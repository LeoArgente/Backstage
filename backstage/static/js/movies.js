// ===== Movies Page JavaScript =====
// Todos os dados de filmes são fornecidos pelo backend Django
// Este arquivo apenas adiciona interatividade à página

// ===== DOM Elements =====
const moviesGrid = document.getElementById('movies-grid');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sort-movies');
const loadMoreBtn = document.getElementById('load-more');
const viewToggle = document.getElementById('view-toggle');
const searchInput = document.querySelector('.search-input');

// ===== State Variables =====
let currentView = 'grid'; // 'grid' or 'list'

// ===== View Toggle Function =====
function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';

  if (moviesGrid) {
    moviesGrid.className = `movies-grid ${currentView}-view`;
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
  // Initialize news dropdown
  initNewsDropdown();

  // View toggle
  if (viewToggle) {
    viewToggle.addEventListener('click', toggleView);
  }

  // Movie card clicks
  document.addEventListener('click', (e) => {
    if (e.target.closest('.movie-card')) {
      const card = e.target.closest('.movie-card');

      // Handle action buttons
      if (e.target.closest('.action-btn')) {
        e.stopPropagation();
        const btn = e.target.closest('.action-btn');
        const action = btn.dataset.action;

        // Toggle button state
        btn.classList.toggle('active');

        // Handle action logic here (could be connected to backend in future)
        console.log(`${action} action triggered`);
        return;
      }

      // Navigate to movie details - extract tmdb_id from the link
      const link = card.querySelector('a[href*="/filmes/"]');
      if (link) {
        window.location.href = link.href;
      }
    }
  });
});

// ===== News Dropdown Functionality =====
function initNewsDropdown() {
  const newsDropdownContent = document.querySelector('.news-dropdown-content');

  if (!newsDropdownContent) return;

  // Sample news data
  const newsData = [
    {
      id: 1,
      title: 'Christopher Nolan anuncia novo filme épico de ficção científica para 2025',
      category: 'Cinema',
      date: 'Há 2 horas',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=150&fit=crop'
    },
    {
      id: 2,
      title: 'Marvel revela primeira imagem do novo Quarteto Fantástico',
      category: 'Marvel',
      date: 'Há 4 horas',
      image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=150&fit=crop'
    },
    {
      id: 3,
      title: 'Oscar 2024: Confira a lista completa de indicados',
      category: 'Premiação',
      date: 'Há 6 horas',
      image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=200&h=150&fit=crop'
    },
    {
      id: 4,
      title: 'Netflix anuncia segunda temporada de série mais vista de 2024',
      category: 'Streaming',
      date: 'Há 8 horas',
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=150&fit=crop'
    },
    {
      id: 5,
      title: 'Duna 3 já está em desenvolvimento, confirma diretor',
      category: 'Cinema',
      date: 'Há 12 horas',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=150&fit=crop'
    }
  ];

  // Populate dropdown
  newsDropdownContent.innerHTML = newsData.map(news => `
    <a href="noticias.html#${news.id}" class="news-dropdown-item">
      <img src="${news.image}" alt="${news.title}" class="news-thumbnail" />
      <div class="news-item-content">
        <h4 class="news-item-title">${news.title}</h4>
        <div class="news-item-meta">
          <span class="news-category">${news.category}</span>
          <span>${news.date}</span>
        </div>
      </div>
    </a>
  `).join('');
}


// ===== Search Functionality =====
let searchTimeout;
let searchResults = null;

function initializeSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchContainer = document.querySelector('.search-container');
  
  if (!searchInput || !searchContainer) return;

  // Create search results dropdown
  const searchResults = document.createElement('div');
  searchResults.className = 'search-results-dropdown';
  searchResults.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
    margin-top: 5px;
  `;
  searchContainer.style.position = 'relative';
  searchContainer.appendChild(searchResults);

  // Handle input
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(() => {
      performSearch(query, searchResults);
    }, 300);
  });

  // Hide results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchContainer.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  // Show results when focusing on input
  searchInput.addEventListener('focus', function() {
    if (searchResults.innerHTML) {
      searchResults.style.display = 'block';
    }
  });
}

async function performSearch(query, resultsContainer) {
  try {
    const response = await fetch(`/api/busca/?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      displaySearchResults(data.results, resultsContainer);
      resultsContainer.style.display = 'block';
    } else {
      resultsContainer.innerHTML = '<div style="padding: 15px; color: #666; text-align: center;">Nenhum resultado encontrado</div>';
      resultsContainer.style.display = 'block';
    }
  } catch (error) {
    console.error('Erro na busca:', error);
    resultsContainer.style.display = 'none';
  }
}

function displaySearchResults(results, container) {
  container.innerHTML = results.map(item => `
    <a href="${item.url}" class="search-result-item" style="
      display: flex;
      align-items: center;
      padding: 12px;
      text-decoration: none;
      color: inherit;
      border-bottom: 1px solid #333;
    ">
      <img src="${item.poster || '/static/images/no-image.png'}" alt="${item.titulo}" style="
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 12px;
      ">
      <div style="flex: 1;">
        <h4 style="margin: 0 0 4px; font-size: 14px;">${item.titulo}</h4>
        <p style="margin: 0; font-size: 12px; color: #888;">
          ${item.ano} • ${item.tipo.toUpperCase()}
        </p>
      </div>
    </a>
  `).join('');
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSearch);

// ===== Filter Functionality =====
document.addEventListener('DOMContentLoaded', () => {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const sortSelect = document.getElementById('sort-movies');

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

function applyFilters() {
  // Get current active genre
  const activeTab = document.querySelector('.filter-tab.active');
  const genre = activeTab ? activeTab.dataset.filter : 'all';

  // Get current sort option
  const sortSelect = document.getElementById('sort-movies');
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
  const sortSelect = document.getElementById('sort-movies');
  if (sortSelect) {
    sortSelect.value = sortParam;
  }
});
