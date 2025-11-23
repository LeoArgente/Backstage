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

  // Friend search in "Assistido com" field
  const watchedWithInput = document.getElementById('watchedWith');
  if (watchedWithInput) {
    watchedWithInput.addEventListener('input', function() {
      const query = this.value.trim();
      searchFriends(query);
    });

    // Close results when clicking outside
    watchedWithInput.addEventListener('blur', function() {
      setTimeout(() => {
        document.getElementById('friendsSearchResults').style.display = 'none';
      }, 200);
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

      // Check if this button is already active
      const isActive = this.classList.contains('active');

      // Remove active class from all buttons of this filter type
      document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(btn => {
        btn.classList.remove('active');
      });

      // If it wasn't active, activate it and apply filter
      // If it was active, deselect it and show all
      if (!isActive) {
        this.classList.add('active');
        filterDiaryEntries(filterType, filterValue);
      } else {
        // Deselected - show all entries
        filterDiaryEntries(filterType, '');
      }
    });
  });

  // Star rating filter
  const starFilters = document.querySelectorAll('.star-filter');
  let selectedRating = null;

  starFilters.forEach((star) => {
    // Hover effect - highlight stars from left to right (1 to rating)
    star.addEventListener('mouseenter', function() {
      const rating = parseInt(this.dataset.rating);
      starFilters.forEach((s) => {
        const starRating = parseInt(s.dataset.rating);
        if (starRating <= rating) {
          s.style.color = '#fbbf24';
        } else {
          s.style.color = selectedRating && starRating <= selectedRating ? '#fbbf24' : 'var(--text-muted)';
        }
      });
    });

    // Click to select rating
    star.addEventListener('click', function() {
      const rating = parseInt(this.dataset.rating);

      // If clicking the same rating, deselect it
      if (selectedRating === rating) {
        selectedRating = null;
        starFilters.forEach(s => {
          s.classList.remove('active');
          s.style.color = 'var(--text-muted)';
        });
        filterDiaryByRating(null);
      } else {
        selectedRating = rating;
        starFilters.forEach((s) => {
          const starRating = parseInt(s.dataset.rating);
          if (starRating <= rating) {
            s.classList.add('active');
            s.style.color = '#fbbf24';
          } else {
            s.classList.remove('active');
            s.style.color = 'var(--text-muted)';
          }
        });
        filterDiaryByRating(rating);
      }
    });
  });

  // Mouse leave - restore selected state
  document.querySelector('.star-rating-filter')?.addEventListener('mouseleave', function() {
    if (selectedRating) {
      starFilters.forEach((s) => {
        const starRating = parseInt(s.dataset.rating);
        if (starRating <= selectedRating) {
          s.style.color = '#fbbf24';
        } else {
          s.style.color = 'var(--text-muted)';
        }
      });
    } else {
      starFilters.forEach(s => {
        s.style.color = 'var(--text-muted)';
      });
    }
  });

  // Clear rating filter button
  document.querySelector('.clear-rating-filter')?.addEventListener('click', function() {
    selectedRating = null;
    starFilters.forEach(s => {
      s.classList.remove('active');
      s.style.color = 'var(--text-muted)';
    });
    filterDiaryByRating(null);
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
          // Armazenar como array para suportar múltiplos filmes por dia
          if (!diaryEntries[dateKey]) {
            diaryEntries[dateKey] = [];
          }
          diaryEntries[dateKey].push(entry);
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
    const entries = diaryEntries[dateKey]; // Array de filmes do dia

    if (entries && entries.length > 0) {
      // Criar um único card para o dia
      const dayRow = document.createElement('div');
      dayRow.className = 'calendar-day-row';

      const starIcon = '<span style="color: #fbbf24; font-size: 18px; margin: 0 2px;">★</span>';

      // Gerar HTML dos filmes
      const moviesHTML = entries.map(entry => {
        const posterSrc = entry.poster || getPlaceholderPoster();
        const ratingStars = starIcon.repeat(entry.nota);
        return `
          <div class="calendar-movie-item" data-genres="${entry.generos || ''}">
            <div class="calendar-movie-main">
              <div class="calendar-poster">
                <a href="/filmes/${entry.filme_id}/">
                  <img src="${posterSrc}" alt="${entry.titulo}">
                </a>
              </div>
              <div class="calendar-movie-title">
                <a href="/filmes/${entry.filme_id}/" style="color: inherit; text-decoration: none;">${entry.titulo}</a>
              </div>
            </div>
            <div class="calendar-rating">${ratingStars}</div>
            <div class="calendar-watched-with">${entry.assistido_com || '-'}</div>
            <div class="calendar-actions">
              <button class="delete-diary-btn" onclick="deleteDiaryEntry(${entry.id}, '${entry.titulo}')" title="Remover do diário">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      dayRow.innerHTML = `
        <div class="calendar-date">
          <span class="calendar-month">${monthNames[currentMonth].substring(0, 3)}</span>
          <span class="calendar-day-number">${day}</span>
          <span class="calendar-day-name">${dayOfWeek}</span>
        </div>
        <div class="calendar-movies-list">
          ${moviesHTML}
        </div>
      `;

      calendarDays.appendChild(dayRow);
    } else {
      // Dia sem filmes
      const dayRow = document.createElement('div');
      dayRow.className = 'calendar-day-row empty';
      dayRow.innerHTML = `
        <div class="calendar-date">
          <span class="calendar-month">${monthNames[currentMonth].substring(0, 3)}</span>
          <span class="calendar-day-number">${day}</span>
          <span class="calendar-day-name">${dayOfWeek}</span>
        </div>
        <div class="calendar-movies-list empty"></div>
      `;
      calendarDays.appendChild(dayRow);
    }
  }
}

// Open add movie modal (from calendar day)
function openAddMovieModal(day, month, year) {
  selectedDateForAdd = { day, month, year };
  document.getElementById('selectedDate').textContent = `no dia ${day}/${month}/${year}`;
  
  // Set hidden date field
  const dateInput = document.getElementById('movieDate');
  const dateValue = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  dateInput.value = dateValue;
  
  // Hide date picker when opening from specific day
  const datePickerGroup = document.getElementById('datePickerGroup');
  if (datePickerGroup) {
    datePickerGroup.style.display = 'none';
  }
  
  document.getElementById('addMovieModal').classList.add('active');
  document.getElementById('movieSearch').focus();
}

// Open add movie modal with date picker (from main button)
function openAddMovieModalWithDatePicker() {
  // Clear previous selection
  selectedDateForAdd = null;
  document.getElementById('selectedDate').textContent = 'ao diário';
  
  // Show date picker
  const datePickerGroup = document.getElementById('datePickerGroup');
  if (datePickerGroup) {
    datePickerGroup.style.display = 'block';
  }
  
  // Set today as default
  const today = new Date();
  const dateInput = document.getElementById('movieDate');
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  dateInput.value = todayValue;
  
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
  selectedDateForAdd = null;
  
  // Reset date picker visibility
  const datePickerGroup = document.getElementById('datePickerGroup');
  if (datePickerGroup) {
    datePickerGroup.style.display = 'block';
  }
}

// Search movies
function searchMovies(query) {
  console.log('=== INÍCIO DA BUSCA ===');
  console.log('Query:', query);
  console.log('URL da API:', `/api/sugestoes/?q=${encodeURIComponent(query)}`);
  
  const resultsContainer = document.getElementById('movieSearchResults');
  console.log('Container encontrado?', !!resultsContainer);
  
  if (!resultsContainer) {
    console.error('❌ Elemento #movieSearchResults NÃO ENCONTRADO no DOM!');
    return;
  }
  
  fetch(`/api/sugestoes/?q=${encodeURIComponent(query)}`)
    .then(response => {
      console.log('Status da resposta:', response.status);
      console.log('Response OK?', response.ok);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('✅ Dados recebidos:', data);
      console.log('Número de sugestões:', data.sugestoes ? data.sugestoes.length : 0);
      
      if (data.sugestoes && data.sugestoes.length > 0) {
        console.log('Primeira sugestão:', data.sugestoes[0]);

        // Incluir filmes e séries
        const items = data.sugestoes.filter(s => s.tipo === 'filme' || s.tipo === 'serie');
        console.log(`Filmes e séries após filtro: ${items.length}`);

        if (items.length > 0) {
          console.log('Gerando HTML para', items.length, 'items');

          resultsContainer.innerHTML = items.map(item => {
            const itemJson = JSON.stringify(item).replace(/'/g, "&#39;");
            const posterSrc = item.poster || getPlaceholderPoster();
            const tipoIcon = item.tipo === 'serie'
              ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>'
              : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>';
            const tipoLabel = item.tipo === 'serie' ? 'Série' : 'Filme';
            const starIcon = '<span style="color: #fbbf24; font-size: 14px; margin: 0 1px;">★</span>';
            return `
              <div class="search-result-item" onclick='selectMovie(${itemJson})'>
                <img src="${posterSrc}" alt="${item.titulo}" class="search-result-poster">
                <div class="search-result-info">
                  <h4>${item.titulo}</h4>
                  <p>${tipoIcon}${tipoLabel} • ${item.ano} • ${starIcon}${item.nota}</p>
                </div>
              </div>
            `;
          }).join('');

          console.log('HTML gerado, adicionando classe active');
          resultsContainer.classList.add('active');
          console.log('Classes do container:', resultsContainer.className);
        } else {
          console.log('⚠️ Nenhum filme ou série encontrado');
          resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum filme ou série encontrado</p>';
          resultsContainer.classList.add('active');
        }
      } else {
        console.log('⚠️ Nenhuma sugestão retornada pela API');
        resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum resultado encontrado</p>';
        resultsContainer.classList.add('active');
      }
      
      console.log('=== FIM DA BUSCA (SUCESSO) ===');
    })
    .catch(error => {
      console.error('❌ ERRO ao buscar filmes:', error);
      console.error('Tipo do erro:', error.name);
      console.error('Mensagem:', error.message);
      
      if (resultsContainer) {
        resultsContainer.innerHTML = `<p style="padding: 1rem; text-align: center; color: var(--red);">Erro: ${error.message}</p>`;
        resultsContainer.classList.add('active');
      }
      console.log('=== FIM DA BUSCA (ERRO) ===');
    });
}

// Placeholder SVG for missing posters
function getPlaceholderPoster() {
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#1a1a1a"/>
      <g transform="translate(150,225)">
        <rect x="-40" y="-60" width="80" height="100" rx="8" fill="#333" stroke="#666" stroke-width="2"/>
        <circle cx="0" cy="-30" r="12" fill="#666"/>
        <path d="M -20,-10 L -20,30 L 20,30 L 20,-10 L 10,0 L 0,-10 L -10,0 Z" fill="#666"/>
      </g>
      <text x="150" y="400" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">Sem Pôster</text>
    </svg>
  `);
}

// Search friends for "Assistido com" field
let searchFriendsTimeout;
function searchFriends(query) {
  const resultsContainer = document.getElementById('friendsSearchResults');

  if (!query || query.length < 1) {
    resultsContainer.style.display = 'none';
    return;
  }

  clearTimeout(searchFriendsTimeout);

  searchFriendsTimeout = setTimeout(() => {
    fetch(`/api/buscar-amigos/?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.amigos && data.amigos.length > 0) {
          resultsContainer.innerHTML = data.amigos.map(amigo => {
            const fotoPerfil = amigo.foto_perfil || '/static/images/default-avatar.png';
            return `
              <div class="friend-result-item" onclick='selectFriend(${JSON.stringify(amigo)})'>
                <img src="${fotoPerfil}" alt="${amigo.nome_completo}" class="friend-result-avatar">
                <div class="friend-result-info">
                  <h4>${amigo.nome_completo}</h4>
                  <p>@${amigo.username}</p>
                </div>
              </div>
            `;
          }).join('');
          resultsContainer.style.display = 'block';
        } else {
          resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum amigo encontrado</p>';
          resultsContainer.style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Erro ao buscar amigos:', error);
        resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--red);">Erro ao buscar amigos</p>';
        resultsContainer.style.display = 'block';
      });
  }, 300);
}

// Select friend from search results
function selectFriend(friend) {
  document.getElementById('watchedWith').value = friend.nome_completo;
  document.getElementById('selectedFriendId').value = friend.id;
  document.getElementById('friendsSearchResults').style.display = 'none';
}

// Select movie or series from search
function selectMovie(item) {
  selectedMovieData = item;
  document.getElementById('selectedMovieId').value = item.id;
  document.getElementById('selectedMovieTitle').textContent = item.titulo;
  const tipoLabel = item.tipo === 'serie' ? 'Série' : 'Filme';
  document.getElementById('selectedMovieYear').textContent = `${tipoLabel} • ${item.ano}`;
  document.getElementById('selectedMoviePoster').src = item.poster || getPlaceholderPoster();
  document.getElementById('selectedMovieInfo').style.display = 'block';
  document.getElementById('movieSearchResults').classList.remove('active');
  document.getElementById('movieSearch').value = item.titulo;
}

// Save movie to diary
function saveMovieToDiary() {
  const movieId = document.getElementById('selectedMovieId').value;
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  const watchedWith = document.getElementById('watchedWith').value;
  
  // Get date from date picker input
  const dateInput = document.getElementById('movieDate');
  const date = dateInput ? dateInput.value : null;

  if (!movieId) {
    showNotification('Selecione um filme', 'error');
    return;
  }

  if (!date) {
    showNotification('Selecione uma data', 'error');
    return;
  }

  if (!rating) {
    showNotification('Selecione uma avaliação', 'error');
    return;
  }

  const data = {
    filme_id: movieId,
    tipo: selectedMovieData?.tipo || 'filme',
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
  const calendarRows = document.querySelectorAll('.calendar-day-row');

  if (!filterValue || filterValue === '') {
    // Show all entries
    calendarRows.forEach(row => {
      row.style.display = '';
      const movieItems = row.querySelectorAll('.calendar-movie-item');
      movieItems.forEach(item => {
        item.style.display = '';
      });
    });
    return;
  }

  if (filterType === 'genre') {
    calendarRows.forEach(row => {
      const movieItems = row.querySelectorAll('.calendar-movie-item');

      if (movieItems.length === 0) {
        row.style.display = 'none';
        return;
      }

      let hasMatchingMovie = false;

      movieItems.forEach(item => {
        const genres = item.getAttribute('data-genres') || '';

        // Check if the genre is in the comma-separated list
        const genresList = genres.split(',').map(g => g.trim());

        if (genresList.includes(filterValue)) {
          item.style.display = '';
          hasMatchingMovie = true;
        } else {
          item.style.display = 'none';
        }
      });

      // Show row only if at least one movie matches
      row.style.display = hasMatchingMovie ? '' : 'none';
    });
  }
}

// Filter diary by rating
function filterDiaryByRating(rating) {
  const calendarRows = document.querySelectorAll('.calendar-day-row');

  if (!rating) {
    // Show all entries and all movie items
    calendarRows.forEach(row => {
      row.style.display = '';
      const movieItems = row.querySelectorAll('.calendar-movie-item');
      movieItems.forEach(item => {
        item.style.display = '';
      });
    });
    return;
  }

  calendarRows.forEach(row => {
    // Get all movie items in this day
    const movieItems = row.querySelectorAll('.calendar-movie-item');

    if (movieItems.length === 0) {
      // Empty day - hide it when filtering
      row.style.display = 'none';
      return;
    }

    let hasMatchingMovie = false;

    // Check each movie item
    movieItems.forEach(item => {
      const ratingElement = item.querySelector('.calendar-rating');
      if (ratingElement) {
        const stars = ratingElement.querySelectorAll('span');
        const entryRating = stars.length;

        // Show or hide individual movie item
        if (entryRating === rating) {
          item.style.display = '';
          hasMatchingMovie = true;
        } else {
          item.style.display = 'none';
        }
      } else {
        item.style.display = 'none';
      }
    });

    // Show row only if at least one movie matches
    row.style.display = hasMatchingMovie ? '' : 'none';
  });
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

// Delete diary entry
async function deleteDiaryEntry(entryId, movieTitle) {
  if (!confirm(`Tem certeza que deseja remover "${movieTitle}" do seu diário?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/diario/remover/${entryId}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': getCookie('csrftoken')
      }
    });

    const data = await response.json();

    if (data.success) {
      showNotification('Filme removido do diário!', 'success');
      loadDiaryEntries(); // Recarregar o calendário
    } else {
      showNotification(data.message || 'Erro ao remover filme', 'error');
    }
  } catch (error) {
    console.error('Erro:', error);
    showNotification('Erro ao remover filme do diário', 'error');
  }
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
