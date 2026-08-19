// TETELESTAI UI prototype — stable command table + RAC-aligned priority instrument.
// Presentation-only enhancement. It does not change System RAC or database values.

const style=document.createElement('style');
style.textContent=`
@media(min-width:901px){
  .wrap{width:min(98vw,1780px)!important;max-width:1780px!important}
  .dims-grid{table-layout:fixed!important}
  .dims-grid th,.dims-grid td{vertical-align:middle!important}
  .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:6.5%!important}
  .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:4%!important}
  .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:33%!important}
  .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:7%!important}
  .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:12%!important}
  .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:8%!important}
  .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:9%!important}
  .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:8%!important}
  .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:8%!important}
  .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:4.5%!important}

  /* Suppress the older non-interactive hover. The prototype supplies an anchored clickable one. */
  .rac-v2-pop{display:none!important}
}
.dims-grid td[data-label="RAC"]{white-space:nowrap!important;font-weight:850;color:#0c1475;cursor:pointer!important}
.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}
.dims-grid td[data-label="Owner"]{overflow-wrap:anywhere}
.view-button{position:relative!important;z-index:3!important;pointer-events:auto!important}

/* Enterprise-style four-band hazard/priority instrument inspired by the mission progression bars. */
.epi-priority{min-width:138px;max-width:205px;position:relative;padding:4px 1px 0}
.epi-priority-track{height:22px;padding:3px;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;position:relative;overflow:visible;border:2px solid #10234b;border-radius:999px;background:linear-gradient(180deg,#14284e 0%,#07142e 48%,#10254c 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -2px 5px rgba(0,0,0,.45),0 3px 8px rgba(6,18,43,.28)}
.epi-priority-seg{height:16px;min-width:0;position:relative;opacity:.82;box-shadow:inset 0 2px 2px rgba(255,255,255,.4),inset 0 -2px 3px rgba(0,0,0,.16)}
.epi-priority-seg:first-child{border-radius:999px 3px 3px 999px}.epi-priority-seg:last-of-type{border-radius:3px 999px 999px 3px}
.epi-priority-seg[data-band="high"]{background:linear-gradient(180deg,#ff5360 0%,#ec1d2d 52%,#b90e1b 100%)}
.epi-priority-seg[data-band="serious"]{background:linear-gradient(180deg,#ffb44f 0%,#f47a10 52%,#d55600 100%)}
.epi-priority-seg[data-band="medium"]{background:linear-gradient(180deg,#fff16b 0%,#f3cd16 52%,#cfaa00 100%)}
.epi-priority-seg[data-band="low"]{background:linear-gradient(180deg,#68ef91 0%,#25bb59 52%,#12843a 100%)}
.epi-priority-marker{position:absolute;top:-8px;width:6px;height:32px;border-radius:999px;background:linear-gradient(90deg,#d9edff,#fff 45%,#fff 55%,#d9edff);border:1px solid #56a7ff;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 9px 3px rgba(0,150,255,.9),0 0 18px 6px rgba(0,110,255,.38);transform:translateX(-50%);pointer-events:none}
.epi-priority-label{display:block;margin-top:4px;text-align:center;font-size:.66rem;font-weight:950;letter-spacing:.06em;color:#0c1475;white-space:nowrap}
.epi-priority[data-level="high"] .epi-priority-marker{left:12.5%}.epi-priority[data-level="serious"] .epi-priority-marker{left:37.5%}.epi-priority[data-level="medium"] .epi-priority-marker{left:62.5%}.epi-priority[data-level="low"] .epi-priority-marker{left:87.5%}
.epi-priority[data-level="high"] [data-band="high"],.epi-priority[data-level="serious"] [data-band="serious"],.epi-priority[data-level="medium"] [data-band="medium"],.epi-priority[data-level="low"] [data-band="low"]{opacity:1;filter:saturate(1.15) brightness(1.08);box-shadow:inset 0 2px 2px rgba(255,255,255,.55),inset 0 -2px 3px rgba(0,0,0,.14),0 0 10px rgba(255,255,255,.36)}

/* Desktop RAC hover: anchored beside the RAC cell and itself clickable. */
.proto-rac-pop{position:fixed;z-index:14500;width:min(300px,calc(100vw - 24px));padding:11px 13px;border:2px solid #0047AB;border-radius:11px;background:#fff;color:#172033;box-shadow:0 14px 34px rgba(11,23,51,.26);cursor:pointer;pointer-events:auto}
.proto-rac-pop:before{content:'';position:absolute;top:50%;left:-8px;width:14px;height:14px;background:#fff;border-left:2px solid #0047AB;border-bottom:2px solid #0047AB;transform:translateY(-50%) rotate(45deg)}
.proto-rac-pop.flip:before{left:auto;right:-8px;border-left:0;border-bottom:0;border-right:2px solid #0047AB;border-top:2px solid #0047AB}
.proto-rac-pop h3{margin:0 0 4px;color:#0c1475;font-size:.88rem}.proto-rac-pop .code{font-size:.96rem;font-weight:900;color:#0047AB}.proto-rac-pop p{margin:4px 0;font-size:.73rem;line-height:1.35}.proto-rac-pop .action{font-weight:900;color:#0047AB}

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

/* Desktop RAC hover is close enough to enter with the pointer and clicking it opens the same RAC guide. */
let hoverPop=null,hoverCell=null,hoverTimer=null;
function clearHoverTimer(){if(hoverTimer){clearTimeout(hoverTimer);hoverTimer=null}}
function hideHover(){clearHoverTimer();hoverPop?.remove();hoverPop=null;hoverCell=null}
function scheduleHide(){clearHoverTimer();hoverTimer=setTimeout(hideHover,220)}
function showHover(cell){if(innerWidth<=900||!cell)return;if(hoverCell===cell&&hoverPop)return;hideHover();hoverCell=cell;hoverPop=document.createElement('div');hoverPop.className='proto-rac-pop';const value=(cell.textContent||'').replace(/\s+/g,' ').trim()||'Not assessed';hoverPop.innerHTML=`<h3>Risk Assessment Code (RAC)</h3><div class="code">${value}</div><p>RAC = Severity × Probability using the governed matrix.</p><p class="action">Click here to open the RAC Guide.</p>`;document.body.appendChild(hoverPop);const r=cell.getBoundingClientRect(),w=hoverPop.offsetWidth,h=hoverPop.offsetHeight;let left=r.right+5,flip=false;if(left+w>innerWidth-10){left=Math.max(10,r.left-w-5);flip=true}let top=Math.max(10,Math.min(r.top+r.height/2-h/2,innerHeight-h-10));if(flip)hoverPop.classList.add('flip');Object.assign(hoverPop.style,{left:`${left}px`,top:`${top}px`});hoverPop.addEventListener('mouseenter',clearHoverTimer);hoverPop.addEventListener('mouseleave',scheduleHide);hoverPop.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const c=hoverCell;hideHover();c?.click()})}
document.addEventListener('mouseover',e=>{if(innerWidth<=900)return;const cell=e.target.closest?.('td[data-label="RAC"]');if(!cell)return;if(e.relatedTarget&&cell.contains(e.relatedTarget))return;showHover(cell)});
document.addEventListener('mouseout',e=>{if(innerWidth<=900)return;const cell=e.target.closest?.('td[data-label="RAC"]');if(!cell||cell!==hoverCell)return;if(e.relatedTarget&&(cell.contains(e.relatedTarget)||hoverPop?.contains(e.relatedTarget)))return;scheduleHide()});

/* Desktop View: route the button into the row's native detail handler without depending on column position. */
document.addEventListener('click',e=>{const v=e.target.closest?.('.view-button');if(!v||innerWidth<=900)return;e.preventDefault();e.stopImmediatePropagation();v.closest('tr')?.click()},true);

let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});window.addEventListener('load',schedule);schedule();
