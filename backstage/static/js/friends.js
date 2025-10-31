// Friends Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Tab Navigation
  const tabs = document.querySelectorAll('.friends-tab');
  const tabContents = document.querySelectorAll('.friends-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // Search on Enter key
  const searchInput = document.getElementById('searchFriendsInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        buscarUsuarios();
      }
    });
  }
});

// Buscar Usuários
function buscarUsuarios() {
  const searchInput = document.getElementById('searchFriendsInput');
  const query = searchInput.value.trim();
  const resultsContainer = document.getElementById('searchResults');
  const emptyState = document.getElementById('searchEmptyState');

  if (!query) {
    return;
  }

  // Show loading state
  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
      <p style="color: var(--text-muted);">Buscando usuários...</p>
    </div>
  `;
  emptyState.style.display = 'none';

  fetch(`/api/buscar-usuarios/?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.usuarios.length > 0) {
        resultsContainer.innerHTML = data.usuarios.map(usuario => `
          <div class="friend-card">
            <div class="friend-avatar">
              <img src="https://ui-avatars.com/api/?name=${usuario.username}&background=00d9ff&color=0a0e27&size=100" alt="${usuario.username}">
            </div>
            <div class="friend-info">
              <h3 class="friend-name">${usuario.username}</h3>
              <p class="friend-stats">${usuario.reviews_count || 0} reviews</p>
            </div>
            <div class="friend-actions">
              ${renderFriendButton(usuario)}
            </div>
          </div>
        `).join('');
      } else {
        resultsContainer.innerHTML = '';
        emptyState.style.display = 'flex';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar usuários:', error);
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; grid-column: 1 / -1; color: #ff3b5c;">
          <p>Erro ao buscar usuários. Tente novamente.</p>
        </div>
      `;
    });
}

// Render Friend Button based on status
function renderFriendButton(usuario) {
  if (usuario.is_friend) {
    return `
      <button class="btn-friend-action btn-remove" onclick="removerAmigo(${usuario.id}, '${usuario.username}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <line x1="18" y1="8" x2="23" y2="13" stroke="currentColor" stroke-width="2"/>
          <line x1="23" y1="8" x2="18" y2="13" stroke="currentColor" stroke-width="2"/>
        </svg>
        Amigo
      </button>
    `;
  } else if (usuario.request_sent) {
    return `
      <button class="btn-friend-action btn-add-friend pending" disabled>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Pendente
      </button>
    `;
  } else if (usuario.request_received) {
    return `
      <button class="btn-friend-action btn-accept" onclick="aceitarSolicitacaoPorUsuario(${usuario.id})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        Aceitar
      </button>
    `;
  } else {
    return `
      <button class="btn-friend-action btn-add-friend" onclick="enviarSolicitacao(${usuario.id}, this)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
          <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <line x1="18" y1="8" x2="23" y2="13" stroke="currentColor" stroke-width="2"/>
          <line x1="23" y1="8" x2="18" y2="13" stroke="currentColor" stroke-width="2"/>
        </svg>
        Adicionar
      </button>
    `;
  }
}

// Enviar Solicitação de Amizade
function enviarSolicitacao(userId, button) {
  fetch('/api/enviar-solicitacao-amizade/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({ user_id: userId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      button.classList.add('pending');
      button.disabled = true;
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Pendente
      `;
      showNotification('Solicitação enviada com sucesso!', 'success');
    } else {
      showNotification(data.message || 'Erro ao enviar solicitação', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao enviar solicitação', 'error');
  });
}

// Aceitar Solicitação
function aceitarSolicitacao(requestId) {
  fetch(`/api/aceitar-solicitacao-amizade/${requestId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Solicitação aceita!', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(data.message || 'Erro ao aceitar solicitação', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao aceitar solicitação', 'error');
  });
}

// Aceitar Solicitação por ID de Usuário
function aceitarSolicitacaoPorUsuario(userId) {
  fetch(`/api/aceitar-solicitacao-por-usuario/${userId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Solicitação aceita!', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(data.message || 'Erro ao aceitar solicitação', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao aceitar solicitação', 'error');
  });
}

// Rejeitar Solicitação
function rejeitarSolicitacao(requestId) {
  if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) {
    return;
  }

  fetch(`/api/rejeitar-solicitacao-amizade/${requestId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Solicitação rejeitada', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(data.message || 'Erro ao rejeitar solicitação', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao rejeitar solicitação', 'error');
  });
}

// Cancelar Solicitação
function cancelarSolicitacao(requestId) {
  if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) {
    return;
  }

  fetch(`/api/cancelar-solicitacao-amizade/${requestId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Solicitação cancelada', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(data.message || 'Erro ao cancelar solicitação', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao cancelar solicitação', 'error');
  });
}

// Remover Amigo
function removerAmigo(userId, username) {
  if (!confirm(`Tem certeza que deseja remover ${username} dos seus amigos?`)) {
    return;
  }

  fetch(`/api/remover-amigo/${userId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Amigo removido', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(data.message || 'Erro ao remover amigo', 'error');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao remover amigo', 'error');
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

// Show Notification
function showNotification(message, type = 'success') {
  // Create notification element
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

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
