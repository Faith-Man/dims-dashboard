(() => {
  const MODULES = {
    'index.html':'DOME™','':'DOME™','dashboard-v3.html':'GEGRAPTAI™','intelligence-briefing.html':'EKPOREUMA™',
    'projects-tasks.html':'TETELESTAI™','orel-studio.html':'OrEl™','yaratheke.html':'YARATHĒKĒ™',
    'peace-safety-intelligence.html':'SHAMAR™','command-alerts.html':'RHEŌ™','executive-dashboard.html':'EKKLĒSIA™'
  };
  const page = location.pathname.split('/').pop();
  const moduleName = MODULES[page] || document.title.split('—')[0].trim() || 'DOME™';

  // Stage 1 RAC / EPI / APN bridge. The worker injects this script into every DOME HTML page,
  // so TETELESTAI receives these fixes even if an older page-level presentation script is cached.
  if (page === 'projects-tasks.html') {
    const stageStyle = document.createElement('style');
    stageStyle.id = 'tetelestai-stage1-bridge';
    stageStyle.textContent = `
      .view-button{display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;min-width:64px!important;width:auto!important;padding:6px 10px!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
      .dims-grid td:last-child{min-width:74px!important;overflow:visible!important}
      .stage1-rac-popover{position:fixed;z-index:12000;width:min(440px,calc(100vw - 24px));background:#fff;color:#172033;border:2px solid #0F52BA;border-radius:12px;box-shadow:0 18px 46px rgba(11,23,51,.28);padding:14px 16px;line-height:1.4}
      .stage1-rac-popover h3{margin:0 0 8px;color:#0c1475;font-size:1rem}.stage1-rac-popover p{margin:6px 0;font-size:.8rem}.stage1-rac-popover strong{color:#0c1475}.stage1-rac-popover .code{font-size:1.05rem;font-weight:900;color:#0F52BA}.stage1-rac-popover .close{position:absolute;top:7px;right:9px;border:0;background:transparent;color:#0c1475;font-size:1.15rem;cursor:pointer}.stage1-rac-popover .guide{display:inline-flex;margin-top:7px;color:#fff;background:#0F52BA;border-radius:8px;padding:7px 10px;text-decoration:none;font-size:.76rem;font-weight:850}
      .stage1-guide-link{display:inline-flex;align-items:center;gap:5px;color:#0F52BA;font-size:.74rem;font-weight:850;text-decoration:none;border-bottom:1px dotted #0F52BA;margin-top:4px}
      @media(max-width:900px){.view-button{width:100%!important;min-width:0!important}.dims-grid td:last-child{min-width:0!important}.stage1-rac-popover{left:12px!important;right:12px!important;width:auto!important}}
    `;
    document.head.appendChild(stageStyle);

    const ensureGuideNav = () => {
      const nav = document.querySelector('.nav-pills');
      if (nav && !nav.querySelector('a[href="rac-epi-apn-guide.html"]')) {
        const link = document.createElement('a');
        link.className = 'nav-pill';
        link.href = 'rac-epi-apn-guide.html';
        link.textContent = 'ⓘ RAC / EPI / APN Guide';
        nav.appendChild(link);
      }
      const row = document.querySelector('#drawerContent .priority-method-row dd');
      if (row && !row.querySelector('.stage1-guide-link')) {
        const link = document.createElement('a');
        link.className = 'stage1-guide-link';
        link.href = 'rac-epi-apn-guide.html';
        link.textContent = 'How RAC, EPI & APN are calculated';
        row.appendChild(link);
      }
    };
    ensureGuideNav();
    const drawer = document.getElementById('drawerContent');
    if (drawer) new MutationObserver(ensureGuideNav).observe(drawer,{childList:true,subtree:true});

    let stagePopover = null;
    const closeStagePopover = () => { stagePopover?.remove(); stagePopover = null; };
    const openStagePopover = target => {
      const cell = target.closest('td[data-label="RAC"]');
      if (!cell) return;
      closeStagePopover();
      const code = cell.querySelector('.rac-main')?.childNodes?.[0]?.textContent?.trim() || cell.textContent.trim() || 'Not assessed';
      const pop = document.createElement('div');
      pop.className = 'stage1-rac-popover';
      pop.setAttribute('role','dialog');
      pop.setAttribute('aria-label','RAC, EPI and APN explanation');
      pop.innerHTML = `<button class="close" type="button" aria-label="Close explanation">×</button><h3>RAC • EPI • APN</h3><div class="code">${code}</div><p><strong>RAC — Risk Assessment Code</strong> comes from Severity × Probability. Lower RAC numbers receive higher primary risk priority.</p><p><strong>EPI — Execution Priority Index</strong> is the normal DIMS method for equal-RAC records. Its governed inputs are Impact and Estimated Resolution Effort, with <strong>ERE = AIT + HIT</strong>. The final numerical EPI formula remains under validation.</p><p><strong>APN — Abatement Priority Number</strong> is the safety-hazard method. <strong>APN = RAC (CEI)</strong>, where <strong>CEI = Cost ÷ (Multiplier × Exposure)</strong>.</p><a class="guide" href="rac-epi-apn-guide.html">Open full RAC / EPI / APN guide</a>`;
      document.body.appendChild(pop);
      const rect = cell.getBoundingClientRect();
      if (innerWidth > 900) {
        pop.style.left = `${Math.max(12,Math.min(rect.left,innerWidth-pop.offsetWidth-12))}px`;
        let top = rect.bottom + 8;
        if (top + pop.offsetHeight > innerHeight - 12) top = Math.max(12,rect.top-pop.offsetHeight-8);
        pop.style.top = `${top}px`;
      } else {
        pop.style.top = `${Math.max(12,Math.min(rect.bottom+8,innerHeight-pop.offsetHeight-12))}px`;
      }
      pop.querySelector('.close').onclick = closeStagePopover;
      stagePopover = pop;
    };
    document.addEventListener('click',e=>{
      const rac = e.target.closest?.('td[data-label="RAC"] .rac-main');
      if (rac) { e.preventDefault(); e.stopImmediatePropagation(); openStagePopover(rac); return; }
      if (!e.target.closest?.('.stage1-rac-popover')) closeStagePopover();
    },true);
    document.addEventListener('mouseover',e=>{
      const rac = e.target.closest?.('td[data-label="RAC"] .rac-main');
      if (rac && innerWidth > 900) { e.stopImmediatePropagation(); openStagePopover(rac); }
    },true);
  }

  const memoryKey = 'dominion1st-di-conversation-v1';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const token = () => {
    for (let i=0;i<localStorage.length;i+=1) {
      const key=localStorage.key(i);
      if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      try { return JSON.parse(localStorage.getItem(key))?.access_token || ''; } catch (_) {}
    }
    return '';
  };
  const button=document.createElement('button');
  button.className='di-launch'; button.type='button'; button.textContent='✦ Ask DI'; button.setAttribute('aria-haspopup','dialog');
  const backdrop=document.createElement('div'); backdrop.className='di-backdrop';
  const panel=document.createElement('aside'); panel.className='di-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-label','Dominion1st Intelligence companion'); panel.setAttribute('aria-hidden','true');
  panel.innerHTML=`<div class="di-head"><div><strong>Dominion1st Intelligence™</strong><small>${escapeHtml(moduleName)} · Read-only companion</small></div><div><button class="di-new" type="button">New</button> <button class="di-close" type="button" aria-label="Close Dominion1st Intelligence">Close</button></div></div><div class="di-status">TETELESTAI: certified live adapter · Other modules: status shown in answers</div><div class="di-log" aria-live="polite"></div><div class="di-starters"><button class="di-starter" type="button">What requires my attention?</button><button class="di-starter" type="button">What can DI work on now?</button><button class="di-starter" type="button">What is awaiting verification?</button></div><form class="di-form"><label for="diQuestion">Ask across DOME or this module</label><textarea id="diQuestion" required maxlength="1200"></textarea><div class="di-actions"><span class="di-disclaimer">Facts, calculations, and recommendations are labeled.</span><button class="di-send" type="submit">Ask DI</button></div></form>`;
  document.body.append(backdrop,button,panel);
  const log=panel.querySelector('.di-log'), input=panel.querySelector('textarea'), close=panel.querySelector('.di-close');
  let previousFocus=null;
  function save(messages){sessionStorage.setItem(memoryKey,JSON.stringify(messages.slice(-12)))}
  function messages(){try{return JSON.parse(sessionStorage.getItem(memoryKey))||[]}catch(_){return[]}}
  function render(){const rows=messages();log.innerHTML=rows.length?rows.map(m=>`<div class="di-message ${escapeHtml(m.role)}">${escapeHtml(m.text)}${m.citations?.length?`<ul class="di-citations">${m.citations.map(c=>`<li><a href="${escapeHtml(c.url)}">${escapeHtml(c.number)} — ${escapeHtml(c.title)}</a></li>`).join('')}</ul>`:''}</div>`).join(''):'<div class="di-message assistant">Ask about priorities, blockers, follow-ups, verification, or module availability. DI will identify what is live, calculated, recommended, or unavailable.</div>';log.scrollTop=log.scrollHeight}
  function open(){previousFocus=document.activeElement;panel.setAttribute('aria-hidden','false');backdrop.classList.add('open');render();setTimeout(()=>input.focus(),0)}
  function shut(){panel.setAttribute('aria-hidden','true');backdrop.classList.remove('open');previousFocus?.focus()}
  button.addEventListener('click',open); close.addEventListener('click',shut); backdrop.addEventListener('click',shut);
  document.addEventListener('keydown',e=>{
    if(panel.getAttribute('aria-hidden')==='true')return;
    if(e.key==='Escape'){shut();return}
    if(e.key==='Tab'){
      const focusable=[...panel.querySelectorAll('button,textarea,[href],[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled);
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  panel.querySelector('.di-new').addEventListener('click',()=>{sessionStorage.removeItem(memoryKey);render();input.focus()});
  panel.querySelectorAll('.di-starter').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent;input.focus()}));
  panel.querySelector('form').addEventListener('submit',async e=>{
    e.preventDefault(); const question=input.value.trim(); if(!question)return;
    const history=messages(); history.push({role:'user',text:question}); save(history); input.value=''; render();
    const accessToken=token();
    if(!accessToken){history.push({role:'error',text:'An authorized DOME session is required before DI can read operational records. Please sign in, then try again.'});save(history);render();return}
    const send=panel.querySelector('.di-send');send.disabled=true;send.textContent='Working…';
    try{
      const selected=document.querySelector('[aria-selected="true"],[data-selected="true"]');
      const response=await fetch('/api/di/query',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${accessToken}`},body:JSON.stringify({question,module:moduleName,page:location.pathname,selected_record:selected?.dataset?.recordId||null,history:history.slice(-6).map(({role,text})=>({role,text}))})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
      history.push({role:'assistant',text:data.answer,citations:data.citations||[]});
    }catch(error){history.push({role:'error',text:`DI is unavailable: ${error.message}`})}finally{save(history);render();send.disabled=false;send.textContent='Ask DI'}
  });
})();
