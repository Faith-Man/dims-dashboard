(() => {
  if (document.getElementById('domeGlobalNav')) return;

  const script = document.currentScript;
  const root = script ? new URL('.', script.src) : new URL('./', location.href);
  const registryUrl = new URL('config/dome-routes.json', root);
  const to = path => new URL(path.replace(/^\//, ''), root).href;
  const clean = path => path.replace(/index\.html$/, '').replace(/\/$/, '');
  const current = clean(location.pathname);

  const style = document.createElement('style');
  style.textContent = `:root{--dome-shell-blue:#0c1475;--dome-shell-deep:#050b3d;--dome-shell-bright:#13258f;--dome-shell-line:#c8d8ff}.dome-global-bar{position:sticky;top:0;z-index:2147483000;height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:linear-gradient(135deg,var(--dome-shell-deep),var(--dome-shell-blue) 62%,var(--dome-shell-bright));border-bottom:1px solid rgba(255,255,255,.22);box-shadow:0 3px 12px rgba(0,0,0,.14);font-family:Inter,Arial,sans-serif}.dome-global-brand{color:#fff;font-size:.78rem;font-weight:900;letter-spacing:.12em}.dome-global-open{appearance:none;border:1px solid rgba(255,255,255,.72);background:#fff;color:var(--dome-shell-blue);border-radius:999px;padding:7px 12px;font:800 .76rem/1 Inter,Arial,sans-serif;cursor:pointer}.dome-global-backdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(1,7,25,.58);opacity:0;pointer-events:none;transition:opacity .18s ease}.dome-global-backdrop.open{opacity:1;pointer-events:auto}.dome-global-drawer{position:absolute;left:0;top:0;width:min(380px,90vw);height:100%;background:#fff;transform:translateX(-102%);transition:transform .2s ease;box-shadow:18px 0 48px rgba(0,0,0,.28);display:flex;flex-direction:column}.dome-global-backdrop.open .dome-global-drawer{transform:translateX(0)}.dome-global-head{background:linear-gradient(135deg,var(--dome-shell-deep),var(--dome-shell-blue) 62%,var(--dome-shell-bright));color:#fff;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}.dome-global-head small{display:block;opacity:.8;margin-top:3px}.dome-global-close{appearance:none;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.25rem;cursor:pointer}.dome-global-list{padding:12px;overflow:auto}.dome-global-group{margin:0 0 14px}.dome-global-group-title{font:900 .66rem/1 Inter,Arial,sans-serif;letter-spacing:.12em;color:#62708f;padding:6px 4px 8px}.dome-global-group-links{display:grid;gap:7px}.dome-global-link{display:flex;align-items:center;justify-content:space-between;text-decoration:none;color:var(--dome-shell-blue);background:#fff;border:1px solid var(--dome-shell-line);border-radius:12px;padding:11px 12px;font:800 .86rem/1.2 Inter,Arial,sans-serif}.dome-global-link.active{background:var(--dome-shell-blue);color:#fff}.dome-global-link.active::after{content:'CURRENT';font-size:.58rem;letter-spacing:.08em;opacity:.82}.dome-global-error{padding:18px;color:#8b1d1d;font:700 .82rem/1.4 Inter,Arial,sans-serif}body.dome-global-menu-open{overflow:hidden}`;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'domeGlobalNav';
  bar.className = 'dome-global-bar';
  bar.innerHTML = '<div class="dome-global-brand">DOME™</div><button class="dome-global-open" type="button" aria-haspopup="dialog" aria-expanded="false">☰ Navigate</button>';

  const backdrop = document.createElement('div');
  backdrop.className = 'dome-global-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = '<aside class="dome-global-drawer" role="dialog" aria-modal="true" aria-label="DOME navigation"><div class="dome-global-head"><div><strong>DOME™ Navigation</strong><small>Canonical governed destinations</small></div><button class="dome-global-close" type="button" aria-label="Close navigation">×</button></div><nav class="dome-global-list"><div class="dome-global-error">Loading canonical routes…</div></nav></aside>';

  document.body.prepend(bar);
  document.body.appendChild(backdrop);

  const list = backdrop.querySelector('.dome-global-list');
  const renderGroup = (label, items) => `<section class="dome-global-group"><div class="dome-global-group-title">${label}</div><div class="dome-global-group-links">${items.map(item => { const href = to(item.path); const active = clean(new URL(href).pathname) === current; return `<a class="dome-global-link${active ? ' active' : ''}" href="${href}" data-route-key="${item.key}">${item.label}</a>`; }).join('')}</div></section>`;

  fetch(registryUrl, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(registry => {
      list.innerHTML = renderGroup('PRIMARY DOME MODULES', registry.primary || []) + renderGroup('ENTERPRISE / SYSTEM', registry.enterprise || []);
    })
    .catch(error => {
      console.error('DOME route registry unavailable', error);
      list.innerHTML = '<div class="dome-global-error">Canonical route registry unavailable. Navigation is intentionally disabled rather than falling back to stale links.</div>';
    });

  const openBtn = bar.querySelector('.dome-global-open');
  const closeBtn = backdrop.querySelector('.dome-global-close');
  const drawer = backdrop.querySelector('.dome-global-drawer');
  const open = () => { backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden','false'); openBtn.setAttribute('aria-expanded','true'); document.body.classList.add('dome-global-menu-open'); closeBtn.focus(); };
  const close = () => { backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden','true'); openBtn.setAttribute('aria-expanded','false'); document.body.classList.remove('dome-global-menu-open'); openBtn.focus(); };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  drawer.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && backdrop.classList.contains('open')) close(); });
})();
