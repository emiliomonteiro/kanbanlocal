// Módulo de Administração
// Importa funções de autenticação, utilidades e tarefas
import { getAllUsers, updateUser, deleteUser } from './auth.js';
import { showToast } from './utils.js';
import { getAllTasks } from './board.js';

// Função de inicialização do painel de administração
export function initAdmin() {
    // Configura os listeners dos modais de edição de usuário
    setupUserEditModal();
}

// Atualiza o dashboard de administração
export function refreshAdminDashboard() {
    updateStats();
    renderUsersTable();
}

// Atualiza as estatísticas do painel admin (usuários, tarefas, concluídas)
function updateStats() {
    const users = getAllUsers();
    const tasks = getAllTasks();
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    
    document.getElementById('stat-total-users').textContent = users.length;
    document.getElementById('stat-total-tasks').textContent = tasks.length;
    document.getElementById('stat-completed-tasks').textContent = completedTasks;
}

// Renderiza a tabela de usuários na interface admin
function renderUsersTable() {
    const users = getAllUsers();
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>${user.position || 'N/A'}</td>
            <td><span class="user-role ${user.role}">${user.role}</span></td>
            <td class="user-actions">
                <button class="btn-icon btn-edit" data-email="${user.email}">✏️</button>
                <button class="btn-icon btn-delete" data-email="${user.email}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adiciona listeners para os botões de editar e deletar
    tableBody.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const email = button.dataset.email;
            const user = users.find(u => u.email === email);
            if (user) {
                openUserEditModal(user);
            }
        });
    });
    
    tableBody.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const email = button.dataset.email;
            
            // Impede que o usuário atual delete a si mesmo
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.email === email) {
                showToast('Você não pode deletar sua própria conta', 'error');
                return;
            }
            
            // Confirmação de exclusão
            if (confirm(`Tem certeza que deseja deletar o usuário ${email}?`)) {
                if (deleteUser(email)) {
                    renderUsersTable();
                    updateStats();
                    showToast('Usuário deletado com sucesso', 'success');
                } else {
                    showToast('Falha ao deletar usuário', 'error');
                }
            }
        });
    });
}

// Configura o modal de edição de usuário
function setupUserEditModal() {
    // Fecha o modal
    document.getElementById('btn-close-user-modal').addEventListener('click', () => {
        closeUserEditModal();
    });
    
    // Impede propagação do clique no conteúdo do modal
    document.querySelector('#user-modal .modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Fecha modal ao clicar no overlay
    document.getElementById('modal-overlay').addEventListener('click', () => {
        closeUserEditModal();
    });
    
    // Salva alterações do usuário
    document.getElementById('user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUserChanges();
    });
    
    // Botão de deletar usuário
    document.getElementById('btn-delete-user').addEventListener('click', () => {
        const email = document.getElementById('edit-user-email').value;
        
        // Impede que o usuário atual delete a si mesmo
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email === email) {
            showToast('Você não pode deletar sua própria conta', 'error');
            return;
        }
        
        if (confirm(`Tem certeza que deseja deletar o usuário ${email}?`)) {
            if (deleteUser(email)) {
                renderUsersTable();
                updateStats();
                closeUserEditModal();
                showToast('Usuário deletado com sucesso', 'success');
            } else {
                showToast('Falha ao deletar usuário', 'error');
            }
        }
    });
}

// Abre o modal de edição de usuário e preenche os campos
function openUserEditModal(user) {
    const modal = document.getElementById('user-modal');
    const overlay = document.getElementById('modal-overlay');
    
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-position').value = user.position || '';
    document.getElementById('edit-user-role').value = user.role || 'user';
    
    // Exibe o modal
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

// Fecha o modal de edição de usuário
function closeUserEditModal() {
    const modal = document.getElementById('user-modal');
    const overlay = document.getElementById('modal-overlay');
    
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

// Salva as alterações feitas no usuário
function saveUserChanges() {
    const email = document.getElementById('edit-user-email').value;
    const name = document.getElementById('edit-user-name').value;
    const position = document.getElementById('edit-user-position').value;
    const role = document.getElementById('edit-user-role').value;
    
    const updatedUser = {
        email,
        name,
        position,
        role
    };
    
    if (updateUser(updatedUser)) {
        renderUsersTable();
        closeUserEditModal();
        showToast('Usuário atualizado com sucesso', 'success');
    } else {
        showToast('Falha ao atualizar usuário', 'error');
    }
}