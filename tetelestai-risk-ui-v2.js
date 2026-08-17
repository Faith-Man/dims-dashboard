import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const APN_MULTIPLIER = {
  I: { A: 188, B: 63, C: 21, D: 7 },
  II: { A: 63, B: 21, C: 7, D: 2 },
  III: { A: 21, B: 7, C: 2, D: 1 },
  IV: { A: 7, B: 2, C: 1, D: 0.26 }
};

const style = document.createElement('style');
style.textContent = `
.section-title{display:flex!important;align-items:center!important;gap:12px!important}.section-title .dims-grid-search{margin:0 0 0 auto!important;width:min(520px,58%)!important;background:#fff!important;color:#172033!important;border:1px solid rgba(255,255,255,.55)!important;border-radius:8px!important;padding:8px 10px!important;font-weight:600!important}.section-title .dims-grid-search::placeholder{color:#687387!important}.dims-grid td[data-label="RAC"]{cursor:pointer!important}.dims-grid td[data-label="RAC"] .rac-na,.dims-grid td[data-label="RAC"] .rac-main{display:inline-block!important;min-width:34px!important}.dims-grid th:nth-child(10),.dims-grid td:nth-child(10){padding-right:16px!important;min-width:92px!important}.dims-grid th:nth-child(11),.dims-grid td:nth-child(11){padding-left:16px!important;min-width:68px!important;text-align:center!important}.dims-grid th:nth-child(11) .dims-grid-header{justify-content:center!important;width:100%!important}.view-button{min-width:44px!important;width:auto!important;padding:4px 7px!important;font-size:.68rem!important}.rac-v2-pop{position:fixed;z-index:14000;width:min(390px,calc(100vw - 24px));background:#fff;border:2px solid #0F52BA;border-radius:12px;box-shadow:0 18px 48px rgba(11,23,51,.28);padding:14px 16px;color:#172033}.rac-v2-pop h3{margin:0 0 7px;color:#0c1475;font-size:1rem}.rac-v2-pop p{margin:5px 0;font-size:.79rem;line-height:1.4}.rac-v2-code{font-size:1.05rem;font-weight:900;color:#0F52BA}.rac-v2-close{position:absolute;right:8px;top:6px;border:0;background:transparent;font-size:1.1rem;cursor:pointer}.rac-v2-open{margin-top:8px;border:0;background:#0F52BA;color:#fff;border-radius:8px;padding:8px 11px;font-weight:850;cursor:pointer}.rac-v2-backdrop{position:fixed;inset:0;background:rgba(6,15,36,.34);z-index:14010;opacity:0;pointer-events:none;transition:.2s}.rac-v2-backdrop.open{opacity:1;pointer-events:auto}.rac-v2-drawer{position:fixed;z-index:14020;top:0;right:0;height:100dvh;width:min(560px,94vw);box-sizing:border-box;background:#fff;box-shadow:-18px 0 45px rgba(11,23,51,.28);transform:translateX(105%);transition:.24s;overflow:auto;padding:22px}.rac-v2-drawer.open{transform:translateX(0)}.rac-v2-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;border-bottom:2px solid #0F52BA;padding-bottom:12px;margin-bottom:14px}.rac-v2-head h2{margin:0;color:#0c1475;font-size:1.15rem}.rac-v2-x{border:1px solid #b9c6dc;background:#fff;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer}.rac-v2-card{border:1px solid #cbd8ec;border-radius:11px;padding:13px;margin:11px 0;background:#f8fbff}.rac-v2-card h3{margin:0 0 7px;color:#0c1475;font-size:.96rem}.rac-v2-row{display:grid;grid-template-columns:42% 1fr;gap:8px;padding:5px 0;border-bottom:1px solid #e3e9f3;font-size:.79rem}.rac-v2-row:last-child{border:0}.rac-v2-eq{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#fff;border:1px solid #d7e0ee;border-radius:8px;padding:9px;margin-top:8px;font-size:.76rem;overflow-wrap:anywhere}.rac-v2-note{font-size:.75rem;color:#667085;line-height:1.45}.rac-v2-link{display:inline-flex;margin-top:8px;color:#0F52BA;font-weight:850;text-decoration:none;border-bottom:1px dotted #0F52BA}
@media(max-width:900px){.section-title{align-items:stretch!important;flex-wrap:wrap!important}.section-title .dims-grid-search{width:100%!important;margin:4px 0 0!important}.view-button{min-width:44px!important;width:44px!important}.dims-grid td[data-label="View"]{grid-template-columns:34% 1fr!important}.rac-v2-drawer{width:96vw;padding:17px}.rac-v2-row{grid-template-columns:1fr;gap:2px}}
`;
document.head.appendChild(style);

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString(undefined,{maximumFractionDigits:3}) : '—';

function moveSearchBars(){
  const projectSearch=document.getElementById('projectSearch');
  const taskSearch=document.getElementById('taskSearch');
  const projectCard=projectSearch?.closest('.card');
  const taskCard=taskSearch?.closest('.card');
  const projectTitle=projectCard?.querySelector('.section-title');
  const taskTitle=taskCard?.querySelector('.section-title');
  if(projectSearch&&projectTitle&&projectSearch.parentElement!==projectTitle) projectTitle.appendChild(projectSearch);
  if(taskSearch&&taskTitle&&taskSearch.parentElement!==taskTitle) taskTitle.appendChild(taskSearch);
}

function cleanView(){
  const drawer=document.getElementById('drawerContent');
  if(!drawer) return;
  drawer.querySelectorAll('.detail-field').forEach(field=>{
    const label=field.querySelector('dt')?.textContent?.trim().toLowerCase();
    if(['execution rank','rac','severity','probability','impact','dea rank basis'].includes(label)) field.remove();
  });
  drawer.querySelectorAll('.control-block').forEach(block=>{
    const title=block.querySelector('.control-title')?.textContent?.trim().toUpperCase()||'';
    if(title.includes('RISK ASSESSMENT MATRIX')) block.remove();
  });
  drawer.querySelectorAll('.apn-panel,.priority-method-row').forEach(el=>el.remove());
}

let pop=null, closeTimer=null, backdrop=null, calcDrawer=null;
function closePop(){clearTimeout(closeTimer);pop?.remove();pop=null}
function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(closePop,300)}
function rowNumber(cell){
  const tr=cell.closest('tr');
  return tr?.querySelector('td[data-label="Number"]')?.textContent?.trim() || '';
}
async function fetchRecord(cell){
  const number=rowNumber(cell); if(!number) return null;
  for(const [table,column,kind] of [['projects','project_number','project'],['tasks','task_number','task']]){
    const {data}=await sb.from(table).select(`id,${column},title,priority_method,system_rac,risk_severity,risk_probability,apn_cost,apn_exposure`).eq(column,number).maybeSingle();
    if(data) return {...data,number,kind};
  }
  return null;
}
function racLabel(cell){
  const text=cell.querySelector('.rac-main')?.childNodes?.[0]?.textContent?.trim() || cell.textContent.trim();
  return text && text!=='—' ? text : 'Not assessed';
}
function openPop(cell){
  closePop();
  pop=document.createElement('div'); pop.className='rac-v2-pop';
  pop.innerHTML=`<button class="rac-v2-close" type="button">×</button><h3>Risk Assessment Code (RAC)</h3><div class="rac-v2-code">${esc(racLabel(cell))}</div><p><b>RAC = Severity × Probability</b> using the governed risk matrix.</p><p>${racLabel(cell)==='Not assessed'?'This record has not yet received a System RAC. Open the calculation panel to review its current assessment state.':'Open the calculation panel to see Severity, Probability, RAC, and the active EPI/APN method.'}</p><button class="rac-v2-open" type="button">Open Calculation →</button>`;
  document.body.appendChild(pop);
  const r=cell.getBoundingClientRect();
  const left=Math.max(12,Math.min(r.left,innerWidth-pop.offsetWidth-12));
  let top=r.bottom+7; if(top+pop.offsetHeight>innerHeight-12) top=Math.max(12,r.top-pop.offsetHeight-7);
  Object.assign(pop.style,{left:`${left}px`,top:`${top}px`});
  pop.querySelector('.rac-v2-close').onclick=closePop;
  pop.querySelector('.rac-v2-open').onclick=()=>openCalculation(cell);
  pop.onmouseenter=()=>clearTimeout(closeTimer); pop.onmouseleave=scheduleClose;
}
function ensureDrawer(){
  if(calcDrawer) return;
  backdrop=document.createElement('div'); backdrop.className='rac-v2-backdrop';
  calcDrawer=document.createElement('aside'); calcDrawer.className='rac-v2-drawer'; calcDrawer.setAttribute('role','dialog');
  document.body.append(backdrop,calcDrawer); backdrop.onclick=closeCalculation;
}
function closeCalculation(){backdrop?.classList.remove('open');calcDrawer?.classList.remove('open')}
async function openCalculation(cell){
  closePop(); ensureDrawer();
  calcDrawer.innerHTML='<div class="rac-v2-head"><h2>RAC • EPI • APN Calculation</h2><button class="rac-v2-x">Close</button></div><p>Loading governed record data…</p>';
  calcDrawer.querySelector('button').onclick=closeCalculation; backdrop.classList.add('open');calcDrawer.classList.add('open');
  const rec=await fetchRecord(cell);
  if(!rec){calcDrawer.innerHTML='<div class="rac-v2-head"><h2>RAC • EPI • APN Calculation</h2><button class="rac-v2-x">Close</button></div><p>Record calculation data could not be resolved.</p>';calcDrawer.querySelector('button').onclick=closeCalculation;return;}
  const sev=String(rec.risk_severity||'').toUpperCase(); const prob=String(rec.risk_probability||'').toUpperCase(); const m=APN_MULTIPLIER[sev]?.[prob];
  const cost=Number(rec.apn_cost); const exposure=Number(rec.apn_exposure); const cei=m&&Number.isFinite(cost)&&exposure>0?cost/(m*exposure):null;
  const method=rec.priority_method==='apn'?'APN — Safety Hazard':'EPI — DIMS Execution';
  calcDrawer.innerHTML=`<div class="rac-v2-head"><div><h2>${esc(rec.number)} — Calculation</h2><div class="rac-v2-note">${esc(rec.title||'')}</div></div><button class="rac-v2-x">Close</button></div><section class="rac-v2-card"><h3>RAC — Risk Assessment Code</h3><div class="rac-v2-row"><b>Severity</b><span>${esc(sev||'Not assessed')}</span></div><div class="rac-v2-row"><b>Probability</b><span>${esc(prob||'Not assessed')}</span></div><div class="rac-v2-row"><b>System RAC</b><span><strong>${esc(rec.system_rac??'Not assessed')}</strong></span></div><div class="rac-v2-eq">RAC = Severity × Probability → governed matrix intersection</div></section><section class="rac-v2-card"><h3>${esc(method)}</h3>${rec.priority_method==='apn'?`<div class="rac-v2-row"><b>Multiplier (M)</b><span>${fmt(m)}</span></div><div class="rac-v2-row"><b>Exposure (E)</b><span>${fmt(exposure)} personnel/day</span></div><div class="rac-v2-row"><b>Cost (C)</b><span>${Number.isFinite(cost)?'$'+cost.toLocaleString():'—'}</span></div><div class="rac-v2-row"><b>CEI</b><span>${cei===null?'—':fmt(cei)}</span></div><div class="rac-v2-row"><b>APN</b><span><strong>${cei===null?'Awaiting cost/exposure':`${rec.system_rac} (${fmt(cei)})`}</strong></span></div><div class="rac-v2-eq">CEI = C ÷ (M × E)<br>APN = RAC (CEI)</div>`:`<div class="rac-v2-row"><b>Governed inputs</b><span>Impact + Estimated Resolution Effort (ERE)</span></div><div class="rac-v2-row"><b>ERE</b><span>AIT + HIT</span></div><div class="rac-v2-eq">ERE = Estimated AI Time (AIT) + Human Interaction Time (HIT)</div><p class="rac-v2-note">The final numerical EPI formula remains under validation.</p>`}<a class="rac-v2-link" href="rac-epi-apn-guide.html">Open full RAC / EPI / APN guide →</a></section>`;
  calcDrawer.querySelector('.rac-v2-x').onclick=closeCalculation;
}

moveSearchBars(); cleanView();
new MutationObserver(()=>{moveSearchBars();cleanView()}).observe(document.body,{childList:true,subtree:true});

document.addEventListener('mouseover',e=>{const cell=e.target.closest?.('td[data-label="RAC"]');if(cell) openPop(cell)});
document.addEventListener('mouseout',e=>{const cell=e.target.closest?.('td[data-label="RAC"]');if(cell&&!e.relatedTarget?.closest?.('.rac-v2-pop')) scheduleClose()});
document.addEventListener('click',e=>{const cell=e.target.closest?.('td[data-label="RAC"]');if(cell){e.preventDefault();e.stopPropagation();openPop(cell);return;}if(!e.target.closest?.('.rac-v2-pop'))closePop()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePop();closeCalculation()}});
