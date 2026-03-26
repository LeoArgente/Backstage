(function () {
  const initialized = new WeakSet();

  function setupMenu(root) {
    if (initialized.has(root)) return;

    const btn = root.querySelector('[data-user-menu-btn], #userMenuBtn, .user-avatar, .user-menu-toggle, [data-user-menu-toggle]');
    const dropdown = root.querySelector('[data-user-dropdown], #userDropdown, .user-dropdown');

    if (!btn || !dropdown) return;

    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', dropdown.classList.contains('active') ? 'true' : 'false');

    function open() {
      dropdown.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      dropdown.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }

    function toggle(e) {
      e.stopPropagation();
      dropdown.classList.contains('active') ? close() : open();
    }

    try { btn.removeEventListener('click', toggle); } catch (e) {}
    btn.addEventListener('click', toggle);

    try { btn.removeEventListener('touchstart', toggle); } catch (e) {}
    btn.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      if (!dropdown.classList.contains('active')) open();
    }, { passive: true });

    function onDocClick(e) {
      if (!root.contains(e.target)) close();
    }
    document.removeEventListener('click', onDocClick);
    document.addEventListener('click', onDocClick);

    function onKeyDown(e) {
      if (e.key === 'Escape') close();
    }
    document.removeEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onKeyDown);

    initialized.add(root);
  }

  function initAll() {
    const roots = document.querySelectorAll('.user-menu, [data-user-menu-root]');
    if (roots.length) {
      roots.forEach(setupMenu);
      return;
    }

    const possibleBtns = document.querySelectorAll('[data-user-menu-btn], #userMenuBtn, .user-avatar, .user-menu-toggle');
    possibleBtns.forEach(btn => {
      const root = btn.closest('.user-menu') || document.body;
      setupMenu(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  const mo = new MutationObserver(() => initAll());
  mo.observe(document.body, { childList: true, subtree: true });
})();