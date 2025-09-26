// ===== TMDb API Configuration =====
const TMDB_API_KEY = 'e2bf84876d17e898ef5fc63655cd5040';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ===== Import Movie Database from main.js =====
// Para simplicidade, vou redefinir os dados aqui. Em produção, seria melhor importar
const moviesDatabase = [
  {
    id: 1,
    tmdbId: 27205,
    titulo: "A Origem",
    tituloOriginal: "Inception",
    ano: 2010,
    duracao: "2h 28min",
    classificacao: "PG-13",
    poster: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    nota: 8.364,
    imdbRating: 8.4,
    generos: ["Ação", "Ficção Científica", "Aventura"],
    diretor: "Christopher Nolan",
    sinopse: "Um especialista em roubo de sonhos recebe a missão impossível de plantar uma ideia na mente de alguém em vez de roubá-la.",
    assistido: true,
    favorito: true,
    streaming: ["Netflix", "Prime Video", "Apple TV+"]
  },
  {
    id: 2,
    tmdbId: 157336,
    titulo: "Interestelar",
    tituloOriginal: "Interstellar",
    ano: 2014,
    duracao: "2h 49min",
    classificacao: "PG-13",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    nota: 8.417,
    imdbRating: 8.4,
    generos: ["Aventura", "Drama", "Ficção Científica"],
    diretor: "Christopher Nolan",
    sinopse: "Um pai e ex-piloto lidera uma missão interestelar para salvar a humanidade em um futuro onde a Terra está morrendo.",
    assistido: true,
    favorito: true,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 3,
    tmdbId: 155,
    titulo: "Batman: O Cavaleiro das Trevas",
    tituloOriginal: "The Dark Knight",
    ano: 2008,
    duracao: "2h 32min",
    classificacao: "PG-13",
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    nota: 8.512,
    imdbRating: 8.5,
    generos: ["Drama", "Ação", "Crime", "Thriller"],
    diretor: "Christopher Nolan",
    sinopse: "Batman enfrenta seu maior desafio quando o Coringa semeia o caos em Gotham, testando os limites da justiça e da moralidade.",
    assistido: true,
    favorito: true,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 4,
    tmdbId: 19995,
    titulo: "Avatar",
    tituloOriginal: "Avatar",
    ano: 2009,
    duracao: "2h 42min",
    classificacao: "PG-13",
    poster: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    nota: 7.573,
    imdbRating: 7.6,
    generos: ["Ação", "Aventura", "Fantasia", "Ficção Científica"],
    diretor: "James Cameron",
    sinopse: "Em um mundo alienígena, um ex-marine paralítico ganha uma nova vida através de um corpo Avatar, mas logo questiona sua missão.",
    assistido: false,
    favorito: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 5,
    tmdbId: 24428,
    titulo: "Os Vingadores",
    tituloOriginal: "The Avengers",
    ano: 2012,
    duracao: "2h 23min",
    classificacao: "PG-13",
    poster: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    nota: 7.71,
    imdbRating: 8.0,
    generos: ["Ficção Científica", "Ação", "Aventura"],
    diretor: "Joss Whedon",
    sinopse: "Quando uma ameaça global emerge, os maiores super-heróis da Terra devem unir forças pela primeira vez para salvar o mundo.",
    assistido: true,
    favorito: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 6,
    tmdbId: 550,
    titulo: "Clube da Luta",
    tituloOriginal: "Fight Club",
    ano: 1999,
    duracao: "2h 19min",
    classificacao: "R",
    poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    nota: 8.433,
    imdbRating: 8.8,
    generos: ["Drama", "Thriller"],
    diretor: "David Fincher",
    sinopse: "Um funcionário de escritório insone e um fabricante de sabão formam um clube de luta subterrâneo que evolui para algo muito mais.",
    assistido: true,
    favorito: true,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 7,
    tmdbId: 13,
    titulo: "Forrest Gump",
    tituloOriginal: "Forrest Gump",
    ano: 1994,
    duracao: "2h 22min",
    classificacao: "PG-13",
    poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    nota: 8.471,
    imdbRating: 8.8,
    generos: ["Drama", "Romance"],
    diretor: "Robert Zemeckis",
    sinopse: "A história de vida extraordinária de Forrest Gump, um homem simples que testemunhou e influenciou eventos marcantes da história americana.",
    assistido: true,
    favorito: false,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 8,
    tmdbId: 680,
    titulo: "Pulp Fiction",
    tituloOriginal: "Pulp Fiction",
    ano: 1994,
    duracao: "2h 34min",
    classificacao: "R",
    poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    nota: 8.506,
    imdbRating: 8.9,
    generos: ["Crime", "Drama", "Thriller"],
    diretor: "Quentin Tarantino",
    sinopse: "Histórias interligadas de crime e redenção em Los Angeles, contadas de forma não linear por Quentin Tarantino.",
    assistido: false,
    favorito: false,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 9,
    tmdbId: 238,
    titulo: "Um Sonho de Liberdade",
    tituloOriginal: "The Shawshank Redemption",
    ano: 1994,
    duracao: "2h 22min",
    classificacao: "R",
    poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    nota: 8.704,
    imdbRating: 9.3,
    generos: ["Drama"],
    diretor: "Frank Darabont",
    sinopse: "Dois homens presos desenvolvem uma amizade ao longo de vários anos, encontrando consolo e eventual redenção através de atos de decência comum.",
    assistido: true,
    favorito: true,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 10,
    tmdbId: 122,
    titulo: "O Senhor dos Anéis: O Retorno do Rei",
    tituloOriginal: "The Lord of the Rings: The Return of the King",
    ano: 2003,
    duracao: "3h 21min",
    classificacao: "PG-13",
    poster: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    nota: 8.482,
    imdbRating: 8.9,
    generos: ["Aventura", "Drama", "Fantasia"],
    diretor: "Peter Jackson",
    sinopse: "Gandalf e Aragorn lideram o Mundo dos Homens contra o exército de Sauron para desviar sua atenção de Frodo e Sam.",
    assistido: true,
    favorito: true,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 11,
    tmdbId: 496243,
    titulo: "Parasita",
    tituloOriginal: "기생충",
    ano: 2019,
    duracao: "2h 12min",
    classificacao: "R",
    poster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    nota: 8.506,
    imdbRating: 8.6,
    generos: ["Comédia", "Thriller", "Drama"],
    diretor: "Bong Joon-ho",
    sinopse: "Uma família pobre planeja se infiltrar na casa de uma família rica, posando como trabalhadores altamente qualificados.",
    assistido: false,
    favorito: false,
    streaming: ["Prime Video", "Apple TV+"]
  },
  {
    id: 12,
    tmdbId: 372058,
    titulo: "Coringa",
    tituloOriginal: "Joker",
    ano: 2019,
    duracao: "2h 2min",
    classificacao: "R",
    poster: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    nota: 8.159,
    imdbRating: 8.4,
    generos: ["Crime", "Drama", "Thriller"],
    diretor: "Todd Phillips",
    sinopse: "Um comediante fracassado mergulha na loucura e torna-se uma figura psicopática de crime em Gotham City.",
    assistido: true,
    favorito: false,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 13,
    tmdbId: 429617,
    titulo: "Homem-Aranha no Aranhaverso",
    tituloOriginal: "Spider-Man: Into the Spider-Verse",
    ano: 2018,
    duracao: "1h 57min",
    classificacao: "PG",
    poster: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    nota: 8.426,
    imdbRating: 8.4,
    generos: ["Ação", "Aventura", "Animação"],
    diretor: "Bob Persichetti",
    sinopse: "Miles Morales se torna o Homem-Aranha de sua realidade e cruza caminhos com seus colegas de outras dimensões.",
    assistido: true,
    favorito: true,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 14,
    tmdbId: 278,
    titulo: "Matrix",
    tituloOriginal: "The Matrix",
    ano: 1999,
    duracao: "2h 16min",
    classificacao: "R",
    poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    nota: 8.218,
    imdbRating: 8.7,
    generos: ["Ação", "Ficção Científica"],
    diretor: "Lana Wachowski",
    sinopse: "Um programador descobre que a realidade como ele a conhece não existe e embarca numa jornada para libertar a humanidade.",
    assistido: true,
    favorito: true,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 15,
    tmdbId: 324857,
    titulo: "Homem-Aranha: Sem Volta para Casa",
    tituloOriginal: "Spider-Man: No Way Home",
    ano: 2021,
    duracao: "2h 28min",
    classificacao: "PG-13",
    poster: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    nota: 8.1,
    imdbRating: 8.4,
    generos: ["Ação", "Aventura", "Ficção Científica"],
    diretor: "Jon Watts",
    sinopse: "Peter Parker pede ajuda ao Doutor Estranho para fazer todos esquecerem que ele é o Homem-Aranha, mas isso abre o multiverso.",
    assistido: true,
    favorito: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 16,
    tmdbId: 106646,
    titulo: "O Lobo de Wall Street",
    tituloOriginal: "The Wolf of Wall Street",
    ano: 2013,
    duracao: "3h 0min",
    classificacao: "R",
    poster: "/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg",
    nota: 8.033,
    imdbRating: 8.2,
    generos: ["Biografia", "Crime", "Drama"],
    diretor: "Martin Scorsese",
    sinopse: "Baseado na história real de Jordan Belfort, desde sua ascensão a um corretor da bolsa rica até sua queda envolvendo crime, corrupção e governo federal.",
    assistido: false,
    favorito: false,
    streaming: ["Netflix", "Prime Video"]
  },
  {
    id: 17,
    tmdbId: 329865,
    titulo: "Chegada",
    tituloOriginal: "Arrival",
    ano: 2016,
    duracao: "1h 56min",
    classificacao: "PG-13",
    poster: "/yIuyBjZlwZvI2vOHZnD5kT3npBf.jpg",
    nota: 7.647,
    imdbRating: 7.9,
    generos: ["Drama", "Ficção Científica"],
    diretor: "Denis Villeneuve",
    sinopse: "Uma linguista trabalha com militares para se comunicar com formas de vida alienígenas após doze naves misteriosas aparecerem ao redor do mundo.",
    assistido: true,
    favorito: true,
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    id: 18,
    tmdbId: 346698,
    titulo: "Pantera Negra",
    tituloOriginal: "Black Panther",
    ano: 2018,
    duracao: "2h 14min",
    classificacao: "PG-13",
    poster: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
    nota: 7.287,
    imdbRating: 7.3,
    generos: ["Ação", "Aventura", "Ficção Científica"],
    diretor: "Ryan Coogler",
    sinopse: "T'Challa retorna para casa para a nação isolada e tecnologicamente avançada de Wakanda para se tornar rei.",
    assistido: true,
    favorito: false,
    streaming: ["Disney+", "Prime Video"]
  },
  {
    id: 19,
    tmdbId: 508947,
    titulo: "Duna",
    tituloOriginal: "Dune",
    ano: 2021,
    duracao: "2h 35min",
    classificacao: "PG-13",
    poster: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    nota: 7.786,
    imdbRating: 8.0,
    generos: ["Aventura", "Drama", "Ficção Científica"],
    diretor: "Denis Villeneuve",
    sinopse: "Paul Atreides lidera uma rebelião para libertar seu povo no planeta deserto Arrakis do controle dos Harkonnen.",
    assistido: false,
    favorito: false,
    streaming: ["Max", "Prime Video"]
  },
  {
    id: 20,
    tmdbId: 299534,
    titulo: "Vingadores: Ultimato",
    tituloOriginal: "Avengers: Endgame",
    ano: 2019,
    duracao: "3h 1min",
    classificacao: "PG-13",
    poster: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    nota: 8.254,
    imdbRating: 8.4,
    generos: ["Aventura", "Ficção Científica", "Ação"],
    diretor: "Anthony Russo",
    sinopse: "Após os eventos devastadores de Guerra Infinita, os Vingadores restantes devem se unir mais uma vez para desfazer as ações de Thanos.",
    assistido: true,
    favorito: true,
    streaming: ["Disney+", "Prime Video"]
  }
];

// ===== DOM Elements =====
const moviesGrid = document.getElementById('movies-grid');
const filterTabs = document.querySelectorAll('.filter-tab');
const sortSelect = document.getElementById('sort-movies');
const loadMoreBtn = document.getElementById('load-more');
const viewToggle = document.getElementById('view-toggle');
const searchInput = document.querySelector('.search-input');

// ===== State Variables =====
let currentFilter = 'all';
let currentSort = 'popular';
let currentView = 'grid'; // 'grid' or 'list'
let displayedMovies = 12;
let filteredMovies = [...moviesDatabase];

// ===== Utility Functions =====
function getFullImageUrl(path) {
  if (!path) return 'https://via.placeholder.com/500x750/1a1f2e/ffffff?text=Poster+Indisponível';
  return `${TMDB_IMAGE_BASE_URL}${path}`;
}

function createMovieCard(movie) {
  const posterUrl = getFullImageUrl(movie.poster);
    const posterUrl = movie.poster
    ? `${TMDB_IMAGE_BASE_URL}${movie.poster}`
  'https://via.placeholder.com/300x450/1a1f2e/ffffff?text=Sem+Imagem';
  
  return `
    <div class="movie-card ${currentView}" data-id="${movie.id}" data-genres="${movie.generos.join(',').toLowerCase()}">
      <div class="movie-poster">
        <img src="${posterUrl}" alt="${movie.titulo}" loading="lazy" />
        <div class="movie-overlay">
          <div class="movie-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${(movie.nota / 2).toFixed(1)}
          </div>
          <div class="movie-actions">
            <button class="action-btn ${movie.assistido ? 'active' : ''}" data-action="watched" title="Assistido">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="action-btn ${movie.favorito ? 'active' : ''}" data-action="favorite" title="Favorito">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button class="action-btn" data-action="list" title="Adicionar à Lista">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.titulo}</h3>
        <div class="movie-meta">
          <span class="movie-year">${movie.ano}</span>
          <span class="movie-genres">${movie.generos.join(', ')}</span>
        </div>
        <div class="movie-synopsis">
          <p>${movie.sinopse}</p>
        </div>
      </div>
    </div>
  `;
}

function filterMovies(genre) {
  if (genre === 'all') {
    filteredMovies = [...moviesDatabase];
  } else {
    const genreMap = {
      'action': 'ação',
      'adventure': 'aventura', 
      'comedy': 'comédia',
      'drama': 'drama',
      'scifi': 'ficção científica',
      'thriller': 'thriller'
    };
    
    const targetGenre = genreMap[genre];
    filteredMovies = moviesDatabase.filter(movie => 
      movie.generos.some(g => g.toLowerCase().includes(targetGenre))
    );
  }
  
  sortMovies(currentSort);
  displayedMovies = 12;
  renderMovies();
}

function sortMovies(sortBy) {
  switch(sortBy) {
    case 'popular':
      filteredMovies.sort((a, b) => b.nota - a.nota);
      break;
    case 'rating':
      filteredMovies.sort((a, b) => b.imdbRating - a.imdbRating);
      break;
    case 'recent':
      filteredMovies.sort((a, b) => b.ano - a.ano);
      break;
    case 'alphabetical':
      filteredMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
  }
}

function renderMovies() {
  if (!moviesGrid) return;
  
  const moviesToShow = filteredMovies.slice(0, displayedMovies);
  
  if (moviesToShow.length === 0) {
    moviesGrid.innerHTML = `
      <div class="no-movies">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <h3>Nenhum filme encontrado</h3>
        <p>Tente ajustar os filtros ou busca</p>
      </div>
    `;
    return;
  }
  
  moviesGrid.innerHTML = moviesToShow.map(movie => createMovieCard(movie)).join('');
  
  // Update load more button
  if (loadMoreBtn) {
    if (displayedMovies >= filteredMovies.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }
}

function toggleView() {
  currentView = currentView === 'grid' ? 'list' : 'grid';
  
  moviesGrid.className = `movies-grid ${currentView}-view`;
  
  // Update view toggle icon
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
  
  renderMovies();
}

function handleSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  
  if (searchTerm.length >= 2) {
    filteredMovies = moviesDatabase.filter(movie => 
      movie.titulo.toLowerCase().includes(searchTerm) ||
      movie.diretor.toLowerCase().includes(searchTerm) ||
      movie.generos.some(g => g.toLowerCase().includes(searchTerm))
    );
  } else if (searchTerm.length === 0) {
    filterMovies(currentFilter);
    return;
  }
  
  displayedMovies = 12;
  renderMovies();
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize page
  renderMovies();
  initNewsDropdown();
  
  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentFilter = tab.dataset.filter;
      filterMovies(currentFilter);
    });
  });
  
  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      sortMovies(currentSort);
      renderMovies();
    });
  }
  
  // View toggle
  if (viewToggle) {
    viewToggle.addEventListener('click', toggleView);
  }
  
  // Load more
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      displayedMovies += 12;
      renderMovies();
    });
  }
  
  // Search
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearch(e.target.value);
      }, 300);
    });
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
        const movieId = parseInt(card.dataset.id);
        
        // Toggle button state
        btn.classList.toggle('active');
        
        // Handle action logic here
        console.log(`${action} toggled for movie ID: ${movieId}`);
        return;
      }
      
      // Navigate to movie details
      const movieId = card.dataset.id;
      window.location.href = `filmes.html?id=${movieId}`;
    }
  });
  
  // Show API key warning if not configured
  if (!TMDB_API_KEY) {
    console.warn(`
      🎬 Para usar imagens reais dos filmes, configure sua chave da API do TMDb:
      1. Acesse: https://www.themoviedb.org/settings/api
      2. Obtenha sua chave da API
      3. Adicione na variável TMDB_API_KEY no arquivo movies.js
    `);
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