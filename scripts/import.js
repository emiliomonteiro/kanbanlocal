// Módulo de Importação
// Responsável por importar tarefas de arquivo ou API externa
import { showToast } from './utils.js';
import { refreshBoard } from './board.js';

// Inicializa o módulo de importação e listeners dos botões/modais
export function initImport() {
    // Botão para abrir modal de importação
    document.getElementById('btn-import').addEventListener('click', () => {
        openImportModal();
    });
    
    // Botão para fechar modal de importação
    document.getElementById('btn-close-import-modal').addEventListener('click', () => {
        closeImportModal();
    });
    
    // Fecha modal ao clicar no overlay
    document.getElementById('modal-overlay').addEventListener('click', () => {
        closeImportModal();
    });
    
    // Impede propagação do clique no conteúdo do modal
    document.querySelector('#import-modal .modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Listener para seleção de arquivo
    document.getElementById('import-file').addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || '';
        document.getElementById('file-name').textContent = fileName;
    });
    
    // Botão para importar da API JSONPlaceholder
    document.getElementById('btn-import-api').addEventListener('click', () => {
        importFromApi();
    });
    
    // Botão para iniciar importação de arquivo
    document.getElementById('btn-start-import').addEventListener('click', () => {
        const fileInput = document.getElementById('import-file');
        if (fileInput.files.length > 0) {
            importFromFile(fileInput.files[0]);
        } else {
            showToast('Selecione um arquivo para importar', 'warning');
        }
    });
}

// Abre o modal de importação e reseta o formulário
function openImportModal() {
    const modal = document.getElementById('import-modal');
    const overlay = document.getElementById('modal-overlay');
    
    // Reseta campos do modal
    document.getElementById('file-name').textContent = '';
    document.getElementById('import-file').value = '';
    document.getElementById('import-status').classList.add('hidden');
    document.getElementById('import-progress').style.width = '0%';
    document.getElementById('import-message').textContent = '';
    
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

// Fecha o modal de importação
function closeImportModal() {
    const modal = document.getElementById('import-modal');
    const overlay = document.getElementById('modal-overlay');
    
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

// Importa tarefas da API JSONPlaceholder
function importFromApi() {
    const statusDiv = document.getElementById('import-status');
    const progressBar = document.getElementById('import-progress');
    const messageEl = document.getElementById('import-message');
    
    statusDiv.classList.remove('hidden');
    progressBar.style.width = '0%';
    messageEl.textContent = 'Conectando à API JSONPlaceholder...';
    
    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => {
            progressBar.style.width = '50%';
            messageEl.textContent = 'Baixando dados...';
            return response.json();
        })
        .then(data => {
            progressBar.style.width = '75%';
            messageEl.textContent = 'Processando dados...';
            
            // Processa os dados recebidos
            const importedTasks = data.slice(0, 10).map(item => {
                return {
                    id: `api-${item.id}`,
                    title: item.title,
                    description: `Importado da JSONPlaceholder (ID: ${item.id})`,
                    status: item.completed ? 'done' : 'todo',
                    subtasks: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });
            
            // Salva as tarefas importadas
            saveImportedTasks(importedTasks);
            
            progressBar.style.width = '100%';
            messageEl.textContent = 'Importação concluída com sucesso!';
            
            // Fecha o modal após um tempo
            setTimeout(() => {
                closeImportModal();
            }, 2000);
        })
        .catch(error => {
            console.error('Erro na importação:', error);
            messageEl.textContent = `Erro: ${error.message || 'Falha ao importar dados'}`;
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'var(--color-error)';
        });
}

// Importa tarefas de um arquivo JSON
function importFromFile(file) {
    const statusDiv = document.getElementById('import-status');
    const progressBar = document.getElementById('import-progress');
    const messageEl = document.getElementById('import-message');
    
    statusDiv.classList.remove('hidden');
    progressBar.style.width = '0%';
    messageEl.textContent = 'Lendo arquivo...';
    
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentLoaded = Math.round((event.loaded / event.total) * 50);
            progressBar.style.width = `${percentLoaded}%`;
        }
    };
    
    reader.onerror = () => {
        messageEl.textContent = 'Erro ao ler arquivo';
        progressBar.style.backgroundColor = 'var(--color-error)';
    };
    
    reader.onload = (event) => {
        progressBar.style.width = '60%';
        messageEl.textContent = 'Processando dados...';
        
        try {
            const data = JSON.parse(event.target.result);
            
            // Valida se o arquivo é um array de tarefas
            if (!Array.isArray(data)) {
                throw new Error('Formato inválido: esperado um array de tarefas');
            }
            
            // Processa e valida cada tarefa
            const importedTasks = data.map(item => {
                if (!item.title) {
                    throw new Error('Tarefa inválida: título ausente');
                }
                
                return {
                    id: item.id || `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: item.title,
                    description: item.description || '',
                    status: ['todo', 'progress', 'done'].includes(item.status) ? item.status : 'todo',
                    subtasks: Array.isArray(item.subtasks) ? item.subtasks : [],
                    dueDate: item.dueDate || null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });
            
            progressBar.style.width = '80%';
            
            // Salva as tarefas importadas
            saveImportedTasks(importedTasks);
            
            progressBar.style.width = '100%';
            messageEl.textContent = `Importação de ${importedTasks.length} tarefas realizada com sucesso`;
            
            // Fecha o modal após um tempo
            setTimeout(() => {
                closeImportModal();
            }, 2000);
            
        } catch (error) {
            console.error('Erro na importação:', error);
            messageEl.textContent = `Erro: ${error.message || 'JSON inválido'}`;
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'var(--color-error)';
        }
    };
    
    reader.readAsText(file);
}

// Salva as tarefas importadas no localStorage do usuário atual
function saveImportedTasks(importedTasks) {
    // Obtém usuário atual
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Obtém tarefas existentes
    let tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
    
    // Adiciona as tarefas importadas
    tasks = [...tasks, ...importedTasks];
    
    // Salva no localStorage
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
    
    // Atualiza o quadro
    refreshBoard();
    
    // Mensagem de sucesso
    showToast(`Importação de ${importedTasks.length} tarefas realizada com sucesso`, 'success');
}