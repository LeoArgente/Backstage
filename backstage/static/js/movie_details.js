// ===== Movie Details Interactive Functionality =====
// Todas as chamadas à API do TMDb são feitas pelo backend Django

// URLs base do TMDb (usadas apenas para montagem de URLs de imagens)
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Global variables for movie data
let currentMovieData = null;
let currentMovieCredits = null;
let currentSimilarMovies = null;


// ===== Get TMDb ID directly from Django URL =====
function getCurrentMovieId() {
  // Get tmdb_id directly from Django URL: /filmes/123/
  const path = window.location.pathname;
  const match = path.match(/\/filmes\/(\d+)\//);
  return match ? parseInt(match[1]) : null;
}

function getCurrentMovieTMDbId() {
  const tmdbId = getCurrentMovieId();
  console.log('TMDb ID from URL:', tmdbId);

  if (!tmdbId) {
    console.error('No TMDb ID found in URL');
    return null;
  }

  return tmdbId;
}

// ===== Tab System =====
document.addEventListener('DOMContentLoaded', async () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Initialize news dropdown
  initNewsDropdown();

  // Load movie data directly from TMDb API using URL
  await loadMovieData();

  // Tab switching functionality
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      // Load tab-specific content if needed
      loadTabContent(targetTab);
    });
  });

  // Media tab functionality
  const mediaTabButtons = document.querySelectorAll('.media-tab-btn');
  
  mediaTabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mediaType = button.dataset.media;
      
      // Remove active class from all media tabs
      mediaTabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked media tab
      button.classList.add('active');
      
      // Load media content
      loadMediaContent(mediaType);
    });
  });

  // Star rating functionality
  const starButtons = document.querySelectorAll('.star-rating .star');
  const ratingInput = document.getElementById('rating-value');
  let currentRating = 0;

  starButtons.forEach((star, index) => {
    star.addEventListener('mouseenter', () => {
      highlightStars(index + 1);
    });

    star.addEventListener('mouseleave', () => {
      highlightStars(currentRating);
    });

    star.addEventListener('click', () => {
      currentRating = index + 1;
      highlightStars(currentRating);

      // Update hidden input for form submission
      if (ratingInput) {
        ratingInput.value = currentRating;
      }

      // Show feedback
      showRatingFeedback(currentRating);
    });
  });

  function highlightStars(rating) {
    starButtons.forEach((star, index) => {
      if (index < rating) {
        star.style.color = '#fbbf24';
      } else {
        star.style.color = '#6b7280';
      }
    });
  }

  function showRatingFeedback(rating) {
    console.log(`Avaliação: ${rating} estrelas`);
  }

  // Initialize with default color
  highlightStars(0);

  // Initialize with default content
  loadTabContent('overview');

  // Add a small delay to ensure all elements are rendered
  setTimeout(() => {
    if (document.querySelector('.crew-grid').innerHTML.trim() === '') {
      console.warn('Crew section appears empty, forcing reload...');
      loadMovieData();
    }
  }, 2000);
});

// ===== Load Movie Data from Backend Django API =====
async function loadMovieData() {
  const tmdbMovieId = getCurrentMovieTMDbId();

  if (!tmdbMovieId) {
    console.error('No TMDb ID found, cannot load movie data');
    showErrorState();
    return;
  }

  // Show loading states for all sections that will be updated
  showLoadingState();

  try {
    // Ler dados que vieram do Django via window
    const crewData = window.movieCrewData || [];
    const castData = window.movieCastData || [];

    console.log('Movie details page loaded via Django backend');
    console.log('TMDb ID:', tmdbMovieId);
    console.log('Crew data loaded:', crewData.length, 'members');
    console.log('Cast data loaded:', castData.length, 'members');

    // Criar estrutura de creditsData
    currentMovieCredits = {
      crew: crewData,
      cast: castData
    };

    // Carregar seções se houver dados
    if (crewData && crewData.length > 0) {
      console.log('Loading crew section...');
      loadOverviewCrewSection(currentMovieCredits);
    } else {
      console.warn('No crew data available');
    }

    if (castData && castData.length > 0) {
      console.log('Loading cast overview...');
      loadOverviewCast();
    } else {
      console.warn('No cast data available');
    }

    // Hide loading states
    hideLoadingState();

  } catch (error) {
    console.error('Error loading movie data:', error);
    showErrorState();
  }
}

function showLoadingState() {
  // Add loading spinners for crew section
  const crewGrid = document.querySelector('.crew-grid');
  if (crewGrid) {
    crewGrid.innerHTML = '<div class="loading-spinner">Carregando equipe...</div>';
  }

  // Add loading spinners for cast section
  const castGrid = document.getElementById('overview-cast-grid');
  if (castGrid) {
    castGrid.innerHTML = '<div class="loading-spinner">Carregando elenco...</div>';
  }
}

function hideLoadingState() {
  // Remover spinners de loading se ainda estiverem presentes
  const crewGrid = document.querySelector('.crew-grid');
  const castGrid = document.getElementById('overview-cast-grid');

  if (crewGrid) {
    const loadingSpinner = crewGrid.querySelector('.loading-spinner');
    if (loadingSpinner) {
      crewGrid.innerHTML = ''; // Limpar apenas se ainda tiver o spinner
    }
  }

  if (castGrid) {
    const loadingSpinner = castGrid.querySelector('.loading-spinner');
    if (loadingSpinner) {
      castGrid.innerHTML = ''; // Limpar apenas se ainda tiver o spinner
    }
  }
}

function showErrorState() {
  const crewGrid = document.querySelector('.crew-grid');
  if (crewGrid) {
    crewGrid.innerHTML = '<div class="error-message">Erro ao carregar dados da equipe.</div>';
  }

  const castGrid = document.getElementById('overview-cast-grid');
  if (castGrid) {
    castGrid.innerHTML = '<div class="error-message">Erro ao carregar dados do elenco.</div>';
  }
}

// ===== Load Overview Crew Section (Only Key Roles) =====
function loadOverviewCrewSection(creditsData) {
  console.log('loadCrewSection called with:', creditsData);

  const crewGrid = document.querySelector('.crew-grid');
  console.log('crewGrid element found:', !!crewGrid);

  if (!crewGrid) {
    console.error('crew-grid element not found');
    return;
  }

  if (!creditsData || !creditsData.crew) {
    console.error('No credits data or crew data available:', creditsData);
    crewGrid.innerHTML = '<div class="error-message">Dados da equipe não disponíveis</div>';
    return;
  }

  console.log('Total crew members:', creditsData.crew.length);

  // Define key roles for overview (only most important)
  const keyRoles = ['Director', 'Writer', 'Screenplay', 'Producer', 'Executive Producer'];

  // Define job hierarchy (order of importance)
  const jobHierarchy = ['Director', 'Writer', 'Screenplay', 'Producer', 'Executive Producer'];

  const importantCrew = creditsData.crew.filter(member => jobHierarchy.includes(member.job));

  console.log('Important crew members found:', importantCrew.length, importantCrew);

  if (importantCrew.length === 0) {
    console.warn('No important crew members found');
    crewGrid.innerHTML = '<div class="info-message">Informações da equipe em carregamento...</div>';
    return;
  }

  // Remove duplicates by combining roles for same person
  const uniqueCrew = importantCrew.reduce((acc, current) => {
    const existing = acc.find(item => item.id === current.id);
    if (existing) {
      if (!existing.job.includes(current.job)) {
        existing.job += `, ${current.job}`;
      }
    } else {
      acc.push({ ...current });
    }
    return acc;
  }, []);

  // Sort by job hierarchy (Director first, then Writer, etc.)
  uniqueCrew.sort((a, b) => {
    // Get the highest priority job for each person (lowest index = highest priority)
    const getHighestPriority = (jobs) => {
      const indices = jobs.split(', ').map(job => jobHierarchy.indexOf(job)).filter(i => i !== -1);
      return indices.length > 0 ? Math.min(...indices) : 999; // 999 for unknown jobs
    };

    const aPriority = getHighestPriority(a.job);
    const bPriority = getHighestPriority(b.job);

    // If same priority, sort alphabetically by name
    if (aPriority === bPriority) {
      return a.name.localeCompare(b.name);
    }

    return aPriority - bPriority;
  });

  console.log('Unique crew members (sorted by hierarchy):', uniqueCrew.map(member => `${member.name} - ${member.job}`));

  // Job translations with hierarchy
  const jobTranslations = {
    'Director': 'Diretor',
    'Writer': 'Roteirista',
    'Screenplay': 'Roteirista',
    'Story': 'História Original',
    'Producer': 'Produtor',
    'Executive Producer': 'Produtor Executivo',
    'Co-Producer': 'Coprodutor',
    'Original Music Composer': 'Compositor',
    'Music': 'Música',
    'Director of Photography': 'Diretor de Fotografia',
    'Cinematography': 'Cinematografia',
    'Editor': 'Editor',
    'Film Editor': 'Editor de Filme',
    'Production Designer': 'Designer de Produção',
    'Costume Designer': 'Figurinista',
    'Makeup Artist': 'Maquiador',
    'Sound Designer': 'Designer de Som'
  };

  // Update overview crew grid with only key roles (max 4)
  const crewHTML = uniqueCrew.slice(0, 4).map((member, index) => {
    // For each person, sort their jobs by hierarchy and translate
    const jobs = member.job.split(', ');
    const sortedJobs = jobs.sort((a, b) => {
      const aIndex = jobHierarchy.indexOf(a);
      const bIndex = jobHierarchy.indexOf(b);
      return aIndex - bIndex;
    });

    const translatedJob = sortedJobs
      .map(job => jobTranslations[job] || job)
      .join(', ');

    return `
      <div class="crew-member">
        <span class="crew-role">${translatedJob}</span>
        <span class="crew-name">${member.name}</span>
      </div>
    `;
  }).join('');

  console.log('Generated overview crew HTML:', crewHTML);
  crewGrid.innerHTML = crewHTML;

  // Add CSS for crew section styling if not already present
  if (!document.querySelector('#crew-overview-styles')) {
    const style = document.createElement('style');
    style.id = 'crew-overview-styles';
    style.textContent = `
      .section-header-with-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .crew-shortcut-btn {
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        color: #dc2626;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .crew-shortcut-btn:hover {
        background: rgba(220, 38, 38, 0.2);
        border-color: rgba(220, 38, 38, 0.5);
        transform: translateX(2px);
      }
      .crew-shortcut-btn svg {
        transition: transform 0.3s ease;
      }
      .crew-shortcut-btn:hover svg {
        transform: translateX(2px);
      }
      .crew-member .crew-role {
        color: #dc2626 !important;
        font-weight: 500;
      }
      .crew-member .crew-name {
        color: #ffffff;
        font-weight: 400;
      }
    `;
    document.head.appendChild(style);
  }

  console.log('Overview crew section updated successfully');
}

// ===== Load Full Crew Section with All Roles =====
function loadFullCrewSection(creditsData) {
  const crewGridFull = document.querySelector('.crew-grid-full');
  if (!crewGridFull) {
    console.error('crew-grid-full element not found');
    return;
  }

  if (!creditsData || !creditsData.crew) {
    console.error('No credits data or crew data available for full crew');
    crewGridFull.innerHTML = '<div class="error-message">Dados da equipe não disponíveis</div>';
    return;
  }

  console.log('Loading full crew section with', creditsData.crew.length, 'total crew members');

  // Define complete job hierarchy for full crew section
  const fullJobHierarchy = [
    'Director',
    'Writer',
    'Screenplay',
    'Story',
    'Producer',
    'Executive Producer',
    'Co-Producer',
    'Associate Producer',
    'Original Music Composer',
    'Music',
    'Music Supervisor',
    'Director of Photography',
    'Cinematography',
    'Editor',
    'Film Editor',
    'Production Designer',
    'Art Direction',
    'Set Decoration',
    'Costume Designer',
    'Makeup Artist',
    'Hair Designer',
    'Sound Designer',
    'Sound Editor',
    'Sound Mixer',
    'Visual Effects Supervisor',
    'Special Effects Supervisor',
    'Stunt Coordinator',
    'Casting',
    'Location Manager'
  ];

  const importantCrew = creditsData.crew.filter(member => fullJobHierarchy.includes(member.job));

  // Remove duplicates by combining roles for same person
  const uniqueCrew = importantCrew.reduce((acc, current) => {
    const existing = acc.find(item => item.id === current.id);
    if (existing) {
      if (!existing.job.includes(current.job)) {
        existing.job += `, ${current.job}`;
      }
    } else {
      acc.push({ ...current });
    }
    return acc;
  }, []);

  // Sort by job hierarchy (Director first, then Writer, etc.)
  uniqueCrew.sort((a, b) => {
    const getHighestPriority = (jobs) => {
      const indices = jobs.split(', ').map(job => fullJobHierarchy.indexOf(job)).filter(i => i !== -1);
      return indices.length > 0 ? Math.min(...indices) : 999;
    };

    const aPriority = getHighestPriority(a.job);
    const bPriority = getHighestPriority(b.job);

    if (aPriority === bPriority) {
      return a.name.localeCompare(b.name);
    }

    return aPriority - bPriority;
  });

  // Extended job translations
  const fullJobTranslations = {
    'Director': 'Diretor',
    'Writer': 'Roteirista',
    'Screenplay': 'Roteirista',
    'Story': 'História Original',
    'Producer': 'Produtor',
    'Executive Producer': 'Produtor Executivo',
    'Co-Producer': 'Coprodutor',
    'Associate Producer': 'Produtor Associado',
    'Original Music Composer': 'Compositor',
    'Music': 'Música',
    'Music Supervisor': 'Supervisor Musical',
    'Director of Photography': 'Diretor de Fotografia',
    'Cinematography': 'Cinematografia',
    'Editor': 'Editor',
    'Film Editor': 'Editor de Filme',
    'Production Designer': 'Designer de Produção',
    'Art Direction': 'Direção de Arte',
    'Set Decoration': 'Decoração de Cenário',
    'Costume Designer': 'Figurinista',
    'Makeup Artist': 'Maquiador',
    'Hair Designer': 'Cabeleireiro',
    'Sound Designer': 'Designer de Som',
    'Sound Editor': 'Editor de Som',
    'Sound Mixer': 'Mixador de Som',
    'Visual Effects Supervisor': 'Supervisor de Efeitos Visuais',
    'Special Effects Supervisor': 'Supervisor de Efeitos Especiais',
    'Stunt Coordinator': 'Coordenador de Acrobacias',
    'Casting': 'Diretor de Elenco',
    'Location Manager': 'Gerente de Locações'
  };

  // Create crew cards with enhanced styling
  const crewHTML = uniqueCrew.map((member, index) => {
    const jobs = member.job.split(', ');
    const sortedJobs = jobs.sort((a, b) => {
      const aIndex = fullJobHierarchy.indexOf(a);
      const bIndex = fullJobHierarchy.indexOf(b);
      return aIndex - bIndex;
    });

    const translatedJob = sortedJobs
      .map(job => fullJobTranslations[job] || job)
      .join(', ');

    // All crew members have equal styling now
    const memberClass = 'crew-card-full';

    return `
      <div class="${memberClass}">
        <div class="crew-info-full">
          <h4 class="crew-name-full">${member.name}</h4>
          <p class="crew-role-full">${translatedJob}</p>
          ${member.department ? `<span class="crew-department">${member.department}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  crewGridFull.innerHTML = crewHTML;

  // Add CSS for full crew styling if not already present
  if (!document.querySelector('#crew-full-styles')) {
    const style = document.createElement('style');
    style.id = 'crew-full-styles';
    style.textContent = `
      .crew-grid-full {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
      }
      .crew-card-full {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        transition: all 0.3s ease;
      }
      .crew-card-full:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(37, 99, 235, 0.3);
        transform: translateY(-2px);
      }
      .crew-name-full {
        font-size: 1.1rem;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 0.5rem;
      }
      .crew-role-full {
        font-size: 0.9rem;
        color: #dc2626;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      .crew-department {
        font-size: 0.8rem;
        color: #64748b;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
  }

  console.log('Full crew section updated with', uniqueCrew.length, 'crew members');
}

// ===== Load Overview Cast (shows first 4 members) =====
function loadOverviewCast() {
  const overviewCastGrid = document.getElementById('overview-cast-grid');
  if (!overviewCastGrid) return;

  if (!currentMovieCredits || !currentMovieCredits.cast) {
    overviewCastGrid.innerHTML = `
      <div class="no-cast-message">
        <p>Informações do elenco não disponíveis.</p>
      </div>
    `;
    return;
  }

  // Show only first 4 cast members in overview
  const topCast = currentMovieCredits.cast.slice(0, 4);

  overviewCastGrid.innerHTML = topCast.map(member => {
    // Suportar ambos os formatos: pt-BR ("nome", "personagem") e en ("name", "character")
    const actorName = member.nome || member.name;
    const characterName = member.personagem || member.character;
    const photoPath = member.foto_path || member.profile_path;

    return `
      <div class="cast-card">
        <img src="${photoPath ? TMDB_IMAGE_BASE_URL + photoPath : `https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}&size=150&background=667eea&color=fff`}" alt="${actorName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}&size=150&background=667eea&color=fff'" />
        <div class="cast-info">
          <span class="actor-name">${actorName}</span>
          <span class="character-name">${characterName}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===== Content Loading Functions =====
function loadTabContent(tabName) {
  switch(tabName) {
    case 'crew':
      if (currentMovieCredits) {
        loadFullCrewSection(currentMovieCredits);
      }
      break;
    case 'cast':
      loadFullCast();
      break;
    case 'reviews':
      loadFullReviews();
      break;
    case 'media':
      loadMediaContent('photos');
      break;
    case 'similar':
      loadSimilarMovies();
      break;
  }
}

function loadFullCast() {
  const castGrid = document.querySelector('.cast-grid-full');
  if (!castGrid) return;

  if (!currentMovieCredits || !currentMovieCredits.cast) {
    castGrid.innerHTML = `
      <div class="no-cast-message">
        <p>Informações do elenco não disponíveis para este filme.</p>
      </div>
    `;
    return;
  }

  // Show all cast members (limit to 20 for performance)
  const cast = currentMovieCredits.cast.slice(0, 20);

  castGrid.innerHTML = cast.map(member => {
    // Suportar ambos os formatos: pt-BR ("nome", "personagem") e en ("name", "character")
    const actorName = member.nome || member.name;
    const characterName = member.personagem || member.character;
    const photoPath = member.foto_path || member.profile_path;

    return `
      <div class="cast-card">
        <img src="${photoPath ? TMDB_IMAGE_BASE_URL + photoPath : `https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}&size=150&background=667eea&color=fff`}" alt="${actorName}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}&size=150&background=667eea&color=fff'" />
        <div class="cast-info">
          <span class="actor-name">${actorName}</span>
          <span class="character-name">${characterName}</span>
        </div>
      </div>
    `;
  }).join('');
}

function loadFullReviews() {
  // Não fazer nada - as críticas já estão renderizadas pelo Django no HTML
  // O template movie_details.html já renderiza as críticas com {% for critica in criticas %}
  return;
}

async function loadMediaContent(mediaType) {
  const mediaGrid = document.querySelector('.media-grid');
  if (!mediaGrid) return;

  // Show loading state
  mediaGrid.innerHTML = '<div class="loading-spinner">Carregando mídia...</div>';

  let content = '';

  try {
    switch(mediaType) {
      case 'photos':
        content = await generatePhotosContent();
        break;
      case 'videos':
        content = await generateVideosContent();
        break;
      case 'posters':
        content = await generatePostersContent();
        break;
    }

    mediaGrid.innerHTML = content;
  } catch (error) {
    console.error('Error loading media content:', error);
    mediaGrid.innerHTML = '<div class="error-message">Erro ao carregar mídia.</div>';
  }
}

async function generatePhotosContent() {
  // Mídia de fotos: funcionalidade futura - requer implementação de endpoint no backend
  return '<div class="no-media-message"><p>Fotos em breve! (Requer endpoint backend)</p></div>';
}

async function generateVideosContent() {
  // Mídia de vídeos: funcionalidade futura - requer implementação de endpoint no backend
  return '<div class="no-media-message"><p>Vídeos em breve! (Requer endpoint backend)</p></div>';
}

// Play YouTube video
function playVideo(videoKey) {
  window.open(`https://www.youtube.com/watch?v=${videoKey}`, '_blank');
}

async function generatePostersContent() {
  // Mídia de posters: funcionalidade futura - requer implementação de endpoint no backend
  return '<div class="no-media-message"><p>Posters em breve! (Requer endpoint backend)</p></div>';
}

function loadSimilarMovies() {
  const similarGrid = document.querySelector('.similar-grid-full');
  if (!similarGrid) return;

  if (!currentSimilarMovies || !currentSimilarMovies.results) {
    similarGrid.innerHTML = `
      <div class="no-similar-message">
        <p>Filmes similares não disponíveis.</p>
      </div>
    `;
    return;
  }

  // Show first 8 similar movies
  const movies = currentSimilarMovies.results.slice(0, 8);

  similarGrid.innerHTML = movies.map(movie => `
    <div class="movie-card similar-movie-card" onclick="navigateToMovie(${movie.id})">
      <div class="movie-poster">
        <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.title}" loading="lazy" />
        <div class="movie-overlay">
          <div class="movie-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${(movie.vote_average / 2).toFixed(1)}
          </div>
        </div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <div class="movie-meta">
          <span class="movie-year">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Switch to crew tab from overview shortcut
function switchToCrewTab() {
  // Remove active class from all tabs and contents
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Add active class to crew tab and content
  const crewTabBtn = document.querySelector('.tab-btn[data-tab="crew"]');
  const crewTabContent = document.getElementById('crew');

  if (crewTabBtn) crewTabBtn.classList.add('active');
  if (crewTabContent) crewTabContent.classList.add('active');

  // Load crew content if not already loaded
  loadTabContent('crew');
}

// Navigate to movie details using Django URL pattern
function navigateToMovie(tmdbMovieId) {
  // Use Django URL pattern directly with TMDb ID
  window.location.href = `/filmes/${tmdbMovieId}/`;
}

// ===== Image Expansion Functionality =====
function expandImage(imageUrl) {
  // Create fullscreen overlay
  const overlay = document.createElement('div');
  overlay.className = 'image-fullscreen-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
    animation: fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div class="image-fullscreen-container" style="position: relative; max-width: 90vw; max-height: 90vh;">
      <img src="${imageUrl}" alt="Imagem ampliada" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
      <button class="image-close" style="position: absolute; top: -40px; right: -40px; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  `;

  // Close on click outside or close button
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.image-close')) {
      overlay.remove();
    }
  });

  // Close on ESC key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(overlay);

  // Add fade-in animation if not already present
  if (!document.querySelector('#image-fade-animation')) {
    const style = document.createElement('style');
    style.id = 'image-fade-animation';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== Additional Interactive Features =====

// ===== Like System for Reviews =====
function toggleLike(button) {
  const criticaId = button.dataset.criticaId;
  const likeCountSpan = button.querySelector('.like-count');

  // Fazer requisição AJAX
  fetch(`/api/critica/${criticaId}/like/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => {
    if (response.status === 401) {
      // Usuário não está autenticado, redirecionar para login
      window.location.href = '/login/';
      return null;
    }
    return response.json();
  })
  .then(data => {
    if (!data) return; // Se redirecionou, não processar

    if (data.success) {
      // Atualizar contagem de likes
      likeCountSpan.textContent = data.total_likes;

      // Atualizar classe liked
      if (data.liked) {
        button.classList.add('liked');
      } else {
        button.classList.remove('liked');
      }
    } else {
      console.error('Erro ao processar like:', data.message);
      alert('Erro ao processar like. Tente novamente.');
    }
  })
  .catch(error => {
    console.error('Erro na requisição:', error);
    alert('Erro ao processar like. Tente novamente.');
  });
}

// Função auxiliar para obter CSRF token
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

// Media item interactions
document.addEventListener('click', (e) => {
  if (e.target.closest('.media-expand')) {
    // Handle media expansion
    console.log('Expanding media item...');
  }
  
  if (e.target.closest('.play-button')) {
    // Handle video play
    console.log('Playing video...');
  }
  
  if (e.target.closest('.media-download')) {
    // Handle download
    console.log('Downloading media...');
  }
});

// Action buttons functionality
document.addEventListener('click', (e) => {
  if (e.target.closest('.action-btn')) {
    const button = e.target.closest('.action-btn');
    button.classList.toggle('active');
    
    // Add visual feedback
    if (button.classList.contains('active')) {
      button.style.background = 'var(--red)';
      button.style.color = 'white';
    } else {
      button.style.background = '';
      button.style.color = '';
    }
  }
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

// ===== Spoiler Reveal Functionality =====
function toggleSpoiler(button) {
  const reviewText = button.closest('.review-text');
  const spoilerBlur = reviewText.querySelector('.spoiler-blur');
  
  if (spoilerBlur) {
    spoilerBlur.style.filter = 'none';
    spoilerBlur.style.userSelect = 'text';
    button.style.display = 'none';
  }
}