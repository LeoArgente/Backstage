// ===== Series Details JavaScript =====

// Configuration
const config = {
  imageBaseUrl: 'https://image.tmdb.org/t/p/'
};

function getCurrentSerieTMDbId() {
  // Prioriza dados do window.serieData
  if (window.serieData && window.serieData.tmdbId) {
    return window.serieData.tmdbId;
  }
  // Fallback: extrai da URL
  const path = window.location.pathname;
  const match = path.match(/\/series\/(\d+)\//);
  return match ? parseInt(match[1]) : null;
}

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      button.classList.add('active');
      const targetContent = document.getElementById(tabName);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      loadTabContent(tabName);
    });
  });
}

function loadTabContent(tabName) {
  if (tabName === 'seasons' && !document.querySelector('.season-card')) {
    loadSeasons();
  }
}

async function loadSeasons() {
  const seasonsList = document.getElementById('seasons-list');
  if (!seasonsList) return;

  // Verificar se os dados da série estão disponíveis
  if (!window.serieData || !window.serieData.temporadas) {
    seasonsList.innerHTML = '<div class="season-loading">Erro ao carregar temporadas.</div>';
    return;
  }

  seasonsList.innerHTML = '<div class="season-loading"><div class="loading-spinner"></div> Carregando temporadas...</div>';

  try {
    const seasons = window.serieData.temporadas || [];
    const regularSeasons = seasons.filter(season => season.season_number > 0);

    if (regularSeasons.length === 0) {
      seasonsList.innerHTML = '<div class="no-episodes">Nenhuma temporada disponível</div>';
      return;
    }

    seasonsList.innerHTML = regularSeasons.map(season => `
      <div class="season-card" data-season="${season.season_number}">
        <div class="season-header" onclick="toggleSeason(${season.season_number})">
          <div class="season-info">
            <h3>${season.name}</h3>
            <div class="season-meta">
              ${season.episode_count} episódio${season.episode_count !== 1 ? 's' : ''}
              ${season.air_date ? '• ' + new Date(season.air_date).getFullYear() : ''}
            </div>
          </div>
          <button class="season-toggle" aria-label="Expandir temporada">▼</button>
        </div>
        <div class="episodes-list" id="season-${season.season_number}-episodes"></div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar temporadas:', error);
    seasonsList.innerHTML = '<div class="season-loading">Erro ao carregar temporadas.</div>';
  }
}

async function toggleSeason(seasonNumber) {
  const seasonCard = document.querySelector(`.season-card[data-season="${seasonNumber}"]`);
  const episodesList = document.getElementById(`season-${seasonNumber}-episodes`);

  if (!seasonCard || !episodesList) return;

  if (seasonCard.classList.contains('expanded')) {
    seasonCard.classList.remove('expanded');
    return;
  }

  seasonCard.classList.add('expanded');

  if (episodesList.innerHTML.trim() !== '') return;

  episodesList.innerHTML = '<div class="season-loading"><div class="loading-spinner"></div> Carregando episódios...</div>';

  const serieId = getCurrentSerieTMDbId();

  try {
    const response = await fetch(`/api/series/${serieId}/temporada/${seasonNumber}/`);
    const data = await response.json();

    if (data.success) {
      const episodios = data.temporada.episodios;

      if (episodios.length === 0) {
        episodesList.innerHTML = '<div class="no-episodes">Nenhum episódio disponível</div>';
        return;
      }

      episodesList.innerHTML = episodios.map(ep => {
        const imageUrl = ep.imagem ? `${config.imageBaseUrl}w300${ep.imagem}` : 'https://via.placeholder.com/160x90?text=Sem+Imagem';
        return `
          <div class="episode-item">
            <img src="${imageUrl}" alt="${ep.nome || 'Episódio'}" class="episode-thumb" loading="lazy" />
            <div class="episode-details">
              <span class="episode-number">Episódio ${ep.numero}</span>
              <span class="episode-title">${ep.nome || 'Título não disponível'}</span>
              <div class="episode-overview">${ep.sinopse || 'Sinopse não disponível'}</div>
              <div class="episode-meta">
                ${ep.nota ? `<div class="episode-rating"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${ep.nota.toFixed(1)}</div>` : ''}
                ${ep.duracao ? `<span>${ep.duracao} min</span>` : ''}
                ${ep.data_exibicao ? `<span>${formatDate(ep.data_exibicao)}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      episodesList.innerHTML = '<div class="season-loading">Erro ao carregar episódios</div>';
    }
  } catch (error) {
    console.error('Erro ao carregar temporada:', error);
    episodesList.innerHTML = '<div class="season-loading">Erro ao carregar episódios</div>';
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function initializeStarRating() {
  const stars = document.querySelectorAll('.star-rating .star');
  const ratingValue = document.getElementById('rating-value');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      ratingValue.value = rating;
      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });

    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add('hover');
        } else {
          s.classList.remove('hover');
        }
      });
    });
  });

  const starRating = document.querySelector('.star-rating');
  if (starRating) {
    starRating.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
  }
}

function initializeFormValidation() {
  const form = document.querySelector('.review-input-group');
  const ratingValue = document.getElementById('rating-value');
  const textarea = document.querySelector('.movie-review-text');

  if (form) {
    form.addEventListener('submit', (e) => {
      if (!ratingValue.value) {
        e.preventDefault();
        alert('Por favor, selecione uma nota de 1 a 5 estrelas.');
        return false;
      }
      if (!textarea.value.trim()) {
        e.preventDefault();
        alert('Por favor, escreva sua crítica.');
        return false;
      }
      return true;
    });
  }
}

function initializeActionButtons() {
  const watchedBtn = document.querySelector('.action-btn.watched');
  const watchlistBtn = document.querySelector('.action-btn.watchlist');
  const favoriteBtn = document.querySelector('.action-btn.favorite');

  if (watchedBtn) {
    watchedBtn.addEventListener('click', () => watchedBtn.classList.toggle('active'));
  }

  if (watchlistBtn) {
    watchlistBtn.addEventListener('click', () => watchlistBtn.classList.toggle('active'));
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => favoriteBtn.classList.toggle('active'));
  }
}

function initializeTrailerButton() {
  const trailerBtn = document.querySelector('.trailer-btn');

  if (trailerBtn) {
    trailerBtn.addEventListener('click', () => {
      // Usa os vídeos já carregados do backend
      if (!window.serieData || !window.serieData.videos) {
        alert('Trailer não disponível para esta série.');
        return;
      }

      try {
        const videos = window.serieData.videos;
        const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube') || videos[0];

        if (trailer && trailer.key) {
          window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        } else {
          alert('Trailer não disponível para esta série.');
        }
      } catch (error) {
        console.error('Erro ao buscar trailer:', error);
        alert('Erro ao buscar trailer.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeStarRating();
  initializeFormValidation();
  initializeActionButtons();
  initializeTrailerButton();
});

window.toggleSeason = toggleSeason;
