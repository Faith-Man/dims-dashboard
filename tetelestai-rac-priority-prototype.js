// TETELESTAI UI prototype — command-oriented table + compact RAC priority spectrum.
// Presentation-only enhancement. It does not change System RAC or database values.

const PROTOTYPE_STYLE = document.createElement('style');
PROTOTYPE_STYLE.textContent = `
  /* Give the desktop command table enough room without changing the mobile card layout. */
  @media(min-width:901px){
    .wrap{width:min(98vw,1780px)!important;max-width:1780px!important}
    .dims-grid{table-layout:fixed!important}
    .dims-grid th,.dims-grid td{vertical-align:middle!important}
    .dims-grid th[data-proto-col="created"],.dims-grid td[data-label="Date Entered"]{width:10%!important}
    .dims-grid th[data-proto-col="number"],.dims-grid td[data-label="Number"]{width:9%!important}
    .dims-grid th[data-proto-col="title"],.dims-grid td[data-label="Project/Task"]{width:24%!important}
    .dims-grid th[data-proto-col="rac"],.dims-grid td[data-label="RAC"]{width:8%!important}
    .dims-grid th[data-proto-col="priority"],.dims-grid td[data-label="Priority"]{width:11%!important}
    .dims-grid th[data-proto-col="status"],.dims-grid td[data-label="Status"]{width:9%!important}
    .dims-grid th[data-proto-col="owner"],.dims-grid td[data-label="Owner"]{width:10%!important}
    .dims-grid th[data-proto-col="follow"],.dims-grid td[data-label="Follow-Up"]{width:9%!important}
    .dims-grid th[data-proto-col="progress"],.dims-grid td[data-label="Progress"]{width:7%!important}
    .dims-grid th[data-proto-col="view"],.dims-grid td[data-label="View"]{width:6%!important}
  }

  .dims-grid td[data-label="RAC"]{white-space:nowrap!important;font-weight:850;color:#0c1475}
  .dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}
  .dims-grid td[data-label="Priority"]{min-width:128px!important}
  .dims-grid td[data-label="Owner"]{overflow-wrap:anywhere}

  /* RAC-aligned priority spectrum: High / Serious / Medium / Low. */
  .epi-priority{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;align-items:center;min-width:118px;max-width:158px}
  .epi-priority-seg{height:10px;border-radius:999px;background:#e4e7ec;border:1px solid rgba(12,20,117,.13)}
  .epi-priority-seg[data-band="high"]{background:#dc2626}
  .epi-priority-seg[data-band="serious"]{background:#f97316}
  .epi-priority-seg[data-band="medium"]{background:#facc15}
  .epi-priority-seg[data-band="low"]{background:#16a34a}
  .epi-priority-label{grid-column:1/-1;font-size:.63rem;font-weight:900;color:#0c1475;white-space:nowrap;margin-top:2px;text-align:center;letter-spacing:.02em}
  .epi-priority[data-level="high"] .epi-priority-seg:not([data-band="high"]),
  .epi-priority[data-level="serious"] .epi-priority-seg:not([data-band="serious"]),
  .epi-priority[data-level="medium"] .epi-priority-seg:not([data-band="medium"]),
  .epi-priority[data-level="low"] .epi-priority-seg:not([data-band="low"]){opacity:.22;filter:saturate(.35)}
  .epi-priority[data-level="high"] .epi-priority-seg[data-band="high"],
  .epi-priority[data-level="serious"] .epi-priority-seg[data-band="serious"],
  .epi-priority[data-level="medium"] .epi-priority-seg[data-band="medium"],
  .epi-priority[data-level="low"] .epi-priority-seg[data-band="low"]{outline:2px solid #172033;outline-offset:1px}

  /* Use the matrix itself as the RAC selector. */
  .rac-v2-drawer .rac-choice,.rac-v2-drawer .rac-calc-controls{display:none!important}
  .rac-matrix-instruction{margin:8px 0 12px;padding:9px 11px;border-left:4px solid #0047AB;background:#eef5ff;border-radius:7px;color:#17315f;font-size:.78rem;font-weight:750;line-height:1.4}
  .rac-v2-matrix td.rac-cell{transition:transform .12s ease,box-shadow .12s ease;cursor:pointer!important}
  .rac-v2-matrix td.rac-cell:hover{transform:scale(1.025);box-shadow:inset 0 0 0 3px rgba(12,20,117,.55)}
  .rac-v2-matrix td.rac-cell.selected{outline:4px solid #0c1475!important;outline-offset:-4px!important;box-shadow:0 0 0 3px rgba(255,255,255,.85) inset}

  @media(max-width:900px){
    .epi-priority{max-width:190px}
    .dims-grid td[data-label="RAC"],.dims-grid td[data-label="Status"],.dims-grid td[data-label="Date Entered"],.dims-grid td[data-label="Follow-Up"]{white-space:nowrap!important}
  }
`;
document.head.appendChild(PROTOTYPE_STYLE);

const RAC_WORDS = /\s*(Critical\s*\/\s*Imminent|Critical|Imminent|Serious|Moderate|Medium|Minor|Negligible|Low|High)\s*$/i;
const DESIRED_COLUMNS = ['Date Entered','Number','Project/Task','RAC','Priority','Status','Owner','Follow-Up','Progress','View'];
const COL_CLASS = {'Date Entered':'created','Number':'number','Project/Task':'title','RAC':'rac','Priority':'priority','Status':'status','Owner':'owner','Follow-Up':'follow','Progress':'progress','View':'view'};

function headerLabel(th){
  return (th?.querySelector('.dims-grid-header > span:first-child')?.textContent || th?.textContent || '').replace(/\s*[•▾]\s*$/,'').trim();
}

function normalizeFollowUp(table){
  const headers=[...table.querySelectorAll('thead th')];
  const dueIndex=headers.findIndex(th=>['Next/Due','Next / Due','Follow-Up','Follow Up'].includes(headerLabel(th)));
  if(dueIndex<0)return;
  const th=headers[dueIndex];
  const label=th.querySelector('.dims-grid-header > span:first-child');
  if(label) label.textContent='Follow-Up'; else th.textContent='Follow-Up';
  table.querySelectorAll('tbody tr').forEach(tr=>{
    const cell=tr.children[dueIndex];
    if(!cell)return;
    cell.dataset.label='Follow-Up';
    // Keep the actual date only; remove repeated Follow-up/Target helper text.
    cell.querySelectorAll('.rank-reason').forEach(e=>e.remove());
  });
}

function reorderTable(table){
  if(!table?.tHead?.rows?.[0])return;
  normalizeFollowUp(table);
  const headRow=table.tHead.rows[0];
  const currentHeaders=[...headRow.children];
  const indexByLabel=new Map(currentHeaders.map((th,i)=>[headerLabel(th),i]));
  const desiredIndices=DESIRED_COLUMNS.map(label=>indexByLabel.get(label)).filter(i=>Number.isInteger(i));
  if(desiredIndices.length<DESIRED_COLUMNS.length-1)return;

  const rows=[...table.querySelectorAll('tbody tr')];
  const headerSnapshot=[...headRow.children];
  const rowSnapshots=rows.map(tr=>[...tr.children]);

  DESIRED_COLUMNS.forEach(label=>{
    const originalIndex=indexByLabel.get(label);
    if(!Number.isInteger(originalIndex))return;
    const th=headerSnapshot[originalIndex];
    th.dataset.protoCol=COL_CLASS[label]||'';
    headRow.appendChild(th);
    rows.forEach((tr,rowIndex)=>{
      const td=rowSnapshots[rowIndex][originalIndex];
      if(td) tr.appendChild(td);
    });
  });

  // Remove any legacy Rank column left by an earlier renderer; the approved table no longer uses it.
  [...headRow.children].forEach((th,index)=>{
    if(headerLabel(th)==='Rank'){
      th.remove();
      rows.forEach(tr=>tr.children[index]?.remove());
    }
  });
  table.dataset.protoOrdered='1';
}

function compactRacCell(cell){
  if (!cell || cell.dataset.racCompact === '1') return;
  const main = cell.querySelector('.rac-main');
  const target = main || cell;
  const raw = target.textContent.replace(/\s+/g,' ').trim();
  if (!raw || /not assessed/i.test(raw)) { cell.dataset.racCompact='1'; return; }
  const m = raw.match(/^(\d+)\s*\(\s*(I{1,3}|IV)\s*,\s*([A-D])\s*\)/i);
  if (m) target.textContent = `${m[1]} (${m[2].toUpperCase()}, ${m[3].toUpperCase()})`;
  else target.textContent = raw.replace(RAC_WORDS,'').trim();
  cell.title = 'Click to open the RAC guide and interactive matrix.';
  cell.dataset.racCompact='1';
}

function racBandFromRow(cell){
  const racText=cell.closest('tr')?.querySelector('td[data-label="RAC"]')?.textContent||'';
  const rac=Number((racText.match(/\b([1-5])\b/)||[])[1]);
  return ({1:'high',2:'serious',3:'medium',4:'low',5:'low'})[rac] || null;
}

function sourcePriorityLevel(text){
  const t=String(text||'').toLowerCase();
  if(t.includes('serious'))return 'serious';
  if(t.includes('high'))return 'high';
  if(t.includes('medium')||t.includes('moderate'))return 'medium';
  return 'low';
}

function priorityLabel(level){return ({high:'HIGH',serious:'SERIOUS',medium:'MEDIUM',low:'LOW'})[level]||'LOW'}

function enhancePriorityCell(cell){
  if (!cell || cell.dataset.epiPriority === '1') return;
  const raw = cell.textContent.replace(/\s+/g,' ').trim();
  if (!raw) return;
  // Prototype behavior: align the visual priority band with the governed RAC table
  // when a System RAC exists; fall back to the stored priority when RAC is absent.
  const level = racBandFromRow(cell) || sourcePriorityLevel(raw);
  cell.innerHTML = `<div class="epi-priority" data-level="${level}" role="img" aria-label="Priority ${priorityLabel(level)}"><span class="epi-priority-seg" data-band="high" title="High"></span><span class="epi-priority-seg" data-band="serious" title="Serious"></span><span class="epi-priority-seg" data-band="medium" title="Medium"></span><span class="epi-priority-seg" data-band="low" title="Low"></span><span class="epi-priority-label">${priorityLabel(level)}</span></div>`;
  cell.title = 'Priority spectrum aligned to RAC bands: High, Serious, Medium, Low.';
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
  document.querySelectorAll('.dims-grid').forEach(table=>reorderTable(table));
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
