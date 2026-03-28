// ========================================
// PERFIL - FUNCIONALIDADES DA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', function() {

    // ========================================
    // TABS
    // ========================================

    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.profile-tab-content');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.dataset.tab;

            tabs.forEach(function(t) { t.classList.remove('active'); });
            tabContents.forEach(function(c) { c.classList.remove('active'); });

            this.classList.add('active');
            var content = document.getElementById('tab-' + target);
            if (content) content.classList.add('active');

            // Load favorites when tab is first clicked
            if (target === 'favoritos' && favContainer && !favoritesLoaded) {
                carregarFavoritos('filmes');
                favoritesLoaded = true;
            }
        }.bind(tab));
    });

    var favoritesLoaded = false;

    // ========================================
    // FAVORITES: LOADING & RENDERING
    // ========================================

    const favContainer = document.getElementById('favorites-container');
    const favToggles = document.querySelectorAll('.fav-toggle');
    let currentFavTipo = 'filmes';

    function carregarFavoritos(tipo) {
        currentFavTipo = tipo;
        const username = window.profileUsername;
        if (!username || !favContainer) return;

        favContainer.innerHTML = '<p class="profile-empty">Carregando favoritos...</p>';

        const endpoint = tipo === 'filmes'
            ? `/api/favoritos/${username}/`
            : `/api/series-favoritas/${username}/`;

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                const favoritos = data.success
                    ? (data.favoritos || data.series_favoritas || [])
                    : [];
                renderizarFavoritos(favoritos, tipo);
            })
            .catch(error => {
                console.error('Erro ao carregar favoritos:', error);
                favContainer.innerHTML = '<p class="profile-empty" style="color:#dc2626;">Erro ao carregar favoritos</p>';
            });
    }

    function renderizarFavoritos(favoritos, tipo) {
        if (!favContainer) return;
        favContainer.innerHTML = '';

        if (favoritos.length === 0) {
            favContainer.innerHTML = '<p class="profile-empty">Nenhum favorito ainda</p>';
            return;
        }

        const urlBase = tipo === 'filmes' ? '/filmes/' : '/series/';

        favoritos.forEach((fav, index) => {
            const link = document.createElement('a');
            link.href = `${urlBase}${fav.tmdb_id}/`;
            link.className = 'profile-fav-item';

            if (fav.poster) {
                const img = document.createElement('img');
                img.src = `https://image.tmdb.org/t/p/w300${fav.poster}`;
                img.className = 'profile-fav-poster';
                img.alt = fav.titulo;
                img.loading = 'lazy';
                link.appendChild(img);
            } else {
                const placeholder = document.createElement('div');
                placeholder.className = 'profile-fav-poster profile-fav-poster--placeholder';
                placeholder.textContent = fav.titulo || '?';
                link.appendChild(placeholder);
            }

            const rank = document.createElement('span');
            rank.className = 'profile-fav-rank';
            rank.textContent = `#${index + 1}`;
            link.appendChild(rank);

            favContainer.appendChild(link);
        });
    }

    // Toggle handlers
    if (favToggles.length > 0) {
        favToggles.forEach(btn => {
            btn.addEventListener('click', function() {
                const tipo = this.dataset.tipo;
                if (tipo === currentFavTipo) return;

                favToggles.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                carregarFavoritos(tipo);
            });
        });
    }

    // Favorites load on tab click, not on page load

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
    // KEYBOARD NAVIGATION
    // ========================================

    document.addEventListener('keydown', function(e) {
        // ESC para fechar modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
            }
        }
    });

    // ========================================
    // COPY PROFILE URL
    // ========================================

    function copyProfileURL() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            // toast notification placeholder
        }).catch(err => {
            // fallback silencioso
        });
    }

    window.copyProfileURL = copyProfileURL;

    // ========================================
    // SHARE PROFILE
    // ========================================

    function shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Confira meu perfil no Backstage!',
                url: window.location.href
            }).catch(() => {});
        } else {
            copyProfileURL();
        }
    }

    window.shareProfile = shareProfile;

    // ========================================
    // LOADING STATE HELPERS
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

    window.showLoading = showLoading;
    window.hideLoading = hideLoading;

    // ========================================
    // CSRF HELPER (needed by inline clear functions)
    // ========================================

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

    window.getCookie = getCookie;

});
