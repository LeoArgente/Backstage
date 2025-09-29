// ===== TMDb API Configuration =====
const TMDB_API_KEY = 'e2bf84876d17e898ef5fc63655cd5040';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ===== Movie Database =====
// MovieDatabase removed - movies page now uses API data from TMDb via Django backend

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