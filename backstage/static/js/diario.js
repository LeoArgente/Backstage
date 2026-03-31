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
  document.querySelectorAll('.diary-filter-btn[data-filter="genre"]').forEach(button => {
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
  const starFilters = document.querySelectorAll('.diary-star-btn');
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
  document.querySelector('#clearRatingFilter')?.addEventListener('click', function() {
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
    .catch(() => {});
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

  // Day-of-week headers
  var headerHTML = '';
  for (var h = 0; h < 7; h++) {
    headerHTML += '<div class="cal-header">' + dayNames[h] + '</div>';
  }
  calendarDays.innerHTML = headerHTML;

  // First day of month offset
  var firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Empty cells before day 1
  for (var e = 0; e < firstDayOfWeek; e++) {
    var emptyEl = document.createElement('div');
    emptyEl.className = 'cal-cell cal-empty';
    calendarDays.appendChild(emptyEl);
  }

  // Render each day
  for (var day = 1; day <= daysInMonth; day++) {
    var dateKey = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    var entries = diaryEntries[dateKey] || [];
    // Determine which column this day falls in (0=Dom, 6=Sáb)
    var colIndex = (firstDayOfWeek + day - 1) % 7;
    var cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (entries.length > 0) cell.className += ' cal-has-entry';
    if (entries.length > 1) cell.className += ' cal-has-stack';
    // Mark expansion direction: last 2 columns expand left
    if (colIndex >= 5) {
      cell.classList.add('cal-expand-left');
    }

    var inner = '<span class="cal-day-number">' + day + '</span>';

    if (entries.length > 0) {
      // Build the stack container
      inner += '<div class="cal-stack" data-count="' + entries.length + '">';

      // Render each entry as a stack card
      for (var idx = 0; idx < entries.length; idx++) {
        var entry = entries[idx];
        var posterSrc = entry.poster || '';
        var urlPrefix = entry.tipo === 'serie' ? '/series/' : '/filmes/';
        var filled = '';
        var empty = '';
        for (var s = 0; s < entry.nota; s++) filled += '★';
        for (var s = 0; s < 5 - entry.nota; s++) empty += '☆';
        var safeTitle = (entry.titulo || '').replace(/'/g, "\\'");

        inner += '<div class="cal-stack-card" data-index="' + idx + '">';

        if (posterSrc) {
          inner += '<a href="' + urlPrefix + entry.filme_id + '/" class="cal-poster-link" onclick="event.stopPropagation()"><img class="cal-poster" src="' + posterSrc + '" alt="' + (entry.titulo || '') + '" loading="lazy"></a>';
        } else {
          inner += '<a href="' + urlPrefix + entry.filme_id + '/" class="cal-poster-link" onclick="event.stopPropagation()"><span class="cal-poster-placeholder">' + (entry.titulo || '').substring(0, 3) + '</span></a>';
        }
        inner += '<span class="cal-stars">' + filled + empty + '</span>';

        // Menu 3 pontos per card
        inner += '<div class="cal-menu">' +
          '<button class="cal-menu-btn" onclick="event.stopPropagation(); this.nextElementSibling.classList.toggle(\'active\')">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>' +
          '</button>' +
          '<div class="cal-menu-dropdown">' +
            '<button onclick="event.stopPropagation(); editDiaryEntry(' + entry.id + ', ' + entry.nota + ', \'' + safeTitle + '\')" title="Editar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
            '<button onclick="event.stopPropagation(); deleteDiaryEntry(' + entry.id + ', \'' + safeTitle + '\')" title="Excluir"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
          '</div>' +
        '</div>';

        inner += '</div>'; // .cal-stack-card
      }

      inner += '</div>'; // .cal-stack

      // Badge showing count
      if (entries.length > 1) {
        inner += '<span class="cal-more">' + entries.length + '</span>';
      }

      // Add button for days that already have entries
      inner += '<button class="cal-add-btn" onclick="event.stopPropagation(); openAddMovieModal(' + day + ', ' + (currentMonth + 1) + ', ' + currentYear + ')" title="Adicionar mais">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
      '</button>';

      // Hidden data for filters — consider ALL entries
      var allGenres = entries.map(function(e) { return e.generos || ''; }).join(',');
      var allRatings = entries.map(function(e) { return e.nota; }).join(',');
      cell.setAttribute('data-genres', allGenres);
      cell.setAttribute('data-ratings', allRatings);
    }

    cell.innerHTML = inner;

    // Click empty cell to add movie on that day
    if (entries.length === 0) {
      cell.setAttribute('data-day', day);
      cell.setAttribute('data-month', currentMonth + 1);
      cell.setAttribute('data-year', currentYear);
      cell.addEventListener('click', function() {
        openAddMovieModal(
          parseInt(this.getAttribute('data-day')),
          parseInt(this.getAttribute('data-month')),
          parseInt(this.getAttribute('data-year'))
        );
      });
    }

    calendarDays.appendChild(cell);
  }

  // Setup stack expand/collapse for touch and click
  setupStackInteractions();
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
  
  const resultsContainer = document.getElementById('movieSearchResults');
  
  if (!resultsContainer) {
    return;
  }
  
  fetch(`/api/sugestoes/?q=${encodeURIComponent(query)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      
      if (data.sugestoes && data.sugestoes.length > 0) {

        // Incluir filmes e séries
        const items = data.sugestoes.filter(s => s.tipo === 'filme' || s.tipo === 'serie');

        if (items.length > 0) {

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


          resultsContainer.classList.add('active');
        } else {
          resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum filme ou série encontrado</p>';
          resultsContainer.classList.add('active');
        }
      } else {
        resultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum resultado encontrado</p>';
        resultsContainer.classList.add('active');
      }
      
    })
    .catch(error => {
      
      if (resultsContainer) {
        resultsContainer.innerHTML = `<p style="padding: 1rem; text-align: center; color: var(--red);">Erro: ${error.message}</p>`;
        resultsContainer.classList.add('active');
      }
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
      // Navigate to the month of the added entry
      var addedDate = document.getElementById('movieDate').value;
      if (addedDate) {
        var parts = addedDate.split('-');
        currentYear = parseInt(parts[0]);
        currentMonth = parseInt(parts[1]) - 1;
      }
      loadDiaryEntries();
    } else {
      showNotification(data.message || 'Erro ao adicionar filme', 'error');
    }
  })
  .catch(error => {
    showNotification('Erro ao adicionar filme', 'error');
  });
}

// Filter diary entries by genre — checks ALL entries in a day
function filterDiaryEntries(filterType, filterValue) {
  var cells = document.querySelectorAll('.cal-cell:not(.cal-empty):not(.cal-header)');

  cells.forEach(function(cell) {
    if (!filterValue || filterValue === '') {
      cell.style.opacity = '';
      return;
    }
    var genres = (cell.getAttribute('data-genres') || '').split(',').map(function(g) { return g.trim(); });
    cell.style.opacity = genres.includes(filterValue) ? '' : '0.15';
  });
}

// Filter diary by rating — matches if ANY entry in the day has the rating
function filterDiaryByRating(rating) {
  var cells = document.querySelectorAll('.cal-cell:not(.cal-empty):not(.cal-header)');

  cells.forEach(function(cell) {
    if (!rating) {
      cell.style.opacity = '';
      return;
    }
    var ratings = (cell.getAttribute('data-ratings') || '').split(',').map(function(r) { return parseInt(r); });
    cell.style.opacity = ratings.includes(rating) ? '' : '0.15';
  });
}

// Setup stack expand/collapse interactions (touch + click)
function setupStackInteractions() {
  var stackCells = document.querySelectorAll('.cal-has-stack');

  stackCells.forEach(function(cell) {
    cell.addEventListener('click', function(e) {
      // Don't toggle if clicking a link, button, or menu
      if (e.target.closest('a, button, .cal-menu, .cal-menu-dropdown')) return;

      var wasExpanded = cell.classList.contains('cal-stack-expanded');

      // Close all other expanded stacks
      document.querySelectorAll('.cal-stack-expanded').forEach(function(c) {
        c.classList.remove('cal-stack-expanded');
      });

      // Toggle this one
      if (!wasExpanded) {
        cell.classList.add('cal-stack-expanded');
      }
    });
  });
}

// Global listener for closing expanded stacks (only added once)
document.addEventListener('click', function(e) {
  if (!e.target.closest('.cal-has-stack')) {
    document.querySelectorAll('.cal-stack-expanded').forEach(function(c) {
      c.classList.remove('cal-stack-expanded');
    });
  }
});

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

// Edit diary entry (reopen modal with pre-filled rating)
function editDiaryEntry(entryId, currentRating, movieTitle) {
  // Close any open menus
  document.querySelectorAll('.cal-menu-dropdown.active').forEach(function(m) { m.classList.remove('active'); });

  // Open the add modal
  openAddMovieModalWithDatePicker();

  // Pre-select the rating
  var ratingInput = document.querySelector('input[name="rating"][value="' + currentRating + '"]');
  if (ratingInput) ratingInput.checked = true;

  // Store the entry ID so save can update instead of create
  window._editingEntryId = entryId;
}

// Close menus when clicking elsewhere
document.addEventListener('click', function() {
  document.querySelectorAll('.cal-menu-dropdown.active').forEach(function(m) { m.classList.remove('active'); });
});

// Close menus when mouse leaves the cell
document.addEventListener('mouseover', function(e) {
  if (!e.target.closest('.cal-has-entry')) {
    document.querySelectorAll('.cal-menu-dropdown.active').forEach(function(m) { m.classList.remove('active'); });
  }
});

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
    showNotification('Erro ao remover filme do diário', 'error');
  }
}

