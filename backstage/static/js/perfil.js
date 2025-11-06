// ========================================
// PERFIL - FUNCIONALIDADES DA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Perfil JS carregado');

    // ========================================
    // TAB SWITCHING
    // ========================================

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                this.classList.add('active');

                // Hide all tab contents
                tabContents.forEach(content => content.classList.remove('active'));

                // Show selected tab content
                const selectedTab = document.getElementById(`tab-${tabId}`);
                if (selectedTab) {
                    selectedTab.classList.add('active');
                }

                console.log(`✓ Tab switched to: ${tabId}`);
            });
        });
    }

    // ========================================
    // REVIEW CARDS INTERACTIONS
    // ========================================

    const reviewCards = document.querySelectorAll('.review-card');

    reviewCards.forEach(card => {
        card.addEventListener('click', function() {
            // Pode adicionar funcionalidade de modal para review completa
            console.log('Review card clicked');
        });
    });

    // ========================================
    // LIST CARDS INTERACTIONS
    // ========================================

    const listCards = document.querySelectorAll('.list-card');

    listCards.forEach(card => {
        card.addEventListener('click', function() {
            // Pode adicionar navegação para detalhes da lista
            console.log('List card clicked');
        });
    });

    // ========================================
    // SMOOTH SCROLL PARA LINKS INTERNOS
    // ========================================

    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ========================================
    // LAZY LOADING DE IMAGENS
    // ========================================

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ========================================
    // TOOLTIP PARA BADGES
    // ========================================

    const badges = document.querySelectorAll('.list-badge, .spoiler-badge');

    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            // Pode adicionar tooltip customizado
        });
    });

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================

    document.addEventListener('keydown', function(e) {
        // ESC para fechar modals (se implementar)
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }

        // Setas para navegar entre tabs
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const allTabs = Array.from(tabButtons);
                const currentIndex = allTabs.indexOf(activeTab);

                let nextIndex;
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
                } else {
                    nextIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
                }

                allTabs[nextIndex].click();
            }
        }
    });

    // ========================================
    // ANIMATION ON SCROLL
    // ========================================

    const observeElements = document.querySelectorAll('.review-card, .list-card');

    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';

                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        observeElements.forEach(el => animationObserver.observe(el));
    }

    // ========================================
    // STATISTICS COUNTER ANIMATION
    // ========================================

    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCounter(element, target, duration = 1000) {
        const start = 0;
        const increment = target / (duration / 16); // 60 FPS
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Animar contadores quando a página carregar
    if ('IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.textContent);
                    if (!isNaN(target)) {
                        animateCounter(entry.target, target);
                    }
                    statsObserver.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => statsObserver.observe(stat));
    }

    // ========================================
    // COPY PROFILE URL
    // ========================================

    function copyProfileURL() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            console.log('✓ URL do perfil copiada!');
            // Pode mostrar toast notification
        }).catch(err => {
            console.error('Erro ao copiar URL:', err);
        });
    }

    // Disponibilizar função globalmente se necessário
    window.copyProfileURL = copyProfileURL;

    // ========================================
    // LOADING STATE
    // ========================================

    function showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Carregando...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    function hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Disponibilizar funções globalmente
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;

    // ========================================
    // FILTER & SEARCH (para implementação futura)
    // ========================================

    function filterReviews(criteria) {
        console.log('Filtering reviews by:', criteria);
        // Implementar filtro de reviews
    }

    function searchContent(query) {
        console.log('Searching for:', query);
        // Implementar busca no perfil
    }

    // ========================================
    // EXPORT DATA (para implementação futura)
    // ========================================

    function exportProfileData() {
        console.log('Exporting profile data...');
        // Implementar exportação de dados do perfil
    }

    // ========================================
    // SHARE PROFILE
    // ========================================

    function shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Confira meu perfil no Backstage!',
                url: window.location.href
            }).then(() => {
                console.log('✓ Perfil compartilhado!');
            }).catch(err => {
                console.log('Erro ao compartilhar:', err);
            });
        } else {
            copyProfileURL();
        }
    }

    window.shareProfile = shareProfile;

    // ========================================
    // DEBUG INFO
    // ========================================

    console.log('📊 Stats:', {
        'Total Tabs': tabButtons.length,
        'Total Reviews': reviewCards.length,
        'Total Lists': listCards.length
    });

    // ========================================
    // PERFORMANCE MONITORING
    // ========================================

    if (window.performance && window.performance.timing) {
        window.addEventListener('load', function() {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`⚡ Página carregada em ${loadTime}ms`);
        });
    }
});
