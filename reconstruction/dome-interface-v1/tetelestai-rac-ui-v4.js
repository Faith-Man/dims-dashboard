// TETELESTAI RAC UI v4 — restores the governed RAC user flow while preserving approved table refinements.
const css=document.createElement('style');
css.textContent=`
@media(min-width:901px){
  .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:4.5%!important}
  .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:3.5%!important}
  .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:36%!important}
  .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:7%!important}
  .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:12%!important;overflow:hidden!important}
  .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:7.5%!important}
  .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:8.5%!important}
  .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:6%!important}
  .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:10%!important}
  .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:5%!important}
  .epi-priority{min-width:0!important;max-width:150px!important;width:100%!important;padding-right:6px!important;overflow:hidden!important}
  .epi-priority-track{width:100%!important;max-width:142px!important}
}
.proto-rac-pop,.stage1-rac-popover,.rac-guide-link{display:none!important}
.dims-grid td[data-label="RAC"]{cursor:pointer!important;text-decoration:underline dotted;text-underline-offset:3px}
.rac4-tip{position:fixed;z-index:29990;display:none;max-width:290px;background:#fff;color:#172033;border:1px solid #7eb1ff;border-radius:9px;padding:8px 10px;box-shadow:0 10px 28px rgba(5,25,70,.22);font-size:.72rem;pointer-events:none}.rac4-tip.open{display:block}.rac4-tip strong{color:#0757c9}
.rac4-backdrop{position:fixed;inset:0;z-index:30000;background:rgba(5,14,40,.62);display:none;align-items:center;justify-content:center;padding:14px}.rac4-backdrop.open{display:flex}.rac4-card{width:min(980px,97vw);max-height:94vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.36)}.rac4-hero{padding:20px 22px;background:linear-gradient(135deg,#075de7,#034cc9 54%,#0c1475);color:#fff;position:sticky;top:0;z-index:2}.rac4-hero h2{margin:0 64px 4px 0;font-size:1.45rem}.rac4-hero p{margin:0;opacity:.92}.rac4-close{position:absolute;right:16px;top:15px;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;border-radius:9px;padding:7px 10px;font-weight:800;cursor:pointer}.rac4-body{padding:18px}.rac4-assigned{display:flex;gap:12px;align-items:center;flex-wrap:wrap;border:1px solid #bcd5ff;background:#eef6ff;border-radius:12px;padding:12px 14px;margin-bottom:12px}.rac4-code{font-size:1.2rem;font-weight:1000;color:#0757c9}.rac4-box{border:1px solid #c9d8ee;border-radius:12px;padding:14px;margin-bottom:12px;background:#f8fbff}.rac4-box h3{margin:0 0 7px;color:#0c1475}.rac4-box p{margin:6px 0;font-size:.85rem;line-height:1.45}.rac4-box strong{color:#0757c9}.rac4-warning{border-left:5px solid #f59e0b;background:#fff8e6}.rac4-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rac4-actions a,.rac4-actions button{display:inline-flex;padding:9px 13px;border-radius:9px;background:#0757c9;color:#fff;text-decoration:none;font-weight:900;border:0;cursor:pointer}.rac4-actions .alt{background:#fff;color:#0c1475;border:1px solid #8db6ff}
.rad4-stage{position:relative;min-height:500px;border-radius:30px;overflow:hidden;margin:12px 0 16px;background:radial-gradient(circle at 50% 49%,#0b4fbd 0 18%,#072867 19% 31%,#1687ff 32% 33%,#e4f6ff 34% 55%,#1687ff 56% 57%,#eff9ff 58% 100%);box-shadow:inset 0 0 32px rgba(255,255,255,.9),0 14px 30px rgba(0,70,170,.16);border:1px solid #9ecbff}.rad4-title{position:absolute;top:14px;left:0;right:0;text-align:center;color:#fff;font-weight:1000;letter-spacing:.13em;text-shadow:0 2px 0 #0a2f79,0 0 12px #5cc8ff}.rad4-arc{position:absolute;top:65px;bottom:38px;width:205px;display:flex;flex-direction:column;justify-content:space-between;z-index:4}.rad4-arc.sev{left:24px}.rad4-arc.prob{right:24px}.rad4-opt{min-height:62px;border:2px solid rgba(255,255,255,.92);background:linear-gradient(#fff,#d8f1ff);color:#092963;box-shadow:inset 0 2px 4px #fff,0 3px 8px rgba(0,47,125,.22);cursor:pointer;font-weight:900;padding:7px 10px}.rad4-arc.sev .rad4-opt{border-radius:28px 8px 8px 28px}.rad4-arc.prob .rad4-opt{border-radius:8px 28px 28px 8px}.rad4-opt.active{background:linear-gradient(#55d8ff,#0879ff 60%,#0047ab);color:#fff;box-shadow:0 0 0 3px #fff,0 0 18px rgba(0,145,255,.75)}.rad4-opt small{display:block;font-size:.6rem;font-weight:650;opacity:.82}.rad4-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:245px;height:245px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;border:8px solid #e5f8ff;background:radial-gradient(circle at 38% 32%,#5be0ff,#1687ff 35%,#0647ad 68%,#041b52);box-shadow:inset 0 0 28px rgba(255,255,255,.55),0 0 0 6px #0b4fac,0 0 0 11px #c7ecff,0 0 38px 10px rgba(0,145,255,.62);z-index:6}.rad4-core .state{font-size:.68rem;font-weight:900;letter-spacing:.12em}.rad4-core .formula{font-size:1.15rem;font-weight:950;margin:5px 0}.rad4-core .value{font-size:2rem;font-weight:1000}.rad4-core .band{font-size:.9rem;font-weight:900;margin-top:5px}.rac4-review{background:#fff;border:2px solid #0c1475;border-radius:12px;padding:14px;margin-top:16px}.rac4-review h3{margin:0 0 6px;color:#0c1475}.rac4-review p{font-size:.8rem;color:#526079}.rac4-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.rac4-form label{font-size:.72rem;font-weight:800;color:#0c1475}.rac4-form input,.rac4-form select,.rac4-form textarea{width:100%;margin-top:4px;padding:8px;border:1px solid #aebfd8;border-radius:7px;font:inherit;background:#fff}.rac4-form .full{grid-column:1/-1}.rac4-review-output{display:none;margin-top:10px;padding:10px;border:1px solid #bfd1ee;border-radius:8px;background:#eef5ff;white-space:pre-wrap;font-size:.78rem}.rac4-review-output.show{display:block}
@media(max-width:760px){.rac4-card{width:99vw}.rad4-stage{min-height:640px}.rad4-arc{width:128px;top:68px;bottom:120px}.rad4-arc.sev{left:10px}.rad4-arc.prob{right:10px}.rad4-core{top:79%;width:185px;height:185px}.rad4-opt{font-size:.67rem;padding:5px}.rad4-opt small{display:none}.rac4-form{grid-template-columns:1fr}.rac4-form .full{grid-column:1}}
`;
document.head.appendChild(css);

const MATRIX={
 I:{A:[1,'Extremely High'],B:[1,'Extremely High'],C:[2,'High'],D:[3,'Serious'],E:[4,'Medium']},
 II:{A:[1,'Extremely High'],B:[2,'High'],C:[3,'Serious'],D:[4,'Medium'],E:[5,'Low']},
 III:{A:[2,'High'],B:[3,'Serious'],C:[4,'Medium'],D:[5,'Low'],E:[5,'Low']},
 IV:{A:[3,'Serious'],B:[4,'Medium'],C:[5,'Low'],D:[5,'Low'],E:[5,'Low']},
 V:{A:[4,'Medium'],B:[5,'Low'],C:[5,'Low'],D:[5,'Low'],E:[5,'Low']}
};
const SEV={I:'Catastrophic',II:'Critical',III:'Moderate',IV:'Minor',V:'Negligible'};
const PROB={A:'Frequent',B:'Likely',C:'Occasional',D:'Seldom',E:'Unlikely'};

function parseCode(td){
  const raw=(td?.querySelector('.rac-main')?.textContent||td?.textContent||'').replace(/\s+/g,' ').trim();
  const m=raw.match(/(?:RAC\s*)?(\d+)\s*\(?\s*(I{1,3}|IV|V)\s*,?\s*([A-E])\s*\)?/i);
  return m?{rac:Number(m[1]),sev:m[2].toUpperCase(),prob:m[3].toUpperCase(),display:`${m[1]} ${m[2].toUpperCase()}, ${m[3].toUpperCase()}`}:{rac:null,sev:'',prob:'',display:raw||'Not assessed'};
}
function normalizeRacCells(){
  document.querySelectorAll('.dims-grid td[data-label="RAC"]').forEach(td=>{
    const c=parseCode(td); const target=td.querySelector('.rac-main')||td;
    if(c.rac){target.textContent=c.display;td.title=`RAC ${c.rac} — Severity ${c.sev} (${SEV[c.sev]}), Probability ${c.prob} (${PROB[c.prob]}). Click for RAC User Brief.`;}
  });
}
const observer=new MutationObserver(normalizeRacCells);observer.observe(document.documentElement,{childList:true,subtree:true});normalizeRacCells();

const tip=document.createElement('div');tip.className='rac4-tip';document.body.appendChild(tip);
function showTip(td){const c=parseCode(td);tip.innerHTML=`<strong>${c.display}</strong><br>Severity ${c.sev||'—'} · Probability ${c.prob||'—'}<br>Click for RAC User Brief + functional RAD.`;const r=td.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-305,Math.max(10,r.left))}px`;tip.style.top=`${Math.min(innerHeight-90,r.bottom+6)}px`;tip.classList.add('open')}
function hideTip(){tip.classList.remove('open')}

document.addEventListener('mouseover',e=>{const td=e.target.closest?.('.dims-grid td[data-label="RAC"]');if(td&&innerWidth>900)showTip(td)},true);
document.addEventListener('mouseout',e=>{if(e.target.closest?.('.dims-grid td[data-label="RAC"]'))hideTip()},true);

const modal=document.createElement('div');modal.className='rac4-backdrop';document.body.appendChild(modal);
let context={code:{display:'Not assessed',sev:'',prob:'',rac:null},number:'',title:''};
function radHtml(){
 const sev=Object.entries(SEV).map(([k,v])=>`<button class="rad4-opt" type="button" data-r4s="${k}">${k} — ${v}<small>Severity / consequence</small></button>`).join('');
 const prob=Object.entries(PROB).map(([k,v])=>`<button class="rad4-opt" type="button" data-r4p="${k}">${k} — ${v}<small>Probability / likelihood</small></button>`).join('');
 return `<div class="rad4-stage"><div class="rad4-title">RISK ASSESSMENT DOME</div><div class="rad4-arc sev">${sev}</div><div class="rad4-arc prob">${prob}</div><div class="rad4-core" data-r4core><div><div class="state">AWAITING ASSESSMENT</div><div class="formula">Severity × Probability</div><div class="value">—</div><div class="band">Select both inputs</div></div></div></div>`;
}
function reviewHtml(c){return `<section class="rac4-review"><h3>Disagree with the assigned RAC?</h3><p>Use this review format to document the basis for a different assessment. A review does not silently overwrite the authoritative System RAC.</p><div class="rac4-form"><label>Current assigned RAC<input data-r4-current readonly value="${c.display.replace(/"/g,'&quot;')}"></label><label>Record<input data-r4-record readonly value="${(context.number+' '+context.title).trim().replace(/"/g,'&quot;')}"></label><label>Your Severity<select data-r4-rsev><option value="">Select</option>${Object.entries(SEV).map(([k,v])=>`<option value="${k}">${k} — ${v}</option>`).join('')}</select></label><label>Your Probability<select data-r4-rprob><option value="">Select</option>${Object.entries(PROB).map(([k,v])=>`<option value="${k}">${k} — ${v}</option>`).join('')}</select></label><label>Proposed revised RAC<input data-r4-proposed readonly placeholder="Calculated from selections"></label><label>Submitted by<input data-r4-by placeholder="Name / role"></label><label class="full">Reason / basis for disagreement<textarea data-r4-reason rows="3" placeholder="Explain why the assigned Severity, Probability, or RAC should be reconsidered."></textarea></label><label class="full">Supporting facts / evidence<textarea data-r4-evidence rows="3" placeholder="Identify observations, records, measurements, dependencies, or other evidence."></textarea></label></div><div class="rac4-actions"><button type="button" data-r4-prepare>Prepare RAC Review</button></div><div class="rac4-review-output" data-r4-output></div></section>`}
function openBrief(td){
 const row=td.closest('tr');context={code:parseCode(td),number:row?.querySelector('td[data-label="Number"]')?.textContent.trim()||'',title:row?.querySelector('td[data-label="Project/Task"]')?.textContent.trim()||''};
 modal.innerHTML=`<section class="rac4-card" role="dialog" aria-modal="true" aria-label="RAC User Brief"><header class="rac4-hero"><button class="rac4-close" type="button">Close</button><h2>RAC User Brief · Risk Assessment Dome (RAD™)</h2><p>Understand the assigned Risk Assessment Code, test Severity and Probability, and request review when warranted.</p></header><div class="rac4-body"><div class="rac4-assigned"><span>Assigned RAC</span><span class="rac4-code">${context.code.display}</span><span>${context.number} ${context.title}</span></div><div class="rac4-box"><h3>What the code means</h3><p><strong>RAC — Risk Assessment Code</strong> is produced from <strong>Severity × Probability</strong>. The compact table code shows the RAC number followed by the Severity category and Probability category. Example: <strong>4 III, C</strong>.</p><p>RAC applies to physical and non-physical governed risk. DEA determines execution order after the risk assessment. APN is reserved for actual physical hazards.</p></div><div class="rac4-box"><h3>Functional Risk Assessment Dome</h3><p>Select Severity and Probability below. RAD will calculate the corresponding RAC without changing the authoritative assigned RAC.</p>${radHtml()}</div><div class="rac4-actions"><a href="rac-epi-apn-guide.html#rad">Open Full RAD Guide</a><a class="alt" href="rac-epi-apn-guide.html#dea">DEA</a><a class="alt" href="rac-epi-apn-guide.html#apn">APN</a></div>${reviewHtml(context.code)}</div></section>`;
 modal.classList.add('open');hideTip();wireModal();
}
function wireModal(){
 const close=()=>modal.classList.remove('open');modal.querySelector('.rac4-close').onclick=close;
 let sev='',prob='';const core=modal.querySelector('[data-r4core]');
 const render=()=>{modal.querySelectorAll('[data-r4s]').forEach(b=>b.classList.toggle('active',b.dataset.r4s===sev));modal.querySelectorAll('[data-r4p]').forEach(b=>b.classList.toggle('active',b.dataset.r4p===prob));if(!sev||!prob){core.innerHTML=`<div><div class="state">AWAITING ASSESSMENT</div><div class="formula">${sev||'—'} × ${prob||'—'}</div><div class="value">—</div><div class="band">Select ${sev?'Probability':'Severity'}</div></div>`;return}const [r,b]=MATRIX[sev][prob];core.innerHTML=`<div><div class="state">RAC RESULT</div><div class="formula">${sev} × ${prob}</div><div class="value">RAC ${r}</div><div class="band">${b}</div></div>`;};
 modal.querySelectorAll('[data-r4s]').forEach(b=>b.onclick=()=>{sev=b.dataset.r4s;render()});modal.querySelectorAll('[data-r4p]').forEach(b=>b.onclick=()=>{prob=b.dataset.r4p;render()});
 const rs=modal.querySelector('[data-r4-rsev]'),rp=modal.querySelector('[data-r4-rprob]'),proposed=modal.querySelector('[data-r4-proposed]');
 const reviewCalc=()=>{if(rs.value&&rp.value){const [r]=MATRIX[rs.value][rp.value];proposed.value=`${r} ${rs.value}, ${rp.value}`}else proposed.value=''};rs.onchange=reviewCalc;rp.onchange=reviewCalc;
 modal.querySelector('[data-r4-prepare]').onclick=()=>{reviewCalc();const reason=modal.querySelector('[data-r4-reason]').value.trim(),evidence=modal.querySelector('[data-r4-evidence]').value.trim(),by=modal.querySelector('[data-r4-by]').value.trim(),out=modal.querySelector('[data-r4-output]');out.textContent=`RAC REVIEW REQUEST\nRecord: ${(context.number+' '+context.title).trim()}\nCurrent RAC: ${context.code.display}\nProposed RAC: ${proposed.value||'Not calculated'}\nSubmitted by: ${by||'Not entered'}\nReason / basis: ${reason||'Not entered'}\nSupporting facts / evidence: ${evidence||'Not entered'}\n\nReview request only — authoritative System RAC remains unchanged until governed review/approval.`;out.classList.add('show')};
}
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('open')});
document.addEventListener('click',e=>{const td=e.target.closest?.('.dims-grid td[data-label="RAC"]');if(!td)return;e.preventDefault();e.stopImmediatePropagation();openBrief(td)},true);
