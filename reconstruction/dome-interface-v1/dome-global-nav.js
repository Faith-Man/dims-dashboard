(() => {
  if (window.self !== window.top) return;
  if (document.getElementById('domeGlobalNav')) return;

  const script = document.currentScript;
  const root = script ? new URL('.', script.src) : new URL('./', location.href);
  const registryUrl = new URL('config/dome-routes.json', root);
  const to = p => new URL(p.replace(/^\//, ''), root).href;
  const clean = p => p.replace(/index\.html$/, '').replace(/\/$/, '');
  const current = clean(location.pathname);
  const themeKey = 'dims.theme';

  const applyTheme = theme => {
    const value = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem(themeKey, value);
    document.documentElement.dataset.domeTheme = value;
    document.documentElement.dataset.theme = value;
    document.body?.classList.toggle('dark', value === 'dark');
    document.querySelectorAll('[data-dome-theme-toggle]').forEach(btn => {
      btn.textContent = value === 'dark' ? '☀︎ Light' : '☾ Dark';
      btn.setAttribute('aria-label', value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };
  const preferred = localStorage.getItem(themeKey) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.domeTheme = preferred;
  document.documentElement.dataset.theme = preferred;

  const style = document.createElement('style');
  style.textContent = `
    :root{--dome-shell-blue:#0c1475;--dome-shell-deep:#04103d;--dome-shell-bright:#0758c8;--dome-shell-line:#c8d8ff}
    .dome-global-bar{position:sticky;top:0;z-index:2147483000;height:64px;display:flex;align-items:center;padding:0 clamp(18px,2.5vw,40px);background:linear-gradient(100deg,var(--dome-shell-deep),#073489 58%,var(--dome-shell-bright));border-bottom:1px solid rgba(255,255,255,.3);box-shadow:0 3px 12px rgba(0,0,0,.14);font-family:Inter,Arial,sans-serif;color:#fff}
    .dome-global-brand{font-size:1.28rem;font-weight:950;letter-spacing:.12em;margin-right:42px;white-space:nowrap}
    .dome-global-desktop{display:flex;align-items:center;gap:28px;flex:1}
    .dome-nav-item{color:#fff;text-decoration:none;font:700 .83rem Inter,Arial,sans-serif;white-space:nowrap}
    .dome-nav-menu{position:relative}.dome-nav-menu>button{border:0;background:transparent;color:#fff;font:700 .83rem Inter,Arial,sans-serif;cursor:pointer;padding:20px 0}
    .dome-nav-pop{display:none;position:absolute;top:48px;left:-12px;min-width:220px;background:#fff;border:1px solid var(--dome-shell-line);border-radius:10px;padding:8px;box-shadow:0 18px 40px rgba(3,16,61,.28)}
    .dome-nav-menu.open .dome-nav-pop{display:grid;gap:4px}.dome-nav-pop a{color:var(--dome-shell-blue);text-decoration:none;font:800 .76rem Inter,Arial,sans-serif;padding:9px 10px;border-radius:7px}.dome-nav-pop a:hover{background:#eaf2ff}
    .dome-theme-toggle,.dome-global-open{border:1px solid rgba(255,255,255,.72);border-radius:999px;padding:7px 11px;background:rgba(255,255,255,.12);color:#fff;font:800 .76rem Inter,Arial,sans-serif;cursor:pointer;white-space:nowrap}.dome-theme-toggle{margin-left:auto}.dome-global-open{display:none;background:#fff;color:#0c1475}
    .dome-global-backdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(1,7,25,.58);opacity:0;pointer-events:none;transition:opacity .18s;overflow:hidden}.dome-global-backdrop.open{opacity:1;pointer-events:auto}
    .dome-global-drawer{position:absolute;left:0;top:0;width:min(380px,90vw);height:100dvh;display:flex;flex-direction:column;background:#fff;transform:translateX(-102%);transition:.2s;box-shadow:18px 0 48px rgba(0,0,0,.28);overflow:hidden}.dome-global-backdrop.open .dome-global-drawer{transform:translateX(0)}
    .dome-global-head{flex:0 0 auto;background:#0c1475;color:#fff;padding:18px;display:flex;justify-content:space-between;align-items:center;gap:10px}.dome-global-head-actions{display:flex;align-items:center;gap:8px}.dome-global-close{border:1px solid #fff;background:transparent;color:#fff;border-radius:50%;width:34px;height:34px}
    .dome-global-list{flex:1 1 auto;min-height:0;padding:12px 12px 40px;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.dome-global-group-title{font:900 .66rem Inter,Arial;letter-spacing:.12em;color:#62708f;padding:8px 4px}.dome-global-group-links{display:grid;gap:6px}.dome-global-link{padding:10px;border:1px solid var(--dome-shell-line);border-radius:9px;text-decoration:none;color:#0c1475;font-weight:800}.dome-global-link.active{background:#0c1475;color:#fff}

    html[data-dome-theme="dark"] body{background:#071126!important;color:#e9f0ff!important}
    html[data-dome-theme="dark"] .wrap,html[data-dome-theme="dark"] main{color:#e9f0ff}
    html[data-dome-theme="dark"] .card,html[data-dome-theme="dark"] .writer-card,html[data-dome-theme="dark"] .feature,html[data-dome-theme="dark"] .item,html[data-dome-theme="dark"] .attention,html[data-dome-theme="dark"] .today,html[data-dome-theme="dark"] .flow,html[data-dome-theme="dark"] .underneath{background:#0c1831!important;color:#e9f0ff!important;border-color:#294b7e!important}
    html[data-dome-theme="dark"] .card p,html[data-dome-theme="dark"] .writer-card p,html[data-dome-theme="dark"] .note,html[data-dome-theme="dark"] .muted,html[data-dome-theme="dark"] .loading,html[data-dome-theme="dark"] .boundary{color:#b9c9e6!important}
    html[data-dome-theme="dark"] input,html[data-dome-theme="dark"] textarea,html[data-dome-theme="dark"] select{background:#071126!important;color:#eef4ff!important;border-color:#42679b!important}
    html[data-dome-theme="dark"] table,html[data-dome-theme="dark"] td{color:#e9f0ff}html[data-dome-theme="dark"] .row-item{border-color:#294b7e!important}
    html[data-dome-theme="dark"] .nav,html[data-dome-theme="dark"] .orel-nav,html[data-dome-theme="dark"] .nav-pills{background:#0a1530!important;border-color:#294b7e!important}
    html[data-dome-theme="dark"] .nav a:not(.active),html[data-dome-theme="dark"] .orel-nav a:not(.active),html[data-dome-theme="dark"] .nav-pill:not(.active){background:#0c1831!important;color:#dce8ff!important;border-color:#42679b!important}
    html[data-dome-theme="dark"] .dome-nav-pop,html[data-dome-theme="dark"] .dome-global-drawer{background:#071126;color:#e9f0ff;border-color:#294b7e}html[data-dome-theme="dark"] .dome-nav-pop a,html[data-dome-theme="dark"] .dome-global-link{color:#dce8ff;border-color:#294b7e}html[data-dome-theme="dark"] .dome-nav-pop a:hover{background:#102349}html[data-dome-theme="dark"] .dome-global-link.active{background:#1254ad;color:#fff}html[data-dome-theme="dark"] .dome-global-group-title{color:#9db2d8}

    @media(max-width:800px){.dome-global-bar{height:52px;padding:0 12px}.dome-global-brand{font-size:.9rem;margin-right:auto}.dome-global-desktop{display:none}.dome-theme-toggle{margin-left:8px;padding:6px 9px;font-size:.7rem}.dome-global-open{display:block;margin-left:7px;padding:7px 10px}.dome-global-head .dome-theme-toggle{margin-left:0}}
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'domeGlobalNav';
  bar.className = 'dome-global-bar';
  bar.innerHTML = '<div class="dome-global-brand">DOME™</div><nav class="dome-global-desktop"><a class="dome-nav-item" data-home>Home</a><div class="dome-nav-menu"><button type="button">Modules⌄</button><div class="dome-nav-pop" data-modules></div></div><a class="dome-nav-item" data-mission>Mission Control</a><div class="dome-nav-menu"><button type="button">System⌄</button><div class="dome-nav-pop" data-system></div></div><div class="dome-nav-menu"><button type="button">Resources⌄</button><div class="dome-nav-pop" data-resources></div></div></nav><button class="dome-theme-toggle" data-dome-theme-toggle type="button"></button><button class="dome-global-open" type="button">☰ Navigate</button>';

  const backdrop = document.createElement('div');
  backdrop.className = 'dome-global-backdrop';
  backdrop.innerHTML = '<aside class="dome-global-drawer"><div class="dome-global-head"><strong>DOME™ Navigation</strong><div class="dome-global-head-actions"><button class="dome-theme-toggle" data-dome-theme-toggle type="button"></button><button class="dome-global-close" type="button" aria-label="Close navigation">×</button></div></div><nav class="dome-global-list">Loading…</nav></aside>';
  document.body.prepend(bar);
  document.body.appendChild(backdrop);
  applyTheme(preferred);

  const render = (label, items) => `<section><div class="dome-global-group-title">${label}</div><div class="dome-global-group-links">${items.map(i => `<a class="dome-global-link${clean(new URL(to(i.path)).pathname) === current ? ' active' : ''}" href="${to(i.path)}">${i.label}</a>`).join('')}</div></section>`;

  fetch(registryUrl,{cache:'no-store'}).then(r => r.json()).then(reg => {
    const primary = reg.primary || [], enterprise = reg.enterprise || [];
    const home = primary.find(i => i.key === 'domeHome'), mission = enterprise.find(i => i.key === 'missionControl');
    if(home) bar.querySelector('[data-home]').href = to(home.path);
    if(mission) bar.querySelector('[data-mission]').href = to(mission.path);
    bar.querySelector('[data-modules]').innerHTML = primary.filter(i => i.key !== 'domeHome').map(i => `<a href="${to(i.path)}">${i.label}</a>`).join('');
    bar.querySelector('[data-system]').innerHTML = enterprise.filter(i => ['kubernesisGateway','systemHealth','executiveDashboard'].includes(i.key)).map(i => `<a href="${to(i.path)}">${i.label}</a>`).join('');
    bar.querySelector('[data-resources]').innerHTML = enterprise.filter(i => ['institutionalQueue','blueprint'].includes(i.key)).map(i => `<a href="${to(i.path)}">${i.label}</a>`).join('');
    backdrop.querySelector('.dome-global-list').innerHTML = render('PRIMARY DOME MODULES',primary) + render('ENTERPRISE / SYSTEM',enterprise);
  }).catch(() => backdrop.querySelector('.dome-global-list').textContent = 'Canonical route registry unavailable.');

  document.querySelectorAll('[data-dome-theme-toggle]').forEach(btn => btn.addEventListener('click', () => applyTheme((localStorage.getItem(themeKey) || 'light') === 'dark' ? 'light' : 'dark')));
  bar.querySelectorAll('.dome-nav-menu>button').forEach(b => b.addEventListener('click', e => {const m=e.currentTarget.parentElement;bar.querySelectorAll('.dome-nav-menu').forEach(x=>x!==m&&x.classList.remove('open'));m.classList.toggle('open')}));
  document.addEventListener('click', e => {if(!e.target.closest('.dome-nav-menu'))bar.querySelectorAll('.dome-nav-menu').forEach(x=>x.classList.remove('open'))});
  const openBtn = bar.querySelector('.dome-global-open'), closeBtn = backdrop.querySelector('.dome-global-close');
  openBtn.addEventListener('click', () => {backdrop.classList.add('open');document.documentElement.style.overflow='hidden'});
  function close(){backdrop.classList.remove('open');document.documentElement.style.overflow=''}
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => e.target === backdrop && close());
})();
