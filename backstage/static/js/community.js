document.addEventListener('DOMContentLoaded', function() {
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
        if (!token) {
            console.warn('CSRF token não encontrado! Verificando cookies...');
            // Fallback: tentar pegar do cookie
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith('csrftoken='))
                ?.split('=')[1];
            return cookieValue || '';
        }
        return token.value;
    }

    // ===== Join Communities Functionality =====
    document.addEventListener('click', async function(e) {
        // Entrar em comunidade
        if (e.target.classList.contains('btn-join') && !e.target.classList.contains('joined')) {
            e.stopPropagation();
            
            const slug = e.target.getAttribute('data-slug');
            if (!slug) return;
            
            const button = e.target;
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Entrando...';
            
            try {
                const formData = new FormData();
                formData.append('slug', slug);
                
                const response = await fetch('/entrar-comunidade/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    const communityName = button.closest('.community-card').querySelector('.community-name').textContent;
                    showNotification(`Você entrou em ${communityName}!`, 'success');
                    
                    // Recarregar a página para atualizar a lista
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification(data.error || 'Erro ao entrar na comunidade', 'error');
                    button.disabled = false;
                    button.textContent = originalText;
                }
            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro de conexão. Tente novamente.', 'error');
                button.disabled = false;
                button.textContent = originalText;
            }
        }
    });

    // Elementos DOM
    const criarComunidadeBtn = document.getElementById('create-community-btn');
    const modalCriarComunidade = document.getElementById('create-community-modal');
    const formCriarComunidade = document.getElementById('create-community-form');
    const modalClose = document.getElementById('community-modal-close');
    const modalCancel = document.getElementById('cancel-community');
    const entrarPorConviteBtn = document.getElementById('entrar-por-convite');
    const codigoConviteInput = document.getElementById('codigo-convite');

    // Abrir modal de criar comunidade
    if (criarComunidadeBtn) {
        criarComunidadeBtn.addEventListener('click', function() {
            modalCriarComunidade.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Botão da empty state
    const criarPrimeiraComunidade = document.getElementById('criar-primeira-comunidade');
    if (criarPrimeiraComunidade) {
        criarPrimeiraComunidade.addEventListener('click', function() {
            modalCriarComunidade.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Fechar modal
    function closeModal() {
        if (modalCriarComunidade) {
            modalCriarComunidade.classList.remove('active');
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
            
            const nome = document.getElementById('community-name').value.trim();
            const descricao = document.getElementById('community-description').value.trim();
            const fotoInput = document.getElementById('community-photo');
            
            // Validação básica
            if (!nome) {
                showNotification('O nome da comunidade é obrigatório', 'error');
                return;
            }
            
            if (!descricao) {
                showNotification('A descrição da comunidade é obrigatória', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('descricao', descricao);
            formData.append('publica', 'on'); // Por padrão, comunidades são públicas
            
            // Adicionar foto se foi selecionada
            if (fotoInput && fotoInput.files.length > 0) {
                formData.append('foto_perfil', fotoInput.files[0]);
            }
            
            const submitBtn = formCriarComunidade.querySelector('button[type="submit"]');
            
            // Desabilitar botão durante envio
            submitBtn.disabled = true;
            submitBtn.textContent = 'Criando...';
            
            console.log('Enviando requisição para criar comunidade...');
            console.log('Nome:', nome);
            console.log('Descrição:', descricao);
            console.log('Foto:', fotoInput && fotoInput.files.length > 0 ? 'Sim' : 'Não');
            
            try {
                const response = await fetch('/criar-comunidade/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    }
                });
                
                console.log('Status da resposta:', response.status);
                const data = await response.json();
                console.log('Dados recebidos:', data);
                
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
                console.error('Erro ao criar comunidade:', error);
                showNotification('Erro de conexão. Tente novamente.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar';
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

    // Tornar getCsrfToken global para uso em outros scripts
    window.getCsrfToken = getCsrfToken;
});

// Estilos CSS para as notificações (inseridos dinamicamente)
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 41, 59, 0.98);
        border-radius: 8px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 450px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 4px solid #3b82f6;
        color: #ffffff;
        font-size: 0.9375rem;
        font-weight: 500;
    }

    .notification.success {
        border-left-color: #10b981;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
    }

    .notification.error {
        border-left-color: #ef4444;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }

    .notification.warning {
        border-left-color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #f59e0b;
    }

    .notification.info {
        border-left-color: #3b82f6;
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #3b82f6;
    }

    .notification span {
        color: inherit;
        flex: 1;
    }

    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 12px;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        padding: 0;
        line-height: 1;
        flex-shrink: 0;
    }

    .notification-close:hover {
        opacity: 1;
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
`;
document.head.appendChild(style);

// ===== Popup de Criar Comunidade =====
document.addEventListener('DOMContentLoaded', function() {
    const createCommunityBtn = document.getElementById('create-community-btn');
    const createCommunityModal = document.getElementById('create-community-modal');
    const closeCommunityModal = document.getElementById('community-modal-close');
    const cancelCommunityBtn = document.getElementById('cancel-community');
    const createCommunityForm = document.getElementById('create-community-form');

    // Função para abrir o popup
    function openCreateCommunityPopup() {
        if (createCommunityModal) {
            createCommunityModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Função para fechar o popup
    function closeCreateCommunityPopup() {
        if (createCommunityModal) {
            createCommunityModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            if (createCommunityForm) {
                createCommunityForm.reset();
            }
        }
    }

    // Abrir popup ao clicar no botão
    if (createCommunityBtn) {
        createCommunityBtn.addEventListener('click', openCreateCommunityPopup);
    }

    // Fechar popup com botão X
    if (closeCommunityModal) {
        closeCommunityModal.addEventListener('click', closeCreateCommunityPopup);
    }

    // Fechar popup com botão Cancelar
    if (cancelCommunityBtn) {
        cancelCommunityBtn.addEventListener('click', closeCreateCommunityPopup);
    }

    // Fechar popup ao clicar fora (no overlay)
    if (createCommunityModal) {
        createCommunityModal.addEventListener('click', function(e) {
            if (e.target === createCommunityModal) {
                closeCreateCommunityPopup();
            }
        });
    }

    // Fechar popup com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && createCommunityModal && createCommunityModal.classList.contains('active')) {
            closeCreateCommunityPopup();
        }
    });

    // Submeter formulário de criar comunidade
    if (createCommunityForm) {
        createCommunityForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = createCommunityForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                // Desabilitar botão e mostrar loading
                submitBtn.disabled = true;
                submitBtn.textContent = 'Criando...';

                // Preparar dados do formulário
                const formData = new FormData(createCommunityForm);

                // Fazer requisição (você vai implementar a rota no backend)
                const response = await fetch('/backstage/criar-comunidade/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // Mostrar mensagem de sucesso
                    if (window.showNotification) {
                        window.showNotification('Comunidade criada com sucesso!', 'success');
                    }
                    closeCreateCommunityPopup();

                    // Redirecionar ou recarregar
                    setTimeout(() => {
                        if (result.comunidade_url) {
                            window.location.href = result.comunidade_url;
                        } else {
                            window.location.reload();
                        }
                    }, 1500);
                } else {
                    // Mostrar mensagem de erro
                    if (window.showNotification) {
                        window.showNotification(result.error || 'Erro ao criar comunidade', 'error');
                    } else {
                        alert(result.error || 'Erro ao criar comunidade');
                    }
                }

            } catch (error) {
                console.error('Erro ao criar comunidade:', error);
                if (window.showNotification) {
                    window.showNotification('Erro de conexão. Tente novamente.', 'error');
                } else {
                    alert('Erro de conexão. Tente novamente.');
                }
            } finally {
                // Restaurar botão
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // ===== Modal de Criar Post =====
    const createPostBtn = document.getElementById('create-post-btn');
    const createPostModal = document.getElementById('create-post-modal');
    const closeModalBtn = document.getElementById('modal-close');
    const cancelPostBtn = document.getElementById('cancel-post');
    const createPostForm = document.getElementById('create-post-form');
    const postType = document.getElementById('post-type');
    const movieSelector = document.getElementById('movie-selector');
    const ratingSelector = document.getElementById('rating-selector');

    // ===== Load More Communities =====
    let currentPage = 1;
    let isLoadingCommunities = false;
    const loadMoreBtn = document.getElementById('load-more');
    const communitiesGrid = document.querySelector('.communities-section:last-of-type .communities-grid');

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreCommunities);
    }

    async function loadMoreCommunities() {
        if (isLoadingCommunities) return;

        isLoadingCommunities = true;
        const button = loadMoreBtn;
        const originalHTML = button.innerHTML;

        // Mostrar loading
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            Carregando...
        `;

        try {
            const response = await fetch(`/api/comunidades/?page=${currentPage + 1}`);
            const data = await response.json();

            if (data.success && data.items.length > 0) {
                // Adicionar novas comunidades ao grid
                data.items.forEach(comunidade => {
                    const card = createCommunityCard(comunidade);
                    communitiesGrid.insertBefore(card, communitiesGrid.lastElementChild);
                });

                currentPage = data.page;

                // Ocultar botão se não houver mais
                if (!data.has_more) {
                    button.style.display = 'none';
                }
            } else if (!data.has_more) {
                button.style.display = 'none';
            }

        } catch (error) {
            console.error('Erro ao carregar comunidades:', error);
            if (window.showNotification) {
                window.showNotification('Erro ao carregar comunidades', 'error');
            }
        } finally {
            isLoadingCommunities = false;
            button.disabled = false;
            button.innerHTML = originalHTML;
        }
    }

    function createCommunityCard(comunidade) {
        const card = document.createElement('div');
        card.className = 'community-card';
        
        card.innerHTML = `
            <img src="https://i.pinimg.com/1200x/bd/e3/e0/bde3e0aaf3dd35b4a42eed8ba9980591.jpg" alt="${comunidade.nome}" class="community-icon-img">
            <div class="community-content">
                <h3 class="community-name">${comunidade.nome}</h3>
                <p class="community-description">${truncateText(comunidade.descricao, 20)}</p>
                <div class="community-stats">
                    <span class="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        ${comunidade.membros_count} membros
                    </span>
                    <span class="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        0 posts
                    </span>
                </div>
                <div class="community-tags">
                    <span class="tag">Público</span>
                </div>
            </div>
            <button class="btn-join" data-slug="${comunidade.slug}">Entrar</button>
        `;
        
        return card;
    }

    function truncateText(text, wordLimit) {
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    }

    // Função para abrir modal de criar post
    function openCreatePostModal() {
        if (createPostModal) {
            createPostModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Função para fechar modal de criar post
    function closeCreatePostModal() {
        if (createPostModal) {
            createPostModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            if (createPostForm) {
                createPostForm.reset();
                // Resetar seletores específicos
                if (movieSelector) movieSelector.style.display = 'none';
                if (ratingSelector) ratingSelector.style.display = 'none';
            }
        }
    }

    // Abrir modal ao clicar no botão
    if (createPostBtn) {
        createPostBtn.addEventListener('click', openCreatePostModal);
    }

    // Abrir modal ao clicar nos botões de ação rápida
    const postActionBtns = document.querySelectorAll('.post-action-btn');
    postActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            openCreatePostModal();
            if (postType) {
                postType.value = type;
                // Trigger change event para mostrar campos relevantes
                postType.dispatchEvent(new Event('change'));
            }
        });
    });

    // Fechar modal com botão X
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeCreatePostModal);
    }

    // Fechar modal com botão Cancelar
    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', closeCreatePostModal);
    }

    // Fechar modal ao clicar fora
    if (createPostModal) {
        createPostModal.addEventListener('click', function(e) {
            if (e.target === createPostModal) {
                closeCreatePostModal();
            }
        });
    }

    // Fechar modais com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (createPostModal && createPostModal.classList.contains('active')) {
                closeCreatePostModal();
            }
            if (createCommunityModal && createCommunityModal.classList.contains('active')) {
                closeCreateCommunityPopup();
            }
        }
    });

    // Mostrar/ocultar campos baseado no tipo de post
    if (postType) {
        postType.addEventListener('change', function() {
            const selectedType = this.value;

            if (selectedType === 'review' || selectedType === 'recommendation') {
                if (movieSelector) movieSelector.style.display = 'block';
                if (selectedType === 'review' && ratingSelector) {
                    ratingSelector.style.display = 'block';
                } else if (ratingSelector) {
                    ratingSelector.style.display = 'none';
                }
            } else {
                if (movieSelector) movieSelector.style.display = 'none';
                if (ratingSelector) ratingSelector.style.display = 'none';
            }
        });
    }

    // Star rating interativo
    const stars = document.querySelectorAll('.star-rating .star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = this.getAttribute('data-rating');
            updateStarRating(selectedRating);
        });

        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            updateStarRating(rating);
        });
    });

    if (stars.length > 0) {
        const starRatingContainer = document.getElementById('star-rating');
        if (starRatingContainer) {
            starRatingContainer.addEventListener('mouseleave', function() {
                updateStarRating(selectedRating);
            });
        }
    }

    function updateStarRating(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Submeter formulário de criar post
    if (createPostForm) {
        createPostForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = createPostForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Publicando...';

                const formData = new FormData(createPostForm);

                // Adicionar rating se foi selecionado
                if (selectedRating > 0) {
                    formData.append('rating', selectedRating);
                }

                const response = await fetch('/backstage/criar-post/', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
                    }
                });

                const result = await response.json();

                if (result.success) {
                    if (window.showNotification) {
                        window.showNotification('Post criado com sucesso!', 'success');
                    }
                    closeCreatePostModal();
                    selectedRating = 0;

                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    if (window.showNotification) {
                        window.showNotification(result.error || 'Erro ao criar post', 'error');
                    } else {
                        alert(result.error || 'Erro ao criar post');
                    }
                }

            } catch (error) {
                console.error('Erro ao criar post:', error);
                if (window.showNotification) {
                    window.showNotification('Erro de conexão. Tente novamente.', 'error');
                } else {
                    alert('Erro de conexão. Tente novamente.');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // ===== Community Card Menu (3 pontos) =====
    // Toggle menu dropdown
    document.addEventListener('click', function(e) {
        // Se clicou no botão de menu
        if (e.target.closest('.community-menu-btn')) {
            e.stopPropagation();
            const btn = e.target.closest('.community-menu-btn');
            const communityId = btn.getAttribute('data-community-id');
            const menu = document.getElementById(`menu-${communityId}`);

            // Fechar todos os outros menus
            document.querySelectorAll('.community-dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });

            // Toggle o menu atual
            menu.classList.toggle('active');
        } else {
            // Fechar todos os menus ao clicar fora
            document.querySelectorAll('.community-dropdown-menu').forEach(m => {
                m.classList.remove('active');
            });
        }
    });

    // Editar comunidade
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.edit-community')) {
            e.preventDefault();
            const communityId = e.target.closest('.edit-community').getAttribute('data-community-id');

            // Buscar dados da comunidade
            try {
                const response = await fetch(`/comunidade/api/${communityId}/`);
                if (!response.ok) throw new Error('Erro ao carregar comunidade');

                const data = await response.json();

                // Preencher o formulário de edição
                document.getElementById('edit-community-id').value = data.id;
                document.getElementById('edit-community-name').value = data.nome;
                document.getElementById('edit-community-description').value = data.descricao;

                // Mostrar foto atual se existir
                const editPhotoPreview = document.getElementById('edit-photo-preview');
                if (data.foto_perfil) {
                    editPhotoPreview.innerHTML = `<img src="${data.foto_perfil}" alt="${data.nome}">`;
                    editPhotoPreview.classList.add('has-image');
                } else {
                    editPhotoPreview.innerHTML = `
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <p>Escolher imagem</p>
                    `;
                    editPhotoPreview.classList.remove('has-image');
                }

                // Abrir modal
                document.getElementById('edit-community-modal').classList.add('active');
                document.body.style.overflow = 'hidden';

            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro ao carregar dados da comunidade', 'error');
            }
        }
    });

    // Fechar modal de edição
    const editModalClose = document.getElementById('edit-modal-close');
    const cancelEditCommunity = document.getElementById('cancel-edit-community');
    const editCommunityModal = document.getElementById('edit-community-modal');

    if (editModalClose) {
        editModalClose.addEventListener('click', () => {
            editCommunityModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    if (cancelEditCommunity) {
        cancelEditCommunity.addEventListener('click', () => {
            editCommunityModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Upload de foto no modal de edição
    const editPhotoPreview = document.getElementById('edit-photo-preview');
    const editCommunityPhoto = document.getElementById('edit-community-photo');

    if (editPhotoPreview && editCommunityPhoto) {
        editPhotoPreview.addEventListener('click', () => {
            editCommunityPhoto.click();
        });

        editCommunityPhoto.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editPhotoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    editPhotoPreview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Submit do formulário de edição
    const editCommunityForm = document.getElementById('edit-community-form');
    if (editCommunityForm) {
        editCommunityForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const communityId = document.getElementById('edit-community-id').value;

            try {
                const response = await fetch(`/comunidade/api/${communityId}/editar/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Comunidade atualizada com sucesso!', 'success');
                    editCommunityModal.classList.remove('active');
                    document.body.style.overflow = 'auto';

                    // Recarregar a página para mostrar as mudanças
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showNotification(data.error || 'Erro ao atualizar comunidade', 'error');
                }
            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro ao atualizar comunidade', 'error');
            }
        });
    }

    // Excluir comunidade
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.delete-community')) {
            e.preventDefault();
            const item = e.target.closest('.delete-community');
            const communityId = item.getAttribute('data-community-id');
            const communityName = item.getAttribute('data-community-name');

            if (confirm(`Tem certeza que deseja excluir a comunidade "${communityName}"? Esta ação não pode ser desfeita.`)) {
                try {
                    const response = await fetch(`/comunidade/api/${communityId}/excluir/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': getCsrfToken(),
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (data.success) {
                        showNotification('Comunidade excluída com sucesso!', 'success');
                        setTimeout(() => {
                            window.location.href = '/comunidade/';
                        }, 1000);
                    } else {
                        showNotification(data.error || 'Erro ao excluir comunidade', 'error');
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    showNotification('Erro ao excluir comunidade', 'error');
                }
            }
        }
    });
});

// Global function to leave community (for community details page)
async function leaveCommunity() {
    const slug = window.location.pathname.split('/')[2]; // Get slug from URL

    if (!slug) {
        console.error('Slug não encontrado na URL');
        return;
    }

    if (!confirm('Tem certeza que deseja sair desta comunidade?')) {
        return;
    }

    try {
        const response = await fetch('/sair-comunidade/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': window.getCsrfToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug: slug })
        });

        const data = await response.json();

        if (data.success) {
            if (window.showNotification) {
                window.showNotification('Você saiu da comunidade', 'success');
            }
            // Redirect to communities page after leaving
            setTimeout(() => {
                window.location.href = '/comunidade/';
            }, 1000);
        } else {
            if (window.showNotification) {
                window.showNotification(data.error || 'Erro ao sair da comunidade', 'error');
            } else {
                alert(data.error || 'Erro ao sair da comunidade');
            }
        }
    } catch (error) {
        console.error('Erro ao sair da comunidade:', error);
        if (window.showNotification) {
            window.showNotification('Erro de conexão. Tente novamente.', 'error');
        } else {
            alert('Erro de conexão. Tente novamente.');
        }
    }
}

// Event delegation for member menu button clicks
document.addEventListener('click', function(e) {
    // Toggle member dropdown menu
    const menuBtn = e.target.closest('.member-menu-btn');
    if (menuBtn) {
        e.preventDefault();
        e.stopPropagation();

        const memberId = menuBtn.dataset.memberId;
        const menu = document.getElementById(`member-menu-${memberId}`);
        const allMenus = document.querySelectorAll('.member-dropdown-menu');

        // Close all other menus
        allMenus.forEach(m => {
            if (m !== menu) {
                m.classList.remove('active');
            }
        });

        // Toggle current menu
        menu.classList.toggle('active');
        return;
    }

    // Close all member menus when clicking outside
    if (!e.target.closest('.member-menu-btn') && !e.target.closest('.member-dropdown-menu')) {
        document.querySelectorAll('.member-dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    }

    // Handle promote admin button
    const promoteBtn = e.target.closest('.promote-admin-btn');
    if (promoteBtn) {
        e.preventDefault();
        const memberId = promoteBtn.dataset.memberId;
        const username = promoteBtn.dataset.memberUsername;
        promoteToAdmin(memberId, username);
        return;
    }

    // Handle kick member button
    const kickBtn = e.target.closest('.kick-member-btn');
    if (kickBtn) {
        e.preventDefault();
        const memberId = kickBtn.dataset.memberId;
        const username = kickBtn.dataset.memberUsername;
        kickMember(memberId, username);
        return;
    }

    // Handle leave community button
    const leaveBtn = e.target.closest('.leave-community-button');
    if (leaveBtn) {
        e.preventDefault();
        leaveCommunity();
        return;
    }
});

// Promote member to admin
async function promoteToAdmin(memberId, username) {
    if (!confirm(`Tem certeza que deseja promover ${username} a administrador?`)) {
        return;
    }

    const slug = window.location.pathname.split('/')[2];

    try {
        const response = await fetch(`/comunidade/${slug}/promover-admin/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': window.getCsrfToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ member_id: memberId })
        });

        const data = await response.json();

        if (data.success) {
            if (window.showNotification) {
                window.showNotification(`${username} foi promovido a administrador!`, 'success');
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            if (window.showNotification) {
                window.showNotification(data.error || 'Erro ao promover membro', 'error');
            } else {
                alert(data.error || 'Erro ao promover membro');
            }
        }
    } catch (error) {
        console.error('Erro ao promover membro:', error);
        if (window.showNotification) {
            window.showNotification('Erro de conexão. Tente novamente.', 'error');
        } else {
            alert('Erro de conexão. Tente novamente.');
        }
    }
}

// Kick member from community
async function kickMember(memberId, username) {
    if (!confirm(`Tem certeza que deseja expulsar ${username} da comunidade?`)) {
        return;
    }

    const slug = window.location.pathname.split('/')[2];

    try {
        const response = await fetch(`/comunidade/${slug}/expulsar-membro/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': window.getCsrfToken(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ member_id: memberId })
        });

        const data = await response.json();

        if (data.success) {
            if (window.showNotification) {
                window.showNotification(`${username} foi expulso da comunidade`, 'info');
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            if (window.showNotification) {
                window.showNotification(data.error || 'Erro ao expulsar membro', 'error');
            } else {
                alert(data.error || 'Erro ao expulsar membro');
            }
        }
    } catch (error) {
        console.error('Erro ao expulsar membro:', error);
        if (window.showNotification) {
            window.showNotification('Erro de conexão. Tente novamente.', 'error');
        } else {
            alert('Erro de conexão. Tente novamente.');
        }
    }
}
