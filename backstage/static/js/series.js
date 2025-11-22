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
        console.log(`${action} action triggered`);
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
  if (isLoading) return;
  
  isLoading = true;
  currentPage++;
  
  // Update button state
  loadMoreBtn.disabled = true;
  loadMoreBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-spinner">
      <circle cx="12" cy="12" r="10"/>
    </svg>
    Carregando...
  `;
  
  try {
    // Get current filters
    const urlParams = new URLSearchParams(window.location.search);
    const genre = urlParams.get('genre') || 'all';
    const sort = urlParams.get('sort') || 'popular';
    
    // Build API URL
    const apiUrl = `/api/series/?page=${currentPage}&genre=${genre}&sort=${sort}`;
    console.log('[LOAD MORE] Fetching:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('[LOAD MORE] Response:', data);
    
    if (data.success && data.series && data.series.length > 0) {
      // Add series to grid
      appendSeriesToGrid(data.series);
      
      // Check if there are more series to load
      if (!data.has_more) {
        loadMoreBtn.style.display = 'none';
      } else {
        // Reset button
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = `
          Carregar mais séries
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        `;
      }
    } else {
      // No more series
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('[LOAD MORE] Erro ao carregar séries:', error);
    alert('Erro ao carregar mais séries. Tente novamente.');
    currentPage--; // Revert page increment
    
    // Reset button
    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = `
      Carregar mais séries
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    `;
  } finally {
    isLoading = false;
  }
}

function appendSeriesToGrid(series) {
  const tmdbImageBase = 'https://image.tmdb.org/t/p/';
  
  series.forEach(serie => {
    const serieCard = document.createElement('div');
    serieCard.className = 'movie-card';
    serieCard.onclick = () => window.location.href = `/series/${serie.tmdb_id}/`;
    serieCard.style.cursor = 'pointer';
    
    serieCard.innerHTML = `
      <div class="movie-card-poster">
        <img src="${tmdbImageBase}w500${serie.poster_path}" alt="${serie.titulo}" />
        <div class="movie-card-overlay">
          <div class="movie-card-rating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${parseFloat(serie.nota_tmdb || 0).toFixed(1)}
          </div>
        </div>
      </div>
      <div class="movie-card-info">
        <h3 class="movie-card-title">${serie.titulo}</h3>
        <span class="movie-card-year">${serie.ano_lancamento || ''}</span>
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
