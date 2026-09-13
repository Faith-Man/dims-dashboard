(() => {
  if (window.self !== window.top) return;
  if (document.getElementById('domeGlobalNav')) return;

  const script = document.currentScript;
  const root = script ? new URL('.', script.src) : new URL('./', location.href);
  const to = path => new URL(path, root).href;
  const clean = p => p.replace(/index\.html$/, '').replace(/\/$/, '');
  const current = clean(location.pathname);

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
        ['GRĒGOREŌ™', 'gregoreo/'],
        ['OIKONOMOS™', 'oikonomos/'],
        ['EKKLĒSIA™', 'ekklesia/']
      ]
    },
    {
      label: 'ENTERPRISE / SYSTEM',
      items: [
        ['Mission Control', 'mission-control.html'],
        ['KUBERNĒSIS™ Gateway', 'dashboard-v3-current.html'],
        ['DSCC — System Health & Command', 'system-health.html'],
        ['Institutional Queue', 'institutional-queue.html'],
        ['Executive Dashboard', 'executive-dashboard.html'],
        ['DIMS-v3 Blueprint', 'dims-blueprint.html']
      ]
    }
  ];

  const teaching = {
    gegraptai: {
      label:'Greek:', name:'γέγραπται · <i>gegraptai</i> · “It is written”',
      why:'GEGRAPTAI was chosen because Scripture is the written authority against which teaching, intelligence, direction, and confession are tested and grounded. Jesus repeatedly answered temptation and error with the governing declaration, “It is written.”',
      scriptureLabel:'Matthew 4:4 (KJV):', scripture:'“But he answered and said, It is written, Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.”',
      function:'Provides a focused daily Kingdom briefing for Scripture-grounded intelligence, directives, and confession without exposing unnecessary system machinery.'
    },
    neshamah: {
      label:'Hebrew:', name:'נְשָׁמָה · <i>neshamah</i> · “breath”',
      why:'NESHAMAH was chosen because biblical breath imagery connects life, inspiration, and God-given understanding. The module emphasizes receiving and expressing Spirit-led understanding rather than merely accumulating information.',
      scriptureLabel:'Job 32:8 (KJV):', scripture:'“But there is a spirit in man: and the inspiration of the Almighty giveth them understanding.”',
      function:'Presents current inspiration, understanding, Spirit-led direction, directives, and declarations while keeping creation and system machinery outside the everyday-user path.'
    },
    tetelestai: {
      label:'Greek:', name:'τετέλεσται · <i>tetelestai</i> · “It is finished / completed”',
      why:'TETELESTAI was chosen because entrusted work is not merely started—it is governed toward faithful completion. The name joins execution, accountability, verification, and completion under the declaration, “It is finished.”',
      scriptureLabel:'John 17:4 (KJV):', scripture:'“I have glorified thee on the earth: I have finished the work which thou gavest me to do.”',
      function:'Owns projects, tasks, assignments, accountability, milestones, priorities, progress, and faithful completion of entrusted work.'
    },
    orel: {
      label:'Coined Name:', name:'<i>OrEl</i> joins <i>Or</i> (“light”) and <i>El</i> (“God”). It is a Dominion1st coined name, not presented as a standard biblical Hebrew compound.',
      why:'OrEl was chosen to describe movement from God-given illumination into faithful written and creative expression: illumination → understanding → expression → creation.',
      scriptureLabel:'Genesis 1:3 (KJV):', scripture:'“And God said, Let there be light: and there was light.”',
      function:'Transforms ideas, revelation, teaching, research, and governed content into written, edited, and publishable forms while preserving clear boundaries with TETELESTAI execution tracking and YARATHĒKĒ knowledge preservation.'
    },
    yaratheke: {
      label:'Identity:', name:'Dominion1st coined name for the governed Knowledge Library. The Wells metaphor is established separately; the full name is not presented as a single biblical Hebrew or Greek word.',
      why:'YARATHĒKĒ was chosen to identify the place where established Dominion1st knowledge is preserved, organized, retrieved, studied, and drawn upon. Its Wells of Knowledge imagery emphasizes returning to a governed source rather than recreating knowledge every time it is needed.',
      scriptureLabel:'Isaiah 12:3 (KJV):', scripture:'“Therefore with joy shall ye draw water out of the wells of salvation.”',
      function:'Preserves and presents established Dominion1st knowledge for discovery, reading, study, organization, retrieval, teaching-series access, and governed knowledge use.'
    },
    gregoreo: {
      label:'Greek:', name:'γρηγορέω · <i>grēgoreō</i> · “watch / stay awake / be vigilant”',
      why:'GRĒGOREŌ was chosen because this module watches conditions, patterns, evidence, and developments that require sustained vigilance. Its purpose is watchfulness and discernment—not system guarding or infrastructure protection.',
      scriptureLabel:'1 Thessalonians 5:6 (KJV):', scripture:'“Therefore let us not sleep, as do others; but let us watch and be sober.”',
      function:'Provides governed Peace & Safety intelligence by monitoring relevant domains, organizing evidence, assessing convergence, and presenting conditions that require attention or further review.'
    },
    oikonomos: {
      label:'Greek:', name:'οἰκονόμος · <i>oikonomos</i> · “steward / household manager”',
      why:'OIKONOMOS was chosen because stewardship is the faithful administration of what another has entrusted. The module therefore governs responsibility, condition, obligations, resources, and accountable care rather than ownership for its own sake.',
      scriptureLabel:'Luke 12:42 (KJV):', scripture:'“And the Lord said, Who then is that faithful and wise steward, whom his lord shall make ruler over his household, to give them their portion of meat in due season?”',
      function:'Stewardship and administration of resources, obligations, records, assets, financial matters, property, renewals, estate, and other entrusted responsibilities. OIKONOMOS owns the stewardship state; TETELESTAI™ owns the action required concerning it.'
    },
    ekklesia: {
      label:'Greek:', name:'ἐκκλησία · <i>ekklēsia</i> · “assembly / congregation”',
      why:'EKKLĒSIA was chosen because this domain is centered on people gathered, formed, connected, discipled, and strengthened in relationship—not merely on records about people.',
      scriptureLabel:'Matthew 16:18 (KJV):', scripture:'“And I say also unto thee, That thou art Peter, and upon this rock I will build my church; and the gates of hell shall not prevail against it.”',
      function:'Owns people, relationships, mentoring, discipleship pathways, ministry participation, teams, families, partners, students, Kingdom-network connections, and governed relationship history.'
    }
  };

  const moduleKey = Object.keys(teaching).find(key => current.includes('/' + key));
  if (moduleKey) document.body.classList.add('dome-module-page');

  const style = document.createElement('style');
  style.textContent = `
    :root{--dome-shell-blue:#0c1266;--dome-shell-deep:#0a0f54;--dome-shell-bright:#0f1673;--dome-shell-line:#c8d8ff;--dome-gold:#d5ad45}
    .dome-global-bar{position:sticky;top:0;z-index:2147483000;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:linear-gradient(110deg,var(--dome-shell-deep),var(--dome-shell-blue) 58%,var(--dome-shell-bright));border-bottom:1px solid rgba(255,255,255,.22);box-shadow:0 3px 12px rgba(0,0,0,.14);font-family:Inter,Arial,sans-serif}
    .dome-global-brand{color:#fff;font-size:.82rem;font-weight:900;letter-spacing:.12em;white-space:nowrap}.dome-global-open{appearance:none;border:1px solid rgba(255,255,255,.72);background:#fff;color:var(--dome-shell-blue);border-radius:999px;padding:7px 12px;font:800 .76rem/1 Inter,Arial,sans-serif;cursor:pointer}
    .dome-global-backdrop{position:fixed;inset:0;z-index:2147483001;background:rgba(1,7,25,.58);opacity:0;pointer-events:none;transition:opacity .18s}.dome-global-backdrop.open{opacity:1;pointer-events:auto}.dome-global-drawer{position:absolute;left:0;top:0;width:min(380px,90vw);height:100%;background:#fff;transform:translateX(-102%);transition:.2s;box-shadow:18px 0 48px rgba(0,0,0,.28);display:flex;flex-direction:column}.dome-global-backdrop.open .dome-global-drawer{transform:translateX(0)}
    .dome-global-head{background:linear-gradient(110deg,var(--dome-shell-deep),var(--dome-shell-blue) 58%,var(--dome-shell-bright));color:#fff;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:12px}.dome-global-close{appearance:none;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1.25rem;cursor:pointer}.dome-global-list{padding:12px;overflow:auto}.dome-global-group{margin:0 0 14px}.dome-global-group-title{font:900 .66rem/1 Inter,Arial,sans-serif;letter-spacing:.12em;color:#62708f;padding:6px 4px 8px}.dome-global-group-links{display:grid;gap:7px}.dome-global-link{display:flex;align-items:center;justify-content:space-between;gap:10px;text-decoration:none;color:var(--dome-shell-blue);background:#fff;border:1px solid var(--dome-shell-line);border-radius:12px;padding:11px 12px;font:800 .86rem/1.2 Inter,Arial,sans-serif}.dome-global-link.active{background:var(--dome-shell-blue);color:#fff;border-color:var(--dome-shell-blue)}.dome-global-link.active::after{content:'CURRENT';font-size:.58rem;letter-spacing:.08em;opacity:.82}body.dome-global-menu-open{overflow:hidden}
    body.dome-module-page .head,body.dome-module-page .orel-head,body.dome-module-page .topbar,body.dome-module-page .top,body.dome-module-page .hero{background:linear-gradient(110deg,var(--dome-shell-deep),var(--dome-shell-blue) 58%,var(--dome-shell-bright))!important;border-bottom:0!important;color:#fff!important}
    body.dome-module-page .identity,body.dome-module-page .orel-identity,body.dome-module-page .module-identity,.dome-module-identity{background:linear-gradient(110deg,var(--dome-shell-deep),var(--dome-shell-blue) 58%,var(--dome-shell-bright))!important;color:#fff!important;border-bottom:4px solid var(--dome-gold)!important;padding:18px clamp(18px,4vw,44px)!important}
    body.dome-module-page .identity-inner,body.dome-module-page .orel-identity-inner,body.dome-module-page .module-identity-inner,.dome-module-identity-inner{max-width:1180px;margin:auto!important;border-left:0!important;padding-left:0!important;display:grid!important;grid-template-columns:170px minmax(0,1fr)!important;gap:8px 18px!important}.dome-module-identity .label,body.dome-module-page .identity .label,body.dome-module-page .orel-identity .label,body.dome-module-page .module-identity .label{font-weight:900!important;color:#fff!important}.dome-module-identity .value,body.dome-module-page .identity .value,body.dome-module-page .orel-identity .value,body.dome-module-page .module-identity .value{line-height:1.5!important;color:#fff!important}
    @media(max-width:760px){.dome-module-identity-inner,body.dome-module-page .identity-inner,body.dome-module-page .orel-identity-inner,body.dome-module-page .module-identity-inner{grid-template-columns:1fr!important;gap:3px!important}.dome-module-identity .value,body.dome-module-page .identity .value,body.dome-module-page .orel-identity .value,body.dome-module-page .module-identity .value{margin-bottom:9px}.dome-global-drawer{width:90vw}}
  `;
  document.head.appendChild(style);

  if (moduleKey) {
    const existing = document.querySelector('.identity,.orel-identity,.module-identity');
    if (!existing) {
      const t = teaching[moduleKey];
      const section = document.createElement('section');
      section.className = 'dome-module-identity';
      section.setAttribute('aria-label','Module identity and teaching');
      section.innerHTML = `<div class="dome-module-identity-inner"><div class="label">${t.label}</div><div class="value">${t.name}</div><div class="label">Why This Name:</div><div class="value">${t.why}</div><div class="label">${t.scriptureLabel}</div><div class="value">${t.scripture}</div><div class="label">Function:</div><div class="value">${t.function}</div></div>`;
      const header = document.querySelector('.head,.orel-head,.topbar,.top,.hero');
      if (header) header.insertAdjacentElement('afterend', section);
    }
  }

  const isActive = href => current === clean(new URL(href, root).pathname);
  const bar = document.createElement('div');
  bar.id = 'domeGlobalNav'; bar.className = 'dome-global-bar';
  bar.innerHTML = `<div class="dome-global-brand">DOME™</div><button class="dome-global-open" type="button" aria-haspopup="dialog" aria-expanded="false">☰ Navigate</button>`;
  const groupsMarkup = groups.map(group => `<section class="dome-global-group"><div class="dome-global-group-title">${group.label}</div><div class="dome-global-group-links">${group.items.map(([label,path]) => `<a class="dome-global-link${isActive(to(path))?' active':''}" href="${to(path)}">${label}</a>`).join('')}</div></section>`).join('');
  const backdrop = document.createElement('div');
  backdrop.className = 'dome-global-backdrop'; backdrop.setAttribute('aria-hidden','true');
  backdrop.innerHTML = `<aside class="dome-global-drawer" role="dialog" aria-modal="true" aria-label="DOME navigation"><div class="dome-global-head"><div><strong>DOME™ Navigation</strong><small>Eight operational modules plus system access</small></div><button class="dome-global-close" type="button" aria-label="Close navigation">×</button></div><nav class="dome-global-list">${groupsMarkup}</nav></aside>`;
  document.body.prepend(bar); document.body.appendChild(backdrop);
  const openBtn=bar.querySelector('.dome-global-open'), closeBtn=backdrop.querySelector('.dome-global-close'), drawer=backdrop.querySelector('.dome-global-drawer');
  const open=()=>{backdrop.classList.add('open');backdrop.setAttribute('aria-hidden','false');openBtn.setAttribute('aria-expanded','true');document.body.classList.add('dome-global-menu-open');closeBtn.focus()};
  const close=()=>{backdrop.classList.remove('open');backdrop.setAttribute('aria-hidden','true');openBtn.setAttribute('aria-expanded','false');document.body.classList.remove('dome-global-menu-open');openBtn.focus()};
  openBtn.addEventListener('click',open);closeBtn.addEventListener('click',close);backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});drawer.addEventListener('click',e=>e.stopPropagation());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&backdrop.classList.contains('open'))close()});
})();