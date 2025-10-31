// Diary/Calendar Page JavaScript

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDateForAdd = null;
let selectedMovieData = null;
let diaryEntries = {};

document.addEventListener('DOMContentLoaded', function() {
  // Load diary entries
  loadDiaryEntries();

  // Calendar navigation
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  // Movie search in modal
  const movieSearchInput = document.getElementById('movieSearch');
  if (movieSearchInput) {
    let searchTimeout;
    movieSearchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      const query = this.value.trim();
      
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => searchMovies(query), 300);
      } else {
        document.getElementById('movieSearchResults').classList.remove('active');
      }
    });
  }

  // Form submission
  document.getElementById('addMovieForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveMovieToDiary();
  });

  // Filter options
  document.querySelectorAll('.filter-option').forEach(button => {
    button.addEventListener('click', function() {
      const filterType = this.dataset.filter;
      const filterValue = this.dataset.value;

      // Toggle active class
      document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');

      // Apply filter
      filterDiaryEntries(filterType, filterValue);
    });
  });

  // Initial render
  renderCalendar();
});

// Load diary entries from server
function loadDiaryEntries() {
  fetch('/api/diario/entradas/')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        diaryEntries = {};
        data.entradas.forEach(entry => {
          const dateKey = `${entry.ano}-${String(entry.mes).padStart(2, '0')}-${String(entry.dia).padStart(2, '0')}`;
          diaryEntries[dateKey] = entry;
        });
        renderCalendar();
      }
    })
    .catch(error => console.error('Erro ao carregar diário:', error));
}

// Render calendar
function renderCalendar() {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  document.getElementById('currentMonth').textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = document.getElementById('calendarDays');
  calendarDays.innerHTML = '';

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = dayNames[date.getDay()];
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = diaryEntries[dateKey];

    const dayRow = document.createElement('div');
    dayRow.className = 'calendar-day-row' + (entry ? '' : ' empty');
    
    if (entry) {
      dayRow.innerHTML = `
        <div class="calendar-date">
          <span class="calendar-month">${monthNames[currentMonth].substring(0, 3)}</span>
          <span class="calendar-day-number">${day}</span>
        </div>
        <div class="calendar-day-name">${dayOfWeek}</div>
        <div class="calendar-poster">
          <img src="${entry.poster}" alt="${entry.titulo}">
        </div>
        <div class="calendar-movie-title">${entry.titulo}</div>
        <div class="calendar-rating">${'⭐'.repeat(entry.nota)}</div>
        <div class="calendar-watched-with">${entry.assistido_com || '-'}</div>
      `;
    } else {
      dayRow.innerHTML = `
        <div class="calendar-date">
          <span class="calendar-month">${monthNames[currentMonth].substring(0, 3)}</span>
          <span class="calendar-day-number">${day}</span>
        </div>
        <div class="calendar-day-name">${dayOfWeek}</div>
        <div class="calendar-poster empty" onclick="openAddMovieModal(${day}, ${currentMonth + 1}, ${currentYear})">
          <div class="add-movie-btn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Adicionar filme neste dia</span>
          </div>
        </div>
        <div class="calendar-movie-title">-</div>
        <div class="calendar-rating">-</div>
        <div class="calendar-watched-with">-</div>
      `;
    }

    calendarDays.appendChild(dayRow);
  }
}

// Open add movie modal
function openAddMovieModal(day, month, year) {
  selectedDateForAdd = { day, month, year };
  document.getElementById('selectedDate').textContent = `${day}/${month}/${year}`;
  document.getElementById('selectedDay').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  document.getElementById('addMovieModal').classList.add('active');
  document.getElementById('movieSearch').focus();
}

// Close add movie modal
function closeAddMovieModal() {
  document.getElementById('addMovieModal').classList.remove('active');
  document.getElementById('addMovieForm').reset();
  document.getElementById('movieSearchResults').classList.remove('active');
  document.getElementById('selectedMovieInfo').style.display = 'none';
  selectedMovieData = null;
}

// Search movies
function searchMovies(query) {
  fetch(`/api/sugestoes/?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      const resultsContainer = document.getElementById('movieSearchResults');
      
      if (data.sugestoes && data.sugestoes.length > 0) {
        const filmes = data.sugestoes.filter(s => s.tipo === 'filme');
        
        resultsContainer.innerHTML = filmes.map(filme => `
          <div class="search-result-item" onclick='selectMovie(${JSON.stringify(filme)})'>
            <img src="${filme.poster || '/static/images/no-poster.png'}" alt="${filme.titulo}" class="search-result-poster">
            <div class="search-result-info">
              <h4>${filme.titulo}</h4>
              <p>${filme.ano} • ⭐ ${filme.nota}</p>
            </div>
          </div>
        `).join('');
        
        resultsContainer.classList.add('active');
      } else {
        resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum filme encontrado</p>';
        resultsContainer.classList.add('active');
      }
    })
    .catch(error => {
      console.error('Erro ao buscar filmes:', error);
    });
}

// Select movie from search
function selectMovie(filme) {
  selectedMovieData = filme;
  document.getElementById('selectedMovieId').value = filme.id;
  document.getElementById('selectedMovieTitle').textContent = filme.titulo;
  document.getElementById('selectedMovieYear').textContent = filme.ano;
  document.getElementById('selectedMoviePoster').src = filme.poster || '/static/images/no-poster.png';
  document.getElementById('selectedMovieInfo').style.display = 'block';
  document.getElementById('movieSearchResults').classList.remove('active');
  document.getElementById('movieSearch').value = filme.titulo;
}

// Save movie to diary
function saveMovieToDiary() {
  const movieId = document.getElementById('selectedMovieId').value;
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const watchedWith = document.getElementById('watchedWith').value;
  const date = document.getElementById('selectedDay').value;

  if (!movieId) {
    showNotification('Selecione um filme', 'error');
    return;
  }

  if (!rating) {
    showNotification('Selecione uma avaliação', 'error');
    return;
  }

  const data = {
    filme_id: movieId,
    data: date,
    nota: parseInt(rating),
    assistido_com: watchedWith
  };

  fetch('/api/diario/adicionar/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Filme adicionado ao diário!', 'success');
      closeAddMovieModal();
      loadDiaryEntries();
    } else {
      showNotification(data.message || 'Erro ao adicionar filme', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao adicionar filme', 'error');
  });
}

// Filter diary entries
function filterDiaryEntries(filterType, filterValue) {
  // This would typically make an API call to filter entries
  // For now, we'll just reload to keep it simple
  console.log('Filtering by', filterType, filterValue);
  // In a real implementation, you'd filter the displayed entries
}

// Get CSRF Token
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

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 2rem;
    background: ${type === 'success' ? '#00d9ff' : '#ff3b5c'};
    color: ${type === 'success' ? '#0a0e27' : 'white'};
    border-radius: 0.5rem;
    font-weight: 600;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
