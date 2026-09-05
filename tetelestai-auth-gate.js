import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const byId = id => document.getElementById(id);
let appStarted = false;
let authCheckRunning = false;
let signInRendered = false;

function setAllLoading(message) {
  const projects = byId('projectsList');
  const tasks = byId('tasksList');
  const summary = byId('accountabilitySummary');
  if (projects) projects.innerHTML = message;
  if (tasks) tasks.innerHTML = message;
  if (summary) summary.innerHTML = `<div class="loading">${message}</div>`;
}

function loadRacMeterStyles() {
  if (document.getElementById('tetelestaiRacMeterV2')) return;
  const link = document.createElement('link');
  link.id = 'tetelestaiRacMeterV2';
  link.rel = 'stylesheet';
  link.href = './tetelestai-rac-meter-v2.css?v=1';
  document.head.appendChild(link);
}

async function startApp() {
  if (appStarted) return;
  appStarted = true;
  signInRendered = false;
  clearTimeout(window.__tetelestaiInitTimer);
  await import('./tetelestai-closed-loop.js?v=28');
  await import('./tetelestai-deep-links.js?v=28');
  loadRacMeterStyles();
}

function renderSignIn() {
  if (appStarted || signInRendered) return;
  signInRendered = true;
  clearTimeout(window.__tetelestaiInitTimer);
  const panel = `
    <section style="max-width:560px;margin:28px auto;padding:20px;border:1px solid #c7d5ea;border-radius:14px;background:#fff;box-shadow:0 10px 28px rgba(11,35,77,.1)">
      <h3 style="margin:0 0 8px;color:#0c1475">DOME Sign In Required</h3>
      <p style="margin:0 0 14px;color:#667085;font-size:.86rem">Projects and Tasks are protected by authenticated Supabase access. Sign in to load TETELESTAI without reopening public database access.</p>
      <label style="display:block;font-size:.75rem;font-weight:800;color:#0c1475;margin-top:10px">Email</label>
      <input id="tetelestaiAuthEmail" type="email" autocomplete="username" style="width:100%;padding:10px;border:1px solid #b9c7dc;border-radius:8px;margin-top:4px">
      <label style="display:block;font-size:.75rem;font-weight:800;color:#0c1475;margin-top:10px">Password</label>
      <input id="tetelestaiAuthPassword" type="password" autocomplete="current-password" style="width:100%;padding:10px;border:1px solid #b9c7dc;border-radius:8px;margin-top:4px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
        <button id="tetelestaiPasswordSignIn" type="button" class="btn">Sign In & Load TETELESTAI</button>
        <button id="tetelestaiMagicLink" type="button" class="clear-filter">Send Magic Link</button>
      </div>
      <div id="tetelestaiAuthMsg" class="loading" style="margin-top:10px"></div>
    </section>`;
  setAllLoading(panel);

  const email = byId('tetelestaiAuthEmail');
  const password = byId('tetelestaiAuthPassword');
  const message = byId('tetelestaiAuthMsg');

  byId('tetelestaiPasswordSignIn').onclick = async () => {
    const e = email.value.trim();
    const p = password.value;
    if (!e || !p) { message.textContent = 'Enter your email and password.'; return; }
    message.textContent = 'Signing in…';
    const { error } = await sb.auth.signInWithPassword({ email: e, password: p });
    if (error) { message.textContent = `Error: ${error.message}`; return; }
    message.textContent = 'Signed in. Loading TETELESTAI…';
    signInRendered = false;
    await verifyAndStart();
  };

  byId('tetelestaiMagicLink').onclick = async () => {
    const e = email.value.trim();
    if (!e) { message.textContent = 'Enter your email first.'; return; }
    message.textContent = 'Sending magic link…';
    const { error } = await sb.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: window.location.href }
    });
    message.textContent = error ? `Error: ${error.message}` : 'Check your email for the sign-in link.';
  };
}

async function verifyAndStart() {
  if (appStarted || authCheckRunning) return;
  authCheckRunning = true;
  try {
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) {
      renderSignIn();
      return;
    }
    await startApp();
  } catch (error) {
    clearTimeout(window.__tetelestaiInitTimer);
    setAllLoading(`Unable to initialize authenticated TETELESTAI: ${String(error?.message || error)}`);
  } finally {
    authCheckRunning = false;
  }
}

sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    appStarted = false;
    signInRendered = false;
    renderSignIn();
    return;
  }

  // Never reload the page from auth events. Supabase may emit INITIAL_SESSION
  // or TOKEN_REFRESHED during startup; reloading here creates an auth loop.
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !appStarted) {
    void verifyAndStart();
  }
});

void verifyAndStart();
