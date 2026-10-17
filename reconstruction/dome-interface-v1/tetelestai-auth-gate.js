function loadRacMeterStyles() {
  if (document.getElementById('tetelestaiRacMeterV2')) return;
  const link = document.createElement('link');
  link.id = 'tetelestaiRacMeterV2';
  link.rel = 'stylesheet';
  link.href = './tetelestai-rac-meter-v2.css?v=3';
  document.head.appendChild(link);
}

async function startApp() {
  clearTimeout(window.__tetelestaiInitTimer);
  await import('./tetelestai-closed-loop.js?v=28');
  await import('./tetelestai-deep-links.js?v=28');
  loadRacMeterStyles();
}

void startApp().catch(error => {
  clearTimeout(window.__tetelestaiInitTimer);
  const message = `Unable to initialize TETELESTAI design preview: ${String(error?.message || error)}`;
  const projects = document.getElementById('projectsList');
  const tasks = document.getElementById('tasksList');
  const summary = document.getElementById('accountabilitySummary');
  if (projects) projects.textContent = message;
  if (tasks) tasks.textContent = message;
  if (summary) summary.innerHTML = `<div class="loading">${message}</div>`;
});
