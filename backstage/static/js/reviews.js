document.addEventListener('DOMContentLoaded', function() {
    const starRating = document.querySelector('.star-rating');
    const ratingInput = document.getElementById('rating-value');
    const stars = document.querySelectorAll('.star');

    if (starRating && stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                ratingInput.value = rating;
                
                // Atualizar visual das estrelas
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= parseInt(rating)) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    }

    // Validação do formulário antes do envio
    const reviewForm = document.querySelector('.review-input-group');
    const reviewText = document.querySelector('.movie-review-text');
    const sendButton = document.querySelector('.send-review-btn');
    const starRating = document.querySelector('.star-rating');
    let currentRating = 0;

    // Configurar o sistema de estrelas
    if (starRating) {
        const stars = starRating.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                currentRating = parseInt(rating);
                starRating.dataset.currentRating = rating;
                
                // Atualizar visual das estrelas
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= currentRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const texto = reviewText.value.trim();
            const nota = currentRating;
            const filmeId = document.querySelector('.movie-info-section').dataset.movieId;

            if (!texto) {
                alert('Por favor, escreva uma crítica antes de enviar.');
                return;
            }

            if (!nota) {
                alert('Por favor, selecione uma nota antes de enviar.');
                return;
            }

            try {
                const response = await fetch('/backstage/salvar-critica/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        filme_id: filmeId,
                        texto: texto,
                        nota: nota
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Crítica enviada com sucesso!');
                    // Limpar o formulário
                    reviewText.value = '';
                    stars.forEach(s => s.classList.remove('active'));
                    currentRating = 0;
                    starRating.dataset.currentRating = '0';
                    // Recarregar a página para mostrar a nova crítica
                    location.reload();
                } else {
                    throw new Error(data.error || 'Erro ao enviar crítica');
                }
            } catch (error) {
                alert(error.message);
                console.error('Erro:', error);
            }
        });
    }

    // Função auxiliar para pegar o cookie CSRF
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
