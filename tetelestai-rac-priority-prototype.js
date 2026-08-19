// TETELESTAI UI prototype — compact RAC + execution-priority spectrum.
// Presentation-only enhancement. It does not change System RAC or database values.

const PROTOTYPE_STYLE = document.createElement('style');
PROTOTYPE_STYLE.textContent = `
  .dims-grid td[data-label="RAC"]{white-space:nowrap!important;font-weight:850;color:#0c1475}
  .dims-grid td[data-label="Status"]{white-space:nowrap!important}
  .dims-grid td[data-label="Priority"]{min-width:118px!important}

  .epi-priority{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;align-items:center;min-width:106px;max-width:145px}
  .epi-priority-seg{height:9px;border-radius:999px;background:#d9deea;border:1px solid rgba(12,20,117,.14)}
  .epi-priority-label{grid-column:1/-1;font-size:.63rem;font-weight:850;color:#0c1475;white-space:nowrap;margin-top:2px;text-align:center}
  .epi-priority[data-level="low"] .epi-priority-seg:nth-child(1){background:#16a34a}
  .epi-priority[data-level="medium"] .epi-priority-seg:nth-child(-n+2){background:#facc15}
  .epi-priority[data-level="high"] .epi-priority-seg:nth-child(-n+3){background:#f97316}
  .epi-priority[data-level="immediate"] .epi-priority-seg{background:#dc2626}

  .rac-v2-drawer .rac-choice,.rac-v2-drawer .rac-calc-controls{display:none!important}
  .rac-matrix-instruction{margin:8px 0 12px;padding:9px 11px;border-left:4px solid #0047AB;background:#eef5ff;border-radius:7px;color:#17315f;font-size:.78rem;font-weight:750;line-height:1.4}
  .rac-v2-matrix td.rac-cell{transition:transform .12s ease,box-shadow .12s ease;cursor:pointer!important}
  .rac-v2-matrix td.rac-cell:hover{transform:scale(1.025);box-shadow:inset 0 0 0 3px rgba(12,20,117,.55)}
  .rac-v2-matrix td.rac-cell.selected{outline:4px solid #0c1475!important;outline-offset:-4px!important;box-shadow:0 0 0 3px rgba(255,255,255,.85) inset}

  @media(min-width:901px){
    .dims-grid th:nth-child(3),.dims-grid td:nth-child(3){width:8%!important}
    .dims-grid th:nth-child(4),.dims-grid td:nth-child(4){width:10%!important}
    .dims-grid th:nth-child(5),.dims-grid td:nth-child(5){width:8%!important}
    .dims-grid th:nth-child(6),.dims-grid td:nth-child(6){width:8%!important}
  }
  @media(max-width:900px){
    .epi-priority{max-width:180px}
    .dims-grid td[data-label="RAC"],.dims-grid td[data-label="Status"]{white-space:nowrap!important}
  }
`;
document.head.appendChild(PROTOTYPE_STYLE);

const RAC_WORDS = /\s*(Critical\s*\/\s*Imminent|Critical|Imminent|Serious|Moderate|Medium|Minor|Negligible|Low|High)\s*$/i;

function compactRacCell(cell){
  if (!cell || cell.dataset.racCompact === '1') return;
  const main = cell.querySelector('.rac-main');
  const target = main || cell;
  const raw = target.textContent.replace(/\s+/g,' ').trim();
  if (!raw || /not assessed/i.test(raw)) { cell.dataset.racCompact='1'; return; }
  // Keep only the governed code and coordinates, e.g. 2 (II, B).
  const m = raw.match(/^(\d+)\s*\(\s*(I{1,3}|IV)\s*,\s*([A-D])\s*\)/i);
  if (m) target.textContent = `${m[1]} (${m[2].toUpperCase()}, ${m[3].toUpperCase()})`;
  else target.textContent = raw.replace(RAC_WORDS,'').trim();
  cell.title = 'Click to open the RAC guide and interactive matrix.';
  cell.dataset.racCompact='1';
}

function priorityLevel(text){
  const t = String(text||'').toLowerCase();
  if (t.includes('immediate') || t.includes('critical')) return 'immediate';
  if (t.includes('high')) return 'high';
  if (t.includes('medium') || t.includes('moderate')) return 'medium';
  return 'low';
}

function priorityLabel(level){
  return ({immediate:'IMMEDIATE',high:'HIGH',medium:'MEDIUM',low:'LOW'})[level] || 'LOW';
}

function enhancePriorityCell(cell){
  if (!cell || cell.dataset.epiPriority === '1') return;
  const raw = cell.textContent.replace(/\s+/g,' ').trim();
  if (!raw) return;
  const level = priorityLevel(raw);
  cell.innerHTML = `<div class="epi-priority" data-level="${level}" role="img" aria-label="Execution priority ${priorityLabel(level)}"><span class="epi-priority-seg"></span><span class="epi-priority-seg"></span><span class="epi-priority-seg"></span><span class="epi-priority-seg"></span><span class="epi-priority-label">${priorityLabel(level)}</span></div>`;
  cell.title = 'DEA/EPI execution priority spectrum';
  cell.dataset.epiPriority='1';
}

function normalizeStatus(cell){
  if (!cell) return;
  cell.style.whiteSpace='nowrap';
  const pill = cell.firstElementChild;
  if (pill) pill.style.whiteSpace='nowrap';
}

function addMatrixInstruction(){
  document.querySelectorAll('.rac-v2-drawer').forEach(drawer=>{
    if (drawer.querySelector('.rac-matrix-instruction')) return;
    const matrix = drawer.querySelector('.rac-v2-matrix-wrap');
    if (!matrix) return;
    const note = document.createElement('div');
    note.className='rac-matrix-instruction';
    note.textContent='Click the Severity × Probability intersection directly on the matrix. The selected cell calculates the User RAC immediately; System RAC remains authoritative.';
    matrix.parentElement?.insertBefore(note,matrix);
  });
}

function enhanceTables(){
  document.querySelectorAll('.dims-grid td[data-label="RAC"]').forEach(compactRacCell);
  document.querySelectorAll('.dims-grid td[data-label="Priority"]').forEach(enhancePriorityCell);
  document.querySelectorAll('.dims-grid td[data-label="Status"]').forEach(normalizeStatus);
  addMatrixInstruction();
}

let scheduled=false;
function scheduleEnhance(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhanceTables()});
}

new MutationObserver(scheduleEnhance).observe(document.body,{childList:true,subtree:true,characterData:true});
window.addEventListener('load',scheduleEnhance);
scheduleEnhance();
