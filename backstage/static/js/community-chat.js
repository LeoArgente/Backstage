/**
 * Community Chat System
 * Modern, modular chat implementation with WebSocket support
 */

class CommunityChat {
  constructor(options = {}) {
    this.communityId = options.communityId;
    this.currentUser = options.currentUser;
    this.isAdmin = options.isAdmin || false;
    this.messagesContainer = null;
    this.inputElement = null;
    this.sendButton = null;
    this.lastMessageId = null;
    this.lastMessageUser = null;
    this.pollInterval = null;
    this.pollDelay = options.pollDelay || 3000;

    // Attachment state
    this.attachedMedia = null;

    this.init();
  }

  /**
   * Initialize chat
   */
  init() {
    this.messagesContainer = document.getElementById('chat-messages');
    this.inputElement = document.getElementById('chat-input');
    this.sendButton = document.getElementById('chat-send');

    // Attachment elements
    this.attachButton = document.getElementById('chat-attach');
    this.modal = document.getElementById('chat-media-modal');
    this.modalSearchInput = document.getElementById('media-search-input');
    this.modalResults = document.getElementById('media-search-results');

    // Admin elements
    this.clearButton = document.getElementById('chat-clear');

    if (!this.messagesContainer || !this.inputElement || !this.sendButton) {
      console.error('Chat elements not found');
      return;
    }

    this.setupEventListeners();
    this.setupAttachmentListeners();
    this.setupAdminListeners();
    this.loadMessages();
    this.startPolling();
    this.scrollToBottom();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    // Enter to send (Shift+Enter for new line)
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.inputElement.addEventListener('input', () => {
      this.autoResizeTextarea();
    });

    // Disable send button when empty (or if there's an attachment)
    this.inputElement.addEventListener('input', () => {
      this.updateSendButtonState();
    });
  }

  /**
   * Setup attachment-related event listeners
   */
  setupAttachmentListeners() {
    if (!this.attachButton || !this.modal) return;

    // Open modal
    this.attachButton.addEventListener('click', () => {
      this.openMediaModal();
    });

    // Close modal
    const closeBtn = document.getElementById('modal-close');
    const overlay = document.getElementById('modal-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMediaModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeMediaModal());
    }


    // Search input with debounce
    if (this.modalSearchInput) {
      let searchTimeout;
      this.modalSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const query = this.modalSearchInput.value.trim();

        if (query.length < 2) {
          this.showSearchPlaceholder();
          return;
        }

        searchTimeout = setTimeout(() => {
          this.searchMedia(query);
        }, 300);
      });
    }

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeMediaModal();
      }
    });
  }

  /**
   * Setup admin-related event listeners
   */
  setupAdminListeners() {
    if (!this.clearButton) return;

    this.clearButton.addEventListener('click', () => {
      this.clearChat();
    });
  }

  /**
   * Update send button state
   */
  updateSendButtonState() {
    const hasText = this.inputElement.value.trim().length > 0;
    const hasAttachment = this.attachedMedia !== null;
    this.sendButton.disabled = !hasText && !hasAttachment;
  }

  /**
   * Auto resize textarea based on content
   */
  autoResizeTextarea() {
    this.inputElement.style.height = 'auto';
    this.inputElement.style.height = Math.min(this.inputElement.scrollHeight, 120) + 'px';
  }

  /**
   * Load initial messages
   */
  async loadMessages() {
    try {
      const response = await fetch(`/comunidade/${this.communityId}/mensagens/`);
      const data = await response.json();

      if (data.success) {
        this.renderMessages(data.mensagens);
        if (data.mensagens.length > 0) {
          this.lastMessageId = data.mensagens[data.mensagens.length - 1].id;
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      this.showError('Erro ao carregar mensagens');
    }
  }

  /**
   * Start polling for new messages
   */
  startPolling() {
    this.pollInterval = setInterval(() => {
      this.pollNewMessages();
    }, this.pollDelay);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Poll for new messages
   */
  async pollNewMessages() {
    if (!this.lastMessageId) return;

    try {
      const response = await fetch(
        `/comunidade/${this.communityId}/mensagens/novas/?after=${this.lastMessageId}`
      );
      const data = await response.json();

      if (data.success && data.mensagens.length > 0) {
        const wasAtBottom = this.isScrolledToBottom();

        data.mensagens.forEach(msg => {
          this.appendMessage(msg);
        });

        this.lastMessageId = data.mensagens[data.mensagens.length - 1].id;

        if (wasAtBottom) {
          this.scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  }

  /**
   * Send a message
   */
  async sendMessage() {
    const content = this.inputElement.value.trim();

    // Must have either content or attachment
    if (!content && !this.attachedMedia) return;

    // Disable input while sending
    this.sendButton.disabled = true;
    this.inputElement.disabled = true;

    try {
      let endpoint = `/comunidade/${this.communityId}/enviar-mensagem/`;
      let payload = { conteudo: content };

      // If there's an attachment, use recommendation endpoint
      if (this.attachedMedia) {
        endpoint = `/comunidade/${this.communityId}/recomendar-${this.attachedMedia.type}/`;
        payload = {
          tmdb_id: this.attachedMedia.tmdb_id,
          mensagem: content || ''
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        // Clear input and attachment
        this.inputElement.value = '';
        this.autoResizeTextarea();
        this.attachedMedia = null;

        // Add message to UI
        this.appendMessage(data.mensagem);
        this.lastMessageId = data.mensagem.id;

        // Scroll to bottom
        this.scrollToBottom();
      } else {
        this.showError(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showError('Erro ao enviar mensagem');
    } finally {
      // Re-enable input
      this.inputElement.disabled = false;
      this.updateSendButtonState();
      this.inputElement.focus();
    }
  }

  /**
   * Render multiple messages
   */
  renderMessages(messages) {
    this.messagesContainer.innerHTML = '';

    if (messages.length === 0) {
      this.showEmptyState();
      return;
    }

    messages.forEach((msg, index) => {
      const isFirstInGroup = index === 0 || messages[index - 1].usuario.username !== msg.usuario.username;
      this.appendMessage(msg, isFirstInGroup);
    });
  }

  /**
   * Append a single message
   */
  appendMessage(message, isFirstInGroup = null) {
    // Determine if first in group
    if (isFirstInGroup === null) {
      isFirstInGroup = this.lastMessageUser !== message.usuario.username;
    }

    this.lastMessageUser = message.usuario.username;

    // Create message element
    const messageEl = this.createMessageElement(message, isFirstInGroup);

    // Append to container
    this.messagesContainer.appendChild(messageEl);
  }

  /**
   * Create message HTML element
   */
  createMessageElement(message, isFirstInGroup) {
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    messageItem.dataset.messageId = message.id;
    messageItem.dataset.username = message.usuario.username;

    // Check if own message
    const isOwnMessage = message.usuario.username === this.currentUser;
    if (isOwnMessage) {
      messageItem.classList.add('own-message');
    }

    // Build HTML
    let html = '';

    // Avatar (only on first message in group)
    if (isFirstInGroup) {
      if (message.usuario.foto_perfil) {
        html += `<img src="${this.escapeHtml(message.usuario.foto_perfil)}"
                      alt="${this.escapeHtml(message.usuario.username)}"
                      class="message-avatar">`;
      } else {
        const initial = message.usuario.username.charAt(0).toUpperCase();
        html += `<div class="message-avatar-placeholder">${initial}</div>`;
      }
    } else {
      html += '<div class="message-avatar-spacer"></div>';
    }

    // Content wrapper
    html += '<div class="message-content-wrapper">';

    // Meta (username + badge) - only on first message in group
    if (isFirstInGroup) {
      html += '<div class="message-meta">';
      html += `<a href="/perfil/${this.escapeHtml(message.usuario.username)}/" class="message-username">${this.escapeHtml(message.usuario.username)}</a>`;

      if (message.usuario.role === 'admin') {
        html += '<span class="message-role-badge role-admin">Admin</span>';
      } else if (message.usuario.role === 'mod') {
        html += '<span class="message-role-badge role-mod">Mod</span>';
      }

      html += '</div>';
    }

    // Movie recommendation card (appears BEFORE text message)
    if (message.tipo_mensagem === 'recomendacao' && message.filme_tmdb_id) {
      html += this.createMovieCard(message);
    }

    // Message bubble (text content with timestamp inside)
    if (message.conteudo) {
      html += `<div class="message-bubble">${this.escapeHtml(message.conteudo)}<span class="message-timestamp">${this.formatTimestamp(message.criado_em)}</span></div>`;
    }

    html += '</div>'; // Close content wrapper

    messageItem.innerHTML = html;
    return messageItem;
  }

  /**
   * Create movie recommendation card HTML - simplified (poster only)
   */
  createMovieCard(message) {
    const posterUrl = message.filme_poster || 'https://via.placeholder.com/120x180?text=No+Poster';
    // Use media_tipo if available, otherwise default to 'filme'
    const mediaType = message.media_tipo || 'filme';
    const url = mediaType === 'serie' ? `/series/${message.filme_tmdb_id}/` : `/filmes/${message.filme_tmdb_id}/`;

    return `
      <a href="${url}" class="message-movie-card">
        <img src="${posterUrl}" alt="${this.escapeHtml(message.filme_titulo)}" class="message-movie-poster">
      </a>
    `;
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    this.messagesContainer.innerHTML = `
      <div class="chat-empty">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <h4>Nenhuma mensagem ainda</h4>
        <p>Seja o primeiro a iniciar a conversa!</p>
      </div>
    `;
  }

  /**
   * Show error message
   */
  showError(message) {
    // You can implement a toast notification here
    console.error(message);
    alert(message);
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom(smooth = true) {
    if (!this.messagesContainer) return;

    this.messagesContainer.scrollTo({
      top: this.messagesContainer.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  /**
   * Check if scrolled to bottom
   */
  isScrolledToBottom() {
    const threshold = 150;
    const position = this.messagesContainer.scrollTop + this.messagesContainer.clientHeight;
    const height = this.messagesContainer.scrollHeight;
    return height - position < threshold;
  }

  /**
   * Format timestamp to HH:mm format
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Get CSRF token from cookies
   */
  getCsrfToken() {
    const name = 'csrftoken';
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

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Open media search modal
   */
  openMediaModal() {
    this.modal.classList.add('active');
    this.modalSearchInput.value = '';
    this.showSearchPlaceholder();
    setTimeout(() => this.modalSearchInput.focus(), 100);
  }

  /**
   * Close media search modal
   */
  closeMediaModal() {
    this.modal.classList.remove('active');
    this.modalSearchInput.value = '';
    this.showSearchPlaceholder();
  }

  /**
   * Show search placeholder
   */
  showSearchPlaceholder() {
    this.modalResults.innerHTML = `
      <div class="search-placeholder">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <p>Digite para buscar filmes ou séries</p>
      </div>
    `;
  }

  /**
   * Search for movies and series
   */
  async searchMedia(query) {
    this.modalResults.innerHTML = '<div class="search-loading">Buscando...</div>';

    try {
      const response = await fetch(`/api/buscar-midia/?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success && data.resultados && data.resultados.length > 0) {
        this.renderMediaResults(data.resultados);
      } else {
        this.modalResults.innerHTML = '<div class="search-empty">Nenhum resultado encontrado</div>';
      }
    } catch (error) {
      console.error('Error searching media:', error);
      this.modalResults.innerHTML = '<div class="search-empty">Erro ao buscar</div>';
    }
  }

  /**
   * Render media search results
   */
  renderMediaResults(results) {
    this.modalResults.innerHTML = results.map(item => {
      const posterUrl = item.poster || 'https://via.placeholder.com/50x75?text=No+Poster';
      const type = item.tipo === 'filme' ? 'Filme' : 'Série';
      const year = item.ano || '';

      return `
        <div class="media-result-item"
             data-tmdb-id="${item.tmdb_id}"
             data-type="${item.tipo}"
             data-title="${this.escapeHtml(item.titulo)}"
             data-poster="${posterUrl}">
          <img src="${posterUrl}" alt="${this.escapeHtml(item.titulo)}" class="media-result-poster"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="media-result-poster-placeholder" style="display:none;">🎬</div>
          <div class="media-result-info">
            <div class="media-result-type">${type}</div>
            <div class="media-result-title">${this.escapeHtml(item.titulo)}</div>
            ${year ? `<div class="media-result-year">${year}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add click listeners
    this.modalResults.querySelectorAll('.media-result-item').forEach(item => {
      item.addEventListener('click', () => {
        this.attachMedia({
          tmdb_id: item.dataset.tmdbId,
          type: item.dataset.type,
          title: item.dataset.title,
          poster: item.dataset.poster
        });
      });
    });
  }

  /**
   * Attach media to message
   */
  attachMedia(media) {
    this.attachedMedia = media;
    this.updateSendButtonState();
    this.closeMediaModal();
    this.inputElement.focus();
  }

  /**
   * Clear all chat messages (admin only)
   */
  async clearChat() {
    if (!confirm('Tem certeza que deseja limpar todas as mensagens do chat? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/comunidade/${this.communityId}/limpar-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        }
      });

      const data = await response.json();

      if (data.success) {
        this.messagesContainer.innerHTML = '';
        this.showEmptyState();
        this.lastMessageId = null;
      } else {
        alert(data.error || 'Erro ao limpar chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      alert('Erro ao limpar chat');
    }
  }

  /**
   * Cleanup - call when leaving page
   */
  destroy() {
    this.stopPolling();
  }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const chatContainer = document.getElementById('community-chat');

  if (chatContainer) {
    const communityId = chatContainer.dataset.communityId;
    const currentUser = chatContainer.dataset.currentUser;
    const isAdmin = chatContainer.dataset.isAdmin === 'true';

    if (communityId && currentUser) {
      window.communityChat = new CommunityChat({
        communityId: communityId,
        currentUser: currentUser,
        isAdmin: isAdmin
      });
    }
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.communityChat) {
    window.communityChat.destroy();
  }
});
