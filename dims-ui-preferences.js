(() => {
  const THEME_KEY = 'dims.theme';
  const VIEW_KEY_PREFIX = 'dims.view.';
  const root = document.documentElement;

  function preferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll('[data-dims-theme-toggle]').forEach(button => {
      button.textContent = theme === 'dark' ? '☀ Light' : '☾ Dark';
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  }

  function pageViewKey() {
    return `${VIEW_KEY_PREFIX}${location.pathname.split('/').pop() || 'index'}`;
  }

  function applyView(view) {
    const normalized = view === 'card' ? 'card' : 'list';
    document.body.dataset.dimsView = normalized;
    localStorage.setItem(pageViewKey(), normalized);
    document.querySelectorAll('[data-dims-view]').forEach(button => {
      const active = button.dataset.dimsView === normalized;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function buildAboutDialog() {
    if (document.getElementById('dimsAboutDialog')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'dimsAboutDialog';
    dialog.className = 'dims-about-dialog';
    dialog.innerHTML = `
      <div class="dims-about-head">
        <div>
          <div class="dims-about-kicker">ABOUT</div>
          <h2>Dominion1st DOME™ / DIMS</h2>
        </div>
        <button type="button" class="dims-icon-button" data-dims-about-close aria-label="Close About">×</button>
      </div>
      <div class="dims-about-body">
        <p><strong>DOME™</strong> is the Dominion1st executive awareness and enterprise front door.</p>
        <p><strong>DIMS</strong> is the Dominion1st Integrated Management System that governs operational execution, continuity, projects, tasks, content, records, and specialized workspaces.</p>
        <p>Specialized modules and DOMEs provide focused workspaces while shared interface standards preserve one coherent operating environment.</p>
        <div class="dims-about-principles">
          <span>One system</span><span>Governed execution</span><span>Persistent context</span><span>Reusable standards</span>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    dialog.querySelector('[data-dims-about-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }

  function injectControls() {
    const header = document.querySelector('.page-header');
    if (!header || header.querySelector('.dims-global-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'dims-global-controls';
    controls.setAttribute('aria-label', 'DIMS display controls');
    controls.innerHTML = `
      <button type="button" class="dims-control" data-dims-about>ⓘ About</button>
      <button type="button" class="dims-control" data-dims-theme-toggle></button>`;

    const existingHome = [...header.children].find(child => child.tagName === 'A');
    if (existingHome) controls.appendChild(existingHome);
    header.appendChild(controls);

    controls.querySelector('[data-dims-about]').addEventListener('click', () => {
      buildAboutDialog();
      document.getElementById('dimsAboutDialog').showModal();
    });
    controls.querySelector('[data-dims-theme-toggle]').addEventListener('click', () => {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
    applyTheme(root.dataset.theme || preferredTheme());
  }

  function bindViewControls() {
    const controls = document.querySelectorAll('[data-dims-view]');
    if (!controls.length) return;
    controls.forEach(button => button.addEventListener('click', () => applyView(button.dataset.dimsView)));
    applyView(localStorage.getItem(pageViewKey()) || 'list');
  }

  applyTheme(preferredTheme());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { injectControls(); bindViewControls(); });
  } else {
    injectControls();
    bindViewControls();
  }
})();
