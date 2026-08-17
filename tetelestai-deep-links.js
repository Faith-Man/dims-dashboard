// TETELESTAI permanent record deep links.
// Canonical examples:
//   projects-tasks.html?project=PROJ-0033
//   projects-tasks.html?task=TASK-0081
// Legacy #PROJ-... / #TASK-... hashes are also accepted.

const PROJECT_PARAM = 'project';
const TASK_PARAM = 'task';
const MAX_WAIT_MS = 10000;

function normalizeNumber(value) {
  return String(value || '').trim().toUpperCase();
}

function targetFromUrl() {
  const params = new URLSearchParams(location.search);
  const project = normalizeNumber(params.get(PROJECT_PARAM));
  const task = normalizeNumber(params.get(TASK_PARAM));
  if (project) return { kind: 'project', number: project };
  if (task) return { kind: 'task', number: task };

  const legacy = normalizeNumber(decodeURIComponent(location.hash.slice(1)));
  if (legacy.startsWith('PROJ-') || legacy === 'RB-001') return { kind: 'project', number: legacy };
  if (legacy.startsWith('TASK-') || /^RB-001-\d+$/i.test(legacy)) return { kind: 'task', number: legacy };
  return null;
}

function canonicalUrl(kind, number) {
  const url = new URL(location.href);
  url.hash = '';
  url.searchParams.delete(PROJECT_PARAM);
  url.searchParams.delete(TASK_PARAM);
  url.searchParams.set(kind === 'project' ? PROJECT_PARAM : TASK_PARAM, number);
  return url;
}

function baseUrl() {
  const url = new URL(location.href);
  url.hash = '';
  url.searchParams.delete(PROJECT_PARAM);
  url.searchParams.delete(TASK_PARAM);
  return url;
}

function rowNumber(row) {
  return normalizeNumber(row?.querySelector('.permanent-number')?.textContent);
}

function findTargetRow(kind, number) {
  const container = document.getElementById(kind === 'project' ? 'projectsList' : 'tasksList');
  if (!container) return null;
  return [...container.querySelectorAll('tbody tr')].find(row => rowNumber(row) === number) || null;
}

function drawerIsOpen() {
  return document.getElementById('drawerBackdrop')?.classList.contains('open');
}

function currentDrawerNumber() {
  const fields = [...document.querySelectorAll('#drawerContent .detail-field')];
  const permanent = fields.find(field =>
    field.querySelector('dt')?.textContent?.trim().toLowerCase() === 'permanent number'
  );
  return normalizeNumber(permanent?.querySelector('dd')?.textContent);
}

function showLinkNotice(message) {
  const active = document.getElementById('activeFilter');
  const text = document.getElementById('activeFilterText');
  if (!active || !text) return;
  text.textContent = message;
  active.classList.add('show');
}

function clearLinkNotice() {
  const active = document.getElementById('activeFilter');
  const text = document.getElementById('activeFilterText');
  if (!active || !text) return;
  if (text.textContent.startsWith('Direct link:')) active.classList.remove('show');
}

async function openTargetFromUrl({ replaceLegacy = true } = {}) {
  const target = targetFromUrl();
  if (!target) return false;
  const started = Date.now();

  while (Date.now() - started < MAX_WAIT_MS) {
    const row = findTargetRow(target.kind, target.number);
    if (row) {
      if (replaceLegacy && location.hash) history.replaceState({ tetelestaiDeepLink: true }, '', canonicalUrl(target.kind, target.number));
      clearLinkNotice();
      row.click();
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  showLinkNotice(`Direct link: ${target.number} was not found in the current TETELESTAI records.`);
  return false;
}

function kindForRow(row) {
  if (row.closest('#projectsList')) return 'project';
  if (row.closest('#tasksList')) return 'task';
  return null;
}

// Keep the address bar synchronized whenever a user opens a record from either grid.
document.addEventListener('click', event => {
  const row = event.target.closest?.('#projectsList tbody tr, #tasksList tbody tr');
  if (!row) return;
  const kind = kindForRow(row);
  const number = rowNumber(row);
  if (!kind || !number) return;

  const target = targetFromUrl();
  if (target?.kind === kind && target.number === number) return;
  history.pushState({ tetelestaiDeepLink: true }, '', canonicalUrl(kind, number));
}, true);

// Closing the View panel returns the browser URL to the general Projects & Tasks page.
document.getElementById('drawerClose')?.addEventListener('click', () => {
  if (targetFromUrl()) history.pushState({ tetelestaiDeepLink: false }, '', baseUrl());
});

document.getElementById('drawerBackdrop')?.addEventListener('click', event => {
  if (event.target.id === 'drawerBackdrop' && targetFromUrl()) {
    history.pushState({ tetelestaiDeepLink: false }, '', baseUrl());
  }
});

// Browser Back/Forward should open the referenced record or close the drawer.
window.addEventListener('popstate', () => {
  const target = targetFromUrl();
  if (target) {
    if (drawerIsOpen() && currentDrawerNumber() === target.number) return;
    openTargetFromUrl({ replaceLegacy: false });
    return;
  }
  if (drawerIsOpen()) document.getElementById('drawerClose')?.click();
});

openTargetFromUrl();
