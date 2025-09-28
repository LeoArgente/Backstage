document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createListBtn = document.getElementById('create-list-btn');
    const modal = document.getElementById('create-list-modal');
    const closeModal = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-create');
    const createForm = document.getElementById('create-list-form');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const listsSections = document.querySelectorAll('.lists-section');

    // Open modal
    createListBtn.addEventListener('click', function() {
        modal.classList.add('active');
    });

    // Close modal
    function closeCreateModal() {
        modal.classList.remove('active');
        createForm.reset();
    }

    closeModal.addEventListener('click', closeCreateModal);
    cancelBtn.addEventListener('click', closeCreateModal);

    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreateModal();
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
        .then(response => response.json())
        .then(data => {
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