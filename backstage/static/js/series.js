// ===== Series Page JavaScript =====
// Todos os dados de séries são fornecidos pelo backend Django
// Este arquivo apenas adiciona interatividade à página

// ===== DOM Elements =====
const seriesGrid = document.getElementById('series-grid');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sort-series');
const viewToggle = document.getElementById('view-toggle');
const loadMoreBtn = document.getElementById('load-more');

// ===== State Variables =====
let currentView = 'grid'; // 'grid' or 'list'
let currentPage = 1;
let isLoading = false;

// ===== View Toggle Function =====
function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';

  if (seriesGrid) {
    seriesGrid.className = `series-grid ${currentView}-view`;
  }

  // Update view toggle icon
  if (viewToggle) {
    const icon = viewToggle.querySelector('svg');
    if (currentView === 'list') {
      icon.innerHTML = `
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      `;
    } else {
      icon.innerHTML = `
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      `;
    }
  }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  // View toggle
  if (viewToggle) {
    viewToggle.addEventListener('click', toggleView);
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreSeries);
  }

  // Series card clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.series-card')) {
      const card = e.target.closest('.series-card');

      // Handle action buttons
      if (e.target.closest('.action-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.action-btn');
        const action = btn.dataset.action;

        // Toggle button state
        btn.classList.toggle('active');

        // Handle action logic here
        return;
      }

      // Navigate to series details
      const link = card.querySelector('a[href*="/series/"]');
      if (link) {
        window.location.href = link.href;
      }
    }
  });
});

// ===== Filter Functionality =====
document.addEventListener('DOMContentLoaded', () => {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const sortSelect = document.getElementById('sort-series');

  // Handle genre filter clicks
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');

      // Apply filter
      applyFilters();
    });
  });

  // Handle sort change
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFilters();
    });
  }
});

// ===== Load More Series Function =====
async function loadMoreSeries() {
  if (isLoading || !loadMoreBtn) return;

  isLoading = true;
  currentPage++;

  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = 'Carregando...';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const genre = urlParams.get('genre') || 'all';
    const sort = urlParams.get('sort') || 'popular';

    const response = await fetch(`/api/series/?page=${currentPage}&genre=${genre}&sort=${sort}`);
    const data = await response.json();

    if (data.success && data.series && data.series.length > 0) {
      appendSeriesToGrid(data.series);

      if (!data.has_more) {
        loadMoreBtn.style.display = 'none';
      }
    } else {
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    currentPage--;
    loadMoreBtn.textContent = 'Erro, tente novamente';
    setTimeout(() => {
      loadMoreBtn.textContent = 'Carregar mais';
    }, 2000);
  } finally {
    isLoading = false;
    if (loadMoreBtn.style.display !== 'none') {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Carregar mais';
    }
  }
}

function appendSeriesToGrid(series) {
  const tmdbImageBase = 'https://image.tmdb.org/t/p/';

  series.forEach(serie => {
    const serieCard = document.createElement('div');
    serieCard.className = 'movie-card';
    serieCard.onclick = () => window.location.href = `/series/${serie.tmdb_id}/`;

    const nota = parseFloat(serie.nota_tmdb || 0).toFixed(1);
    const ano = serie.ano_lancamento || '';

    serieCard.innerHTML = `
      <div class="movie-poster">
        <img src="${tmdbImageBase}w500${serie.poster_path}" alt="${serie.titulo}" loading="lazy" />
        <div class="movie-overlay">
          <span class="movie-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${nota}
          </span>
          <div class="movie-bottom">
            <span class="movie-year">${ano}</span>
          </div>
        </div>
      </div>
    `;

    seriesGrid.appendChild(serieCard);
  });
}

function applyFilters() {
  // Get current active genre
  const activeTab = document.querySelector('.filter-tab.active');
  const genre = activeTab ? activeTab.dataset.filter : 'all';

  // Get current sort option
  const sortSelect = document.getElementById('sort-series');
  const sort = sortSelect ? sortSelect.value : 'popular';

  // Build URL with query parameters
  const url = new URL(window.location.href);
  url.searchParams.set('genre', genre);
  url.searchParams.set('sort', sort);

  // Reload page with new filters
  window.location.href = url.toString();
}

// Set active tab on page load based on URL params
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const genreParam = urlParams.get('genre') || 'all';
  const sortParam = urlParams.get('sort') || 'popular';

  // Set active genre tab
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    if (tab.dataset.filter === genreParam) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Set active sort option
  const sortSelect = document.getElementById('sort-series');
  if (sortSelect) {
    sortSelect.value = sortParam;
  }
});
