document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const criarComunidadeBtn = document.getElementById('criar-comunidade-btn');
    const modalCriarComunidade = document.getElementById('modal-criar-comunidade');
    const formCriarComunidade = document.getElementById('form-criar-comunidade');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    const entrarPorConviteBtn = document.getElementById('entrar-por-convite');
    const codigoConviteInput = document.getElementById('codigo-convite');

    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Remover ao clicar no X
        notification.querySelector('.notification-close').onclick = () => {
            notification.remove();
        };
    }

    // Função para obter CSRF token
    function getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }

    // Abrir modal de criar comunidade
    if (criarComunidadeBtn) {
        criarComunidadeBtn.addEventListener('click', function() {
            modalCriarComunidade.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Botão da empty state
    const criarPrimeiraComunidade = document.getElementById('criar-primeira-comunidade');
    if (criarPrimeiraComunidade) {
        criarPrimeiraComunidade.addEventListener('click', function() {
            modalCriarComunidade.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    // Fechar modal
    function closeModal() {
        if (modalCriarComunidade) {
            modalCriarComunidade.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (formCriarComunidade) {
                formCriarComunidade.reset();
            }
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalCancel) {
        modalCancel.addEventListener('click', closeModal);
    }

    // Fechar modal ao clicar fora
    if (modalCriarComunidade) {
        modalCriarComunidade.addEventListener('click', function(e) {
            if (e.target === modalCriarComunidade) {
                closeModal();
            }
        });
    }

    // Criar comunidade
    if (formCriarComunidade) {
        formCriarComunidade.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(formCriarComunidade);
            const submitBtn = formCriarComunidade.querySelector('button[type="submit"]');
            
            // Desabilitar botão durante envio
            submitBtn.disabled = true;
            submitBtn.textContent = 'Criando...';
            
            try {
                const response = await fetch('/criar-comunidade/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Comunidade criada com sucesso!', 'success');
                    closeModal();
                    // Recarregar página para mostrar nova comunidade
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification(data.error || 'Erro ao criar comunidade', 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar Comunidade';
            }
        });
    }

    // Entrar na comunidade por convite
    if (entrarPorConviteBtn) {
        entrarPorConviteBtn.addEventListener('click', async function() {
            const codigo = codigoConviteInput.value.trim();
            
            if (!codigo) {
                showNotification('Digite um código de convite válido', 'warning');
                return;
            }
            
            const btn = entrarPorConviteBtn;
            btn.disabled = true;
            btn.textContent = 'Entrando...';
            
            try {
                const response = await fetch(`/convite/${codigo}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Você entrou na comunidade com sucesso!', 'success');
                    codigoConviteInput.value = '';
                    // Recarregar página para mostrar nova comunidade
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification(data.error || 'Código de convite inválido', 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Entrar na Comunidade';
            }
        });
    }

    // Sair da comunidade
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('sair-comunidade')) {
            const slug = e.target.getAttribute('data-slug');
            
            if (confirm('Tem certeza que deseja sair desta comunidade?')) {
                const btn = e.target;
                btn.disabled = true;
                btn.textContent = 'Saindo...';
                
                try {
                    const response = await fetch('/sair-comunidade/', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCsrfToken(),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ slug: slug })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showNotification('Você saiu da comunidade', 'info');
                        // Remover o card da comunidade da tela
                        btn.closest('.community-card').remove();
                    } else {
                        showNotification(data.error || 'Erro ao sair da comunidade', 'error');
                        btn.disabled = false;
                        btn.textContent = 'Sair';
                    }
                } catch (error) {
                    showNotification('Erro de conexão. Tente novamente.', 'error');
                    btn.disabled = false;
                    btn.textContent = 'Sair';
                }
            }
        }
    });

    // Convidar amigo (se estivermos na página de detalhes da comunidade)
    const convidarAmigoBtn = document.getElementById('convidar-amigo-btn');
    if (convidarAmigoBtn) {
        convidarAmigoBtn.addEventListener('click', async function() {
            const email = prompt('Digite o email do amigo que você quer convidar:');
            
            if (!email) return;
            
            const slug = window.location.pathname.split('/')[2]; // Pega slug da URL
            
            try {
                const response = await fetch('/convidar-amigo/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: email,
                        slug: slug 
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Convite enviado com sucesso!', 'success');
                } else {
                    showNotification(data.error || 'Erro ao enviar convite', 'error');
                }
            } catch (error) {
                showNotification('Erro de conexão. Tente novamente.', 'error');
            }
        });
    }

    // Copiar código de convite
    const copiarCodigoBtn = document.getElementById('copiar-codigo-btn');
    if (copiarCodigoBtn) {
        copiarCodigoBtn.addEventListener('click', function() {
            const codigo = this.getAttribute('data-codigo');
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(codigo).then(() => {
                    showNotification('Código copiado para a área de transferência!', 'success');
                });
            } else {
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = codigo;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Código copiado para a área de transferência!', 'success');
            }
        });
    }

    // Enter para enviar código de convite
    if (codigoConviteInput) {
        codigoConviteInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                entrarPorConviteBtn.click();
            }
        });
    }

    // Tornar showNotification global para uso em outros scripts
    window.showNotification = showNotification;
});

// Estilos CSS para as notificações (inseridos dinamicamente)
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border-left: 4px solid #007bff;
    }
    
    .notification.success {
        border-left-color: #28a745;
        background: #f8fff9;
    }
    
    .notification.error {
        border-left-color: #dc3545;
        background: #fff8f8;
    }
    
    .notification.warning {
        border-left-color: #ffc107;
        background: #fffdf5;
    }
    
    .notification.info {
        border-left-color: #17a2b8;
        background: #f8ffff;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        margin-left: 10px;
        color: #666;
    }
    
    .notification-close:hover {
        color: #000;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    /* Estilos para modal */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #333;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-close:hover {
        color: #000;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
    }
    
    .form-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #007bff;
    }
    
    .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
    }
    
    .checkbox-label input[type="checkbox"] {
        margin-right: 8px;
    }
    
    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
    }
    
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-primary {
        background: #007bff;
        color: white;
    }
    
    .btn-primary:hover {
        background: #0056b3;
    }
    
    .btn-outline {
        background: transparent;
        color: #007bff;
        border: 1px solid #007bff;
    }
    
    .btn-outline:hover {
        background: #007bff;
        color: white;
    }
    
    .btn-danger {
        background: #dc3545;
        color: white;
    }
    
    .btn-danger:hover {
        background: #c82333;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #545b62;
    }
`;
document.head.appendChild(style);

// ===== Create Community Modal Management =====
const createCommunityBtn = document.getElementById('create-community-btn');
const createCommunityModal = document.getElementById('create-community-modal');
const closeCommunityModal = document.getElementById('close-community-modal');
const cancelCommunityBtn = document.getElementById('cancel-community');
const createCommunityForm = document.getElementById('create-community-form');

// Função para mostrar alertas
function showAlert(message, type = 'success') {
    // Remove alertas existentes
    const existingAlerts = document.querySelectorAll('.custom-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Adicionar estilos inline para o alerta
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Abrir modal de criar comunidade
if (createCommunityBtn) {
    createCommunityBtn.addEventListener('click', () => {
        createCommunityModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Fechar modal
function closeCreateCommunityModal() {
    if (createCommunityModal) {
        createCommunityModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (createCommunityForm) {
            createCommunityForm.reset();
        }
    }
}

if (closeCommunityModal) {
    closeCommunityModal.addEventListener('click', closeCreateCommunityModal);
}

if (cancelCommunityBtn) {
    cancelCommunityBtn.addEventListener('click', closeCreateCommunityModal);
}

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === createCommunityModal) {
        closeCreateCommunityModal();
    }
});

// Submeter formulário de criar comunidade
if (createCommunityForm) {
    createCommunityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = createCommunityForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Desabilitar botão e mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Criando...
            `;
            
            // Preparar dados do formulário
            const formData = new FormData(createCommunityForm);
            
            // Fazer requisição
            const response = await fetch('/criar-comunidade/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert(result.message, 'success');
                closeCreateCommunityModal();
                
                // Redirecionar para a nova comunidade após um breve delay
                setTimeout(() => {
                    if (result.comunidade_slug) {
                        window.location.href = `/comunidade/${result.comunidade_slug}/`;
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            } else {
                showAlert(result.error || 'Erro ao criar comunidade', 'error');
            }
            
        } catch (error) {
            console.error('Erro ao criar comunidade:', error);
            showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// Adicionar estilos para animação do alerta
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    .custom-alert {
        transition: opacity 0.3s ease;
    }
    
    .custom-alert:hover {
        opacity: 0.9;
    }
    
    .alert-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .alert-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin-left: 10px;
    }
`;
document.head.appendChild(alertStyles);
