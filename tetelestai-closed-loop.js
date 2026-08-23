import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderDeaRiskMatrix, activateRacAssessment } from './dea-risk-matrix.js';
import { DIMS_IMPACT, impactScore, deaPriorityDisclosure } from './dea-execution-priority.js';

const sb = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const CLOSED = new Set(['verified_closed', 'cancelled', 'canceled', 'deferred']);
const OWNER = {
  dominion1st_di: '🚀 Dominion1st DI',
  pastor_michael: '👑 Pastor H. Michael Daniels',
  shared: '🤝 Shared',
  external: '↗ External'
};
const RAC_BAND = { 1: 'High', 2: 'Serious', 3: 'Medium', 4: 'Low', 5: 'Low' };

let projects = [];
let tasks = [];
let projectGrid;
let taskGrid;
let summaryFilter = null;
let lastFocus = null;

const byId = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const norm = value => String(value || '').trim().toLowerCase().replaceAll(' ', '_');
const fmt = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString() : '—';
const ageDays = value => value ? Math.floor((Date.now() - new Date(value).getTime()) / 86400000) : 0;

function ensureRacStyles() {
  if (document.getElementById('tetelestaiRacBriefStyles')) return;
  const style = document.createElement('style');
  style.id = 'tetelestaiRacBriefStyles';
  style.textContent = `
    .rac-brief{position:relative;display:inline-block;overflow:visible}.rac-brief summary{list-style:none;cursor:pointer;border:1px solid #d6b858;border-radius:999px;padding:3px 7px;background:#fff8db;color:#6a5000;font-weight:800;white-space:nowrap}.rac-brief summary::-webkit-details-marker{display:none}.rac-brief-panel{display:none;position:absolute;z-index:10020;left:0;top:100%;margin-top:0;width:min(280px,76vw);padding:10px;border:2px solid #0879ff;border-radius:11px;background:#fff;color:#14213d;box-shadow:0 14px 34px rgba(11,23,51,.26);font-size:.72rem;line-height:1.4;pointer-events:auto}.rac-brief[open] .rac-brief-panel,.rac-brief:hover .rac-brief-panel,.rac-brief:focus-within .rac-brief-panel{display:block}.rac-brief-panel strong{display:block;color:#0c1475;margin-bottom:4px}.rac-guide-link{display:inline-block;margin-top:7px;color:#0879ff;font-weight:900;text-decoration:underline}.title-stack .next-preview{margin-top:3px}@media(max-width:900px){.rac-brief-panel{position:static;width:auto;margin-top:6px}}
  `;
  document.head.appendChild(style);
}
ensureRacStyles();

function racNotation(row) {
  if (!row.system_rac) return '—';
  if (row.risk_severity && row.risk_probability) return `${row.system_rac} ${row.risk_severity}, ${row.risk_probability}`;
  return String(row.system_rac);
}

function racBrief(row) {
  if (!row.system_rac) return '<span class="rac-na">—</span>';
  const notation = racNotation(row);
  const band = RAC_BAND[Number(row.system_rac)] || 'Assessed';
  return `<details class="rac-brief" onclick="event.stopPropagation()">
    <summary aria-label="RAC ${esc(notation)}. Open brief">${esc(notation)}</summary>
    <div class="rac-brief-panel" role="note">
      <strong>RAC ${esc(notation)} — ${esc(band)}</strong>
      <div>Risk Assessment Dome: Severity ${esc(row.risk_severity || '—')} × Probability ${esc(row.risk_probability || '—')}.</div>
      <a class="rac-guide-link" href="rac-epi-apn-guide.html" onclick="event.stopPropagation()">OPEN FULL RAD GUIDE</a>
    </div>
  </details>`;
}

function displayStatus(row) {
  if (norm(row.verification_status) === 'verified_closed') return 'Verified/Closed';
  const n = norm(row.status);
  if (['reported_complete', 'complete', 'completed'].includes(n)) return 'Completed';
  return String(row.status || 'Open').replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase());
}

function statusBadge(row) {
  const label = displayStatus(row);
  const n = norm(label);
  const color = n.includes('progress') || n === 'active' ? 'amber'
    : n.includes('complete') || n.includes('verified') ? 'blue'
      : n === 'blocked' || n === 'deferred' ? 'grey' : 'green';
  return `<span class="badge badge-${color}">${esc(label)}</span>`;
}

function priorityBadge(value) {
  if (norm(value) === 'high') return '<span class="badge badge-amber">👑 High</span>';
  if (norm(value) === 'low') return '<span class="badge badge-grey">⚔️ Low</span>';
  return '<span class="badge badge-blue">🛡️ Medium</span>';
}

function progress(value) {
  const p = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><span class="row-meta">${p}%</span>`;
}

async function control(action, kind, row, extra = {}) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Please sign in to DOME before making protected changes.');
  const { data, error } = await sb.functions.invoke('tetelestai-control', {
    body: { action, record_type: kind, record_id: row.id, ...extra }
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function rankInfo(row) {
  const status = norm(row.status);
  if (CLOSED.has(norm(row.verification_status)) || ['cancelled', 'canceled', 'deferred'].includes(status)) {
    return { excluded: true, score: -1, reason: 'Excluded' };
  }
  if (Number.isInteger(row.queue_position)) {
    return { override: true, score: 100000 - row.queue_position, reason: 'Executive override' };
  }
  let score = 0;
  const reasons = [];
  const add = (points, label) => { score += points; if (points) reasons.push(label); };
  add({ high: 300, medium: 200, low: 100 }[norm(row.priority)] || 0, 'priority');
  add(['active', 'in_progress'].includes(status) ? 120 : 0, 'WIP');
  const due = row.target_date ? Math.ceil((new Date(row.target_date) - new Date()) / 86400000) : null;
  add(due !== null && due < 0 ? 160 + Math.min(60, -due) : due !== null && due <= 7 ? 120 : 0, 'deadline');
  const follow = row.next_follow_up_date ? Math.ceil((new Date(row.next_follow_up_date) - new Date()) / 86400000) : null;
  add(follow !== null && follow <= 0 ? 140 + Math.min(60, -follow) : 0, 'follow-up');
  add({ 1: 160, 2: 130, 3: 90, 4: 45, 5: 10 }[Number(row.system_rac)] || 0, 'RAC');
  add(row.readiness === 'ready' ? 70 : row.readiness === 'blocked' ? -160 : -60, 'readiness');
  add(Math.min(45, Math.max(0, ageDays(row.created_at)) / 7), 'age');
  add(row.action_owner === 'dominion1st_di' && row.readiness === 'ready' ? 70 : 0, 'DI-ready');
  add(row.action_owner === 'pastor_michael' ? 40 : 0, 'manual action');
  add(({ 5: 150, 4: 110, 3: 70, 2: 35, 1: 10 })[impactScore(row)] || 0, 'impact');
  return { score, reason: reasons.slice(0, 4).join(' + ') || 'Standard queue' };
}

export function ranked(rows) {
  const active = rows.map(row => ({ row, rank: rankInfo(row) }))
    .filter(item => !item.rank.excluded)
    .sort((a, b) => a.rank.override !== b.rank.override
      ? (a.rank.override ? -1 : 1)
      : a.rank.override
        ? a.row.queue_position - b.row.queue_position
        : b.rank.score - a.rank.score);
  active.forEach((item, index) => { item.row._rank = index + 1; });
  const excluded = rows.filter(row => rankInfo(row).excluded).map(row => Object.assign(row, { _rank: '—' }));
  return [...active.map(item => item.row), ...excluded];
}

function projectTaskCell(row) {
  return `<div class="title-stack"><button class="title-button">${esc(row.title)}</button><span class="next-preview">${esc(row.next_action || 'No next action recorded')}</span></div>`;
}

const columns = [
  { key: 'created_at', label: 'Date', value: r => r.created_at ? String(r.created_at).slice(0, 10) : '', display: r => fmt(r.created_at), render: r => fmt(r.created_at) },
  { key: 'number', label: 'Number', value: r => r.project_number || r.task_number || '—', render: r => `<span class="permanent-number">${esc(r.project_number || r.task_number || '—')}</span>` },
  { key: 'title', label: 'Project/Task', value: r => r.title || '', render: projectTaskCell },
  { key: 'system_rac', label: 'RAC', value: r => Number(r.system_rac) || 0, display: r => racNotation(r), render: r => racBrief(r) },
  { key: 'priority', label: 'Priority', value: r => r.priority || 'medium', display: r => String(r.priority || 'medium').replaceAll('_', ' '), render: r => priorityBadge(r.priority) },
  { key: 'status', label: 'Status', value: r => displayStatus(r), display: r => displayStatus(r), render: r => statusBadge(r) },
  { key: 'action_owner', label: 'Owner', value: r => r.action_owner || '', display: r => OWNER[r.action_owner] || r.action_owner || '—', render: r => esc(OWNER[r.action_owner] || r.action_owner || '—') },
  { key: 'next_follow_up_date', label: 'Follow-Up', value: r => r.next_follow_up_date || '', display: r => fmt(r.next_follow_up_date), render: r => fmt(r.next_follow_up_date) },
  { key: 'percent_complete', label: 'Progress', value: r => Number(r.percent_complete) || 0, display: r => `${Number(r.percent_complete) || 0}%`, render: r => progress(r.percent_complete) },
  { key: 'view', label: 'View', filterable: false, sortable: false, render: r => `<button class="view-button" aria-label="View ${esc(r.title)}">View</button>` }
];

function columnValue(column, row) {
  return typeof column.value === 'function' ? column.value(row) : row[column.key] ?? '';
}
function columnDisplay(column, row) {
  return typeof column.display === 'function' ? column.display(row) : String(columnValue(column, row)).replaceAll('_', ' ');
}

function matchesSummary(row, key) {
  const active = !rankInfo(row).excluded;
  if (key === 'di') return active && row.action_owner === 'dominion1st_di' && row.readiness === 'ready';
  if (key === 'mine') return active && row.action_owner === 'pastor_michael';
  if (key === 'blocked') return active && (row.readiness === 'blocked' || norm(row.status) === 'blocked');
  if (key === 'follow') return active && row.next_follow_up_date && new Date(row.next_follow_up_date) <= new Date();
  if (key === 'verify') return ['awaiting_verification', 'legacy_complete_review_required', 'verification_failed'].includes(row.verification_status);
  if (key === 'wip') return active && ['active', 'in_progress'].includes(norm(row.status));
  return true;
}

class CompactGrid {
  constructor({ container, search, rows, kind }) {
    this.container = document.querySelector(container);
    this.search = document.querySelector(search);
    this.rows = rows;
    this.kind = kind;
    this.sort = null;
    this.filters = {};
    this.menu = null;
    this.search.addEventListener('input', () => this.render());
    this.render();
  }

  filtered() {
    const q = this.search.value.trim().toLowerCase();
    let data = this.rows.filter(row =>
      (!summaryFilter || matchesSummary(row, summaryFilter)) &&
      Object.entries(this.filters).every(([key, value]) => {
        const column = columns.find(c => c.key === key);
        return !column || String(columnValue(column, row)) === String(value);
      }) &&
      (!q || columns.some(c => String(columnDisplay(c, row)).toLowerCase().includes(q)) || String(row.notes || row.description || '').toLowerCase().includes(q))
    );
    if (this.sort) {
      const column = columns.find(c => c.key === this.sort.key);
      const direction = this.sort.direction === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) => String(columnValue(column, a)).localeCompare(String(columnValue(column, b)), undefined, { numeric: true, sensitivity: 'base' }) * direction);
    }
    return data;
  }

  closeMenu() {
    this.menu?.remove();
    this.menu = null;
  }

  openMenu(column, header) {
    this.closeMenu();
    const menu = document.createElement('div');
    menu.className = 'dims-grid-menu';

    if (column.sortable !== false) {
      const sortLabel = document.createElement('span');
      sortLabel.className = 'menu-label';
      sortLabel.textContent = 'Sort';
      menu.appendChild(sortLabel);
      [['Sort A → Z', 'asc'], ['Sort Z → A', 'desc']].forEach(([text, direction]) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = () => { this.sort = { key: column.key, direction }; this.closeMenu(); this.render(); };
        menu.appendChild(button);
      });
    }

    if (column.filterable !== false) {
      const divider = document.createElement('div');
      divider.className = 'menu-divider';
      menu.appendChild(divider);
      const filterLabel = document.createElement('span');
      filterLabel.className = 'menu-label';
      filterLabel.textContent = `Filter ${column.label}`;
      menu.appendChild(filterLabel);

      const all = document.createElement('button');
      all.textContent = `All ${column.label}`;
      all.onclick = () => { delete this.filters[column.key]; this.closeMenu(); this.render(); };
      menu.appendChild(all);

      const seen = new Map();
      this.rows.forEach(row => {
        const value = String(columnValue(column, row));
        if (!seen.has(value)) seen.set(value, columnDisplay(column, row) || '—');
      });
      [...seen.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]), undefined, { numeric: true, sensitivity: 'base' })).forEach(([value, text]) => {
        const option = document.createElement('label');
        option.className = 'filter-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `filter-${this.kind}-${column.key}`;
        radio.checked = String(this.filters[column.key] ?? '') === value;
        radio.onchange = () => { this.filters[column.key] = value; this.closeMenu(); this.render(); };
        const span = document.createElement('span');
        span.textContent = text;
        option.append(radio, span);
        menu.appendChild(option);
      });
    }

    document.body.appendChild(menu);
    const rect = header.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - menu.offsetWidth - 12))}px`;
    menu.style.top = `${Math.min(rect.bottom + 5, innerHeight - menu.offsetHeight - 12)}px`;
    this.menu = menu;
  }

  render() {
    const data = this.filtered();
    this.container.innerHTML = '';
    if (!data.length) {
      this.container.innerHTML = '<div class="dims-grid-empty">No matching records found.</div>';
      return;
    }
    const table = document.createElement('table');
    table.className = 'dims-grid';
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach(column => {
      const th = document.createElement('th');
      const header = document.createElement('span');
      header.className = 'dims-grid-header';
      const active = Object.prototype.hasOwnProperty.call(this.filters, column.key) ? ' •' : '';
      header.innerHTML = `<span>${esc(column.label)}${active}</span>${column.filterable !== false || column.sortable !== false ? '<span class="dims-grid-arrow">▾</span>' : ''}`;
      if (column.filterable !== false || column.sortable !== false) header.onclick = e => { e.stopPropagation(); this.openMenu(column, header); };
      th.appendChild(header);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.onclick = e => {
        if (e.target.closest('.rac-brief,.rac-guide-link')) return;
        openDrawer(this.kind, row.id, e.target);
      };
      tr.onkeydown = e => {
        if (e.target.closest('.rac-brief,.rac-guide-link')) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(this.kind, row.id, tr); }
      };
      columns.forEach(column => {
        const td = document.createElement('td');
        td.dataset.label = column.label;
        td.innerHTML = column.render ? column.render(row) : esc(columnDisplay(column, row));
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const wrapper = document.createElement('div');
    wrapper.className = 'dims-grid-wrap';
    wrapper.appendChild(table);
    this.container.appendChild(wrapper);
  }
}

const summaryDefs = [
  ['di', '🚀 Ready for DI execution'],
  ['mine', '👑 Pastor H. Michael Daniels action'],
  ['blocked', '⛔ Blocked items'],
  ['follow', '⏰ Follow-ups due'],
  ['verify', '🔎 Awaiting verification'],
  ['wip', '🏗️ Started / WIP']
];

function renderSummary() {
  const all = [...projects, ...tasks];
  byId('accountabilitySummary').innerHTML = summaryDefs.map(([key, label]) =>
    `<button class="accountability-item ${summaryFilter === key ? 'active' : ''}" data-summary="${key}"><strong>${all.filter(r => matchesSummary(r, key)).length}</strong><span>${label}</span></button>`
  ).join('');
  document.querySelectorAll('[data-summary]').forEach(button => button.onclick = () => {
    summaryFilter = button.dataset.summary;
    byId('activeFilterText').textContent = `Showing: ${button.querySelector('span').textContent}`;
    byId('activeFilter').classList.add('show');
    projectGrid.render(); taskGrid.render(); renderSummary();
  });
}

byId('clearSummaryFilter').onclick = () => {
  summaryFilter = null;
  byId('activeFilter').classList.remove('show');
  projectGrid.render(); taskGrid.render(); renderSummary();
};

function field(label, value, full = false) {
  return `<div class="detail-field ${full ? 'full' : ''}"><dt>${esc(label)}</dt><dd>${esc(value || '—')}</dd></div>`;
}

async function historyFor(kind, row) {
  const column = kind === 'project' ? 'project_id' : 'task_id';
  const { data } = await sb.from('tetelestai_follow_up_history').select('*').eq(column, row.id).order('follow_up_date', { ascending: false }).limit(20);
  return data || [];
}

function historyHtml(items) {
  if (!items.length) return '<p class="identity-note">No append-only follow-up entries recorded yet.</p>';
  return items.map(item => `<div class="history-item"><strong>${fmt(item.follow_up_date)} — ${esc(item.action_taken)}</strong><div>${esc(item.results)}</div>${item.next_action ? `<div><b>Next:</b> ${esc(item.next_action)}</div>` : ''}</div>`).join('');
}

async function addFollowUp(kind, row) {
  const action_taken = prompt('Follow-up action taken:'); if (!action_taken) return;
  const results = prompt('Results / current condition:'); if (!results) return;
  const next_action = prompt('Next action (optional):', row.next_action || '') || null;
  const next_follow_up_date = prompt('Next follow-up date YYYY-MM-DD (optional):', row.next_follow_up_date || '') || null;
  try {
    await control('follow_up', kind, row, { action_taken, results, next_action, next_follow_up_date, progress_percent: Number(row.percent_complete) || 0 });
    await load(); await openDrawer(kind, row.id, byId('drawerClose'));
  } catch (error) { alert(error.message); }
}

async function editCurrent(kind, row) {
  const status = prompt('Status:', row.status || 'open'); if (status === null) return;
  const priority = prompt('Priority (high / medium / low):', row.priority || 'medium'); if (priority === null) return;
  const next_action = prompt('Next executable action:', row.next_action || ''); if (next_action === null) return;
  const reason = prompt('Reason for this controlled update:'); if (!reason) return alert('A reason is required so the audit trail remains meaningful.');
  try {
    await control('update_current', kind, row, { fields: { status, priority, next_action }, reason });
    await load(); await openDrawer(kind, row.id, byId('drawerClose'));
  } catch (error) { alert(error.message); }
}

async function saveRac(kind, row, assessment) {
  const rationale = prompt('Optional assessment rationale:') || null;
  try {
    await control('user_rac', kind, row, { severity: assessment.severity, probability: assessment.probability, rationale });
    alert(`User RAC ${assessment.rac} saved. System RAC remains authoritative.`);
  } catch (error) { alert(error.message); }
}

async function challengeRac(kind, row, assessment) {
  const rationale = prompt(`Why should System RAC ${row.system_rac || 'Not assessed'} be reviewed against your RAC ${assessment.rac}?`);
  if (!rationale) return;
  try {
    await control('challenge_rac', kind, row, { severity: assessment.severity, probability: assessment.probability, rationale });
    alert('RAC challenge submitted for governed review. The System RAC has not changed.');
  } catch (error) { alert(error.message); }
}

async function openDrawer(kind, id, source) {
  const row = (kind === 'project' ? projects : tasks).find(item => item.id === id);
  if (!row) return;
  lastFocus = source instanceof HTMLElement ? source : document.activeElement;
  const history = await historyFor(kind, row);
  const related = kind === 'project' ? tasks.filter(t => t.project_id === row.id).map(t => `${t.task_number || '—'} — ${t.title}`).join('\n') : '—';
  const impact = DIMS_IMPACT[impactScore(row)];
  const disclosure = deaPriorityDisclosure(row, rankInfo(row));

  byId('drawerKind').textContent = kind === 'project' ? 'PROJECT DETAILS' : 'TASK DETAILS';
  byId('drawerTitle').textContent = row.title;
  byId('drawerContent').innerHTML = `<dl class="detail-grid">
    ${field('Permanent number', row.project_number || row.task_number)}
    ${field('Execution rank', row._rank)}
    ${field('RAC', row.system_rac ? `${racNotation(row)} — ${RAC_BAND[Number(row.system_rac)] || ''}` : 'Not assessed')}
    ${field('Severity', row.risk_severity || 'Not assessed')}
    ${field('Probability', row.risk_probability || 'Not assessed')}
    ${field('Impact', impact ? `${impactScore(row)} — ${impact.label}` : 'Not assessed')}
    ${field('DEA rank basis', disclosure.reason)}
    ${field('Date entered', fmt(row.created_at))}
    ${field('Priority', row.priority)}
    ${field('Status', displayStatus(row))}
    ${field('Action owner', OWNER[row.action_owner] || row.action_owner)}
    ${field('Readiness', row.readiness)}
    ${field('Next follow-up date', fmt(row.next_follow_up_date))}
    ${field('Progress', `${Number(row.percent_complete) || 0}%`)}
    ${field('Follow-up interval', `${row.follow_up_interval_days || 30} days`)}
    ${field('Complete description', row.description, true)}
    ${field('Full notes', row.notes, true)}
    ${field('Exact next executable action', row.next_action, true)}
    ${field('Project tasks/subtasks', related, true)}
    ${field('Dependencies', row.dependencies || 'Not recorded', true)}
  </dl>
  <section class="control-block"><div class="control-title">DEA™ RISK ASSESSMENT MATRIX</div>${renderDeaRiskMatrix(row.risk_severity || '', row.risk_probability || '')}</section>
  <section class="control-block"><div class="control-title">FOLLOW-UP / ACTION HISTORY</div><div class="control-actions"><button type="button" data-add-followup>+ Add Follow-Up</button><button type="button" data-edit-current>Edit Current Record</button></div>${historyHtml(history)}</section>
  <section class="control-block"><div class="control-title">COMPLETION & VERIFICATION</div>${field('Reported complete', row.reported_complete_at ? fmt(row.reported_complete_at) : 'Not reported')}${field('Verification status', row.verification_status)}${field('Verification evidence', row.verification_evidence, true)}</section>
  <p class="identity-note">Permanent facts remain locked. Current conditions are controlled-editable. Historical actions are append-only.</p>`;

  activateRacAssessment(byId('drawerContent'), {
    onSave: assessment => saveRac(kind, row, assessment),
    onChallenge: assessment => challengeRac(kind, row, assessment)
  });
  byId('drawerContent').querySelector('[data-add-followup]').onclick = () => addFollowUp(kind, row);
  byId('drawerContent').querySelector('[data-edit-current]').onclick = () => editCurrent(kind, row);
  byId('drawerBackdrop').classList.add('open');
  byId('drawerBackdrop').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => byId('drawerClose').focus(), 0);
}

function closeDrawer() {
  byId('drawerBackdrop').classList.remove('open');
  byId('drawerBackdrop').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocus?.focus();
}

byId('drawerClose').onclick = closeDrawer;
byId('drawerBackdrop').onclick = event => { if (event.target === byId('drawerBackdrop')) closeDrawer(); };
document.addEventListener('keydown', event => { if (event.key === 'Escape' && byId('drawerBackdrop').classList.contains('open')) closeDrawer(); });

document.addEventListener('click', event => {
  if (!event.target.closest('.dims-grid-menu') && !event.target.closest('.dims-grid-header')) {
    projectGrid?.closeMenu();
    taskGrid?.closeMenu();
  }
});

function renderLoadFailure(error) {
  clearTimeout(window.__tetelestaiInitTimer);
  const detail = esc(error?.message || String(error || 'Unknown initialization failure'));
  byId('projectsList').classList.remove('loading');
  byId('tasksList').classList.remove('loading');
  byId('projectsList').innerHTML = `Unable to load Projects: ${detail}`;
  byId('tasksList').innerHTML = `Unable to load Tasks: ${detail}`;
  byId('accountabilitySummary').innerHTML = `<div class="loading">Unable to load accountability: ${detail}</div>`;
}

async function load() {
  try {
    const [{ data: p, error: pe }, { data: t, error: te }] = await Promise.all([
      sb.from('projects').select('*'),
      sb.from('tasks').select('*')
    ]);
    if (pe || te) throw pe || te;
    projects = ranked(p || []);
    tasks = ranked(t || []);
    byId('projCount').textContent = `(${projects.length})`;
    byId('taskCount').textContent = `(${tasks.length})`;
    projectGrid = new CompactGrid({ container: '#projectsList', search: '#projectSearch', rows: projects, kind: 'project' });
    taskGrid = new CompactGrid({ container: '#tasksList', search: '#taskSearch', rows: tasks, kind: 'task' });
    renderSummary();
    clearTimeout(window.__tetelestaiInitTimer);
  } catch (error) {
    renderLoadFailure(error);
  }
}

window.saveProject = async () => {
  const title = byId('p_title').value.trim();
  if (!title) return byId('pMsg').textContent = 'Title required.';
  const { error } = await sb.from('projects').insert({ title, description: byId('p_desc').value, status: byId('p_status').value, priority: byId('p_priority').value, stream: byId('p_stream').value });
  byId('pMsg').textContent = error ? `Error: ${error.message}` : 'Saved ✅';
  if (!error) load();
};

window.saveTask = async () => {
  const title = byId('t_title').value.trim();
  if (!title) return byId('tMsg').textContent = 'Title required.';
  const { error } = await sb.from('tasks').insert({ title, notes: byId('t_notes').value, status: byId('t_status').value, priority: byId('t_priority').value });
  byId('tMsg').textContent = error ? `Error: ${error.message}` : 'Saved ✅';
  if (!error) load();
};

load();