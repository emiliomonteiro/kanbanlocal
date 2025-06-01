// Módulo de Perfil
// Responsável por exibir e atualizar dados do perfil do usuário
import { getCurrentUser, updateUser } from './auth.js';
import { showToast } from './utils.js';

// Inicializa o módulo de perfil e listeners do formulário
export function initProfile() {
    // Listener do formulário de perfil
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileChanges();
    });
}

// Carrega os dados do perfil do usuário na tela
export function loadUserProfile(user) {
    if (!user) {
        user = getCurrentUser();
        if (!user) return;
    }
    
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-birthday').value = user.birthday || '';
    document.getElementById('profile-position').value = user.position || '';
}

// Salva as alterações feitas no perfil do usuário
function saveProfileChanges() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const name = document.getElementById('profile-name').value;
    const birthday = document.getElementById('profile-birthday').value;
    const position = document.getElementById('profile-position').value;
    
    const updatedUser = {
        ...currentUser,
        name,
        birthday,
        position
    };
    
    if (updateUser(updatedUser)) {
        showToast('Perfil atualizado com sucesso', 'success');
    } else {
        showToast('Falha ao atualizar perfil', 'error');
    }
}