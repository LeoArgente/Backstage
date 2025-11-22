document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createListBtn = document.getElementById('create-list-btn');
    const modal = document.getElementById('create-list-modal');
    const closeModal = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-create');
    const createForm = document.getElementById('create-list-form');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const listsSections = document.querySelectorAll('.lists-section');

    // Edit modal elements
    const editModal = document.getElementById('edit-list-modal');
    const editCloseModal = document.getElementById('edit-modal-close');
    const editCancelBtn = document.getElementById('cancel-edit');
    const editForm = document.getElementById('edit-list-form');

    // View modal elements
    const viewModal = document.getElementById('view-list-modal');
    const viewCloseModal = document.getElementById('view-modal-close');

    // Open modal
    createListBtn.addEventListener('click', function() {
        modal.classList.add('active');
    });

    // Close modal functions
    function closeCreateModal() {
        modal.classList.remove('active');
        createForm.reset();
    }

    function closeEditModal() {
        editModal.classList.remove('active');
        editForm.reset();
    }

    function closeViewModal() {
        viewModal.classList.remove('active');
    }

    // Event listeners for closing modals
    closeModal.addEventListener('click', closeCreateModal);
    cancelBtn.addEventListener('click', closeCreateModal);
    editCloseModal.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);
    viewCloseModal.addEventListener('click', closeViewModal);

    // Save button for edit modal
    const saveEditBtn = document.getElementById('save-edit');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', function() {
            const listId = document.getElementById('edit-list-id').value;
            const data = {
                nome: document.getElementById('edit-list-name').value,
                descricao: document.getElementById('edit-list-description').value,
                publica: document.getElementById('edit-list-public').checked
            };

            fetch(`/api/lista/${listId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.status === 401) {
                    window.location.href = '/login/';
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (!data) return;

                if (data.success) {
                    alert('Lista atualizada com sucesso!');
                    closeEditModal();
                    location.reload();
                } else {
                    alert('Erro: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao editar lista');
            });
        });
    }

    // Close modals on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreateModal();
        }
    });

    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    viewModal.addEventListener('click', function(e) {
        if (e.target === viewModal) {
            closeViewModal();
        }
    });

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.dataset.filter;

            // Update active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Show/hide sections
            listsSections.forEach(section => {
                const sectionType = section.dataset.section;
                if (sectionType === filter) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

    // Create list form submission
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {
            nome: formData.get('name'),
            descricao: formData.get('description'),
            publica: formData.get('public') === 'on'
        };

        fetch('/api/criar-lista/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            // Verificar se usuário não está autenticado (status 401)
            if (response.status === 401) {
                window.location.href = '/login/';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return; // Se redirecionou, não processar

            if (data.success) {
                alert('Lista criada com sucesso!');
                location.reload(); // Recarrega para mostrar a nova lista
            } else {
                alert('Erro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao criar lista');
        });
    });

    // Edit list form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const listId = document.getElementById('edit-list-id').value;
        const formData = new FormData(this);
        const data = {
            nome: formData.get('name'),
            descricao: formData.get('description'),
            publica: formData.get('public') === 'on'
        };

        fetch(`/api/lista/${listId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            // Verificar se usuário não está autenticado (status 401)
            if (response.status === 401) {
                window.location.href = '/login/';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return; // Se redirecionou, não processar

            if (data.success) {
                alert('Lista atualizada com sucesso!');
                closeEditModal();
                location.reload(); // Recarrega para mostrar as alterações
            } else {
                alert('Erro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao editar lista');
        });
    });

    // Get CSRF token function
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
});

// Global functions called by template buttons
window.editList = function(listId) {
    // Fetch list data with movies and series
    fetch(`/api/lista/${listId}/visualizar/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        // Verificar se usuário não está autenticado (status 401)
        if (response.status === 401) {
            window.location.href = '/login/';
            return;
        }
        return response.json();
    })
    .then(data => {
        if (!data) return; // Se redirecionou, não processar

        if (data.success) {
            const lista = data.lista;

            // Update title in header
            document.getElementById('edit-list-title-display').textContent = lista.nome;

            // Fill form fields
            document.getElementById('edit-list-id').value = lista.id;
            document.getElementById('edit-list-name').value = lista.nome;
            document.getElementById('edit-list-description').value = lista.descricao || '';
            document.getElementById('edit-list-public').checked = lista.publica;

            // Separar filmes e séries
            const filmes = lista.itens.filter(item => item.tipo === 'filme');
            const series = lista.itens.filter(item => item.tipo === 'serie');

            // Update tab counts
            document.getElementById('edit-movies-tab').innerHTML = `Filmes (${filmes.length})`;
            document.getElementById('edit-series-tab').innerHTML = `Séries (${series.length})`;

            // Populate movies grid with trash icon
            const editMoviesGrid = document.getElementById('edit-movies-grid');
            if (filmes.length === 0) {
                editMoviesGrid.innerHTML = '<p class="empty-message">Nenhum filme nesta lista.</p>';
            } else {
                editMoviesGrid.innerHTML = filmes.map(item => {
                    return `
                        <div class="movie-item">
                            <div class="movie-info">
                                <h4 class="movie-title">${item.titulo}</h4>
                                <p class="movie-added">Adicionado em ${item.adicionado_em}</p>
                            </div>
                            <button class="delete-item-btn" onclick="removeItemFromList(${lista.id}, ${item.tmdb_id}, 'filme')" title="Remover filme">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    `;
                }).join('');
            }

            // Populate series grid with trash icon
            const editSeriesGrid = document.getElementById('edit-series-grid');
            if (series.length === 0) {
                editSeriesGrid.innerHTML = '<p class="empty-message">Nenhuma série nesta lista.</p>';
            } else {
                editSeriesGrid.innerHTML = series.map(item => {
                    return `
                        <div class="movie-item">
                            <div class="movie-info">
                                <h4 class="movie-title">${item.titulo}</h4>
                                <p class="movie-added">Adicionado em ${item.adicionado_em}</p>
                            </div>
                            <button class="delete-item-btn" onclick="removeItemFromList(${lista.id}, ${item.tmdb_id}, 'serie')" title="Remover série">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('edit-list-modal').classList.add('active');
        } else {
            alert('Erro ao carregar dados da lista: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao carregar lista para edição');
    });
}

window.deleteList = function(listId, listName) {
    if (confirm(`Tem certeza que deseja deletar a lista "${listName}"? Esta ação não pode ser desfeita.`)) {
        fetch(`/api/lista/${listId}/deletar/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            // Verificar se usuário não está autenticado (status 401)
            if (response.status === 401) {
                window.location.href = '/login/';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return; // Se redirecionou, não processar

            if (data.success) {
                alert(data.message);
                // Remove the list card from the page
                const listCard = document.querySelector(`[data-list-id="${listId}"]`);
                if (listCard) {
                    listCard.remove();
                }
            } else {
                alert('Erro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao deletar lista');
        });
    }
}

window.viewList = function(listId) {
    // Fetch list data with movies and series
    fetch(`/api/lista/${listId}/visualizar/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        // Verificar se usuário não está autenticado (status 401)
        if (response.status === 401) {
            window.location.href = '/login/';
            return;
        }
        return response.json();
    })
    .then(data => {
        if (!data) return; // Se redirecionou, não processar

        if (data.success) {
            const lista = data.lista;

            // Populate view modal
            document.getElementById('view-list-title').textContent = lista.nome;
            document.getElementById('view-list-description').textContent = lista.descricao || 'Sem descrição';
            document.getElementById('view-list-privacy').textContent = lista.publica ? 'Pública' : 'Privada';
            document.getElementById('view-list-author').textContent = `por ${lista.usuario}`;
            document.getElementById('view-list-date').textContent = `Criada em ${lista.criada_em}`;

            // Separar filmes e séries
            const filmes = lista.itens.filter(item => item.tipo === 'filme');
            const series = lista.itens.filter(item => item.tipo === 'serie');

            // Update tab counts
            document.getElementById('movies-tab').innerHTML = `Filmes (${filmes.length})`;
            document.getElementById('series-tab').innerHTML = `Séries (${series.length})`;

            // Populate movies grid
            const moviesGrid = document.getElementById('movies-grid');
            if (filmes.length === 0) {
                moviesGrid.innerHTML = '<p class="empty-message">Nenhum filme nesta lista.</p>';
            } else {
                moviesGrid.innerHTML = filmes.map(item => {
                    const detailsUrl = `/filmes/${item.tmdb_id}/`;
                    return `
                        <a href="${detailsUrl}" class="movie-item">
                            <div class="movie-info">
                                <h4 class="movie-title">${item.titulo}</h4>
                                <p class="movie-added">Adicionado em ${item.adicionado_em}</p>
                            </div>
                        </a>
                    `;
                }).join('');
            }

            // Populate series grid
            const seriesGrid = document.getElementById('series-grid');
            if (series.length === 0) {
                seriesGrid.innerHTML = '<p class="empty-message">Nenhuma série nesta lista.</p>';
            } else {
                seriesGrid.innerHTML = series.map(item => {
                    const detailsUrl = `/series/${item.tmdb_id}/`;
                    return `
                        <a href="${detailsUrl}" class="movie-item">
                            <div class="movie-info">
                                <h4 class="movie-title">${item.titulo}</h4>
                                <p class="movie-added">Adicionado em ${item.adicionado_em}</p>
                            </div>
                        </a>
                    `;
                }).join('');
            }

            document.getElementById('view-list-modal').classList.add('active');
        } else {
            alert('Erro ao carregar lista: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao visualizar lista');
    });
}

// Tab switching function for view modal
window.switchContentTab = function(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('#view-list-modal .content-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all content
    document.querySelectorAll('#view-list-modal .content-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to clicked tab and corresponding content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// Tab switching function for edit modal
window.switchEditTab = function(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('#edit-list-modal .content-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all content
    document.querySelectorAll('#edit-list-modal .content-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to clicked tab and corresponding content
    document.getElementById(`edit-${tabName}-tab`).classList.add('active');
    document.getElementById(`edit-${tabName}-content`).classList.add('active');
}

// Remove item from list
window.removeItemFromList = function(listId, tmdbId, tipo) {
    if (confirm(`Tem certeza que deseja remover este ${tipo === 'filme' ? 'filme' : 'série'} da lista?`)) {
        fetch(`/api/lista/${listId}/remover-item/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                tmdb_id: tmdbId,
                tipo: tipo
            })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login/';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;

            if (data.success) {
                // Reload the edit modal to show updated list
                editList(listId);
            } else {
                alert('Erro ao remover item: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao remover item da lista');
        });
    }
}

// Helper function to get CSRF token (also used by global functions)
window.getCookie = function(name) {
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

// ===== Load More Lists Functionality =====
let currentPage = 1;
let isLoadingLists = false;
let currentFilter = 'my-lists';

document.addEventListener('DOMContentLoaded', function() {
    const loadMoreBtn = document.getElementById('load-more');
    const filterTabs = document.querySelectorAll('.filter-tab');

    // Track current filter
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            currentPage = 1; // Reset page when filter changes
        });
    });

    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async function() {
            if (isLoadingLists) return;

            isLoadingLists = true;
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
                const apiUrl = `/api/listas/?page=${currentPage}&filter=${currentFilter}`;
                console.log('[LOAD MORE LISTS] Fetching:', apiUrl);

                const response = await fetch(apiUrl);
                const data = await response.json();

                console.log('[LOAD MORE LISTS] Response:', data);

                if (data.success && data.listas && data.listas.length > 0) {
                    // Find the correct section to append to
                    const activeSection = document.querySelector(`.lists-section[data-section="${currentFilter}"]`);
                    
                    // Append new lists to the grid
                    data.listas.forEach(lista => {
                        const listCard = createListCard(lista);
                        activeSection.appendChild(listCard);
                    });

                    // Check if there are more lists to load
                    if (!data.has_more) {
                        loadMoreBtn.style.display = 'none';
                    } else {
                        // Reset button
                        loadMoreBtn.disabled = false;
                        loadMoreBtn.innerHTML = `
                            Carregar mais listas
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        `;
                    }
                } else {
                    // No more lists
                    loadMoreBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('[LOAD MORE LISTS] Erro ao carregar listas:', error);
                alert('Erro ao carregar mais listas. Tente novamente.');
                currentPage--; // Revert page increment

                // Reset button
                loadMoreBtn.disabled = false;
                loadMoreBtn.innerHTML = `
                    Carregar mais listas
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                `;
            } finally {
                isLoadingLists = false;
            }
        });
    }
});

function createListCard(lista) {
    const listCard = document.createElement('div');
    listCard.className = 'list-card';
    listCard.dataset.listId = lista.id;

    const badge = lista.is_mine 
        ? (lista.publica ? 'Pública' : 'Privada')
        : lista.usuario;

    let actionsHTML = '';
    if (lista.is_mine) {
        actionsHTML = `
            <div class="list-actions">
                <button class="action-btn view-btn" title="Visualizar lista" onclick="viewList(${lista.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
                <button class="action-btn edit-btn" title="Editar lista" onclick="editList(${lista.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="action-btn delete-btn" title="Deletar lista" onclick="deleteList(${lista.id}, '${lista.nome.replace(/'/g, "\\'")}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        `;
    } else {
        actionsHTML = `
            <div class="list-actions">
                <button class="action-btn view-btn" title="Visualizar lista" onclick="viewList(${lista.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
            </div>
        `;
    }

    listCard.innerHTML = `
        <span class="list-badge">${badge}</span>
        <h3 class="list-title">${lista.nome}</h3>
        <p class="list-description">${lista.descricao || 'Sem descrição'}</p>
        <div class="list-meta">
            <span class="list-count">${lista.num_filmes} filme${lista.num_filmes !== 1 ? 's' : ''} • ${lista.num_series} série${lista.num_series !== 1 ? 's' : ''}</span>
            <span class="list-date">${lista.atualizada_em}</span>
        </div>
        ${actionsHTML}
    `;

    return listCard;
}
