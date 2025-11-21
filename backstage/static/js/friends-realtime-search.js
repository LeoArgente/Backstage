/**
 * Sistema de busca em tempo real de amigos
 * Estilo Instagram/Facebook
 */

class FriendsRealtimeSearch {
    constructor() {
        console.log('🔍 Iniciando FriendsRealtimeSearch...');
        this.searchInput = document.getElementById('search-input-realtime');
        this.resultsContainer = document.getElementById('search-results-realtime');
        this.loadingSpinner = document.getElementById('search-loading');
        this.searchTimeout = null;
        this.currentQuery = '';
        
        console.log('📝 Elementos encontrados:', {
            searchInput: !!this.searchInput,
            resultsContainer: !!this.resultsContainer,
            loadingSpinner: !!this.loadingSpinner
        });
        
        this.init();
    }
    
    init() {
        if (!this.searchInput) {
            console.error('❌ search-input-realtime não encontrado!');
            return;
        }
        
        console.log('✅ FriendsRealtimeSearch inicializado com sucesso');
        
        // Event listener com debounce
        this.searchInput.addEventListener('input', (e) => {
            console.log('📝 Input detectado:', e.target.value);
            this.handleSearch(e.target.value);
        });
        
        // Limpar resultados ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container-realtime')) {
                this.hideResults();
            }
        });
    }
    
    handleSearch(query) {
        // Cancelar busca anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        query = query.trim();
        this.currentQuery = query;

        // Mínimo de 2 caracteres
        if (query.length < 2) {
            this.hideResults();
            this.hideLoading(); // Esconder loading se input estiver vazio
            return;
        }

        // Mostrar loading
        this.showLoading();

        // Debounce de 300ms
        this.searchTimeout = setTimeout(() => {
            this.buscarUsuarios(query);
        }, 300);
    }
    
    async buscarUsuarios(query) {
        console.log('🔎 Buscando usuários com query:', query);
        try {
            const url = `/api/buscar-usuarios-realtime/?q=${encodeURIComponent(query)}`;
            console.log('📡 URL da requisição:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            console.log('📥 Resposta recebida:', response.status, response.statusText);
            const data = await response.json();
            console.log('📦 Dados recebidos:', data);
            
            if (data.success) {
                console.log('✅ Busca bem-sucedida, usuários encontrados:', data.usuarios.length);
                this.renderResults(data.usuarios);
            } else {
                console.error('❌ Erro na busca:', data.message);
                this.showError(data.message || 'Erro ao buscar usuários');
            }
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            this.showError('Erro ao buscar usuários');
        } finally {
            this.hideLoading();
        }
    }
    
    renderResults(usuarios) {
        if (usuarios.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-user-slash"></i>
                    <p>Nenhum usuário encontrado</p>
                </div>
            `;
            this.showResults();
            return;
        }
        
        const html = usuarios.map(usuario => `
            <div class="search-result-item" data-user-id="${usuario.id}">
                <div class="result-user-info">
                    <div class="result-avatar">
                        ${usuario.foto_perfil 
                            ? `<img src="${usuario.foto_perfil}" alt="${usuario.nome}">` 
                            : `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="result-details">
                        <div class="result-name">${this.escapeHtml(usuario.nome)}</div>
                        <div class="result-username">@${this.escapeHtml(usuario.username)}</div>
                    </div>
                </div>
                <div class="result-action">
                    ${this.renderActionButton(usuario)}
                </div>
            </div>
        `).join('');
        
        this.resultsContainer.innerHTML = html;
        this.showResults();
        this.attachEventListeners();
    }
    
    renderActionButton(usuario) {
        switch (usuario.status) {
            case 'amigo':
                return `
                    <a href="/perfil/${usuario.username}/" class="btn-result btn-view-profile">
                        <i class="fas fa-eye"></i>
                        Ver perfil
                    </a>
                `;
            
            case 'pendente_enviada':
                return `
                    <button class="btn-result btn-pending" disabled>
                        <i class="fas fa-clock"></i>
                        ${usuario.status_text}
                    </button>
                `;
            
            case 'pendente_recebida':
                return `
                    <button class="btn-result btn-accept" data-action="aceitar" data-user-id="${usuario.id}">
                        <i class="fas fa-check"></i>
                        ${usuario.status_text}
                    </button>
                `;
            
            case 'adicionar':
            default:
                return `
                    <button class="btn-result btn-add" data-action="adicionar" data-user-id="${usuario.id}">
                        <i class="fas fa-user-plus"></i>
                        ${usuario.status_text}
                    </button>
                `;
        }
    }
    
    attachEventListeners() {
        // Botões de adicionar
        this.resultsContainer.querySelectorAll('[data-action="adicionar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = btn.dataset.userId;
                this.enviarSolicitacao(userId, btn);
            });
        });
        
        // Botões de aceitar
        this.resultsContainer.querySelectorAll('[data-action="aceitar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const userId = btn.dataset.userId;
                this.aceitarSolicitacao(userId, btn);
            });
        });
    }
    
    async enviarSolicitacao(userId, button) {
        const originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            const response = await fetch('/api/enviar-solicitacao/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    destinatario_id: userId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Atualizar botão para "Solicitação enviada"
                button.className = 'btn-result btn-pending';
                button.innerHTML = '<i class="fas fa-clock"></i> Solicitação enviada';
                
                // Mostrar notificação de sucesso
                this.showNotification('Solicitação enviada com sucesso!', 'success');
            } else {
                button.disabled = false;
                button.innerHTML = originalHtml;
                this.showNotification(data.message || 'Erro ao enviar solicitação', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            button.disabled = false;
            button.innerHTML = originalHtml;
            this.showNotification('Erro ao enviar solicitação', 'error');
        }
    }
    
    async aceitarSolicitacao(userId, button) {
        const originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            // Buscar a solicitação pendente do usuário
            const response = await fetch('/api/aceitar-solicitacao/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    solicitacao_id: userId  // Nota: adaptar se necessário
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Atualizar botão para "Ver perfil"
                const resultItem = button.closest('.search-result-item');
                const username = resultItem.querySelector('.result-username').textContent.replace('@', '');
                
                button.outerHTML = `
                    <a href="/perfil/${username}/" class="btn-result btn-view-profile">
                        <i class="fas fa-eye"></i>
                        Ver perfil
                    </a>
                `;
                
                this.showNotification('Solicitação aceita!', 'success');
            } else {
                button.disabled = false;
                button.innerHTML = originalHtml;
                this.showNotification(data.message || 'Erro ao aceitar solicitação', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            button.disabled = false;
            button.innerHTML = originalHtml;
            this.showNotification('Erro ao aceitar solicitação', 'error');
        }
    }
    
    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
        }
    }
    
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }
    
    showResults() {
        this.resultsContainer.classList.add('show');
    }
    
    hideResults() {
        this.resultsContainer.classList.remove('show');
    }
    
    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="search-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        this.showResults();
    }
    
    showNotification(message, type = 'success') {
        // Criar notificação toast
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar com animação
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM carregado, iniciando FriendsRealtimeSearch...');
    new FriendsRealtimeSearch();
});
