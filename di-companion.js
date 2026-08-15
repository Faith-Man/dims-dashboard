(() => {
  const MODULES = {
    'index.html':'DOME™','':'DOME™','dashboard-v3.html':'GEGRAPTAI™','intelligence-briefing.html':'EKPOREUMA™',
    'projects-tasks.html':'TETELESTAI™','orel-studio.html':'OrEl™','yaratheke.html':'YARATHĒKĒ™',
    'peace-safety-intelligence.html':'SHAMAR™','command-alerts.html':'RHEŌ™','executive-dashboard.html':'EKKLĒSIA™'
  };
  const page = location.pathname.split('/').pop();
  const moduleName = MODULES[page] || document.title.split('—')[0].trim() || 'DOME™';
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
