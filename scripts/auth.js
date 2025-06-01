// Módulo de Autenticação
// Responsável por login, registro, atualização e remoção de usuários
import { showToast, validateEmail, validatePassword } from './utils.js';
import { updateUserInfo } from './app.js';
import { refreshBoard } from './board.js';
import { refreshAdminDashboard } from './admin.js';
import { loadUserProfile } from './profile.js';

// Inicializa o módulo de autenticação e configura os listeners dos formulários
export function initAuth() {
    // Cria usuário admin padrão caso não existam usuários
    if (!localStorage.getItem('users')) {
        const defaultAdmin = {
            email: 'emilio@taskflow.com',
            name: 'Emilio Monteiro',
            password: 'emilio123', // Em um app real, a senha seria criptografada
            role: 'admin',
            position: 'Administrador do Sistema',
            birthday: '1993-11-26'
        };
        
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        showToast('Usuário admin padrão criado: emilio@taskflow.com / emilio123', 'info');
    }
    
    // Alterna entre os formulários de login e registro
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });
    
    // Listener do formulário de login
    document.getElementById('form-login').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (login(email, password)) {
            // Limpa o formulário
            document.getElementById('form-login').reset();
            
            // Mostra a view principal
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('app-container').classList.remove('hidden');
            
            // Atualiza o quadro com as tarefas do usuário
            refreshBoard();
            
            // Mensagem de sucesso
            showToast('Login realizado com sucesso', 'success');
        }
    });
    
    // Listener do formulário de registro
    document.getElementById('form-register').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const name = document.getElementById('register-name').value;
        const password = document.getElementById('register-password').value;
        const birthday = document.getElementById('register-birthday').value;
        const position = document.getElementById('register-position').value;
        
        // Valida formato do email
        if (!validateEmail(email)) {
            const errorElement = document.getElementById('register-email').nextElementSibling;
            errorElement.textContent = 'Por favor, insira um email válido';
            document.getElementById('register-email').classList.add('error');
            return;
        }
        
        // Valida força da senha
        if (!validatePassword(password)) {
            const errorElement = document.getElementById('register-password').nextElementSibling;
            errorElement.textContent = 'A senha deve ter pelo menos 6 caracteres';
            document.getElementById('register-password').classList.add('error');
            return;
        }
        
        if (register(email, name, password, birthday, position)) {
            // Limpa o formulário
            document.getElementById('form-register').reset();
            
            // Volta para o formulário de login
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
            
            // Mensagem de sucesso
            showToast('Cadastro realizado com sucesso! Agora você pode fazer login', 'success');
        }
    });
    
    // Limpa mensagens de erro ao digitar nos inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        });
    });
}

// Função de login: verifica email e senha, atualiza o usuário atual e UI
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        // Salva usuário atual no localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Atualiza UI com info do usuário
        updateUserInfo(user);
        
        // Carrega dados do perfil
        loadUserProfile(user);
        
        // Atualiza dashboard admin se for admin
        if (user.role === 'admin') {
            refreshAdminDashboard();
        }
        
        return true;
    } else {
        // Mensagem de erro
        showToast('Email ou senha inválidos', 'error');
        return false;
    }
}

// Função de registro: cria novo usuário e salva no localStorage
function register(email, name, password, birthday, position) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verifica se já existe usuário com o email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('Já existe um usuário com este email', 'error');
        return false;
    }
    
    // Cria novo usuário
    const newUser = {
        email,
        name,
        password, // Em um app real, a senha seria criptografada
        role: 'user', // Papel padrão
        birthday: birthday || null,
        position: position || '',
        id: Date.now().toString() // Geração simples de ID
    };
    
    // Adiciona ao array de usuários
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
}

// Retorna o usuário atualmente logado
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Atualiza dados de um usuário existente
export function updateUser(updatedUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === updatedUser.email);
    
    if (index !== -1) {
        // Atualiza usuário no array
        users[index] = { ...users[index], ...updatedUser };
        localStorage.setItem('users', JSON.stringify(users));
        
        // Se for o usuário atual, atualiza também
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.email === updatedUser.email) {
            localStorage.setItem('currentUser', JSON.stringify(users[index]));
            updateUserInfo(users[index]);
        }
        
        return true;
    }
    
    return false;
}

// Remove um usuário pelo email
export function deleteUser(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filteredUsers = users.filter(u => u.email !== email);
    
    if (filteredUsers.length < users.length) {
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        return true;
    }
    
    return false;
}

// Retorna todos os usuários cadastrados
export function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}