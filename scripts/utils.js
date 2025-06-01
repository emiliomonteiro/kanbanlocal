// Funções utilitárias
// Diversas funções auxiliares para validação, formatação, notificações, etc.

// Exibe uma notificação (toast) na tela
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    
    // Cria elemento do toast
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
    
    toast.innerHTML = `
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    // Adiciona ao container
    toastContainer.appendChild(toast);
    
    // Listener do botão de fechar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    });
    
    // Remove automaticamente após o tempo
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toast.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }
    }, duration);
}

// Formata uma data para o padrão local
export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Valida se o email está em formato válido
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Valida se a senha tem pelo menos 6 caracteres
export function validatePassword(password) {
    return password.length >= 6;
}

// Sanitiza texto para evitar XSS
export function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Gera um ID aleatório
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Função debounce para limitar execuções frequentes
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Retorna a posição de um elemento na tela (drag and drop)
export function getElementPosition(el) {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
    };
}

// Retorna a data atual no formato YYYY-MM-DD
export function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Formata tempo relativo (ex: "há 2 dias")
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'agora mesmo';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
    }
    
    // Para datas mais antigas, retorna formato padrão
    return formatDate(dateString);
}