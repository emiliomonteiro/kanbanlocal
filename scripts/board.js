// Módulo do Quadro (Board)
// Responsável por gerenciar tarefas, renderizar, drag-and-drop e contadores
import { getCurrentUser } from './auth.js';
import { showToast, formatDate } from './utils.js';

// Armazena as tarefas do usuário logado
let tasks = [];

// Inicializa o quadro: carrega tarefas, listeners e drag-and-drop
export function initBoard() {
    // Inicializa o quadro
    loadTasks();
    setupEventListeners();
    initDragAndDrop();
}

// Carrega tarefas do localStorage para o usuário atual
function loadTasks() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
    renderTasks();
}

// Salva tarefas no localStorage para o usuário atual
function saveTasks() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
    updateTaskCounts();
}

// Renderiza as tarefas nas colunas do quadro
function renderTasks() {
    // Limpa as listas de tarefas
    document.getElementById('todo-tasks').innerHTML = '';
    document.getElementById('progress-tasks').innerHTML = '';
    document.getElementById('done-tasks').innerHTML = '';
    
    // Renderiza cada tarefa na coluna correspondente
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        const column = document.getElementById(`${task.status}-tasks`);
        if (column) {
            column.appendChild(taskElement);
        }
    });
    
    updateTaskCounts();
}

// Cria o elemento visual de uma tarefa
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-card', task.status);
    taskElement.dataset.id = task.id;
    taskElement.draggable = true;
    
    // Calcula porcentagem de conclusão das subtarefas
    let completionPercentage = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const completedCount = task.subtasks.filter(subtask => subtask.completed).length;
        completionPercentage = Math.round((completedCount / task.subtasks.length) * 100);
    }
    
    // Verifica se a data de entrega está atrasada
    let dueDateClass = '';
    if (task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today && task.status !== 'done') {
            dueDateClass = 'overdue';
        }
    }
    
    taskElement.innerHTML = `
        <h3 class="task-title">${task.title}</h3>
        <p class="task-description">${task.description || 'Sem descrição'}</p>
        <div class="task-meta">
            ${task.dueDate ? `
                <div class="task-due-date ${dueDateClass}">
                    <span>Entrega: ${formatDate(task.dueDate)}</span>
                </div>
            ` : ''}
            ${task.subtasks && task.subtasks.length > 0 ? `
                <div class="task-subtasks">
                    ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}
                </div>
            ` : ''}
        </div>
        ${task.subtasks && task.subtasks.length > 0 ? `
            <div class="progress-wrapper">
                <div class="progress-text">
                    <span>Progresso</span>
                    <span>${completionPercentage}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${completionPercentage}%"></div>
                </div>
            </div>
        ` : ''}
    `;
    
    // Adiciona evento de clique para abrir detalhes da tarefa
    taskElement.addEventListener('click', () => {
        openTaskModal(task);
    });
    
    // Eventos de drag para arrastar tarefas entre colunas
    taskElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        taskElement.classList.add('dragging');
        setTimeout(() => {
            taskElement.classList.add('ghost');
        }, 0);
    });
    
    taskElement.addEventListener('dragend', () => {
        taskElement.classList.remove('dragging', 'ghost');
    });
    
    return taskElement;
}

// Configura os listeners dos botões e formulários do quadro
function setupEventListeners() {
    // Botão de adicionar tarefa
    document.getElementById('btn-add-task').addEventListener('click', () => {
        openTaskModal();
    });
    
    // Botão de fechar modal de tarefa
    document.getElementById('btn-close-task-modal').addEventListener('click', () => {
        closeTaskModal();
    });
    
    // Botão de adicionar sub-tarefa
    document.getElementById('btn-add-subtask').addEventListener('click', () => {
        addSubtaskField();
    });
    
    // Botão de deletar tarefa
    document.getElementById('btn-delete-task').addEventListener('click', () => {
        const taskId = document.getElementById('task-id').value;
        if (taskId) {
            deleteTask(taskId);
            closeTaskModal();
        }
    });
    
    // Formulário de salvar tarefa
    document.getElementById('task-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });
    
    // Fecha modal ao clicar fora
    document.getElementById('modal-overlay').addEventListener('click', () => {
        closeTaskModal();
    });
    
    // Impede propagação do clique no conteúdo do modal
    document.querySelector('#task-modal .modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Inicializa drag-and-drop entre as colunas do quadro
function initDragAndDrop() {
    const columns = document.querySelectorAll('.task-list');
    
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const status = column.id.replace('-tasks', '');
            
            updateTaskStatus(taskId, status);
        });
    });
}

// Atualiza o status de uma tarefa ao arrastar entre colunas
function updateTaskStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveTasks();
        renderTasks();
        showToast(`Tarefa movida para ${newStatus.replace('todo', 'A Fazer').replace('progress', 'Em Progresso').replace('done', 'Concluída')}`, 'success');
    }
}

// Abre o modal de tarefa para criar ou editar
function openTaskModal(task = null) {
    const modal = document.getElementById('task-modal');
    const overlay = document.getElementById('modal-overlay');
    const form = document.getElementById('task-form');
    const deleteBtn = document.getElementById('btn-delete-task');
    const modalTitle = document.getElementById('task-modal-title');
    
    // Reseta o formulário
    form.reset();
    document.getElementById('subtasks-container').innerHTML = '';
    
    if (task) {
        // Edita tarefa existente
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-status').value = task.status;
        
        // Adiciona subtarefas
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(subtask => {
                addSubtaskField(subtask.title, subtask.completed);
            });
        }
        
        modalTitle.textContent = 'Editar Tarefa';
        deleteBtn.classList.remove('hidden');
    } else {
        // Nova tarefa
        document.getElementById('task-id').value = '';
        modalTitle.textContent = 'Adicionar Nova Tarefa';
        deleteBtn.classList.add('hidden');
        
        // Status padrão
        document.getElementById('task-status').value = 'todo';
    }
    
    // Exibe o modal
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

// Fecha o modal de tarefa
function closeTaskModal() {
    const modal = document.getElementById('task-modal');
    const overlay = document.getElementById('modal-overlay');
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

// Adiciona um campo de sub-tarefa no formulário
function addSubtaskField(title = '', completed = false) {
    const container = document.getElementById('subtasks-container');
    const subtaskDiv = document.createElement('div');
    subtaskDiv.classList.add('subtask-field');
    subtaskDiv.innerHTML = `
        <input type="text" class="subtask-title" placeholder="Subtarefa" value="${title}">
        <input type="checkbox" class="subtask-completed" ${completed ? 'checked' : ''}>
        <button type="button" class="btn-remove-subtask">Remover</button>
    `;
    // Remove sub-tarefa
    subtaskDiv.querySelector('.btn-remove-subtask').addEventListener('click', () => {
        container.removeChild(subtaskDiv);
    });
    container.appendChild(subtaskDiv);
}

// Salva uma tarefa nova ou editada
function saveTask() {
    const id = document.getElementById('task-id').value || Date.now().toString();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const status = document.getElementById('task-status').value;
    
    // Coleta subtarefas do formulário
    const subtaskFields = document.querySelectorAll('.subtask-field');
    const subtasks = Array.from(subtaskFields).map(field => {
        return {
            title: field.querySelector('.subtask-title').value,
            completed: field.querySelector('.subtask-completed').checked
        };
    });
    
    // Verifica se já existe tarefa (edição)
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        // Atualiza tarefa existente
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title,
            description,
            dueDate,
            status,
            subtasks
        };
        showToast('Tarefa atualizada com sucesso', 'success');
    } else {
        // Adiciona nova tarefa
        tasks.push({
            id,
            title,
            description,
            dueDate,
            status,
            subtasks
        });
        showToast('Tarefa criada com sucesso', 'success');
    }
    saveTasks();
    renderTasks();
    closeTaskModal();
}

// Remove uma tarefa pelo ID
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
    showToast('Tarefa removida', 'success');
}

// Atualiza os contadores de tarefas em cada coluna
function updateTaskCounts() {
    document.getElementById('todo-count').textContent = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('progress-count').textContent = tasks.filter(t => t.status === 'progress').length;
    document.getElementById('done-count').textContent = tasks.filter(t => t.status === 'done').length;
}

// Atualiza o quadro (usado após login, importação, etc)
export function refreshBoard() {
    loadTasks();
}

// Retorna todas as tarefas do usuário atual (usado pelo admin)
export function getAllTasks() {
    return tasks;
}