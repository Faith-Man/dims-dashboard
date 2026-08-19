// TETELESTAI UI prototype — stable command table + RAC-aligned priority spectrum.
// Presentation-only enhancement. It does not change System RAC or database values.

const style=document.createElement('style');
style.textContent=`
@media(min-width:901px){
  .wrap{width:min(98vw,1780px)!important;max-width:1780px!important}
  .dims-grid{table-layout:fixed!important}
  .dims-grid th,.dims-grid td{vertical-align:middle!important}
  .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:7%!important}
  .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:5%!important}
  .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:31%!important}
  .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:7%!important}
  .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:12%!important}
  .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:8%!important}
  .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:9%!important}
  .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:8%!important}
  .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:8%!important}
  .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:5%!important}
}
.dims-grid td[data-label="RAC"]{white-space:nowrap!important;font-weight:850;color:#0c1475;cursor:pointer!important}
.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}
.dims-grid td[data-label="Owner"]{overflow-wrap:anywhere}
.view-button{position:relative!important;z-index:3!important;pointer-events:auto!important}

/* Polished four-band hazard/priority instrument. */
.epi-priority{min-width:132px;max-width:190px;position:relative;padding:5px 2px 0}
.epi-priority-track{height:18px;padding:3px;display:grid;grid-template-columns:repeat(4,1fr);gap:2px;position:relative;overflow:visible;border:1px solid #9aa8bf;border-radius:999px;background:linear-gradient(180deg,#f9fbff 0%,#dfe6f0 52%,#f7f9fc 100%);box-shadow:inset 0 2px 3px rgba(255,255,255,.95),inset 0 -2px 3px rgba(15,23,42,.12),0 3px 8px rgba(15,23,42,.18)}
.epi-priority-seg{height:12px;border-radius:999px;opacity:.58;filter:saturate(.8);box-shadow:inset 0 1px 1px rgba(255,255,255,.55)}
.epi-priority-seg[data-band="high"]{background:linear-gradient(180deg,#ff5a5f,#d8171f)}
.epi-priority-seg[data-band="serious"]{background:linear-gradient(180deg,#ffa63d,#ed6a00)}
.epi-priority-seg[data-band="medium"]{background:linear-gradient(180deg,#ffe95a,#e4bd00)}
.epi-priority-seg[data-band="low"]{background:linear-gradient(180deg,#5de68b,#159b47)}
.epi-priority-marker{position:absolute;top:-7px;width:8px;height:26px;border-radius:999px;background:#fff;border:2px solid #0c1475;box-shadow:0 0 0 2px rgba(255,255,255,.92),0 0 12px 3px rgba(0,71,171,.6);transform:translateX(-50%);pointer-events:none}
.epi-priority-label{display:block;margin-top:4px;text-align:center;font-size:.64rem;font-weight:950;letter-spacing:.05em;color:#0c1475;white-space:nowrap}
.epi-priority[data-level="high"] .epi-priority-marker{left:12.5%}.epi-priority[data-level="serious"] .epi-priority-marker{left:37.5%}.epi-priority[data-level="medium"] .epi-priority-marker{left:62.5%}.epi-priority[data-level="low"] .epi-priority-marker{left:87.5%}
.epi-priority[data-level="high"] [data-band="high"],.epi-priority[data-level="serious"] [data-band="serious"],.epi-priority[data-level="medium"] [data-band="medium"],.epi-priority[data-level="low"] [data-band="low"]{opacity:1;filter:saturate(1.2);box-shadow:inset 0 1px 2px rgba(255,255,255,.65),0 0 9px rgba(17,24,39,.28)}

.rac-v2-drawer .rac-choice,.rac-v2-drawer .rac-calc-controls{display:none!important}
.rac-matrix-instruction{margin:8px 0 12px;padding:9px 11px;border-left:4px solid #0047AB;background:#eef5ff;border-radius:7px;color:#17315f;font-size:.78rem;font-weight:750;line-height:1.4}
.rac-v2-matrix td.rac-cell{transition:transform .12s ease,box-shadow .12s ease;cursor:pointer!important}.rac-v2-matrix td.rac-cell:hover{transform:scale(1.025);box-shadow:inset 0 0 0 3px rgba(12,20,117,.55)}.rac-v2-matrix td.rac-cell.selected{outline:4px solid #0c1475!important;outline-offset:-4px!important}
@media(max-width:900px){.epi-priority{max-width:205px}.dims-grid td[data-label="RAC"],.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}}
`;
document.head.appendChild(style);

const RAC_WORDS=/\s*(Critical\s*\/\s*Imminent|Critical|Imminent|Serious|Moderate|Medium|Minor|Negligible|Low|High)\s*$/i;
const DESIRED=['Date Entered','Number','Project/Task','RAC','Priority','Status','Owner','Follow-Up','Progress','View'];
const CLASS={'Date Entered':'created','Number':'number','Project/Task':'title','RAC':'rac','Priority':'priority','Status':'status','Owner':'owner','Follow-Up':'follow','Progress':'progress','View':'view'};
const label=th=>(th?.querySelector('.dims-grid-header > span:first-child')?.textContent||th?.textContent||'').replace(/\s*[•▾]\s*$/,'').trim();

function normalizeFollowUp(table){
  const hs=[...table.querySelectorAll('thead th')],i=hs.findIndex(th=>['Next/Due','Next / Due','Follow-Up','Follow Up'].includes(label(th)));if(i<0)return;
  const l=hs[i].querySelector('.dims-grid-header > span:first-child');if(l)l.textContent='Follow-Up';else hs[i].textContent='Follow-Up';
  table.querySelectorAll('tbody tr').forEach(tr=>{const c=tr.children[i];if(c){c.dataset.label='Follow-Up';c.querySelectorAll('.rank-reason').forEach(e=>e.remove())}});
}

function reorder(table){
  /* Critical stability guard: only reorder each rendered table once. Repeated DOM
     re-appends caused the desktop hover target and click targets to move. */
  if(!table?.tHead?.rows?.[0]||table.dataset.protoOrdered==='1')return;
  normalizeFollowUp(table);
  const hr=table.tHead.rows[0],hs=[...hr.children],map=new Map(hs.map((th,i)=>[label(th),i])),rows=[...table.querySelectorAll('tbody tr')],snap=rows.map(tr=>[...tr.children]);
  DESIRED.forEach(name=>{const i=map.get(name);if(!Number.isInteger(i))return;const th=hs[i];th.dataset.protoCol=CLASS[name]||'';const header=th.querySelector('.dims-grid-header > span:first-child');if(name==='Date Entered'&&header)header.textContent='Date';hr.appendChild(th);rows.forEach((tr,r)=>snap[r][i]&&tr.appendChild(snap[r][i]))});
  [...hr.children].forEach((th,i)=>{if(label(th)==='Rank'){th.remove();rows.forEach(tr=>tr.children[i]?.remove())}});
  table.dataset.protoOrdered='1';
}

function compactRac(cell){if(!cell||cell.dataset.racCompact==='1')return;const main=cell.querySelector('.rac-main'),target=main||cell,raw=target.textContent.replace(/\s+/g,' ').trim();if(!raw||/not assessed/i.test(raw)){cell.dataset.racCompact='1';return}const m=raw.match(/^(\d+)\s*\(\s*(I{1,3}|IV)\s*,\s*([A-D])\s*\)/i);target.textContent=m?`${m[1]} (${m[2].toUpperCase()}, ${m[3].toUpperCase()})`:raw.replace(RAC_WORDS,'').trim();cell.dataset.racCompact='1'}
function band(cell){const t=cell.closest('tr')?.querySelector('td[data-label="RAC"]')?.textContent||'',r=Number((t.match(/\b([1-5])\b/)||[])[1]);return({1:'high',2:'serious',3:'medium',4:'low',5:'low'})[r]||null}
function sourceLevel(t){t=String(t||'').toLowerCase();if(t.includes('serious'))return'serious';if(t.includes('high'))return'high';if(t.includes('medium')||t.includes('moderate'))return'medium';return'low'}
const pLabel=l=>({high:'HIGH',serious:'SERIOUS',medium:'MEDIUM',low:'LOW'})[l]||'LOW';
function priority(cell){if(!cell||cell.dataset.epiPriority==='1')return;const raw=cell.textContent.replace(/\s+/g,' ').trim();if(!raw)return;const l=band(cell)||sourceLevel(raw);cell.innerHTML=`<div class="epi-priority" data-level="${l}" role="img" aria-label="Priority ${pLabel(l)}"><div class="epi-priority-track"><span class="epi-priority-seg" data-band="high"></span><span class="epi-priority-seg" data-band="serious"></span><span class="epi-priority-seg" data-band="medium"></span><span class="epi-priority-seg" data-band="low"></span><span class="epi-priority-marker" aria-hidden="true"></span></div><span class="epi-priority-label">${pLabel(l)}</span></div>`;cell.dataset.epiPriority='1'}
function status(cell){if(cell){cell.style.whiteSpace='nowrap';if(cell.firstElementChild)cell.firstElementChild.style.whiteSpace='nowrap'}}
function matrixNote(){document.querySelectorAll('.rac-v2-drawer').forEach(d=>{if(d.querySelector('.rac-matrix-instruction'))return;const m=d.querySelector('.rac-v2-matrix-wrap');if(!m)return;const n=document.createElement('div');n.className='rac-matrix-instruction';n.textContent='Click the Severity × Probability intersection directly on the matrix. The selected cell calculates the User RAC immediately; System RAC remains authoritative.';m.parentElement?.insertBefore(n,m)})}
function enhance(){document.querySelectorAll('.dims-grid').forEach(reorder);document.querySelectorAll('.dims-grid td[data-label="RAC"]').forEach(compactRac);document.querySelectorAll('.dims-grid td[data-label="Priority"]').forEach(priority);document.querySelectorAll('.dims-grid td[data-label="Status"]').forEach(status);matrixNote()}

/* Desktop View: route the button into the row's native detail handler without
   depending on column position. Mobile is intentionally untouched. */
document.addEventListener('click',e=>{const v=e.target.closest?.('.view-button');if(!v||innerWidth<=900)return;e.preventDefault();e.stopImmediatePropagation();v.closest('tr')?.click()},true);

let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});window.addEventListener('load',schedule);schedule();
