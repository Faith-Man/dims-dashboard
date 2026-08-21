(() => {
  const MODULES = {
    'index.html':'DOME™','':'DOME™','dashboard-v3.html':'GEGRAPTAI™','intelligence-briefing.html':'EKPOREUMA™',
    'projects-tasks.html':'TETELESTAI™','orel-studio.html':'OrEl™','yaratheke.html':'YARATHĒKĒ™',
    'peace-safety-intelligence.html':'SHAMAR™','command-alerts.html':'RHEŌ™','executive-dashboard.html':'EKKLĒSIA™'
  };
  const page = location.pathname.split('/').pop();
  const moduleName = MODULES[page] || document.title.split('—')[0].trim() || 'DOME™';

  // RAD™ quick-brief bridge for TETELESTAI. Full doctrine remains in rac-epi-apn-guide.html.
  if (page === 'projects-tasks.html') {
    const stageStyle = document.createElement('style');
    stageStyle.id = 'tetelestai-stage1-bridge';
    stageStyle.textContent = `
      .view-button{display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;min-width:64px!important;width:auto!important;padding:6px 10px!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
      .dims-grid td:last-child{min-width:74px!important;overflow:visible!important}
      .stage1-rac-popover{position:fixed;z-index:12000;width:min(520px,calc(100vw - 24px));max-height:min(84vh,760px);overflow:auto;background:#fff;color:#172033;border:2px solid #0F52BA;border-radius:14px;box-shadow:0 18px 46px rgba(11,23,51,.28);padding:16px 18px;line-height:1.4}
      .stage1-rac-popover h3{margin:0 0 8px;color:#0c1475;font-size:1.05rem}.stage1-rac-popover p{margin:7px 0;font-size:.8rem}.stage1-rac-popover strong{color:#0c1475}.stage1-rac-popover .code{font-size:1.05rem;font-weight:900;color:#0F52BA}.stage1-rac-popover .close{position:absolute;top:7px;right:9px;border:0;background:transparent;color:#0c1475;font-size:1.15rem;cursor:pointer}.stage1-rac-popover .guide{display:inline-flex;margin-top:9px;color:#fff;background:#0F52BA;border-radius:8px;padding:8px 11px;text-decoration:none;font-size:.76rem;font-weight:850}.stage1-rac-popover .boundary{background:#fff7ed;border:1px solid #fdba74;border-radius:8px;padding:8px 9px}.stage1-rac-popover .quick-calc{border-top:1px solid #d7dfec;margin-top:10px;padding-top:10px}.stage1-rac-popover .quick-row{display:flex;gap:6px;flex-wrap:wrap;margin:5px 0}.stage1-rac-popover .quick-row button{border:1px solid #0F52BA;background:#fff;color:#0c1475;border-radius:7px;padding:6px 9px;font-weight:800;cursor:pointer}.stage1-rac-popover .quick-row button.active{background:#0F52BA;color:#fff}.stage1-rac-popover .quick-result{margin-top:7px;border-radius:8px;padding:8px 10px;background:#eef5ff;color:#0c1475;font-weight:850}
      .stage1-guide-link{display:inline-flex;align-items:center;gap:5px;color:#0F52BA;font-size:.74rem;font-weight:850;text-decoration:none;border-bottom:1px dotted #0F52BA;margin-top:4px}
      @media(max-width:900px){.view-button{width:100%!important;min-width:0!important}.dims-grid td:last-child{min-width:0!important}.stage1-rac-popover{left:12px!important;right:12px!important;width:auto!important}}
    `;
    document.head.appendChild(stageStyle);

    const ensureGuideNav = () => {
      const nav = document.querySelector('.nav-pills');
      if (nav && !nav.querySelector('[data-rad-quick]')) {
        const link = document.createElement('a');
        link.className = 'nav-pill';
        link.href = '#rad-quick-brief';
        link.dataset.radQuick = '1';
        link.textContent = 'ⓘ RAD Quick Brief';
        nav.appendChild(link);
      }
      const row = document.querySelector('#drawerContent .priority-method-row dd');
      if (row && !row.querySelector('.stage1-guide-link')) {
        const link = document.createElement('a');
        link.className = 'stage1-guide-link';
        link.href = '#rad-quick-brief';
        link.dataset.radQuick = '1';
        link.textContent = 'RAD quick brief & calculator';
        row.appendChild(link);
      }
    };
    ensureGuideNav();
    const drawer = document.getElementById('drawerContent');
    if (drawer) new MutationObserver(ensureGuideNav).observe(drawer,{childList:true,subtree:true});

    let stagePopover = null;
    const closeStagePopover = () => { stagePopover?.remove(); stagePopover = null; };
    const R={I:{A:[1,'Critical / Imminent'],B:[1,'Critical / Imminent'],C:[2,'Serious'],D:[4,'Minor']},II:{A:[1,'Critical / Imminent'],B:[2,'Serious'],C:[3,'Moderate'],D:[4,'Minor']},III:{A:[2,'Serious'],B:[3,'Moderate'],C:[4,'Minor'],D:[5,'Negligible']},IV:{A:[4,'Minor'],B:[4,'Minor'],C:[5,'Negligible'],D:[5,'Negligible']}};
    const wireQuickCalc = pop => {
      let s='',p=''; const out=pop.querySelector('[data-quick-result]');
      const refresh=()=>{pop.querySelectorAll('[data-qsev]').forEach(b=>b.classList.toggle('active',b.dataset.qsev===s));pop.querySelectorAll('[data-qprob]').forEach(b=>b.classList.toggle('active',b.dataset.qprob===p));out.textContent=s&&p?`RAC ${R[s][p][0]} — ${R[s][p][1]}`:'Select Severity + Probability';};
      pop.querySelectorAll('[data-qsev]').forEach(b=>b.onclick=()=>{s=b.dataset.qsev;refresh()});pop.querySelectorAll('[data-qprob]').forEach(b=>b.onclick=()=>{p=b.dataset.qprob;refresh()});refresh();
    };
    const openStagePopover = target => {
      const cell = target?.closest?.('td[data-label="RAC"]') || null;
      closeStagePopover();
      const code = cell?.querySelector('.rac-main')?.childNodes?.[0]?.textContent?.trim() || 'RAD Quick Brief';
      const pop = document.createElement('div');
      pop.className = 'stage1-rac-popover';
      pop.setAttribute('role','dialog');
      pop.setAttribute('aria-label','RAD quick brief and RAC calculator');
      pop.innerHTML = `<button class="close" type="button" aria-label="Close explanation">×</button><h3>RAD™ — Risk Assessment Dome</h3><div class="code">${code}</div><p><strong>RAC — Risk Assessment Code</strong> assesses risk from Severity × Probability. RAD can support physical and non-physical governed risk.</p><p><strong>EPI — Execution Priority Index</strong> supports DEA execution sequencing after gates using: Urgency, Dependency/Unlocking Power, Mission Impact, Consequence of Delay, Readiness/Executability, Leverage/Return on Effort, and Continuity/Finish-What-We-Started. Final numerical weighting remains under validation.</p><p class="boundary"><strong>APN — Abatement Priority Number: ACTUAL PHYSICAL HAZARDS ONLY.</strong> Use it for physical occupational-safety, fire, or occupational-health hazards where personnel exposure and abatement cost are meaningful. Do not use APN for ordinary software, project, governance, deployment, or workflow risk.</p><div class="quick-calc"><strong>Quick RAC Calculator</strong><div class="quick-row"><span>Severity:</span><button data-qsev="I">I</button><button data-qsev="II">II</button><button data-qsev="III">III</button><button data-qsev="IV">IV</button></div><div class="quick-row"><span>Probability:</span><button data-qprob="A">A</button><button data-qprob="B">B</button><button data-qprob="C">C</button><button data-qprob="D">D</button></div><div class="quick-result" data-quick-result></div></div><a class="guide" href="rac-epi-apn-guide.html">Open Full RAD Guide</a>`;
      document.body.appendChild(pop);wireQuickCalc(pop);
      if (cell && innerWidth > 900) {const rect=cell.getBoundingClientRect();pop.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-pop.offsetWidth-12))}px`;let top=rect.bottom+8;if(top+pop.offsetHeight>innerHeight-12)top=Math.max(12,rect.top-pop.offsetHeight-8);pop.style.top=`${top}px`;} else {pop.style.left=`${Math.max(12,(innerWidth-pop.offsetWidth)/2)}px`;pop.style.top=`${Math.max(12,(innerHeight-pop.offsetHeight)/2)}px`;}
      pop.querySelector('.close').onclick = closeStagePopover;stagePopover = pop;
    };
    document.addEventListener('click',e=>{
      const quick=e.target.closest?.('[data-rad-quick]');if(quick){e.preventDefault();e.stopImmediatePropagation();openStagePopover(null);return;}
      const rac=e.target.closest?.('td[data-label="RAC"] .rac-main');if(rac){e.preventDefault();e.stopImmediatePropagation();openStagePopover(rac);return;}
      if(!e.target.closest?.('.stage1-rac-popover'))closeStagePopover();
    },true);
    document.addEventListener('mouseover',e=>{const rac=e.target.closest?.('td[data-label="RAC"] .rac-main');if(rac&&innerWidth>900){e.stopImmediatePropagation();openStagePopover(rac)}},true);
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