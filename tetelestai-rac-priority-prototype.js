// TETELESTAI UI prototype — stable command table + DOME RAC dial + five-level priority instrument.
// Presentation-only enhancement. It does not change System RAC or database values.

const style=document.createElement('style');
style.textContent=`
@media(min-width:901px){
  .wrap{width:min(99vw,1860px)!important;max-width:1860px!important}
  .dims-grid{table-layout:fixed!important}
  .dims-grid th,.dims-grid td{vertical-align:middle!important}
  .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:4.5%!important}
  .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:3.5%!important}
  .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:36%!important}
  .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:6.5%!important}
  .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:13%!important}
  .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:7.5%!important}
  .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:8.5%!important}
  .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:7.5%!important}
  .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:8%!important}
  .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:4.5%!important}
  .rac-v2-pop{display:none!important}
}
.dims-grid td[data-label="RAC"]{white-space:nowrap!important;font-weight:850;color:#0c1475;cursor:pointer!important}
.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}
.dims-grid td[data-label="Owner"]{overflow-wrap:anywhere}
.view-button{position:relative!important;z-index:3!important;pointer-events:auto!important}

/* Five-level shiny hazard/priority instrument: Extremely High / High / Serious / Medium / Low. */
.epi-priority{min-width:155px;max-width:230px;position:relative;padding:5px 1px 0}
.epi-priority-track{height:24px;padding:3px;display:grid;grid-template-columns:repeat(5,1fr);gap:1px;position:relative;overflow:visible;border:2px solid #10234b;border-radius:999px;background:linear-gradient(180deg,#18396f 0%,#061734 48%,#12346b 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.48),inset 0 -3px 6px rgba(0,0,0,.5),0 3px 9px rgba(6,18,43,.3),0 0 8px rgba(28,109,255,.2)}
.epi-priority-seg{height:18px;min-width:0;position:relative;opacity:.72;box-shadow:inset 0 3px 3px rgba(255,255,255,.48),inset 0 -3px 4px rgba(0,0,0,.2)}
.epi-priority-seg:first-child{border-radius:999px 3px 3px 999px}.epi-priority-seg:last-of-type{border-radius:3px 999px 999px 3px}
.epi-priority-seg[data-band="extreme"]{background:linear-gradient(180deg,#ff5560 0%,#f20d22 48%,#a80012 100%)}
.epi-priority-seg[data-band="high"]{background:linear-gradient(180deg,#ffb347 0%,#ff7310 50%,#d34c00 100%)}
.epi-priority-seg[data-band="serious"]{background:linear-gradient(180deg,#fff36d 0%,#f5c612 50%,#c99c00 100%)}
.epi-priority-seg[data-band="medium"]{background:linear-gradient(180deg,#7cff99 0%,#20c655 50%,#087f31 100%)}
.epi-priority-seg[data-band="low"]{background:linear-gradient(180deg,#6ac4ff 0%,#1979ff 50%,#1637cb 100%)}
.epi-priority-marker{position:absolute;top:-9px;width:7px;height:35px;border-radius:999px;background:linear-gradient(90deg,#c9ebff,#fff 42%,#fff 58%,#c9ebff);border:1px solid #38a6ff;box-shadow:0 0 0 2px rgba(255,255,255,.92),0 0 10px 4px rgba(0,160,255,.95),0 0 22px 8px rgba(0,110,255,.42);transform:translateX(-50%);pointer-events:none}
.epi-priority-label{display:block;margin-top:4px;text-align:center;font-size:.66rem;font-weight:950;letter-spacing:.055em;color:#0c1475;white-space:nowrap}
.epi-priority[data-level="extreme"] .epi-priority-marker{left:10%}.epi-priority[data-level="high"] .epi-priority-marker{left:30%}.epi-priority[data-level="serious"] .epi-priority-marker{left:50%}.epi-priority[data-level="medium"] .epi-priority-marker{left:70%}.epi-priority[data-level="low"] .epi-priority-marker{left:90%}
.epi-priority[data-level="extreme"] [data-band="extreme"],.epi-priority[data-level="high"] [data-band="high"],.epi-priority[data-level="serious"] [data-band="serious"],.epi-priority[data-level="medium"] [data-band="medium"],.epi-priority[data-level="low"] [data-band="low"]{opacity:1;filter:saturate(1.2) brightness(1.1);box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -3px 4px rgba(0,0,0,.16),0 0 12px rgba(255,255,255,.48)}

/* Desktop RAC hover: anchored beside the RAC cell and itself clickable. */
.proto-rac-pop{position:fixed;z-index:14500;width:min(310px,calc(100vw - 24px));padding:11px 13px;border:2px solid #0879ff;border-radius:11px;background:#fff;color:#172033;box-shadow:0 14px 34px rgba(11,23,51,.26);cursor:pointer;pointer-events:auto}
.proto-rac-pop:before{content:'';position:absolute;top:50%;left:-8px;width:14px;height:14px;background:#fff;border-left:2px solid #0879ff;border-bottom:2px solid #0879ff;transform:translateY(-50%) rotate(45deg)}
.proto-rac-pop.flip:before{left:auto;right:-8px;border-left:0;border-bottom:0;border-right:2px solid #0879ff;border-top:2px solid #0879ff}
.proto-rac-pop h3{margin:0 0 4px;color:#0c1475;font-size:.88rem}.proto-rac-pop .code{font-size:.96rem;font-weight:900;color:#0879ff}.proto-rac-pop p{margin:4px 0;font-size:.73rem;line-height:1.35}.proto-rac-pop .action{font-weight:900;color:#0879ff}

/* DOME radial RAC user-mode prototype. */
.rac-v2-drawer{background:linear-gradient(180deg,#f8fbff,#eef6ff)!important}
.dome-rac-dial{--ice:#eaf8ff;--electric:#1687ff;--deep:#061f57;position:relative;margin:14px auto 20px;max-width:760px;padding:20px 16px 30px;border-radius:30px;background:radial-gradient(circle at 50% 48%,#0a3d99 0 19%,#061d55 20% 34%,#0b63d8 35% 36%,#eef9ff 37% 56%,#126dd4 57% 58%,#eaf8ff 59% 73%,#0879ff 74% 75%,#dff4ff 76% 100%);box-shadow:inset 0 0 30px rgba(255,255,255,.95),0 16px 35px rgba(0,68,160,.2);overflow:hidden}
.dome-rac-dial:before{content:'DOME';display:block;text-align:center;font-size:2rem;font-weight:1000;letter-spacing:.12em;color:#fff;text-shadow:0 2px 0 #0a2f79,0 0 12px #5cc8ff;margin-bottom:4px}
.dome-rac-dial:after{content:'RISK ASSESSMENT CODE';display:block;text-align:center;font-size:.72rem;font-weight:900;letter-spacing:.16em;color:#eaf8ff;margin-bottom:10px}
.dome-dial-stage{position:relative;min-height:520px}
.dome-arc-label{position:absolute;top:238px;z-index:5;font-size:1rem;font-weight:1000;letter-spacing:.12em;color:#fff;text-shadow:0 0 8px #1687ff;writing-mode:vertical-rl}
.dome-arc-label.sev{left:2px;transform:rotate(180deg)}.dome-arc-label.prob{right:2px}
.dome-arc{position:absolute;top:18px;width:205px;height:440px;display:flex;flex-direction:column;justify-content:space-between;z-index:4}
.dome-arc.severity{left:30px}.dome-arc.probability{right:30px}
.dome-rac-option{min-height:70px;padding:8px 12px;border:2px solid rgba(255,255,255,.9);background:linear-gradient(180deg,#ffffff 0%,#d8f1ff 58%,#a9d6ff 100%);color:#092963;box-shadow:inset 0 2px 4px #fff,inset 0 -3px 5px rgba(0,70,170,.18),0 3px 7px rgba(0,47,125,.25);cursor:pointer;font-weight:900;transition:.16s ease;display:grid;grid-template-columns:42px 1fr;gap:6px;align-items:center}
.dome-arc.severity .dome-rac-option{border-radius:28px 8px 8px 28px}.dome-arc.probability .dome-rac-option{border-radius:8px 28px 28px 8px}
.dome-rac-option:hover{transform:scale(1.035);filter:brightness(1.05)}
.dome-rac-option.active{background:linear-gradient(180deg,#5dd0ff,#0879ff 58%,#0047ab);color:#fff;box-shadow:inset 0 2px 3px rgba(255,255,255,.7),0 0 0 3px #fff,0 0 18px 6px rgba(0,142,255,.7)}
.dome-rac-option .key{font-size:1.6rem;text-align:center}.dome-rac-option .name{display:block;font-size:.76rem;letter-spacing:.03em}.dome-rac-option .mini{display:block;font-size:.59rem;font-weight:650;opacity:.85;line-height:1.15;margin-top:2px}
.dome-rac-center{position:absolute;left:50%;top:210px;transform:translate(-50%,-50%);width:245px;height:245px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;border:8px solid #dff6ff;background:radial-gradient(circle at 40% 35%,#55d8ff 0%,#1687ff 24%,#0757c9 55%,#052568 100%);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #0b4fac,0 0 0 10px #c7ecff,0 0 32px 10px rgba(0,145,255,.7);transition:background .28s ease,box-shadow .28s ease,transform .28s ease;z-index:6}
.dome-rac-center .state{font-size:.66rem;font-weight:900;letter-spacing:.14em;opacity:.9}.dome-rac-center .formula{font-size:1.45rem;font-weight:1000;margin:4px 0}.dome-rac-center .result{font-size:2rem;font-weight:1000;line-height:1}.dome-rac-center .level{font-size:.9rem;font-weight:1000;margin-top:6px;letter-spacing:.08em}.dome-rac-center.calculating{animation:domePulse .7s ease-in-out infinite alternate}.dome-rac-center.locked{transform:translate(-50%,-50%) scale(1.025)}
.dome-rac-center.extreme{background:radial-gradient(circle at 40% 35%,#ff6671,#ed1027 44%,#8f0011 100%);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #9e0012,0 0 0 10px #ffd0d4,0 0 38px 12px rgba(255,15,39,.75)}
.dome-rac-center.high{background:radial-gradient(circle at 40% 35%,#ffc063,#ff7915 45%,#aa3b00 100%);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #b64b00,0 0 0 10px #ffe0ad,0 0 38px 12px rgba(255,122,16,.72)}
.dome-rac-center.serious{background:radial-gradient(circle at 40% 35%,#fff780,#f6c516 48%,#a97a00 100%);color:#172033;box-shadow:inset 0 0 26px rgba(255,255,255,.6),0 0 0 6px #b48700,0 0 0 10px #fff0a8,0 0 38px 12px rgba(255,207,19,.72)}
.dome-rac-center.medium{background:radial-gradient(circle at 40% 35%,#8bffa8,#25c95a 48%,#087735 100%);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #0b7d38,0 0 0 10px #c8ffd6,0 0 38px 12px rgba(36,202,89,.7)}
.dome-rac-center.low{background:radial-gradient(circle at 40% 35%,#76ceff,#187cff 48%,#1734b8 100%);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #1744b9,0 0 0 10px #cae7ff,0 0 38px 12px rgba(25,126,255,.72)}
@keyframes domePulse{from{filter:brightness(1);box-shadow:inset 0 0 26px rgba(255,255,255,.55),0 0 0 6px #0b4fac,0 0 0 10px #c7ecff,0 0 22px 7px rgba(0,145,255,.55)}to{filter:brightness(1.2);box-shadow:inset 0 0 32px rgba(255,255,255,.7),0 0 0 6px #1687ff,0 0 0 10px #fff,0 0 45px 16px rgba(0,184,255,.9)}}
.dome-hazard-band{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:min(94%,640px);display:grid;grid-template-columns:repeat(5,1fr);gap:3px;align-items:end;z-index:7}
.dome-hazard-seg{height:56px;border:2px solid rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font-size:.67rem;font-weight:1000;letter-spacing:.04em;text-shadow:0 1px 2px #000;box-shadow:inset 0 3px 4px rgba(255,255,255,.55),inset 0 -4px 5px rgba(0,0,0,.3),0 4px 8px rgba(0,0,0,.22);opacity:.82;transition:.18s ease}
.dome-hazard-seg:nth-child(1),.dome-hazard-seg:nth-child(5){transform:translateY(15px)}.dome-hazard-seg:nth-child(2),.dome-hazard-seg:nth-child(4){transform:translateY(6px)}
.dome-hazard-seg:first-child{border-radius:26px 7px 7px 26px}.dome-hazard-seg:last-child{border-radius:7px 26px 26px 7px}
.dome-hazard-seg.extreme{background:linear-gradient(180deg,#ff5965,#ed0d24 52%,#990010)}.dome-hazard-seg.high{background:linear-gradient(180deg,#ffc159,#ff7410 52%,#c44500)}.dome-hazard-seg.serious{background:linear-gradient(180deg,#fff67a,#f2c216 52%,#a97d00);color:#172033;text-shadow:none}.dome-hazard-seg.medium{background:linear-gradient(180deg,#89ffa4,#23c555 52%,#087632)}.dome-hazard-seg.low{background:linear-gradient(180deg,#72cfff,#197cff 52%,#1735b7)}
.dome-hazard-seg.active{opacity:1;filter:brightness(1.16) saturate(1.15);box-shadow:inset 0 3px 4px rgba(255,255,255,.7),inset 0 -4px 5px rgba(0,0,0,.24),0 0 16px 5px rgba(255,255,255,.65)}
.dome-rac-detail{max-width:760px;margin:8px auto 18px;display:grid;grid-template-columns:1fr 1fr;gap:12px}.dome-rac-detail .panel{background:#fff;border:1px solid #bdd8fb;border-radius:12px;padding:12px;color:#183158}.dome-rac-detail h4{margin:0 0 7px!important;color:#0c1475!important}.dome-rac-detail ul{margin:5px 0 0;padding-left:18px;font-size:.74rem;line-height:1.45}.dome-rac-derivation{grid-column:1/-1;background:linear-gradient(180deg,#fff,#f5fbff)!important;border:2px solid #1687ff!important}.dome-rac-derivation .eq{font-weight:950;color:#0757c9;margin:6px 0}.dome-5x5{grid-column:1/-1;overflow:auto}.dome-5x5 table{width:100%;border-collapse:collapse;min-width:620px;font-size:.7rem}.dome-5x5 th,.dome-5x5 td{border:1px solid #c1d8f3;padding:7px;text-align:center}.dome-5x5 th{background:#0b65cc;color:#fff}.dome-5x5 td{font-weight:850}.dome-5x5 .r1{background:#e7192f;color:#fff}.dome-5x5 .r2{background:#f47712;color:#fff}.dome-5x5 .r3{background:#f4ca19}.dome-5x5 .r4{background:#27b956;color:#fff}.dome-5x5 .r5{background:#267cf0;color:#fff}
#racGuide>.rac-v2-matrix-wrap,#racGuide>.rac-v2-example,#racGuide>.rac-result{display:none!important}
.rac-v2-drawer .rac-choice,.rac-v2-drawer .rac-calc-controls{display:none!important}
@media(max-width:760px){.dome-rac-dial{padding:16px 8px 24px}.dome-dial-stage{min-height:660px}.dome-arc{width:44%;top:20px}.dome-arc.severity{left:1%}.dome-arc.probability{right:1%}.dome-rac-option{min-height:66px;padding:6px 7px;grid-template-columns:34px 1fr}.dome-rac-option .key{font-size:1.3rem}.dome-rac-center{top:490px;width:205px;height:205px}.dome-hazard-band{bottom:0;width:98%}.dome-hazard-seg{height:48px;font-size:.55rem}.dome-arc-label{display:none}.dome-rac-detail{grid-template-columns:1fr}.dome-rac-derivation,.dome-5x5{grid-column:1}}
@media(max-width:900px){.epi-priority{max-width:215px}.dims-grid td[data-label="RAC"],.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}}
`;
document.head.appendChild(style);

const RAC_WORDS=/\s*(Critical\s*\/\s*Imminent|Critical|Imminent|Extremely\s*High|Serious|Moderate|Medium|Minor|Negligible|Low|High)\s*$/i;
const DESIRED=['Date Entered','Number','Project/Task','RAC','Priority','Status','Owner','Follow-Up','Progress','View'];
const CLASS={'Date Entered':'created','Number':'number','Project/Task':'title','RAC':'rac','Priority':'priority','Status':'status','Owner':'owner','Follow-Up':'follow','Progress':'progress','View':'view'};
const label=th=>(th?.querySelector('.dims-grid-header > span:first-child')?.textContent||th?.textContent||'').replace(/\s*[•▾]\s*$/,'').trim();

const DOME_SEVERITY={
  I:{name:'Catastrophic',weight:5,short:'Mission failure, loss of life, irreversible or enterprise-wide loss.'},
  II:{name:'Critical',weight:4,short:'Major degradation or serious loss requiring extensive recovery.'},
  III:{name:'Significant',weight:3,short:'Meaningful operational degradation requiring corrective action.'},
  IV:{name:'Moderate',weight:2,short:'Limited/localized impact manageable with standard controls.'},
  V:{name:'Minor',weight:1,short:'Negligible impact or routine correction.'}
};
const DOME_PROBABILITY={
  A:{name:'Frequent',weight:5,short:'Expected repeatedly or exposure makes recurrence highly likely.'},
  B:{name:'Likely',weight:4,short:'Expected one or more times if the condition is not controlled.'},
  C:{name:'Occasional',weight:3,short:'Could occur sometimes during normal operations.'},
  D:{name:'Seldom',weight:2,short:'Unlikely, but credible under known conditions.'},
  E:{name:'Rare',weight:1,short:'Highly unlikely; exceptional conditions would be required.'}
};
const DOME_RAC={
  1:{level:'EXTREMELY HIGH',band:'extreme'},
  2:{level:'HIGH',band:'high'},
  3:{level:'SERIOUS',band:'serious'},
  4:{level:'MEDIUM',band:'medium'},
  5:{level:'LOW',band:'low'}
};
function deriveDomeRac(sev,prob){
  if(!DOME_SEVERITY[sev]||!DOME_PROBABILITY[prob])return null;
  const index=DOME_SEVERITY[sev].weight*DOME_PROBABILITY[prob].weight;
  const rac=index>=21?1:index>=16?2:index>=10?3:index>=5?4:5;
  return{rac,index,...DOME_RAC[rac]};
}

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

function compactRac(cell){if(!cell||cell.dataset.racCompact==='1')return;const main=cell.querySelector('.rac-main'),target=main||cell,raw=target.textContent.replace(/\s+/g,' ').trim();if(!raw||/not assessed/i.test(raw)){cell.dataset.racCompact='1';return}const m=raw.match(/^(\d+)\s*\(\s*(I{1,3}|IV|V)\s*,\s*([A-E])\s*\)/i);target.textContent=m?`${m[1]} (${m[2].toUpperCase()}, ${m[3].toUpperCase()})`:raw.replace(RAC_WORDS,'').trim();cell.dataset.racCompact='1'}
function band(cell){const t=cell.closest('tr')?.querySelector('td[data-label="RAC"]')?.textContent||'',r=Number((t.match(/\b([1-5])\b/)||[])[1]);return({1:'extreme',2:'high',3:'serious',4:'medium',5:'low'})[r]||null}
function sourceLevel(t){t=String(t||'').toLowerCase();if(t.includes('extreme')||t.includes('imminent')||t.includes('critical'))return'extreme';if(t.includes('serious'))return'serious';if(t.includes('high'))return'high';if(t.includes('medium')||t.includes('moderate'))return'medium';return'low'}
const pLabel=l=>({extreme:'EXTREMELY HIGH',high:'HIGH',serious:'SERIOUS',medium:'MEDIUM',low:'LOW'})[l]||'LOW';
function priority(cell){if(!cell||cell.dataset.epiPriority==='1')return;const raw=cell.textContent.replace(/\s+/g,' ').trim();if(!raw)return;const l=band(cell)||sourceLevel(raw);cell.innerHTML=`<div class="epi-priority" data-level="${l}" role="img" aria-label="Priority ${pLabel(l)}"><div class="epi-priority-track"><span class="epi-priority-seg" data-band="extreme"></span><span class="epi-priority-seg" data-band="high"></span><span class="epi-priority-seg" data-band="serious"></span><span class="epi-priority-seg" data-band="medium"></span><span class="epi-priority-seg" data-band="low"></span><span class="epi-priority-marker" aria-hidden="true"></span></div><span class="epi-priority-label">${pLabel(l)}</span></div>`;cell.dataset.epiPriority='1'}
function status(cell){if(cell){cell.style.whiteSpace='nowrap';if(cell.firstElementChild)cell.firstElementChild.style.whiteSpace='nowrap'}}

function fiveByFiveHtml(){
  const probs=Object.keys(DOME_PROBABILITY),sevs=Object.keys(DOME_SEVERITY);
  return `<div class="dome-5x5"><h4>Traditional 5×5 Reference View</h4><table aria-label="DIMS five by five risk reference"><thead><tr><th>Severity ↓ / Probability →</th>${probs.map(p=>`<th>${p}<br><small>${DOME_PROBABILITY[p].name}</small></th>`).join('')}</tr></thead><tbody>${sevs.map(s=>`<tr><th>${s}<br><small>${DOME_SEVERITY[s].name}</small></th>${probs.map(p=>{const d=deriveDomeRac(s,p);return `<td class="r${d.rac}">RAC ${d.rac}<br><small>${d.level}<br>Index ${d.index}</small></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function dialHtml(){
  const sev=Object.entries(DOME_SEVERITY).map(([k,v])=>`<button type="button" class="dome-rac-option" data-dome-sev="${k}" title="${v.short}"><span class="key">${k}</span><span><span class="name">${v.name}</span><span class="mini">${v.short}</span></span></button>`).join('');
  const prob=Object.entries(DOME_PROBABILITY).map(([k,v])=>`<button type="button" class="dome-rac-option" data-dome-prob="${k}" title="${v.short}"><span class="key">${k}</span><span><span class="name">${v.name}</span><span class="mini">${v.short}</span></span></button>`).join('');
  return `<div class="dome-rac-dial" data-dome-rac-dial><div class="dome-dial-stage"><div class="dome-arc-label sev">SEVERITY</div><div class="dome-arc-label prob">PROBABILITY</div><div class="dome-arc severity">${sev}</div><div class="dome-arc probability">${prob}</div><div class="dome-rac-center idle" data-dome-center><div><div class="state">READY</div><div class="formula">RAC</div><div class="result">AWAITING INPUT</div><div class="level">Select Severity + Probability</div></div></div><div class="dome-hazard-band">${['extreme','high','serious','medium','low'].map(b=>`<div class="dome-hazard-seg ${b}" data-dome-band="${b}">${pLabel(b)}</div>`).join('')}</div></div></div>`;
}
function detailHtml(){
  return `<div class="dome-rac-detail"><div class="panel"><h4>Severity — Consequence</h4><ul>${Object.entries(DOME_SEVERITY).map(([k,v])=>`<li><b>${k} — ${v.name}:</b> ${v.short}</li>`).join('')}</ul></div><div class="panel"><h4>Probability — Likelihood</h4><ul>${Object.entries(DOME_PROBABILITY).map(([k,v])=>`<li><b>${k} — ${v.name}:</b> ${v.short}</li>`).join('')}</ul></div><div class="panel dome-rac-derivation"><h4>How the DIMS RAC is derived</h4><div class="eq">Severity weight × Probability weight = Risk Index (1–25) → RAC 1–5</div><ul><li>Severity weights: I=5, II=4, III=3, IV=2, V=1.</li><li>Probability weights: A=5, B=4, C=3, D=2, E=1.</li><li>Risk Index 21–25 → RAC 1 Extremely High; 16–20 → RAC 2 High; 10–15 → RAC 3 Serious; 5–9 → RAC 4 Medium; 1–4 → RAC 5 Low.</li><li>The radial selector changes the human interface, not the risk principle: consequence + likelihood still produce the risk result.</li><li>User assessment remains a governed aid and does not silently overwrite the authoritative System RAC.</li></ul></div>${fiveByFiveHtml()}</div>`;
}
function bindDial(root){
  const dial=root.querySelector('[data-dome-rac-dial]');if(!dial||dial.dataset.bound==='1')return;dial.dataset.bound='1';
  let sev='',prob='',timer=null;const center=dial.querySelector('[data-dome-center]');
  const paint=()=>{dial.querySelectorAll('[data-dome-sev]').forEach(b=>b.classList.toggle('active',b.dataset.domeSev===sev));dial.querySelectorAll('[data-dome-prob]').forEach(b=>b.classList.toggle('active',b.dataset.domeProb===prob));};
  const idle=()=>{if(timer){clearTimeout(timer);timer=null}center.className='dome-rac-center idle';center.innerHTML=`<div><div class="state">READY</div><div class="formula">RAC</div><div class="result">AWAITING INPUT</div><div class="level">Select Severity + Probability</div></div>`;dial.querySelectorAll('[data-dome-band]').forEach(x=>x.classList.remove('active'))};
  const partial=()=>{center.className='dome-rac-center idle';center.innerHTML=`<div><div class="state">INPUT RECEIVED</div><div class="formula">${sev||'—'} × ${prob||'—'}</div><div class="result">ONE INPUT REMAINS</div><div class="level">${sev?'Select Probability':'Select Severity'}</div></div>`};
  const calculate=()=>{const d=deriveDomeRac(sev,prob);if(!d)return partial();center.className='dome-rac-center calculating';center.innerHTML=`<div><div class="state">CALCULATING</div><div class="formula">${sev} × ${prob}</div><div class="result">ASSESSING</div><div class="level">Risk Index ${d.index}</div></div>`;dial.querySelectorAll('[data-dome-band]').forEach(x=>x.classList.remove('active'));timer=setTimeout(()=>{center.className=`dome-rac-center locked ${d.band}`;center.innerHTML=`<div><div class="state">RAC LOCKED</div><div class="formula">${sev} × ${prob}</div><div class="result">RAC ${d.rac}</div><div class="level">${d.level} · Index ${d.index}</div></div>`;dial.querySelector(`[data-dome-band="${d.band}"]`)?.classList.add('active')},720)};
  const choose=()=>{paint();if(sev&&prob)calculate();else partial()};
  dial.querySelectorAll('[data-dome-sev]').forEach(b=>b.onclick=()=>{sev=b.dataset.domeSev;if(timer){clearTimeout(timer);timer=null}choose()});dial.querySelectorAll('[data-dome-prob]').forEach(b=>b.onclick=()=>{prob=b.dataset.domeProb;if(timer){clearTimeout(timer);timer=null}choose()});idle();
}
function enhanceGuide(){
  document.querySelectorAll('#racGuide').forEach(g=>{if(g.dataset.domeDial==='1')return;g.dataset.domeDial='1';const note=g.querySelector('.rac-v2-note');if(note)note.textContent='DIMS uses a 5×5 risk model that combines Severity (consequence) and Probability (likelihood). The radial selector is the primary user interface; the traditional matrix remains below as a transparent reference. This prototype does not change the authoritative System RAC or production database values.';const h=g.querySelector('h4');const host=document.createElement('div');host.innerHTML=dialHtml()+detailHtml();if(h)g.insertBefore(host,h);else g.appendChild(host);bindDial(g)});
}
function enhance(){document.querySelectorAll('.dims-grid').forEach(reorder);document.querySelectorAll('.dims-grid td[data-label="RAC"]').forEach(compactRac);document.querySelectorAll('.dims-grid td[data-label="Priority"]').forEach(priority);document.querySelectorAll('.dims-grid td[data-label="Status"]').forEach(status);enhanceGuide()}

/* Desktop RAC hover is close enough to enter with the pointer and clicking it opens the same RAC guide. */
let hoverPop=null,hoverCell=null,hoverTimer=null;
function clearHoverTimer(){if(hoverTimer){clearTimeout(hoverTimer);hoverTimer=null}}
function hideHover(){clearHoverTimer();hoverPop?.remove();hoverPop=null;hoverCell=null}
function scheduleHide(){clearHoverTimer();hoverTimer=setTimeout(hideHover,220)}
function showHover(cell){if(innerWidth<=900||!cell)return;if(hoverCell===cell&&hoverPop)return;hideHover();hoverCell=cell;hoverPop=document.createElement('div');hoverPop.className='proto-rac-pop';const value=(cell.textContent||'').replace(/\s+/g,' ').trim()||'Not assessed';hoverPop.innerHTML=`<h3>Risk Assessment Code (RAC)</h3><div class="code">${value}</div><p>DIMS RAC combines Severity and Probability in the governed 5×5 risk model.</p><p class="action">Click here to open the RAC Guide & Selector.</p>`;document.body.appendChild(hoverPop);const r=cell.getBoundingClientRect(),w=hoverPop.offsetWidth,h=hoverPop.offsetHeight;let left=r.right+5,flip=false;if(left+w>innerWidth-10){left=Math.max(10,r.left-w-5);flip=true}let top=Math.max(10,Math.min(r.top+r.height/2-h/2,innerHeight-h-10));if(flip)hoverPop.classList.add('flip');Object.assign(hoverPop.style,{left:`${left}px`,top:`${top}px`});hoverPop.addEventListener('mouseenter',clearHoverTimer);hoverPop.addEventListener('mouseleave',scheduleHide);hoverPop.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const c=hoverCell;hideHover();c?.click()})}
document.addEventListener('mouseover',e=>{if(innerWidth<=900)return;const cell=e.target.closest?.('td[data-label="RAC"]');if(!cell)return;if(e.relatedTarget&&cell.contains(e.relatedTarget))return;showHover(cell)});
document.addEventListener('mouseout',e=>{if(innerWidth<=900)return;const cell=e.target.closest?.('td[data-label="RAC"]');if(!cell||cell!==hoverCell)return;if(e.relatedTarget&&(cell.contains(e.relatedTarget)||hoverPop?.contains(e.relatedTarget)))return;scheduleHide()});

/* Desktop View: route the button into the row's native detail handler without depending on column position. */
document.addEventListener('click',e=>{const v=e.target.closest?.('.view-button');if(!v||innerWidth<=900)return;e.preventDefault();e.stopImmediatePropagation();v.closest('tr')?.click()},true);

let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});window.addEventListener('load',schedule);schedule();
