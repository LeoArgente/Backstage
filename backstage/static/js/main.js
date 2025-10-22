// ===== Movie Data will be fetched from API =====
// Data now comes from /api/filmes-home/ endpoint with real TMDb data
let moviesData = []; // Will be populated from API

// ===== Cache System =====
const MovieCache = {
    set(key, data, ttlMinutes = 30) {
        const item = {
            data: data,
            expires: Date.now() + (ttlMinutes * 60 * 1000)
        };
        localStorage.setItem('movie_' + key, JSON.stringify(item));
    },

    get(key) {
        const item = JSON.parse(localStorage.getItem('movie_' + key));
        if (!item) return null;
        if (Date.now() > item.expires) {
            localStorage.removeItem('movie_' + key);
            return null;
        }
        return item.data;
    },

    clear() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('movie_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// ===== API Data Management =====
let apiData = {
  heroMovies: [],
  goats: [],
  recommended: [],
  emCartaz: [],
  classicos: []
};

// Fetch data from API
async function fetchMoviesData() {
  try {
    // Check cache first
    const cachedData = MovieCache.get('home_data');
    if (cachedData) {
      apiData = cachedData;
      return cachedData;
    }

    // Fetch from API
    const response = await fetch('/api/filmes-home/');
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();

    if (data.success) {
      apiData = {
        heroMovies: data.hero_movies || [],
        goats: data.goats || [],
        recommended: data.recommended || [],
        emCartaz: data.em_cartaz || [],
        classicos: data.classicos || []
      };


      // Cache for 30 minutes
      MovieCache.set('home_data', apiData, 30);
      return apiData;
    }

    throw new Error('API returned error');

  } catch (error) {
    console.error('Error fetching movies:', error);
    // Return empty data on error
    return {
      heroMovies: [],
      goats: [],
      recommended: [],
      emCartaz: [],
      classicos: []
    };
  }
}

// Loading state helper
function showLoadingState(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Carregando filmes...</p>
    </div>
  `;
}

// MovieDatabase removed - now using API data

// ===== DOM Elements =====
const goatsMoviesGrid = document.getElementById('goats-movies');
const recentTrack = document.getElementById('recent-track');
const recommendedMoviesGrid = document.getElementById('recommended-movies');
const emCartazMoviesGrid = document.getElementById('em-cartaz-movies');
const classicosMoviesGrid = document.getElementById('classicos-movies');

// ===== Utility Functions =====
function getFullImageUrl(path, isBackdrop = false) {
  if (!path) return 'https://via.placeholder.com/500x750/1a1f2e/ffffff?text=No+Image';

  // URLs base do TMDb (usadas apenas para montagem de URLs de imagens)
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

  const baseUrl = isBackdrop ? BACKDROP_BASE_URL : IMAGE_BASE_URL;
  return `${baseUrl}${path}`;
}

function showLoading(element) {
  element.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Carregando filmes...
    </div>
  `;
}

// ===== Função para Resumir Sinopse =====
function resumirSinopse(sinopse, maxLength = 150) {
  if (!sinopse) return '';
  
  // Se a sinopse já for curta, retorna ela mesma
  if (sinopse.length <= maxLength) {
    return sinopse;
  }
  
  // Divide em frases para pegar as mais importantes
  const frases = sinopse.split(/[.!?]+/).filter(frase => frase.trim().length > 0);
  
  // Tenta construir um resumo com as primeiras frases mais importantes
  let resumo = '';
  for (const frase of frases) {
    const fraseLimpa = frase.trim();
    if (resumo.length + fraseLimpa.length + 2 <= maxLength) {
      resumo += (resumo ? '. ' : '') + fraseLimpa;
    } else {
      break;
    }
  }
  
  // Se conseguiu pelo menos uma frase completa, usa ela
  if (resumo.length > 0) {
    return resumo + (resumo.endsWith('.') ? '..' : '...');
  }
  
  // Caso contrário, faz corte por caracteres (fallback)
  resumo = sinopse.substring(0, maxLength);
  
  // Encontra o último espaço completo para não cortar palavras no meio
  const ultimoEspaco = resumo.lastIndexOf(' ');
  if (ultimoEspaco > 0) {
    resumo = resumo.substring(0, ultimoEspaco);
  }
  
  // Remove pontuação final incompleta
  resumo = resumo.replace(/[,;:\-–—]$/, '');
  
  // Adiciona reticências
  return resumo + '...';
}

// ===== Initialize Homepage =====
async function initHomepage() {
  // Initialize non-async components first
  initCarouselControls();
  // Filters disabled - would need API implementation

  // Load async components with proper error handling
  try {
    if (goatsMoviesGrid) {
      await renderGoatsMovies();
    }
    // Recent movies section not implemented yet (would need watch history from API)
    if (recommendedMoviesGrid) {
      await renderRecommendedMovies();
    }
    if (emCartazMoviesGrid) {
      await renderEmCartazMovies();
    }
    if (classicosMoviesGrid) {
      await renderClassicosMovies();
    }

    // Set featured movie with TOP 5 - must be after API data is loaded
    await setFeaturedMoviesCarousel();
  } catch (error) {
    console.error('Erro ao inicializar página:', error);
  }
}

// ===== Set Featured Movies Carousel (TOP 5) =====
let currentFeaturedIndex = 0;
let featuredRotationInterval = null;

async function setFeaturedMoviesCarousel() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  // Fetch data if not already loaded
  if (!apiData.heroMovies || apiData.heroMovies.length === 0) {
    await fetchMoviesData();
  }

  const top5Movies = apiData.heroMovies;

  if (top5Movies.length === 0) {
    heroSection.innerHTML = '<p>Nenhum filme disponível no momento.</p>';
    return;
  }
  
  // Clear existing interval if any
  if (featuredRotationInterval) {
    clearInterval(featuredRotationInterval);
  }
  
  // Keep existing hero content structure
  const heroBackdrop = heroSection.querySelector('.hero-backdrop img');
  const heroTitle = heroSection.querySelector('.hero-title');
  const heroSynopsis = heroSection.querySelector('.hero-synopsis');
  const heroMeta = heroSection.querySelector('.hero-meta');
  const heroBadge = heroSection.querySelector('.hero-badge');
  
  // Function to update the featured movie display with ultra-smooth transition
  function updateFeaturedMovie(index) {
    const movie = top5Movies[index];
    
    // Create subtle crossfade effect for backdrop
    if (heroBackdrop) {
      const newImg = new Image();
      newImg.onload = function() {
        // Direct backdrop update without transition
        heroBackdrop.src = getFullImageUrl(movie.backdrop_path, true);
        heroBackdrop.alt = movie.titulo;
        heroBackdrop.style.opacity = '0.6'; // Meio termo entre o fade forte e fraco
        heroBackdrop.style.filter = 'blur(0px)';
      };
      newImg.src = getFullImageUrl(movie.backdrop_path, true);
    }
    
    // Stagger text changes for seamless transition
    setTimeout(() => {
      if (heroBadge) {
        heroBadge.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroBadge.style.transform = 'translateY(-10px)';
        heroBadge.style.opacity = '0';
        
        setTimeout(() => {
          heroBadge.innerHTML = `TOP ${index + 1} DE HOJE`;
          heroBadge.style.transform = 'translateY(0)';
          heroBadge.style.opacity = '1';
        }, 200);
      }
    }, 200);
    
    setTimeout(() => {
      if (heroTitle) {
        heroTitle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroTitle.style.transform = 'translateX(-20px)';
        heroTitle.style.opacity = '0';
        
        setTimeout(() => {
          heroTitle.textContent = movie.titulo;
          heroTitle.style.transform = 'translateX(0)';
          heroTitle.style.opacity = '1';
        }, 200);
      }
    }, 400);
    
    // Sinopse removida da hero section
    
    setTimeout(() => {
      if (heroMeta) {
        heroMeta.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        heroMeta.style.transform = 'scale(0.95)';
        heroMeta.style.opacity = '0';
        
        setTimeout(() => {
          // Converter nota da escala 10 para escala 5 com 1 casa decimal
          const notaEscala10 = movie.nota || movie.nota_estrelas * 2 || 0;
          const notaEscala5 = (notaEscala10 / 2).toFixed(1);

          heroMeta.innerHTML = `
            <span class="hero-year">${movie.ano}</span>
            <span class="hero-duration">${movie.duracao}</span>
            <span class="hero-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              ${notaEscala5}
            </span>
          `;
          heroMeta.style.transform = 'scale(1)';
          heroMeta.style.opacity = '1';
        }, 200);
      }
    }, 800);
    
    updateIndicators(index);
  }
  
  // Add navigation indicators
  let indicatorsContainer = heroSection.querySelector('.hero-indicators');
  if (!indicatorsContainer) {
    indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'hero-indicators';
    heroSection.appendChild(indicatorsContainer);
  }
  
  indicatorsContainer.innerHTML = top5Movies.map((_, index) => `
    <button class="hero-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Ir para filme ${index + 1}"></button>
  `).join('');
  
  // Add click handlers to indicators
  const indicators = indicatorsContainer.querySelectorAll('.hero-indicator');
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      const index = parseInt(indicator.dataset.index);
      currentFeaturedIndex = index;
      updateFeaturedMovie(index);
      
      // Reset the interval
      if (featuredRotationInterval) {
        clearInterval(featuredRotationInterval);
      }
      startRotation();
    });
  });
  
  // Function to update active indicator
  function updateIndicators(activeIndex) {
    const indicators = document.querySelectorAll('.hero-indicator');
    indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  // Function to start automatic rotation
  function startRotation() {
    featuredRotationInterval = setInterval(() => {
      currentFeaturedIndex = (currentFeaturedIndex + 1) % top5Movies.length;
      updateFeaturedMovie(currentFeaturedIndex);
    }, 7000); // Rotate every 7 seconds
  }
  
  // Initialize with first movie immediately to avoid flash
  updateFeaturedMovie(0);
  
  // Hide loading content and show hero
  setTimeout(() => {
    const heroContent = heroSection.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }
  }, 100);
  
  // Start automatic rotation
  startRotation();
  
  // Add cursor pointer and styling to hero section to indicate it's clickable
  heroSection.style.cursor = 'pointer';
  heroSection.style.userSelect = 'none'; // Prevent text selection
  
  // Add a subtle overlay to indicate clickability
  if (!heroSection.querySelector('.hero-click-overlay')) {
    const clickOverlay = document.createElement('div');
    clickOverlay.className = 'hero-click-overlay';
    clickOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, 
        rgba(37, 99, 235, 0.03) 0%, 
        rgba(220, 38, 38, 0.03) 100%
      );
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      z-index: 1;
    `;
    heroSection.appendChild(clickOverlay);
  }
  
  // Pause rotation on hover (sem animação de expansão)
  heroSection.addEventListener('mouseenter', () => {
    if (featuredRotationInterval) {
      clearInterval(featuredRotationInterval);
    }
    
    // Show click overlay apenas
    const overlay = heroSection.querySelector('.hero-click-overlay');
    if (overlay) {
      overlay.style.opacity = '1';
    }
  });
  
  heroSection.addEventListener('mouseleave', () => {
    startRotation();
    
    // Hide click overlay
    const overlay = heroSection.querySelector('.hero-click-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
    }
  });
  
  // Add click functionality to hero section to go to movie details
  heroSection.addEventListener('click', (e) => {
    // Ignore clicks on indicators
    if (e.target.closest('.hero-indicators')) {
      return;
    }
    
    const currentMovie = top5Movies[currentFeaturedIndex];
    if (currentMovie) {
      // Redirect imediatamente (sem animação de clique)
      window.location.href = `/filmes/${currentMovie.tmdb_id}/`;
    }
  });
}

// ===== Render GOATS Movies =====
window.renderGoatsMovies = async function() {
  if (!goatsMoviesGrid) return;

  // Show loading state
  showLoadingState(goatsMoviesGrid);

  // Fetch data if not already loaded
  if (!apiData.goats || apiData.goats.length === 0) {
    await fetchMoviesData();
  }

  const goatsMovies = apiData.goats;

  if (!goatsMovies || goatsMovies.length === 0) {
    goatsMoviesGrid.innerHTML = '<p class="no-movies">Nenhum filme GOATS encontrado.</p>';
    return;
  }

  goatsMoviesGrid.innerHTML = goatsMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Render Recent Movies =====
// Function removed - not implemented yet (would need watch history from API)

// ===== Render Recommended Movies =====
window.renderRecommendedMovies = async function() {
  if (!recommendedMoviesGrid) return;

  // Show loading state
  showLoadingState(recommendedMoviesGrid);

  // Fetch data if not already loaded
  if (!apiData.recommended || apiData.recommended.length === 0) {
    await fetchMoviesData();
  }

  const recommendedMovies = apiData.recommended;

  recommendedMoviesGrid.innerHTML = recommendedMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Render Em Cartaz Movies =====
window.renderEmCartazMovies = async function() {
  if (!emCartazMoviesGrid) return;

  // Show loading state
  showLoadingState(emCartazMoviesGrid);

  // Fetch data if not already loaded
  if (!apiData.emCartaz || apiData.emCartaz.length === 0) {
    await fetchMoviesData();
  }

  const emCartazMovies = apiData.emCartaz;

  emCartazMoviesGrid.innerHTML = emCartazMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Render Clássicos Movies =====
window.renderClassicosMovies = async function() {
  if (!classicosMoviesGrid) return;

  // Show loading state
  showLoadingState(classicosMoviesGrid);

  // Fetch data if not already loaded
  if (!apiData.classicos || apiData.classicos.length === 0) {
    await fetchMoviesData();
  }

  const classicosMovies = apiData.classicos;

  classicosMoviesGrid.innerHTML = classicosMovies.map(movie => createMovieCard(movie)).join('');
}

// ===== Create Movie Card =====
function createMovieCard(movie) {
  const posterUrl = getFullImageUrl(movie.poster_path);

  // Converter nota da escala 10 para escala 5 com 1 casa decimal
  const notaEscala10 = movie.nota || movie.nota_estrelas * 2 || 0;
  const notaEscala5 = (notaEscala10 / 2).toFixed(1);

  return `
    <div class="movie-card" data-id="${movie.tmdb_id}">
      <div class="movie-card-poster">
        <img src="${posterUrl}" alt="${movie.titulo}" loading="lazy" />
        <div class="movie-card-overlay">
          <span class="movie-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${notaEscala5}
          </span>
        </div>
      </div>
      <div class="movie-card-info">
        <h4 class="movie-card-title">${movie.titulo}</h4>
        <span class="movie-card-year">${movie.ano}</span>
      </div>
    </div>
  `;
}

// ===== Carousel Controls =====
function initCarouselControls() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    
    if (!track) return;
    
    // Auto-scroll functionality
    let autoScrollInterval = null;
    const startAutoScroll = () => {
      autoScrollInterval = setInterval(() => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 10) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }, 3000);
    };
    
    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
    };
    
    // Start auto-scroll
    startAutoScroll();
    
    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoScroll);
    carousel.addEventListener('mouseleave', startAutoScroll);
    
    // Manual controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const scrollAmount = 240 * 3; // Scroll 3 cards
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        stopAutoScroll();
        setTimeout(startAutoScroll, 5000);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const scrollAmount = 240 * 3; // Scroll 3 cards
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        stopAutoScroll();
        setTimeout(startAutoScroll, 5000);
      });
    }
    
    // Update button visibility based on scroll position
    const updateButtonVisibility = () => {
      if (prevBtn) {
        // Esconde o botão esquerdo quando está no início
        if (track.scrollLeft <= 10) {
          prevBtn.classList.add('hidden');
        } else {
          prevBtn.classList.remove('hidden');
        }
      }
      if (nextBtn) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        // Esconde o botão direito quando chega ao fim
        if (track.scrollLeft >= maxScroll - 10) {
          nextBtn.classList.add('hidden');
        } else {
          nextBtn.classList.remove('hidden');
        }
      }
    };
    
    track.addEventListener('scroll', updateButtonVisibility);
    // Verifica visibilidade inicial
    setTimeout(updateButtonVisibility, 100);
  });
}

// ===== Filter Functionality =====
function initFilters() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterSelect = document.querySelector('.filter-select');
  
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      filterTabs.forEach(t => t.classList.remove('active'));
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Filter movies based on genre
      const genre = tab.textContent.trim();
      filterMoviesByGenre(genre);
    });
  });
  
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      sortMovies(e.target.value);
    });
  }
}

// ===== Filter Movies by Genre =====
// Function removed - filtering would need to be implemented with API calls

// ===== Sort Movies =====
// Function removed - sorting would need to be implemented with API calls

// ===== Enhanced Search Functionality =====
// Busca foi movida para o backend Django - usar /buscar/ ou /busca-ajax/
function initSearch() {
  const searchInput = document.querySelector('.search-input');

  if (searchInput) {
    searchInput.addEventListener('input', debounce(async (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();

      if (searchTerm.length >= 2) {
        try {
          // Usar API do backend Django para busca
          const response = await fetch(`/busca-ajax/?q=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Resultados da busca:', data.results);

            // Exibir resultados (implementação futura)
            // Por enquanto, redireciona para página de busca completa
          }
        } catch (error) {
          console.error('Erro na busca:', error);
        }
      } else if (searchTerm.length === 0) {
        // Reset to GOATS movies
        renderGoatsMovies();
      }
    }, 300));
  }
}

// ===== Utility: Debounce =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== Refresh Button =====
function initRefreshButton() {
  const refreshBtn = document.querySelector('.refresh-btn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      if (!recommendedMoviesGrid) return;

      recommendedMoviesGrid.style.opacity = '0.5';

      // Recarregar recomendações do backend
      await renderRecommendedMovies();

      setTimeout(() => {
        recommendedMoviesGrid.style.opacity = '1';
      }, 300);
    });
  }
}

// ===== Image Loading Error Handler =====
function handleImageError(img) {
  img.src = 'https://via.placeholder.com/500x750/1a1f2e/ffffff?text=Poster+Indisponível';
  img.onerror = null;
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', async () => {
  // Check which page we're on
  const isHomepage = document.getElementById('goats-movies');

  if (isHomepage) {
    await initHomepage();
    initSearch();
    initRefreshButton();
  }

  // Movie details page functionality is now handled by movie_details.js

  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Add loading animation for images with error handling
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') {
      e.target.style.animation = 'fadeIn 0.5s ease';
      e.target.onerror = () => handleImageError(e.target);
    }
  }, true);
  
  // Add hover effect for movie cards
  document.addEventListener('click', (e) => {
    if (e.target.closest('.movie-card')) {
      const card = e.target.closest('.movie-card');
      const movieId = card.dataset.id;
      
      // Redirect to movie detail page
      window.location.href = `/filmes/${movieId}/`;
    }
  });
  
  // Initialize news dropdown
  initNewsDropdown();
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

// ===== User Menu Dropdown - Letterboxd Style =====
function initUserMenu() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (!userMenuBtn || !userDropdown) return;
  
  // Toggle dropdown on button click
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = userDropdown.classList.contains('show');
    
    // Toggle current dropdown
    userDropdown.classList.toggle('show');
    
    // Update aria-expanded
    userMenuBtn.setAttribute('aria-expanded', !isVisible);
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove('show');
      userMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Close dropdown when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
      userDropdown.classList.remove('show');
      userMenuBtn.setAttribute('aria-expanded', 'false');
      userMenuBtn.focus();
    }
  });
  
  // Close dropdown when clicking on a menu item
  userDropdown.querySelectorAll('.user-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      // Delay closing to allow navigation
      setTimeout(() => {
        userDropdown.classList.remove('show');
        userMenuBtn.setAttribute('aria-expanded', 'false');
      }, 150);
    });
  });
  
  // Handle keyboard navigation
  const menuItems = Array.from(userDropdown.querySelectorAll('.user-dropdown-item'));
  
  userMenuBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && userDropdown.classList.contains('show')) {
      e.preventDefault();
      menuItems[0]?.focus();
    }
  });
  
  menuItems.forEach((item, index) => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        menuItems[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        menuItems[menuItems.length - 1].focus();
      }
    });
  });
}

// Initialize user menu on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initUserMenu();
});