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
    // Fetch list data and populate edit form
    fetch(`/api/lista/${listId}/`, {
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
            document.getElementById('edit-list-id').value = lista.id;
            document.getElementById('edit-list-name').value = lista.nome;
            document.getElementById('edit-list-description').value = lista.descricao || '';
            document.getElementById('edit-list-public').checked = lista.publica;

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
    // Fetch list data with movies
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
            document.getElementById('view-list-privacy').textContent = lista.publica ? 'Pública' : 'Privada';
            document.getElementById('view-list-author').textContent = `por ${lista.usuario}`;
            document.getElementById('view-list-date').textContent = `Criada em ${lista.criada_em}`;
            document.getElementById('view-list-description').textContent = lista.descricao || 'Sem descrição';
            document.getElementById('view-list-count').textContent = lista.total_filmes;

            // Populate movies grid
            const moviesGrid = document.getElementById('view-movies-grid');
            if (lista.filmes.length === 0) {
                moviesGrid.innerHTML = '<p class="empty-message">Esta lista não possui filmes ainda.</p>';
            } else {
                moviesGrid.innerHTML = lista.filmes.map(filme => `
                    <div class="movie-item">
                        <div class="movie-info">
                            <h4 class="movie-title">${filme.titulo}</h4>
                            <p class="movie-added">Adicionado em ${filme.adicionado_em}</p>
                        </div>
                        <div class="movie-actions">
                            <button class="btn btn-small btn-primary" onclick="window.location.href='/filmes/${filme.tmdb_id}/'">
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                `).join('');
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