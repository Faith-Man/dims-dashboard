import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Presentation layer for the RAC-first TETELESTAI interface.
// Core RAC data, filtering, sorting, status, and record rendering remain native in tetelestai-closed-loop.js.
const sbUi = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const css = `
.dims-grid-menu{min-width:290px!important;max-width:380px!important;padding:10px!important}
.dims-grid-menu .menu-label{display:block;padding:7px 10px 5px!important;text-align:left!important;color:#667085;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.dims-grid-menu button{display:block;width:100%;padding:9px 10px!important;text-align:left!important;border:0;background:transparent;border-radius:7px!important;cursor:pointer}
.dims-grid-menu button:hover{background:#eef5ff}
.dims-grid-menu .filter-option{display:grid!important;grid-template-columns:18px minmax(0,1fr)!important;align-items:start!important;gap:10px!important;padding:8px 10px!important;margin:1px 0!important;border-radius:7px;cursor:pointer}
.dims-grid-menu .filter-option:hover{background:#eef5ff}
.dims-grid-menu .filter-option input{margin:2px 0 0!important;width:16px!important;height:16px!important;justify-self:start!important}
.dims-grid-menu .filter-option span{display:block!important;text-align:left!important;line-height:1.3!important;overflow-wrap:anywhere!important}
.dims-grid-menu .menu-divider{height:1px;background:#d9deea;margin:8px 0!important}

/* RAC-first table: remove the visible execution Rank column. RAC is the primary visible ordering control. */
.dims-grid th:first-child,.dims-grid td:first-child{display:none!important}
.dims-grid th{background:#0F52BA!important;color:#fff!important}
.rac-main{font-weight:900;color:#0c1475;white-space:nowrap;cursor:help;text-decoration:underline dotted;text-underline-offset:3px}
.rac-main small{display:block;font-weight:700;color:#667085;margin-top:2px;text-decoration:none}
.rac-na{color:#8b94a7}
.badge{white-space:nowrap!important}

/* View: horizontal record rows on desktop; stacked rows on mobile. */
.detail-grid{display:block!important}
.detail-field,.detail-field.full{display:grid!important;grid-template-columns:minmax(170px,26%) minmax(0,1fr)!important;gap:16px!important;align-items:start!important;width:100%!important;border:0!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;padding:10px 4px!important;margin:0!important}
.detail-field dt{font-weight:800!important;color:#0c1475!important;font-size:.72rem!important}
.detail-field dd{margin:0!important;min-width:0!important}
.detail-field[data-ui-hidden="true"]{display:none!important}
.priority-method-row dd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.priority-method-switch{border:1px solid #0F52BA;background:#fff;color:#0c1475;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer}
.priority-method-switch:hover{background:#eef5ff}
.priority-method-note{font-size:.72rem;color:#667085}
.priority-method-state{font-weight:800;color:#0c1475}

.rac-help-popover{position:fixed;z-index:11000;width:min(440px,calc(100vw - 24px));background:#fff;color:#172033;border:2px solid #0F52BA;border-radius:12px;box-shadow:0 18px 46px rgba(11,23,51,.28);padding:14px 16px;line-height:1.4}
.rac-help-popover h3{margin:0 0 8px;color:#0c1475;font-size:1rem}
.rac-help-popover p{margin:6px 0;font-size:.8rem}
.rac-help-popover .rac-help-code{font-size:1.05rem;font-weight:900;color:#0F52BA}
.rac-help-popover .rac-help-close{position:absolute;top:7px;right:9px;border:0;background:transparent;color:#0c1475;font-size:1.15rem;cursor:pointer}
.rac-help-popover .rac-help-note{color:#667085;font-size:.72rem}

@media(min-width:901px){
  .dims-grid th:nth-child(2),.dims-grid td:nth-child(2){width:9%!important}
  .dims-grid th:nth-child(3),.dims-grid td:nth-child(3){width:23%!important}
  .dims-grid th:nth-child(4),.dims-grid td:nth-child(4){width:10%!important}
  .dims-grid th:nth-child(5),.dims-grid td:nth-child(5){width:10%!important}
  .dims-grid th:nth-child(6),.dims-grid td:nth-child(6){width:10%!important}
  .dims-grid th:nth-child(7),.dims-grid td:nth-child(7){width:10%!important}
  .dims-grid th:nth-child(8),.dims-grid td:nth-child(8){width:10%!important}
  .dims-grid th:nth-child(9),.dims-grid td:nth-child(9){width:9%!important}
  .dims-grid th:nth-child(10),.dims-grid td:nth-child(10){width:6%!important}
  .dims-grid th:nth-child(11),.dims-grid td:nth-child(11){width:3%!important}
}
@media(max-width:900px){
  .dims-grid-menu{left:12px!important;right:12px!important;width:auto!important;max-width:none!important}
  .detail-field,.detail-field.full{grid-template-columns:1fr!important;gap:3px!important;padding:10px 2px!important}
}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

let racPopover = null;
let racCloseTimer = null;

function cancelRacClose() {
  if (racCloseTimer) clearTimeout(racCloseTimer);
  racCloseTimer = null;
}

function closeRacHelp() {
  cancelRacClose();
  racPopover?.remove();
  racPopover = null;
}

function scheduleRacClose() {
  cancelRacClose();
  racCloseTimer = setTimeout(closeRacHelp, 350);
}

function racHelpHtml(codeText) {
  return `<button class="rac-help-close" type="button" aria-label="Close RAC explanation">×</button>
    <h3>RAC • EPI • APN</h3>
    <div class="rac-help-code">${codeText || 'Not assessed'}</div>
    <p><b>RAC — Risk Assessment Code</b> is determined by the intersection of <b>Severity</b> and <b>Probability</b>. Lower RAC numbers receive higher primary risk priority.</p>
    <p><b>EPI — Execution Priority Index</b> is the normal DIMS method used to determine which item should execute first when records have the same RAC. EPI uses <b>Impact</b> and <b>Estimated Resolution Effort (ERE)</b>; ERE is estimated AI Time (AIT) + Human Interaction Time (HIT). The exact numerical EPI formula remains under validation as DIMS accumulates actual history.</p>
    <p><b>APN — Abatement Priority Number</b> is available for genuine safety-hazard records. When APN mode is selected, DIMS preserves the safety-hazard priority method rather than treating the item as a normal EPI record.</p>
    <p class="rac-help-note">Hover over RAC on desktop or tap/click it on mobile. Use the RAC column menu to sort or filter RAC values.</p>`;
}

function openRacHelp(target) {
  cancelRacClose();
  const cell = target.closest('td[data-label="RAC"]');
  if (!cell) return;
  const codeText = cell.querySelector('.rac-main')?.childNodes?.[0]?.textContent?.trim() || cell.textContent.trim();
  if (racPopover?.dataset.code === codeText) return;
  closeRacHelp();
  const pop = document.createElement('div');
  pop.className = 'rac-help-popover';
  pop.dataset.code = codeText;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'RAC, EPI and APN explanation');
  pop.innerHTML = racHelpHtml(codeText);
  document.body.appendChild(pop);
  const rect = cell.getBoundingClientRect();
  const left = Math.max(12, Math.min(rect.left, innerWidth - pop.offsetWidth - 12));
  let top = rect.bottom + 8;
  if (top + pop.offsetHeight > innerHeight - 12) top = Math.max(12, rect.top - pop.offsetHeight - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.querySelector('.rac-help-close').onclick = closeRacHelp;
  pop.addEventListener('mouseenter', cancelRacClose);
  pop.addEventListener('mouseleave', scheduleRacClose);
  racPopover = pop;
}

function normalizeDateLabels(root = document) {
  root.querySelectorAll('.dims-grid th .dims-grid-header > span:first-child').forEach(label => {
    if (label.textContent.trim().replace(' •','') === 'Date Entered') {
      const active = label.textContent.includes('•') ? ' •' : '';
      label.textContent = `Date${active}`;
    }
  });
  root.querySelectorAll('.dims-grid td[data-label="Date Entered"]').forEach(cell => {
    cell.dataset.label = 'Date';
  });
}

async function recordForOpenDrawer() {
  const kindText = document.getElementById('drawerKind')?.textContent?.toLowerCase() || '';
  const kind = kindText.includes('project') ? 'project' : kindText.includes('task') ? 'task' : null;
  if (!kind) return null;
  const fields = [...document.querySelectorAll('#drawerContent .detail-field')];
  const numberField = fields.find(field => field.querySelector('dt')?.textContent?.trim().toLowerCase() === 'permanent number');
  const number = numberField?.querySelector('dd')?.textContent?.trim();
  if (!number || number === '—') return null;
  const table = kind === 'project' ? 'projects' : 'tasks';
  const numberColumn = kind === 'project' ? 'project_number' : 'task_number';
  const { data, error } = await sbUi.from(table).select(`id,priority_method,${numberColumn}`).eq(numberColumn, number).single();
  if (error || !data) return null;
  return { kind, id: data.id, priorityMethod: data.priority_method || 'epi' };
}

async function setPriorityMethod(button, record, method) {
  const { data: { session } } = await sbUi.auth.getSession();
  if (!session) return alert('Please sign in to DOME before changing the priority method.');
  button.disabled = true;
  button.textContent = 'Saving…';
  const { data, error } = await sbUi.functions.invoke('tetelestai-control', {
    body: {
      action: 'update_current',
      record_type: record.kind,
      record_id: record.id,
      fields: { priority_method: method },
      reason: method === 'apn'
        ? 'Record classified as a safety hazard; use APN priority method.'
        : 'Record returned to standard DIMS execution; use EPI priority method.'
    }
  });
  if (error || data?.error) {
    button.disabled = false;
    button.textContent = method === 'apn' ? 'Use APN for Safety Hazard' : 'Use EPI for DIMS Execution';
    return alert(data?.error || error?.message || 'Priority method update failed.');
  }
  const row = button.closest('.priority-method-row');
  const state = row?.querySelector('.priority-method-state');
  const note = row?.querySelector('.priority-method-note');
  if (state) state.textContent = method === 'apn' ? 'APN — Safety Hazard' : 'EPI — DIMS Execution';
  if (note) note.textContent = method === 'apn'
    ? 'APN is now the governed relative-priority method for this safety-hazard record.'
    : 'EPI is now the governed relative-priority method for this DIMS record.';
  button.dataset.method = method;
  button.textContent = method === 'apn' ? 'Switch Back to EPI' : 'Use APN for Safety Hazard';
  button.disabled = false;
}

async function injectPriorityMethodControl() {
  const drawer = document.getElementById('drawerContent');
  if (!drawer || drawer.querySelector('.priority-method-row')) return;
  const racField = [...drawer.querySelectorAll('.detail-field')].find(field => field.querySelector('dt')?.textContent?.trim().toLowerCase() === 'rac');
  if (!racField) return;
  const record = await recordForOpenDrawer();
  if (!record || drawer.querySelector('.priority-method-row')) return;
  const row = document.createElement('div');
  row.className = 'detail-field priority-method-row';
  const method = record.priorityMethod === 'apn' ? 'apn' : 'epi';
  row.innerHTML = `<dt>Priority Method</dt><dd>
    <span class="priority-method-state">${method === 'apn' ? 'APN — Safety Hazard' : 'EPI — DIMS Execution'}</span>
    <button type="button" class="priority-method-switch" data-method="${method}">${method === 'apn' ? 'Switch Back to EPI' : 'Use APN for Safety Hazard'}</button>
    <span class="priority-method-note">${method === 'apn' ? 'APN is the governed relative-priority method for this safety-hazard record.' : 'EPI is the governed relative-priority method for this DIMS record.'}</span>
  </dd>`;
  racField.insertAdjacentElement('afterend', row);
  row.querySelector('.priority-method-switch').onclick = event => {
    const current = event.currentTarget.dataset.method;
    const next = current === 'apn' ? 'epi' : 'apn';
    if (next === 'apn' && !confirm('Use APN for this record because it is a genuine safety hazard?')) return;
    setPriorityMethod(event.currentTarget, record, next);
  };
}

function refineDrawer() {
  const drawer = document.getElementById('drawerContent');
  if (!drawer) return;
  for (const field of drawer.querySelectorAll('.detail-field')) {
    const labelEl = field.querySelector('dt');
    const label = labelEl?.textContent?.trim().toLowerCase();
    if (label === 'execution rank' || label === 'dea rank basis' || label === 'severity' || label === 'probability') {
      field.dataset.uiHidden = 'true';
    }
    if (label === 'date entered' && labelEl) labelEl.textContent = 'Date';
  }
  injectPriorityMethodControl();
}

document.addEventListener('click', event => {
  if (event.target.closest('td[data-label="RAC"] .rac-main')) {
    event.stopPropagation();
    openRacHelp(event.target);
    return;
  }
  if (!event.target.closest('.rac-help-popover')) closeRacHelp();
});

document.addEventListener('mouseover', event => {
  const rac = event.target.closest?.('td[data-label="RAC"] .rac-main');
  if (rac) {
    rac.title = 'RAC • EPI • APN explanation';
    openRacHelp(rac);
  }
});

document.addEventListener('mouseout', event => {
  const rac = event.target.closest?.('td[data-label="RAC"] .rac-main');
  if (rac && !event.relatedTarget?.closest?.('.rac-help-popover')) scheduleRacClose();
});

const drawer = document.getElementById('drawerContent');
if (drawer) new MutationObserver(() => { refineDrawer(); normalizeDateLabels(); }).observe(drawer, { childList: true, subtree: true });

for (const listId of ['projectsList','tasksList']) {
  const list = document.getElementById(listId);
  if (list) new MutationObserver(() => normalizeDateLabels(list)).observe(list, { childList: true, subtree: true });
}

normalizeDateLabels();
refineDrawer();
