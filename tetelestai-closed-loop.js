import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
let projects = [];
let tasks = [];
let lastFocus = null;

const byId = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character])
);
const norm = value => String(value || '').toLowerCase().replaceAll(' ', '_');
const fmt = value => value
  ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString()
  : '—';
const ageDays = value => value
  ? Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  : 0;

function priorityBadge(value) {
  if (norm(value) === 'high') return '<span class="badge badge-amber">👑 High</span>';
  if (norm(value) === 'low') return '<span class="badge badge-grey">⚔️ Low</span>';
  return '<span class="badge badge-blue">🛡️ Medium</span>';
}

function statusBadge(value) {
  const normalized = norm(value);
  const color = normalized.includes('progress') || normalized === 'active'
    ? 'amber'
    : normalized.includes('complete') || normalized === 'verified_closed'
      ? 'blue'
      : normalized === 'blocked' || normalized === 'deferred'
        ? 'grey'
        : 'green';
  return `<span class="badge badge-${color}">${esc(String(value || 'open').replaceAll('_', ' '))}</span>`;
}

function progress(value) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="progress-bar"><div class="progress-fill" style="width:${percent}%"></div></div><span class="row-meta">${percent}%</span>`;
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
  const add = (points, label) => {
    score += points;
    if (points) reasons.push(label);
  };
  add({ high: 300, medium: 200, low: 100 }[norm(row.priority)] || 0, 'priority');
  add(['active', 'in_progress'].includes(status) ? 120 : 0, 'WIP');
  const due = row.target_date
    ? Math.ceil((new Date(row.target_date) - new Date()) / 86400000)
    : null;
  add(due !== null && due < 0 ? 160 + Math.min(60, -due) : due !== null && due <= 7 ? 120 : 0, 'deadline');
  const follow = row.next_follow_up_date
    ? Math.ceil((new Date(row.next_follow_up_date) - new Date()) / 86400000)
    : null;
  add(follow !== null && follow <= 0 ? 140 + Math.min(60, -follow) : 0, 'follow-up');
  add({ critical: 140, high: 100, normal: 30, low: 0 }[norm(row.risk_level)] || 0, 'risk');
  add(row.readiness === 'ready' ? 70 : row.readiness === 'blocked' ? -160 : -60, 'readiness');
  add(Math.min(45, Math.max(0, ageDays(row.created_at)) / 7), 'age');
  add(row.action_owner === 'dominion1st_di' && row.readiness === 'ready' ? 70 : 0, 'DI-ready');
  add(row.action_owner === 'pastor_michael' ? 40 : 0, 'manual action');
  return { score, reason: reasons.slice(0, 3).join(' + ') || 'Standard queue' };
}

export function ranked(rows) {
  const active = rows
    .map(row => ({ row, rank: rankInfo(row) }))
    .filter(item => !item.rank.excluded)
    .sort((a, b) => {
      if (a.rank.override !== b.rank.override) return a.rank.override ? -1 : 1;
      if (a.rank.override) return a.row.queue_position - b.row.queue_position;
      return b.rank.score - a.rank.score;
    });
  active.forEach((item, index) => { item.row._rank = index + 1; });
  const excluded = rows
    .filter(row => rankInfo(row).excluded)
    .map(row => Object.assign(row, { _rank: '—' }));
  return [...active.map(item => item.row), ...excluded];
}

function rankCell(row) {
  return `<span class="rank">${esc(row._rank)}</span><span class="rank-reason">${esc(rankInfo(row).reason)}</span>`;
}

function titleCell(row) {
  const next = row.next_action || 'No next action recorded';
  return `<button class="title-button" data-detail="${esc(row.id)}">${esc(row.title)}</button><span class="next-preview" title="${esc(next)}">${esc(next)}</span>`;
}

function nextDue(row) {
  const isFollowUp = Boolean(row.next_follow_up_date);
  return `${fmt(row.next_follow_up_date || row.target_date)}<span class="rank-reason">${isFollowUp ? 'Follow-up' : 'Target'}</span>`;
}

const columns = [
  { key: '_rank', label: 'Rank', render: rankCell },
  { key: 'number', label: 'Number', value: row => row.project_number || row.task_number || '—', render: row => `<span class="permanent-number">${esc(row.project_number || row.task_number || '—')}</span>` },
  { key: 'title', label: 'Project/Task', value: row => `${row.title} ${row.next_action || ''}`, render: titleCell },
  { key: 'status', label: 'Status', render: row => statusBadge(row.verification_status === 'verified_closed' ? 'verified_closed' : row.status) },
  { key: 'priority', label: 'Priority', render: row => priorityBadge(row.priority) },
  { key: 'action_owner', label: 'Owner', value: row => OWNER[row.action_owner] || row.action_owner, render: row => esc(OWNER[row.action_owner] || row.action_owner || '—') },
  { key: 'next_follow_up_date', label: 'Next/Due', value: row => row.next_follow_up_date || row.target_date || '', render: nextDue },
  { key: 'percent_complete', label: 'Progress', render: row => progress(row.percent_complete) },
  { key: 'view', label: 'View', render: row => `<button class="view-button" data-detail="${esc(row.id)}" aria-label="View ${esc(row.title)}">View</button>` }
];

class CompactGrid {
  constructor({ container, search, rows, kind }) {
    this.container = document.querySelector(container);
    this.search = document.querySelector(search);
    this.rows = rows;
    this.kind = kind;
    this.sort = null;
    this.menu = null;
    this.search.addEventListener('input', () => this.render());
    this.render();
  }

  value(row, column) {
    return typeof column.value === 'function' ? column.value(row) : row[column.key] ?? '';
  }

  filtered() {
    const query = this.search.value.trim().toLowerCase();
    let data = this.rows.filter(row =>
      !query ||
      columns.some(column => String(this.value(row, column)).toLowerCase().includes(query)) ||
      String(row.notes || row.description || '').toLowerCase().includes(query)
    );
    if (this.sort) {
      const column = columns.find(item => item.key === this.sort.key);
      const direction = this.sort.direction === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) =>
        String(this.value(a, column)).localeCompare(
          String(this.value(b, column)),
          undefined,
          { numeric: true, sensitivity: 'base' }
        ) * direction
      );
    }
    return data;
  }

  openMenu(column, header) {
    this.menu?.remove();
    const menu = document.createElement('div');
    menu.className = 'dims-grid-menu';
    [['Sort A → Z', 'asc'], ['Sort Z → A', 'desc']].forEach(([label, direction]) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.onclick = () => {
        this.sort = { key: column.key, direction };
        menu.remove();
        this.render();
      };
      menu.appendChild(button);
    });
    document.body.appendChild(menu);
    const rect = header.getBoundingClientRect();
    menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - menu.offsetWidth - 12))}px`;
    menu.style.top = `${rect.bottom + 5}px`;
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
      header.innerHTML = `<span>${esc(column.label)}</span><span class="dims-grid-arrow">▾</span>`;
      header.onclick = event => {
        event.stopPropagation();
        this.openMenu(column, header);
      };
      th.appendChild(header);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.tabIndex = 0;
      tr.setAttribute('aria-label', `Open ${this.kind} ${row.title}`);
      tr.onclick = event => openDrawer(this.kind, row.id, event.target);
      tr.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDrawer(this.kind, row.id, tr);
        }
      };
      columns.forEach(column => {
        const td = document.createElement('td');
        td.dataset.label = column.label;
        td.innerHTML = column.render
          ? column.render(row)
          : esc(this.value(row, column));
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

function renderSummary() {
  const all = [...projects, ...tasks];
  const active = all.filter(row => !rankInfo(row).excluded);
  const stats = [
    ['🚀 Ready for DI execution', active.filter(row => row.action_owner === 'dominion1st_di' && row.readiness === 'ready').length],
    ['👑 Pastor H. Michael Daniels action', active.filter(row => row.action_owner === 'pastor_michael').length],
    ['⛔ Blocked items', active.filter(row => row.readiness === 'blocked' || norm(row.status) === 'blocked').length],
    ['⏰ Follow-ups due', active.filter(row => row.next_follow_up_date && new Date(row.next_follow_up_date) <= new Date()).length],
    ['🔎 Awaiting verification', all.filter(row => ['awaiting_verification', 'legacy_complete_review_required', 'verification_failed'].includes(row.verification_status)).length],
    ['🏗️ Started / WIP', active.filter(row => ['active', 'in_progress'].includes(norm(row.status))).length]
  ];
  byId('accountabilitySummary').innerHTML = stats
    .map(([label, count]) => `<div class="accountability-item"><strong>${count}</strong><span>${label}</span></div>`)
    .join('');
}

function field(label, value, full = false) {
  return `<div class="detail-field ${full ? 'full' : ''}"><dt>${esc(label)}</dt><dd>${esc(value || '—')}</dd></div>`;
}

function openDrawer(kind, id, source) {
  const row = (kind === 'project' ? projects : tasks).find(item => item.id === id);
  if (!row) return;
  lastFocus = source instanceof HTMLElement ? source : document.activeElement;
  byId('drawerKind').textContent = kind === 'project' ? 'PROJECT DETAILS' : 'TASK DETAILS';
  byId('drawerTitle').textContent = row.title;
  const related = kind === 'project'
    ? tasks.filter(task => task.project_id === row.id).map(task => `${task.task_number || '—'} — ${task.title}`).join('\n')
    : '—';
  const verified = [row.verified_by, row.verified_at ? fmt(row.verified_at) : null].filter(Boolean).join(' — ');
  const effectiveness = [row.effectiveness_review_date ? fmt(row.effectiveness_review_date) : null, row.effectiveness_status].filter(Boolean).join(' — ');
  byId('drawerContent').innerHTML = `<dl class="detail-grid">
    ${field('Permanent number', row.project_number || row.task_number)}
    ${field('Execution rank', row._rank)}
    ${field('Priority', row.priority)}
    ${field('Status', row.status)}
    ${field('Action owner', OWNER[row.action_owner] || row.action_owner)}
    ${field('Readiness', row.readiness)}
    ${field('Risk level', row.risk_level)}
    ${field('Start date', fmt(row.start_date))}
    ${field('Target date', fmt(row.target_date))}
    ${field('Next follow-up date', fmt(row.next_follow_up_date))}
    ${field('Progress', `${Number(row.percent_complete) || 0}%`)}
    ${field('Follow-up interval', `${row.follow_up_interval_days || 30} days`)}
    ${field('Complete description', row.description, true)}
    ${field('Full notes', row.notes, true)}
    ${field('Exact next executable action', row.next_action, true)}
    ${field('Project tasks/subtasks', related, true)}
    ${field('Dependencies', row.dependencies || 'Not recorded', true)}
    ${field('Follow-up history', row.last_follow_up_date ? `Last follow-up: ${fmt(row.last_follow_up_date)}` : 'No follow-up recorded', true)}
    ${field('Reported complete', row.reported_complete_at ? fmt(row.reported_complete_at) : 'Not reported')}
    ${field('Verification status', row.verification_status)}
    ${field('Verification evidence', row.verification_evidence, true)}
    ${field('Verified by / date', verified)}
    ${field('Effectiveness review', effectiveness)}
    ${field('Origin / audit context', row.origin || 'DIMS-v3 canonical record', true)}
    ${field('Related documents/links', row.related_links || 'None recorded', true)}
  </dl><p class="identity-note">✝️ Faithman is the platform identity for Pastor H. Michael Daniels, not a separate action owner.</p>`;
  byId('drawerBackdrop').classList.add('open');
  byId('detailDrawer').dataset.selected = 'true';
  byId('detailDrawer').dataset.recordId = row.id;
  byId('drawerBackdrop').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => byId('drawerClose').focus(), 0);
}

function closeDrawer() {
  byId('drawerBackdrop').classList.remove('open');
  byId('drawerBackdrop').setAttribute('aria-hidden', 'true');
  delete byId('detailDrawer').dataset.selected;
  delete byId('detailDrawer').dataset.recordId;
  document.body.style.overflow = '';
  lastFocus?.focus();
}

byId('drawerClose').onclick = closeDrawer;
byId('drawerBackdrop').onclick = event => {
  if (event.target === byId('drawerBackdrop')) closeDrawer();
};
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && byId('drawerBackdrop').classList.contains('open')) closeDrawer();
  if (event.key !== 'Tab' || !byId('drawerBackdrop').classList.contains('open')) return;
  const focusable = [...byId('detailDrawer').querySelectorAll('button,[href],input,select,[tabindex]:not([tabindex="-1"])')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

async function load() {
  const [{ data: projectRows, error: projectError }, { data: taskRows, error: taskError }] = await Promise.all([
    sb.from('projects').select('*'),
    sb.from('tasks').select('*')
  ]);
  if (projectError || taskError) {
    const message = esc(projectError?.message || taskError?.message);
    byId('projectsList').innerHTML = `<span class="loading">${message}</span>`;
    byId('tasksList').innerHTML = `<span class="loading">${message}</span>`;
    return;
  }
  projects = ranked(projectRows || []);
  tasks = ranked(taskRows || []);
  byId('projCount').textContent = `(${projects.length})`;
  byId('taskCount').textContent = `(${tasks.length})`;
  new CompactGrid({ container: '#projectsList', search: '#projectSearch', rows: projects, kind: 'project' });
  new CompactGrid({ container: '#tasksList', search: '#taskSearch', rows: tasks, kind: 'task' });
  renderSummary();
  const requestedNumber = decodeURIComponent(location.hash.slice(1));
  if (requestedNumber) {
    const project = projects.find(row => row.project_number === requestedNumber);
    const task = tasks.find(row => row.task_number === requestedNumber);
    if (project) openDrawer('project', project.id, document.activeElement);
    else if (task) openDrawer('task', task.id, document.activeElement);
  }
}

window.saveProject = async function saveProject() {
  const title = byId('p_title').value.trim();
  if (!title) {
    byId('pMsg').textContent = 'Title required.';
    return;
  }
  const { error } = await sb.from('projects').insert({
    title,
    description: byId('p_desc').value,
    status: byId('p_status').value,
    priority: byId('p_priority').value,
    stream: byId('p_stream').value
  });
  byId('pMsg').textContent = error ? `Error: ${error.message}` : 'Saved ✅';
  if (!error) load();
};

window.saveTask = async function saveTask() {
  const title = byId('t_title').value.trim();
  if (!title) {
    byId('tMsg').textContent = 'Title required.';
    return;
  }
  const { error } = await sb.from('tasks').insert({
    title,
    notes: byId('t_notes').value,
    status: byId('t_status').value,
    priority: byId('t_priority').value
  });
  byId('tMsg').textContent = error ? `Error: ${error.message}` : 'Saved ✅';
  if (!error) load();
};

load();
