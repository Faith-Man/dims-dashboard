(() => {
  if (document.getElementById('domeGlobalNav')) return;

  const script = document.currentScript;
  const root = script ? new URL('.', script.src) : new URL('./', location.href);
  const to = path => new URL(path, root).href;

  const groups = [
    {
      label: 'PRIMARY DOME MODULES',
      items: [
        ['DOME Home', 'prototypes/dome-eight-module-home/'],
        ['GEGRAPTAI™', 'gegraptai/'],
        ['NESHAMAH™', 'neshamah/'],
        ['TETELESTAI™', 'tetelestai/'],
        ['OrEl™', 'orel/'],
        ['YARATHĒKĒ™', 'yaratheke/'],
        ['SHAMAR™', 'shamar-intelligence-dome.html'],
        ['OIKONOMOS™', 'oikonomos/'],
        ['EKKLĒSIA™', 'ekklesia/']
      ]
    },
    {
      label: 'ENTERPRISE / SYSTEM',
      items: [
        ['Mission Control', 'mission-control.html'],
        ['KUBERNĒSIS™', 'dashboard-v3-current.html'],
        ['System', 'dashboard-v3.html'],
        ['System Health', 'system-health.html'],
        ['Enterprise Forms', 'enterprise-forms.html'],
        ['Institutional Queue', 'institutional-queue.html'],
        ['Intelligence Center', 'intelligence-briefing.html'],
        ['Teaching Center', 'teaching-library-v3.html'],
        ['Thesaurus Vault', 'glossary/index.html'],
        ['Executive Dashboard', 'executive-dashboard.html'],
        ['Settings / Admin', 'admin.html'],
        ['DIMS-v3 Blueprint', 'dims-blueprint.html']
      ]
    }
  ];

  const current = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  const isActive = href => {
    const p = new URL(href, root).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    return current === p;
  };

  const style = document.createElement('style');
  style.textContent = `
    :root{--dome-shell-blue:#0c1475;--dome-shell-deep:#050b3d;--dome-shell-bright:#13258f;--dome-shell-line:#c8d8ff}
    .dome-global-bar{position:sticky;top:0;z-index:2147483000;height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:linear-gradient(135deg,var(--dome-shell-deep),var(--dome-shell-blue) 62%,var(--dome-shell-bright));border-bottom:1px solid rgba(255,255,255,.22);box-shadow:0 3px 12px rgba(0,0,0,.14);font-family:Inter,Arial,sans-serif}
    .dome-global-brand{color:#fff;font-size:.78rem;font-weight:900;letter-spacing:.12em;white-space:nowrap}
    .dome-global-open{appearance:none;border:1px solid rgba(255,255,255,.72);background:#fff;color:var(--dome-shell-blue);border-radius:999px;padding:7px 12px;font:800 .76rem/1 Inter,Arial,sans-serif;cursor:pointer}
    .dome-global-open:hover,.dome-global-open:focus-visible{background:#eaf0ff;outline:2px solid #fff;outline-offset:2px}
    .dome-global-backdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(1,7,25,.58);opacity:0;pointer-events:none;transition:opacity .18s ease}
    .dome-global-backdrop.open{opacity:1;pointer-events:auto}
    .dome-global-drawer{position:absolute;left:0;top:0;width:min(380px,90vw);height:100%;background:#fff;transform:translateX(-102%);transition:transform .2s ease;box-shadow:18px 0 48px rgba(0,0,0,.28);display:flex;flex-direction:column}
    .dome-global-backdrop.open .dome-global-drawer{transform:translateX(0)}
    .dome-global-head{background:linear-gradient(135deg,var(--dome-shell-deep),var(--dome-shell-blue) 62%,var(--dome-shell-bright));color:#fff;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .dome-global-head strong{font-size:1rem;letter-spacing:.08em}.dome-global-head small{display:block;opacity:.8;margin-top:3px}
    .dome-global-close{appearance:none;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.25rem;cursor:pointer}
    .dome-global-list{padding:12px;overflow:auto}
    .dome-global-group{margin:0 0 14px}.dome-global-group:last-child{margin-bottom:0}
    .dome-global-group-title{font:900 .66rem/1 Inter,Arial,sans-serif;letter-spacing:.12em;color:#62708f;padding:6px 4px 8px}
    .dome-global-group-links{display:grid;gap:7px}
    .dome-global-link{display:flex;align-items:center;justify-content:space-between;gap:10px;text-decoration:none;color:var(--dome-shell-blue);background:#fff;border:1px solid var(--dome-shell-line);border-radius:12px;padding:11px 12px;font:800 .86rem/1.2 Inter,Arial,sans-serif}
    .dome-global-link:hover,.dome-global-link:focus-visible{border-color:var(--dome-shell-blue);background:#eef3ff;outline:none}
    .dome-global-link.active{background:var(--dome-shell-blue);color:#fff;border-color:var(--dome-shell-blue)}
    .dome-global-link.active::after{content:'CURRENT';font-size:.58rem;letter-spacing:.08em;opacity:.82}
    body.dome-global-menu-open{overflow:hidden}
    @media(min-width:1000px){.dome-global-drawer{width:360px}.dome-global-bar{padding-left:20px;padding-right:20px}}
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'domeGlobalNav';
  bar.className = 'dome-global-bar';
  bar.innerHTML = `<div class="dome-global-brand">DOME™</div><button class="dome-global-open" type="button" aria-haspopup="dialog" aria-expanded="false">☰ Navigate</button>`;

  const groupsMarkup = groups.map(group => `<section class="dome-global-group"><div class="dome-global-group-title">${group.label}</div><div class="dome-global-group-links">${group.items.map(([label,path]) => `<a class="dome-global-link${isActive(to(path))?' active':''}" href="${to(path)}">${label}</a>`).join('')}</div></section>`).join('');

  const backdrop = document.createElement('div');
  backdrop.className = 'dome-global-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = `<aside class="dome-global-drawer" role="dialog" aria-modal="true" aria-label="DOME navigation"><div class="dome-global-head"><div><strong>DOME™ Navigation</strong><small>Primary modules plus preserved enterprise/system access</small></div><button class="dome-global-close" type="button" aria-label="Close navigation">×</button></div><nav class="dome-global-list">${groupsMarkup}</nav></aside>`;

  document.body.prepend(bar);
  document.body.appendChild(backdrop);

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