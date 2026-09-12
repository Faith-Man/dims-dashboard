import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const byId = id => document.getElementById(id);

function renderSignedOut(message = 'Sign in to DOME to load protected TETELESTAI project and task data.') {
  clearTimeout(window.__tetelestaiInitTimer);
  const signInUrl = `admin.html?return=home`;
  const html = `<div class="dims-grid-empty"><strong>${message}</strong><br><a href="${signInUrl}">Sign in to DOME</a></div>`;
  const projects = byId('projectsList');
  const tasks = byId('tasksList');
  const summary = byId('accountabilitySummary');
  if (projects) { projects.classList.remove('loading'); projects.innerHTML = html; }
  if (tasks) { tasks.classList.remove('loading'); tasks.innerHTML = html; }
  if (summary) summary.innerHTML = `<div class="loading">Authentication required. <a href="${signInUrl}">Sign in to DOME</a></div>`;
}

function renderAuthFailure(error) {
  clearTimeout(window.__tetelestaiInitTimer);
  const detail = error?.message || String(error || 'Unable to verify DOME authentication.');
  const html = `<div class="dims-grid-empty">Unable to verify DOME authentication: ${detail}</div>`;
  const projects = byId('projectsList');
  const tasks = byId('tasksList');
  const summary = byId('accountabilitySummary');
  if (projects) { projects.classList.remove('loading'); projects.innerHTML = html; }
  if (tasks) { tasks.classList.remove('loading'); tasks.innerHTML = html; }
  if (summary) summary.innerHTML = `<div class="loading">Unable to verify DOME authentication.</div>`;
}

async function startTetelestai() {
  try {
    // Match the established DOME fail-closed pattern: verify the user with
    // Supabase Auth before any RLS-protected project/task reads are attempted.
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) {
      renderSignedOut();
      return;
    }

    await import('./tetelestai-closed-loop.js?v=22');
  } catch (error) {
    console.error('TETELESTAI authentication bootstrap failed.', error);
    renderAuthFailure(error);
  }
}

const { data: authListener } = sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || !session?.user) {
    renderSignedOut();
  }
});

window.addEventListener('pagehide', () => authListener.subscription.unsubscribe(), { once: true });
void startTetelestai();
