// Sistema de sugestões de busca em tempo real
document.addEventListener('DOMContentLoaded', function() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(searchInput => {
    let suggestionsContainer = searchInput.parentElement.querySelector('.search-suggestions');
    
    // Criar container de sugestões se não existir
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'search-suggestions';
      searchInput.parentElement.appendChild(suggestionsContainer);
    }
    
    let timeoutId = null;
    
    // Buscar sugestões enquanto digita
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      
      // Limpar timeout anterior
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Se a busca tiver menos de 2 caracteres, esconder sugestões
      if (query.length < 2) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.style.display = 'none';
        return;
      }
      
      // Aguardar 300ms antes de fazer a requisição (debounce)
      timeoutId = setTimeout(() => {
        fetch(`/api/sugestoes/?q=${encodeURIComponent(query)}`)
          .then(response => response.json())
          .then(data => {
            mostrarSugestoes(data.sugestoes, suggestionsContainer);
          })
          .catch(error => {
            console.error('Erro ao buscar sugestões:', error);
          });
      }, 300);
    });
    
    // Fechar sugestões ao clicar fora
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
      }
    });
    
    // Mostrar sugestões ao focar no input
    searchInput.addEventListener('focus', function() {
      if (suggestionsContainer.children.length > 0) {
        suggestionsContainer.style.display = 'block';
      }
    });
  });
});

function mostrarSugestoes(sugestoes, container) {
  if (!sugestoes || sugestoes.length === 0) {
    container.innerHTML = '<div class="search-suggestion-empty">Nenhum resultado encontrado</div>';
    container.style.display = 'block';
    return;
  }
  
  let html = '';
  
  sugestoes.forEach(item => {
    const posterUrl = item.poster || 'https://via.placeholder.com/92x138?text=Sem+Poster';
    const tipoLabel = item.tipo === 'filme' ? 'Filme' : 'Série';
    const tipoClass = item.tipo === 'filme' ? 'tipo-filme' : 'tipo-serie';
    
    html += `
      <a href="${item.url}" class="search-suggestion-item">
        <div class="suggestion-poster">
          <img src="${posterUrl}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/92x138?text=Sem+Poster'">
        </div>
        <div class="suggestion-content">
          <div class="suggestion-header">
            <h4 class="suggestion-title">${item.titulo}</h4>
            <span class="suggestion-tipo ${tipoClass}">${tipoLabel}</span>
          </div>
          <div class="suggestion-meta">
            <span class="suggestion-ano">${item.ano}</span>
            ${item.nota > 0 ? `<span class="suggestion-rating">★ ${item.nota}</span>` : ''}
          </div>
          <p class="suggestion-descricao">${item.descricao}</p>
        </div>
      </a>
    `;
  });
  
  container.innerHTML = html;
  container.style.display = 'block';
}
