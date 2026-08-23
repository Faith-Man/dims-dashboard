import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderDeaRiskMatrix } from './dea-risk-matrix.js';
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
const RAC_BAND = { 1: 'Extremely High', 2: 'High', 3: 'Serious', 4: 'Medium', 5: 'Low' };

let projects = [];
let tasks = [];
let projectGrid;
let taskGrid;
let summaryFilter = null;
let lastFocus = null;
let racHoverHideTimer = null;

const byId = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const norm = value => String(value || '').trim().toLowerCase().replaceAll(' ', '_');
const fmt = value => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString() : '—';
const ageDays = value => value ? Math.floor((Date.now() - new Date(value).getTime()) / 86400000) : 0;

function ensureUiStyles() {
  if (document.getElementById('tetelestaiAuthoritativeUiStyles')) return;
  const style = document.createElement('style');
  style.id = 'tetelestaiAuthoritativeUiStyles';
  style.textContent = `
    .rac-trigger{border:0;background:transparent;padding:2px 3px;color:#0c1475;font:inherit;font-weight:850;cursor:pointer;white-space:nowrap}.rac-trigger:hover,.rac-trigger:focus{outline:2px solid #1687ff;outline-offset:2px;border-radius:4px}.rac-na{color:#0c1475;font-weight:850}
    .rac-hover-pop{position:fixed;z-index:14500;width:min(330px,calc(100vw - 24px));padding:12px 14px;border:2px solid #0879ff;border-radius:12px;background:#fff;color:#172033;box-shadow:0 14px 34px rgba(11,23,51,.26);pointer-events:auto;cursor:pointer}.rac-hover-pop::before{content:'';position:absolute;top:50%;left:-8px;width:14px;height:14px;background:#fff;border-left:2px solid #0879ff;border-bottom:2px solid #0879ff;transform:translateY(-50%) rotate(45deg)}.rac-hover-pop.flip::before{left:auto;right:-8px;border-left:0;border-bottom:0;border-right:2px solid #0879ff;border-top:2px solid #0879ff}.rac-hover-pop h3{margin:0 0 5px;color:#0c1475;font-size:.9rem}.rac-hover-pop .code{font-size:.95rem;font-weight:900;color:#0879ff;margin-bottom:5px}.rac-hover-pop p{margin:4px 0;font-size:.74rem;line-height:1.4}.rac-hover-pop .action{font-weight:900;color:#0879ff}
    .rac-brief-box{border:2px solid #1687ff;border-radius:14px;background:linear-gradient(180deg,#fff,#f3f9ff);padding:16px;margin-bottom:16px}.rac-brief-box h3{margin:0 0 8px;color:#0c1475}.rac-brief-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0}.rac-brief-item{border:1px solid #bdd8fb;border-radius:9px;background:#fff;padding:10px}.rac-brief-item b{display:block;color:#0c1475;font-size:.72rem;text-transform:uppercase;margin-bottom:3px}.rac-full-guide-link{display:inline-block;margin-top:8px;border:1px solid #1687ff;border-radius:8px;padding:8px 12px;color:#0757c9;font-weight:900;text-decoration:none}.rac-full-guide-link:hover{background:#eef7ff}
    .epi-priority{min-width:145px;max-width:220px;position:relative;padding:5px 1px 0}.epi-priority-track{height:24px;padding:3px;display:grid;grid-template-columns:repeat(5,1fr);gap:1px;position:relative;overflow:visible;border:2px solid #10234b;border-radius:999px;background:linear-gradient(180deg,#18396f 0%,#061734 48%,#12346b 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.48),inset 0 -3px 6px rgba(0,0,0,.5),0 3px 9px rgba(6,18,43,.3),0 0 8px rgba(28,109,255,.2)}.epi-priority-seg{height:18px;min-width:0;position:relative;opacity:.72;box-shadow:inset 0 3px 3px rgba(255,255,255,.48),inset 0 -3px 4px rgba(0,0,0,.2)}.epi-priority-seg:first-child{border-radius:999px 3px 3px 999px}.epi-priority-seg:last-of-type{border-radius:3px 999px 999px 3px}.epi-priority-seg[data-band="extreme"]{background:linear-gradient(180deg,#ff5560 0%,#f20d22 48%,#a80012 100%)}.epi-priority-seg[data-band="high"]{background:linear-gradient(180deg,#ffb347 0%,#ff7310 50%,#d34c00 100%)}.epi-priority-seg[data-band="serious"]{background:linear-gradient(180deg,#fff36d 0%,#f5c612 50%,#c99c00 100%)}.epi-priority-seg[data-band="medium"]{background:linear-gradient(180deg,#7cff99 0%,#20c655 50%,#087f31 100%)}.epi-priority-seg[data-band="low"]{background:linear-gradient(180deg,#6ac4ff 0%,#1979ff 50%,#1637cb 100%)}.epi-priority-marker{position:absolute;top:-9px;width:7px;height:35px;border-radius:999px;background:linear-gradient(90deg,#c9ebff,#fff 42%,#fff 58%,#c9ebff);border:1px solid #38a6ff;box-shadow:0 0 0 2px rgba(255,255,255,.92),0 0 10px 4px rgba(0,160,255,.95),0 0 22px 8px rgba(0,110,255,.42);transform:translateX(-50%);pointer-events:none}.epi-priority-label{display:block;margin-top:4px;text-align:center;font-size:.66rem;font-weight:950;letter-spacing:.055em;color:#0c1475;white-space:nowrap}.epi-priority[data-level="extreme"] .epi-priority-marker{left:10%}.epi-priority[data-level="high"] .epi-priority-marker{left:30%}.epi-priority[data-level="serious"] .epi-priority-marker{left:50%}.epi-priority[data-level="medium"] .epi-priority-marker{left:70%}.epi-priority[data-level="low"] .epi-priority-marker{left:90%}.epi-priority[data-level="extreme"] [data-band="extreme"],.epi-priority[data-level="high"] [data-band="high"],.epi-priority[data-level="serious"] [data-band="serious"],.epi-priority[data-level="medium"] [data-band="medium"],.epi-priority[data-level="low"] [data-band="low"]{opacity:1;filter:saturate(1.2) brightness(1.1);box-shadow:inset 0 3px 3px rgba(255,255,255,.6),inset 0 -3px 4px rgba(0,0,0,.16),0 0 12px rgba(255,255,255,.48)}
    @media(max-width:900px){.rac-hover-pop{display:none!important}.rac-brief-grid{grid-template-columns:1fr}.epi-priority{max-width:215px}}
  `;
  document.head.appendChild(style);
}
ensureUiStyles();

function racNotation(row) {
  if (!row.system_rac) return '—';
  if (row.risk_severity && row.risk_probability) return `${row.system_rac} (${row.risk_severity}, ${row.risk_probability})`;
  return String(row.system_rac);
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

function sourcePriorityLevel(value) {
  const v = norm(value);
  if (v === 'high') return 'high';
  if (v === 'low') return 'low';
  return 'medium';
}
function priorityLevel(row) {
  const rac = Number(row.system_rac);
  if (rac >= 1 && rac <= 5) return ({1:'extreme',2:'high',3:'serious',4:'medium',5:'low'})[rac];
  return sourcePriorityLevel(row.priority);
}
function priorityLabel(level) {
  return ({extreme:'EXTREMELY HIGH',high:'HIGH',serious:'SERIOUS',medium:'MEDIUM',low:'LOW'})[level] || 'MEDIUM';
}
function priorityInstrument(row) {
  const level = priorityLevel(row);
  return `<div class="epi-priority" data-level="${level}" role="img" aria-label="Priority ${priorityLabel(level)}"><div class="epi-priority-track"><span class="epi-priority-seg" data-band="extreme"></span><span class="epi-priority-seg" data-band="high"></span><span class="epi-priority-seg" data-band="serious"></span><span class="epi-priority-seg" data-band="medium"></span><span class="epi-priority-seg" data-band="low"></span><span class="epi-priority-marker" aria-hidden="true"></span></div><span class="epi-priority-label">${priorityLabel(level)}</span></div>`;
}

function progress(value) {
  const p = Math.max(0, Math.min(100, Number(value) || 0));
  return `<div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div><span class="row-meta">${p}%</span>`;
}

async function control(action, kind, row, extra = {}) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Please sign in to DOME before making protected changes.');
  const { data, error } = await sb.functions.invoke('tetelestai-control', { body: { action, record_type: kind, record_id: row.id, ...extra } });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function rankInfo(row) {
  const status = norm(row.status);
  if (CLOSED.has(norm(row.verification_status)) || ['cancelled', 'canceled', 'deferred'].includes(status)) return { excluded: true, score: -1, reason: 'Excluded' };
  if (Number.isInteger(row.queue_position)) return { override: true, score: 100000 - row.queue_position, reason: 'Executive override' };
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
  const active = rows.map(row => ({ row, rank: rankInfo(row) })).filter(item => !item.rank.excluded).sort((a, b) => a.rank.override !== b.rank.override ? (a.rank.override ? -1 : 1) : a.rank.override ? a.row.queue_position - b.row.queue_position : b.rank.score - a.rank.score);
  active.forEach((item, index) => { item.row._rank = index + 1; });
  const excluded = rows.filter(row => rankInfo(row).excluded).map(row => Object.assign(row, { _rank: '—' }));
  return [...active.map(item => item.row), ...excluded];
}

function projectTaskCell(row) {
  return `<div class="title-stack"><button class="title-button">${esc(row.title)}</button><span class="next-preview">${esc(row.next_action || 'No next action recorded')}</span></div>`;
}
function racCell(row) {
  return `<button class="rac-trigger" type="button" aria-label="Open RAC brief for ${esc(row.title)}">${esc(racNotation(row))}</button>`;
}

const columns = [
  { key: 'created_at', label: 'Date', value: r => r.created_at ? String(r.created_at).slice(0, 10) : '', display: r => fmt(r.created_at), render: r => fmt(r.created_at) },
  { key: 'number', label: 'Number', value: r => r.project_number || r.task_number || '—', render: r => `<span class="permanent-number">${esc(r.project_number || r.task_number || '—')}</span>` },
  { key: 'title', label: 'Project/Task', value: r => r.title || '', render: projectTaskCell },
  { key: 'system_rac', label: 'RAC', value: r => Number(r.system_rac) || 0, display: r => racNotation(r), render: racCell },
  { key: 'priority', label: 'Priority', value: r => r.priority || 'medium', display: r => String(r.priority || 'medium').replaceAll('_', ' '), render: priorityInstrument },
  { key: 'status', label: 'Status', value: r => displayStatus(r), display: r => displayStatus(r), render: r => statusBadge(r) },
  { key: 'action_owner', label: 'Owner', value: r => r.action_owner || '', display: r => OWNER[r.action_owner] || r.action_owner || '—', render: r => esc(OWNER[r.action_owner] || r.action_owner || '—') },
  { key: 'next_follow_up_date', label: 'Follow-Up', value: r => r.next_follow_up_date || '', display: r => fmt(r.next_follow_up_date), render: r => fmt(r.next_follow_up_date) },
  { key: 'percent_complete', label: 'Progress', value: r => Number(r.percent_complete) || 0, display: r => `${Number(r.percent_complete) || 0}%`, render: r => progress(r.percent_complete) },
  { key: 'view', label: 'View', filterable: false, sortable: false, render: r => `<button class="view-button" type="button" aria-label="View ${esc(r.title)}">View</button>` }
];

function columnValue(column, row) { return typeof column.value === 'function' ? column.value(row) : row[column.key] ?? ''; }
function columnDisplay(column, row) { return typeof column.display === 'function' ? column.display(row) : String(columnValue(column, row)).replaceAll('_', ' '); }

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

function ensureRacHover() {
  let pop = document.getElementById('racHoverPop');
  if (!pop) {
    pop = document.createElement('div');
    pop.id = 'racHoverPop';
    pop.className = 'rac-hover-pop';
    pop.hidden = true;
    pop.addEventListener('mouseenter', () => clearTimeout(racHoverHideTimer));
    pop.addEventListener('mouseleave', hideRacHover);
    pop.addEventListener('click', () => {
      const kind = pop.dataset.kind;
      const id = pop.dataset.id;
      hideRacHover();
      openRacBrief(kind, id, document.activeElement);
    });
    document.body.appendChild(pop);
  }
  return pop;
}
function showRacHover(trigger, kind, row) {
  if (innerWidth <= 900) return;
  clearTimeout(racHoverHideTimer);
  const pop = ensureRacHover();
  const notation = racNotation(row);
  pop.dataset.kind = kind;
  pop.dataset.id = row.id;
  pop.innerHTML = `<h3>Risk Assessment Code (RAC)</h3><div class="code">${esc(notation)}</div><p>DIMS RAC combines Severity and Probability in the governed 5×5 risk model.</p><p class="action">Click to open the RAC Brief.</p>`;
  pop.hidden = false;
  pop.classList.remove('flip');
  const rect = trigger.getBoundingClientRect();
  const width = pop.offsetWidth;
  const height = pop.offsetHeight;
  let left = rect.right + 10;
  if (left + width > innerWidth - 10) { left = rect.left - width - 10; pop.classList.add('flip'); }
  const top = Math.max(10, Math.min(rect.top + rect.height / 2 - height / 2, innerHeight - height - 10));
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
}
function scheduleHideRacHover() { clearTimeout(racHoverHideTimer); racHoverHideTimer = setTimeout(hideRacHover, 180); }
function hideRacHover() { clearTimeout(racHoverHideTimer); const pop = document.getElementById('racHoverPop'); if (pop) pop.hidden = true; }

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
    let data = this.rows.filter(row => (!summaryFilter || matchesSummary(row, summaryFilter)) && Object.entries(this.filters).every(([key, value]) => { const column = columns.find(c => c.key === key); return !column || String(columnValue(column, row)) === String(value); }) && (!q || columns.some(c => String(columnDisplay(c, row)).toLowerCase().includes(q)) || String(row.notes || row.description || '').toLowerCase().includes(q)));
    if (this.sort) {
      const column = columns.find(c => c.key === this.sort.key);
      const direction = this.sort.direction === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) => String(columnValue(column, a)).localeCompare(String(columnValue(column, b)), undefined, { numeric: true, sensitivity: 'base' }) * direction);
    }
    return data;
  }
  closeMenu() { this.menu?.remove(); this.menu = null; }
  openMenu(column, header) {
    this.closeMenu();
    const menu = document.createElement('div');
    menu.className = 'dims-grid-menu';
    if (column.sortable !== false) {
      const label = document.createElement('span'); label.className = 'menu-label'; label.textContent = 'Sort'; menu.appendChild(label);
      [['Sort A → Z','asc'],['Sort Z → A','desc']].forEach(([text,direction]) => { const button = document.createElement('button'); button.textContent = text; button.onclick = () => { this.sort = { key: column.key, direction }; this.closeMenu(); this.render(); }; menu.appendChild(button); });
    }
    if (column.filterable !== false) {
      const divider = document.createElement('div'); divider.className = 'menu-divider'; menu.appendChild(divider);
      const label = document.createElement('span'); label.className = 'menu-label'; label.textContent = `Filter ${column.label}`; menu.appendChild(label);
      const all = document.createElement('button'); all.textContent = `All ${column.label}`; all.onclick = () => { delete this.filters[column.key]; this.closeMenu(); this.render(); }; menu.appendChild(all);
      const seen = new Map();
      this.rows.forEach(row => { const value = String(columnValue(column,row)); if (!seen.has(value)) seen.set(value,columnDisplay(column,row)||'—'); });
      [...seen.entries()].sort((a,b)=>String(a[1]).localeCompare(String(b[1]),undefined,{numeric:true,sensitivity:'base'})).forEach(([value,text]) => { const option=document.createElement('label'); option.className='filter-option'; const radio=document.createElement('input'); radio.type='radio'; radio.name=`filter-${this.kind}-${column.key}`; radio.checked=String(this.filters[column.key]??'')===value; radio.onchange=()=>{this.filters[column.key]=value;this.closeMenu();this.render();}; const span=document.createElement('span'); span.textContent=text; option.append(radio,span); menu.appendChild(option); });
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
    if (!data.length) { this.container.innerHTML = '<div class="dims-grid-empty">No matching records found.</div>'; return; }
    const table = document.createElement('table'); table.className = 'dims-grid';
    const thead = document.createElement('thead'); const headRow = document.createElement('tr');
    columns.forEach(column => { const th=document.createElement('th'); const header=document.createElement('span'); header.className='dims-grid-header'; const active=Object.prototype.hasOwnProperty.call(this.filters,column.key)?' •':''; header.innerHTML=`<span>${esc(column.label)}${active}</span>${column.filterable!==false||column.sortable!==false?'<span class="dims-grid-arrow">▾</span>':''}`; if(column.filterable!==false||column.sortable!==false) header.onclick=e=>{e.stopPropagation();this.openMenu(column,header);}; th.appendChild(header); headRow.appendChild(th); });
    thead.appendChild(headRow); table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr=document.createElement('tr'); tr.tabIndex=0;
      tr.onclick=e=>{ if(e.target.closest('.rac-trigger,.view-button')) return; openDrawer(this.kind,row.id,e.target); };
      tr.onkeydown=e=>{ if(e.target.closest('.rac-trigger,.view-button')) return; if(e.key==='Enter'||e.key===' '){e.preventDefault();openDrawer(this.kind,row.id,tr);} };
      columns.forEach(column => {
        const td=document.createElement('td'); td.dataset.label=column.label; td.innerHTML=column.render?column.render(row):esc(columnDisplay(column,row));
        if(column.key==='system_rac') {
          const trigger=td.querySelector('.rac-trigger');
          trigger.addEventListener('mouseenter',()=>showRacHover(trigger,this.kind,row));
          trigger.addEventListener('mouseleave',scheduleHideRacHover);
          trigger.addEventListener('focus',()=>showRacHover(trigger,this.kind,row));
          trigger.addEventListener('blur',scheduleHideRacHover);
          trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();hideRacHover();openRacBrief(this.kind,row.id,trigger);});
        }
        if(column.key==='view') td.querySelector('.view-button').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openDrawer(this.kind,row.id,e.currentTarget);});
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    const wrapper=document.createElement('div'); wrapper.className='dims-grid-wrap'; wrapper.appendChild(table); this.container.appendChild(wrapper);
  }
}

const summaryDefs=[['di','🚀 Ready for DI execution'],['mine','👑 Pastor H. Michael Daniels action'],['blocked','⛔ Blocked items'],['follow','⏰ Follow-ups due'],['verify','🔎 Awaiting verification'],['wip','🏗️ Started / WIP']];
function renderSummary(){const all=[...projects,...tasks];byId('accountabilitySummary').innerHTML=summaryDefs.map(([key,label])=>`<button class="accountability-item ${summaryFilter===key?'active':''}" data-summary="${key}"><strong>${all.filter(r=>matchesSummary(r,key)).length}</strong><span>${label}</span></button>`).join('');document.querySelectorAll('[data-summary]').forEach(button=>button.onclick=()=>{summaryFilter=button.dataset.summary;byId('activeFilterText').textContent=`Showing: ${button.querySelector('span').textContent}`;byId('activeFilter').classList.add('show');projectGrid.render();taskGrid.render();renderSummary();});}
byId('clearSummaryFilter').onclick=()=>{summaryFilter=null;byId('activeFilter').classList.remove('show');projectGrid.render();taskGrid.render();renderSummary();};

function field(label,value,full=false){return `<div class="detail-field ${full?'full':''}"><dt>${esc(label)}</dt><dd>${esc(value||'—')}</dd></div>`;}
async function historyFor(kind,row){const column=kind==='project'?'project_id':'task_id';const{data}=await sb.from('tetelestai_follow_up_history').select('*').eq(column,row.id).order('follow_up_date',{ascending:false}).limit(20);return data||[];}
function historyHtml(items){if(!items.length)return'<p class="identity-note">No append-only follow-up entries recorded yet.</p>';return items.map(item=>`<div class="history-item"><strong>${fmt(item.follow_up_date)} — ${esc(item.action_taken)}</strong><div>${esc(item.results)}</div>${item.next_action?`<div><b>Next:</b> ${esc(item.next_action)}</div>`:''}</div>`).join('');}
async function addFollowUp(kind,row){const action_taken=prompt('Follow-up action taken:');if(!action_taken)return;const results=prompt('Results / current condition:');if(!results)return;const next_action=prompt('Next action (optional):',row.next_action||'')||null;const next_follow_up_date=prompt('Next follow-up date YYYY-MM-DD (optional):',row.next_follow_up_date||'')||null;try{await control('follow_up',kind,row,{action_taken,results,next_action,next_follow_up_date,progress_percent:Number(row.percent_complete)||0});await load();await openDrawer(kind,row.id,byId('drawerClose'));}catch(error){alert(error.message);}}
async function editCurrent(kind,row){const status=prompt('Status:',row.status||'open');if(status===null)return;const priority=prompt('Priority (high / medium / low):',row.priority||'medium');if(priority===null)return;const next_action=prompt('Next executable action:',row.next_action||'');if(next_action===null)return;const reason=prompt('Reason for this controlled update:');if(!reason)return alert('A reason is required so the audit trail remains meaningful.');try{await control('update_current',kind,row,{fields:{status,priority,next_action},reason});await load();await openDrawer(kind,row.id,byId('drawerClose'));}catch(error){alert(error.message);}}

function openRacBrief(kind,id,source){
  const row=(kind==='project'?projects:tasks).find(item=>item.id===id);if(!row)return;
  lastFocus=source instanceof HTMLElement?source:document.activeElement;
  const notation=racNotation(row);const band=row.system_rac?(RAC_BAND[Number(row.system_rac)]||'Assessed'):'Not assessed';
  byId('drawerKind').textContent='RAC BRIEF';
  byId('drawerTitle').textContent=`${row.project_number||row.task_number||'—'} — ${row.title}`;
  byId('drawerContent').innerHTML=`<section class="rac-brief-box"><h3>Risk Assessment Code (RAC)</h3><p>DIMS RAC combines Severity (consequence) and Probability (likelihood) in the governed 5×5 risk model. The System RAC remains authoritative.</p><div class="rac-brief-grid"><div class="rac-brief-item"><b>Current System RAC</b>${esc(notation)}</div><div class="rac-brief-item"><b>Risk Level</b>${esc(band)}</div><div class="rac-brief-item"><b>Severity</b>${esc(row.risk_severity||'Not assessed')}</div><div class="rac-brief-item"><b>Probability</b>${esc(row.risk_probability||'Not assessed')}</div></div><a class="rac-full-guide-link" href="rac-epi-apn-guide.html">OPEN FULL RAD GUIDE</a></section><section class="control-block"><div class="control-title">5×5 RAC REFERENCE</div>${renderDeaRiskMatrix(row.risk_severity||'',row.risk_probability||'')}</section>`;
  byId('drawerBackdrop').classList.add('open');byId('drawerBackdrop').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>byId('drawerClose').focus(),0);
}

async function openDrawer(kind,id,source){
  const row=(kind==='project'?projects:tasks).find(item=>item.id===id);if(!row)return;
  lastFocus=source instanceof HTMLElement?source:document.activeElement;
  const history=await historyFor(kind,row);
  const related=kind==='project'?tasks.filter(t=>t.project_id===row.id).map(t=>`${t.task_number||'—'} — ${t.title}`).join('\n'):'—';
  const impact=DIMS_IMPACT[impactScore(row)];const disclosure=deaPriorityDisclosure(row,rankInfo(row));
  byId('drawerKind').textContent=kind==='project'?'PROJECT DETAILS':'TASK DETAILS';byId('drawerTitle').textContent=row.title;
  byId('drawerContent').innerHTML=`<dl class="detail-grid">${field('Permanent number',row.project_number||row.task_number)}${field('Execution rank',row._rank)}${field('RAC',row.system_rac?`${racNotation(row)} — ${RAC_BAND[Number(row.system_rac)]||''}`:'Not assessed')}${field('Date entered',fmt(row.created_at))}${field('Priority',row.priority)}${field('Status',displayStatus(row))}${field('Action owner',OWNER[row.action_owner]||row.action_owner)}${field('Readiness',row.readiness)}${field('Impact',impact?`${impactScore(row)} — ${impact.label}`:'Not assessed')}${field('DEA rank basis',disclosure.reason)}${field('Next follow-up date',fmt(row.next_follow_up_date))}${field('Progress',`${Number(row.percent_complete)||0}%`)}${field('Follow-up interval',`${row.follow_up_interval_days||30} days`)}${field('Complete description',row.description,true)}${field('Full notes',row.notes,true)}${field('Exact next executable action',row.next_action,true)}${field('Project tasks/subtasks',related,true)}${field('Dependencies',row.dependencies||'Not recorded',true)}</dl><section class="control-block"><div class="control-title">FOLLOW-UP / ACTION HISTORY</div><div class="control-actions"><button type="button" data-add-followup>+ Add Follow-Up</button><button type="button" data-edit-current>Edit Current Record</button></div>${historyHtml(history)}</section><section class="control-block"><div class="control-title">COMPLETION & VERIFICATION</div>${field('Reported complete',row.reported_complete_at?fmt(row.reported_complete_at):'Not reported')}${field('Verification status',row.verification_status)}${field('Verification evidence',row.verification_evidence,true)}</section><p class="identity-note">Permanent facts remain locked. Current conditions are controlled-editable. Historical actions are append-only.</p>`;
  byId('drawerContent').querySelector('[data-add-followup]').onclick=()=>addFollowUp(kind,row);byId('drawerContent').querySelector('[data-edit-current]').onclick=()=>editCurrent(kind,row);
  byId('drawerBackdrop').classList.add('open');byId('drawerBackdrop').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>byId('drawerClose').focus(),0);
}

function closeDrawer(){byId('drawerBackdrop').classList.remove('open');byId('drawerBackdrop').setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus?.focus();}
byId('drawerClose').onclick=closeDrawer;byId('drawerBackdrop').onclick=event=>{if(event.target===byId('drawerBackdrop'))closeDrawer();};document.addEventListener('keydown',event=>{if(event.key==='Escape'&&byId('drawerBackdrop').classList.contains('open'))closeDrawer();});
document.addEventListener('click',event=>{if(!event.target.closest('.dims-grid-menu')&&!event.target.closest('.dims-grid-header')){projectGrid?.closeMenu();taskGrid?.closeMenu();}});
window.addEventListener('scroll',hideRacHover,true);window.addEventListener('resize',hideRacHover);

function renderLoadFailure(error){clearTimeout(window.__tetelestaiInitTimer);const detail=esc(error?.message||String(error||'Unknown initialization failure'));byId('projectsList').classList.remove('loading');byId('tasksList').classList.remove('loading');byId('projectsList').innerHTML=`Unable to load Projects: ${detail}`;byId('tasksList').innerHTML=`Unable to load Tasks: ${detail}`;byId('accountabilitySummary').innerHTML=`<div class="loading">Unable to load accountability: ${detail}</div>`;}
async function load(){try{const[{data:p,error:pe},{data:t,error:te}]=await Promise.all([sb.from('projects').select('*'),sb.from('tasks').select('*')]);if(pe||te)throw pe||te;projects=ranked(p||[]);tasks=ranked(t||[]);byId('projCount').textContent=`(${projects.length})`;byId('taskCount').textContent=`(${tasks.length})`;projectGrid=new CompactGrid({container:'#projectsList',search:'#projectSearch',rows:projects,kind:'project'});taskGrid=new CompactGrid({container:'#tasksList',search:'#taskSearch',rows:tasks,kind:'task'});renderSummary();clearTimeout(window.__tetelestaiInitTimer);}catch(error){renderLoadFailure(error);}}

window.saveProject=async()=>{const title=byId('p_title').value.trim();if(!title)return byId('pMsg').textContent='Title required.';const{error}=await sb.from('projects').insert({title,description:byId('p_desc').value,status:byId('p_status').value,priority:byId('p_priority').value,stream:byId('p_stream').value});byId('pMsg').textContent=error?`Error: ${error.message}`:'Saved ✅';if(!error)load();};
window.saveTask=async()=>{const title=byId('t_title').value.trim();if(!title)return byId('tMsg').textContent='Title required.';const{error}=await sb.from('tasks').insert({title,notes:byId('t_notes').value,status:byId('t_status').value,priority:byId('t_priority').value});byId('tMsg').textContent=error?`Error: ${error.message}`:'Saved ✅';if(!error)load();};

load();
