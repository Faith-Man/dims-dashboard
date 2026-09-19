// TETELESTAI RAC UI v3 — removes retired EPI presentation, adds guide access, and tightens desktop layout.
const css=document.createElement('style');
css.textContent=`
@media(min-width:901px){
  .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:5%!important}
  .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:5%!important}
  .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:35%!important}
  .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:8%!important}
  .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:11%!important;overflow:hidden!important}
  .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:7%!important}
  .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:9%!important}
  .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:6%!important}
  .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:9%!important}
  .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:5%!important}
  .epi-priority{min-width:0!important;max-width:145px!important;width:100%!important;padding-right:8px!important;overflow:visible!important}
  .epi-priority-track{width:100%!important;max-width:138px!important}
}
.rac-guide-link{display:inline-flex;margin-top:4px;padding:3px 7px;border:1px solid #8db6ff;border-radius:999px;color:#0456d8!important;background:#fff;text-decoration:none;font-size:.61rem;font-weight:900;line-height:1.2;white-space:nowrap}
.proto-rac-pop{display:none!important}
.rac3-backdrop{position:fixed;inset:0;z-index:30000;background:rgba(5,14,40,.58);display:none;align-items:center;justify-content:center;padding:16px}.rac3-backdrop.open{display:flex}.rac3-card{width:min(720px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.32)}.rac3-hero{padding:22px;background:linear-gradient(135deg,#034cc9,#0c1475);color:#fff;position:relative}.rac3-hero h2{margin:0 52px 5px 0;font-size:1.55rem}.rac3-hero p{margin:0;opacity:.9}.rac3-close{position:absolute;right:16px;top:15px;border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;border-radius:9px;padding:7px 10px;font-weight:800}.rac3-body{padding:18px}.rac3-box{border:1px solid #c9d8ee;border-radius:12px;padding:14px;margin-bottom:12px;background:#f8fbff}.rac3-box h3{margin:0 0 7px;color:#0c1475}.rac3-box strong{color:#0456d8}.rac3-warning{border-left:5px solid #f59e0b;background:#fff8e6}.rac3-actions{display:flex;gap:8px;flex-wrap:wrap}.rac3-actions a{display:inline-flex;padding:10px 14px;border-radius:9px;background:#0456d8;color:#fff;text-decoration:none;font-weight:900}.rac3-actions a.alt{background:#fff;color:#0c1475;border:1px solid #8db6ff}
`;
document.head.appendChild(css);

function ensureGuideLinks(){
  document.querySelectorAll('.dims-grid td[data-label="RAC"]').forEach(td=>{
    if(td.querySelector('.rac-guide-link')) return;
    const a=document.createElement('a');
    a.className='rac-guide-link';
    a.href='rac-epi-apn-guide.html#rad';
    a.textContent='Open Guide';
    a.addEventListener('click',e=>e.stopPropagation());
    td.appendChild(a);
  });
}
const mo=new MutationObserver(ensureGuideLinks);mo.observe(document.documentElement,{childList:true,subtree:true});ensureGuideLinks();

const modal=document.createElement('div');
modal.className='rac3-backdrop';
modal.innerHTML=`<section class="rac3-card" role="dialog" aria-modal="true" aria-label="RAC Quick Brief"><header class="rac3-hero"><button class="rac3-close">Close</button><h2>RAC • DEA • APN Quick Brief</h2><p>Risk assessment, execution order, and physical-hazard abatement.</p></header><div class="rac3-body"><div class="rac3-box"><h3>RAC — Risk Assessment Code</h3><p><strong>Severity × Probability</strong> establishes the governed risk category. RAD is the workspace used to assess both physical and non-physical risk.</p></div><div class="rac3-box"><h3>DEA™ — DIMS Execution Algorithm</h3><p>When executable items share the same RAC, DEA determines relative execution order from objective recorded facts such as dependencies, deadlines, waiting age, readiness, and continuity.</p></div><div class="rac3-box rac3-warning"><h3>APN — Abatement Priority Number</h3><p><strong>Actual physical hazards only.</strong> APN uses RAC with CEI to prioritize occupational-safety, fire, and occupational-health hazard abatement. It is not used for ordinary software, governance, deployment, administrative, or workflow risk.</p></div><div class="rac3-box"><h3>Execution Performance Metrics</h3><p>HEI, AEL, Rework Load, Verified Outcome Yield, and Autonomy measure how work was executed. They are separate from pre-execution priority.</p></div><div class="rac3-actions"><a href="rac-epi-apn-guide.html#rad">Open Full RAD Guide</a><a class="alt" href="rac-epi-apn-guide.html#dea">DEA</a><a class="alt" href="rac-epi-apn-guide.html#apn">APN</a></div></div></section>`;
document.body.appendChild(modal);
const close=()=>modal.classList.remove('open');modal.querySelector('.rac3-close').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};

document.addEventListener('click',e=>{
  const td=e.target.closest?.('.dims-grid td[data-label="RAC"]');
  if(!td || e.target.closest('.rac-guide-link')) return;
  e.preventDefault();e.stopImmediatePropagation();modal.classList.add('open');
},true);
