// Sistema de Notificações - Backstage
document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationList = document.getElementById('notificationList');
    
    if (!notificationBtn) return; // Usuário não logado
    
    let isDropdownOpen = false;
    let notificacoesCarregadas = false;
    
    // Toggle do dropdown
    notificationBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isDropdownOpen = !isDropdownOpen;
        
        if (isDropdownOpen) {
            notificationDropdown.classList.add('active');
            if (!notificacoesCarregadas) {
                carregarNotificacoes();
            }
        } else {
            notificationDropdown.classList.remove('active');
        }
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (isDropdownOpen && !notificationDropdown.contains(e.target) && e.target !== notificationBtn) {
            notificationDropdown.classList.remove('active');
            isDropdownOpen = false;
        }
    });
    
    // Evitar que cliques dentro do dropdown o fechem
    notificationDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Carregar notificações
    function carregarNotificacoes() {
        notificationList.innerHTML = `
            <div class="notification-loading">
                <div class="spinner"></div>
                <p>Carregando notificações...</p>
            </div>
        `;
        
        fetch('/api/notificacoes/')
            .then(response => response.json())
            .then(data => {
                notificacoesCarregadas = true;
                if (data.success) {
                    exibirNotificacoes(data.notificacoes);
                    atualizarBadge(data.total);
                } else {
                    exibirErro('Erro ao carregar notificações');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                exibirErro('Erro ao carregar notificações');
            });
    }
    
    // Exibir notificações
    function exibirNotificacoes(notificacoes) {
        if (notificacoes.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a7 7 0 0 1 7 7c0 5.25 1.5 6.75 1.5 6.75H3.5S5 14.25 5 9a7 7 0 0 1 7-7z"/>
                        <path d="M10.5 19a1.5 1.5 0 0 0 3 0" stroke-linecap="round"/>
                    </svg>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        notificacoes.forEach(notificacao => {
            if (notificacao.tipo === 'solicitacao_amizade') {
                html += `
                    <div class="notification-item" data-id="${notificacao.id}">
                        <div class="notification-avatar">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(notificacao.remetente_username)}&background=random&size=48" alt="${notificacao.remetente_username}">
                        </div>
                        <div class="notification-content">
                            <p class="notification-message">
                                <strong>${notificacao.remetente_username}</strong> enviou uma solicitação de amizade
                            </p>
                            <span class="notification-time">${notificacao.tempo_relativo}</span>
                            <div class="notification-actions">
                                <button class="btn-accept" onclick="aceitarSolicitacao(${notificacao.id}, ${notificacao.remetente_id})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 6L9 17l-5-5"/>
                                    </svg>
                                    Aceitar
                                </button>
                                <button class="btn-reject" onclick="rejeitarSolicitacao(${notificacao.id})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                    Recusar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        notificationList.innerHTML = html;
    }
    
    // Exibir erro
    function exibirErro(mensagem) {
        notificationList.innerHTML = `
            <div class="notification-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4M12 16h.01"/>
                </svg>
                <p>${mensagem}</p>
            </div>
        `;
    }
    
    // Atualizar badge
    function atualizarBadge(total) {
        if (total > 0) {
            notificationBadge.textContent = total > 99 ? '99+' : total;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
    
    // Carregar notificações inicialmente (para o badge)
    carregarNotificacoes();
    
    // Atualizar a cada 30 segundos
    setInterval(carregarNotificacoes, 30000);
});

// Funções globais para aceitar/rejeitar solicitações
function aceitarSolicitacao(solicitacaoId, remetenteId) {
    fetch('/api/aceitar-solicitacao/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ solicitacao_id: solicitacaoId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remover notificação da lista
            const notificationItem = document.querySelector(`[data-id="${solicitacaoId}"]`);
            if (notificationItem) {
                notificationItem.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    notificationItem.remove();
                    
                    // Verificar se ainda há notificações
                    const remainingNotifications = document.querySelectorAll('.notification-item');
                    if (remainingNotifications.length === 0) {
                        document.getElementById('notificationList').innerHTML = `
                            <div class="notification-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2a7 7 0 0 1 7 7c0 5.25 1.5 6.75 1.5 6.75H3.5S5 14.25 5 9a7 7 0 0 1 7-7z"/>
                                    <path d="M10.5 19a1.5 1.5 0 0 0 3 0" stroke-linecap="round"/>
                                </svg>
                                <p>Nenhuma notificação</p>
                            </div>
                        `;
                        document.getElementById('notificationBadge').style.display = 'none';
                    } else {
                        // Atualizar badge
                        const badge = document.getElementById('notificationBadge');
                        const currentCount = parseInt(badge.textContent);
                        badge.textContent = currentCount - 1;
                        if (currentCount - 1 === 0) {
                            badge.style.display = 'none';
                        }
                    }
                }, 300);
            }
            
            // Mostrar mensagem de sucesso
            mostrarMensagem('Solicitação aceita!', 'success');
        } else {
            mostrarMensagem(data.message || 'Erro ao aceitar solicitação', 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao aceitar solicitação', 'error');
    });
}

function rejeitarSolicitacao(solicitacaoId) {
    fetch('/api/rejeitar-solicitacao/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ solicitacao_id: solicitacaoId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remover notificação da lista
            const notificationItem = document.querySelector(`[data-id="${solicitacaoId}"]`);
            if (notificationItem) {
                notificationItem.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    notificationItem.remove();
                    
                    // Verificar se ainda há notificações
                    const remainingNotifications = document.querySelectorAll('.notification-item');
                    if (remainingNotifications.length === 0) {
                        document.getElementById('notificationList').innerHTML = `
                            <div class="notification-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2a7 7 0 0 1 7 7c0 5.25 1.5 6.75 1.5 6.75H3.5S5 14.25 5 9a7 7 0 0 1 7-7z"/>
                                    <path d="M10.5 19a1.5 1.5 0 0 0 3 0" stroke-linecap="round"/>
                                </svg>
                                <p>Nenhuma notificação</p>
                            </div>
                        `;
                        document.getElementById('notificationBadge').style.display = 'none';
                    } else {
                        // Atualizar badge
                        const badge = document.getElementById('notificationBadge');
                        const currentCount = parseInt(badge.textContent);
                        badge.textContent = currentCount - 1;
                        if (currentCount - 1 === 0) {
                            badge.style.display = 'none';
                        }
                    }
                }, 300);
            }
            
            // Mostrar mensagem de sucesso
            mostrarMensagem('Solicitação recusada', 'info');
        } else {
            mostrarMensagem(data.message || 'Erro ao recusar solicitação', 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao recusar solicitação', 'error');
    });
}

// Função auxiliar para mostrar mensagens
function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensagem;
    
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Função auxiliar para obter cookie CSRF
function getCookie(name) {
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
