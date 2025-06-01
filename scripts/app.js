// Ponto de entrada principal da aplicação
// Importa módulos de autenticação, quadro, admin, perfil, importação e utilidades
import { initAuth } from './auth.js';
import { initBoard } from './board.js';
import { initAdmin } from './admin.js';
import { initProfile } from './profile.js';
import { initImport } from './import.js';
import { showToast } from './utils.js';

// Inicializa a aplicação quando o DOM estiver pronto
// Responsável por configurar todos os módulos e exibir a tela correta
// Também mostra um toast de boas-vindas na primeira visita
//
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initBoard();
    initAdmin();
    initProfile();
    initImport();
    initUserMenu();
    
    // Verifica se o usuário já está logado
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        showAppView();
        updateUserInfo(currentUser);
    } else {
        showAuthView();
    }
    
    // Exibe mensagem de boas-vindas na primeira visita
    if (!localStorage.getItem('firstVisit')) {
        showToast('Bem-vindo ao TaskFlow! Um Kanban para gerenciar suas tarefas.', 'info');
        localStorage.setItem('firstVisit', 'true');
    }
});

// Função para alternar entre as views de autenticação e app principal
function showAuthView() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showAppView() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('board-view').classList.remove('hidden');
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('profile-view').classList.add('hidden');
}

// Atualiza as informações do usuário no menu e avatar
// Mostra/oculta o link de admin conforme o papel do usuário
export function updateUserInfo(user) {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const adminLink = document.getElementById('admin-link');
    
    // Define avatar com as iniciais do nome do usuário
    if (user.name) {
        const initials = user.name.split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase();
        userAvatar.textContent = initials;
    } else {
        userAvatar.textContent = user.email.charAt(0).toUpperCase();
    }
    
    // Atualiza informações no menu
    userName.textContent = user.name || 'Usuário';
    userEmail.textContent = user.email;
    
    // Mostra/oculta link de admin conforme o papel
    if (user.role === 'admin') {
        adminLink.classList.remove('hidden');
    } else {
        adminLink.classList.add('hidden');
    }
}

// Inicializa o comportamento do menu do usuário (avatar, logout, navegação)
function initUserMenu() {
    const userAvatar = document.getElementById('user-avatar');
    const userMenu = document.getElementById('user-menu');
    
    // Alterna exibição do menu ao clicar no avatar
    userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('hidden');
    });
    
    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && e.target !== userAvatar) {
            userMenu.classList.add('hidden');
        }
    });
    
    // Realiza logout
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        showAuthView();
        showToast('Logout realizado com sucesso', 'success');
    });
    
    // Navega para o painel admin
    document.getElementById('admin-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('board-view').classList.add('hidden');
        document.getElementById('profile-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        userMenu.classList.add('hidden');
    });
    
    // Navega para o perfil
    document.getElementById('profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('board-view').classList.add('hidden');
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('profile-view').classList.remove('hidden');
        userMenu.classList.add('hidden');
    });
    
    // Volta do admin para o quadro
    document.getElementById('btn-back-to-board').addEventListener('click', () => {
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('board-view').classList.remove('hidden');
    });
    
    // Volta do perfil para o quadro
    document.getElementById('btn-back-from-profile').addEventListener('click', () => {
        document.getElementById('profile-view').classList.add('hidden');
        document.getElementById('board-view').classList.remove('hidden');
    });
}

// Funcionalidade de busca de tarefas no quadro
// Filtra as tarefas conforme o termo digitado
//
document.getElementById('search-tasks').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const tasks = document.querySelectorAll('.task-card');
    
    tasks.forEach(task => {
        const title = task.querySelector('.task-title').textContent.toLowerCase();
        const description = task.querySelector('.task-description')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
});