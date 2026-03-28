/**
 * Backstage Global Toast System
 *
 * Usage:
 *   toast.success('Filme adicionado!')
 *   toast.error('Erro ao salvar')
 *   toast.info('Carregando...')
 *   toast.warning('Atenção!')
 *   toast.show('Custom message', 'success', { duration: 5000 })
 */
(function () {
  'use strict';

  const ICONS = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  let container = null;

  function getContainer() {
    if (!container || !container.parentElement) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type, options) {
    type = type || 'info';
    options = options || {};
    var duration = options.duration != null ? options.duration : 4000;

    var el = document.createElement('div');
    el.className = 'toast toast-' + type;

    el.innerHTML =
      '<span class="toast-icon">' + (ICONS[type] || ICONS.info) + '</span>' +
      '<span class="toast-message">' + message + '</span>' +
      '<button class="toast-dismiss" aria-label="Fechar">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      (duration > 0 ? '<div class="toast-progress" style="animation-duration:' + duration + 'ms"></div>' : '');

    var dismissBtn = el.querySelector('.toast-dismiss');
    dismissBtn.addEventListener('click', function () { dismiss(el); });

    getContainer().appendChild(el);

    // Trigger entrance animation
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('show');
      });
    });

    // Auto-dismiss
    if (duration > 0) {
      el._timeout = setTimeout(function () { dismiss(el); }, duration);
    }

    return el;
  }

  function dismiss(el) {
    if (!el || !el.parentElement) return;
    if (el._timeout) clearTimeout(el._timeout);

    el.classList.remove('show');
    el.classList.add('hiding');
    setTimeout(function () { el.remove(); }, 400);
  }

  // Public API
  window.toast = {
    show: show,
    success: function (msg, opts) { return show(msg, 'success', opts); },
    error: function (msg, opts) { return show(msg, 'error', opts); },
    info: function (msg, opts) { return show(msg, 'info', opts); },
    warning: function (msg, opts) { return show(msg, 'warning', opts); },
    dismiss: dismiss
  };

  // Backward compatibility: global showNotification → toast
  window.showNotification = function (message, type) {
    var mapped = type === 'danger' ? 'error' : (type || 'info');
    return show(message, mapped);
  };
})();
