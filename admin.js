import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://sdquzhsylqpbhrmqjqgk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DOME_HOME = '/index.html';

const authCard = document.getElementById('auth-card');
const securityCard = document.getElementById('security-card');
const editorCard = document.getElementById('editor-card');
const emailEl = document.getElementById('email');
const loginPasswordEl = document.getElementById('login-password');
const passwordSignInBtn = document.getElementById('password-sign-in');
const sendLinkBtn = document.getElementById('send-link');
const authMsg = document.getElementById('auth-msg');
const signOutBtn = document.getElementById('sign-out');
const newPasswordEl = document.getElementById('new-password');
const confirmPasswordEl = document.getElementById('confirm-password');
const setPasswordBtn = document.getElementById('set-password');
const securityMsg = document.getElementById('security-msg');

const titleEl = document.getElementById('title');
const slugEl = document.getElementById('slug');
const statusEl = document.getElementById('status');
const scriptureEl = document.getElementById('scripture');
const tagsEl = document.getElementById('tags');
const contentEl = document.getElementById('content_md');
const saveDraftBtn = document.getElementById('save-draft');
const publishBtn = document.getElementById('publish');
const loadBtn = document.getElementById('load');
const newBtn = document.getElementById('new');
const saveMsg = document.getElementById('save-msg');

function shouldReturnHome() {
  return new URLSearchParams(window.location.search).get('return') === 'home';
}

function redirectToDomeHome() {
  window.location.replace(DOME_HOME);
}

// Fail closed: authenticated controls stay hidden until Supabase verifies the
// current user with the Auth server. Do not trust cached session data alone.
let authResolved = false;
toggleAuth(false);

const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION' && !authResolved) return;
  if (event === 'SIGNED_OUT' || !session?.user) {
    toggleAuth(false);
    return;
  }
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    if (shouldReturnHome()) {
      redirectToDomeHome();
      return;
    }
    toggleAuth(true);
  }
});

async function initializeAuth() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      toggleAuth(false);
      return;
    }
    if (shouldReturnHome()) {
      redirectToDomeHome();
      return;
    }
    toggleAuth(true);
  } catch (error) {
    console.error('Auth initialization failed.', error);
    toggleAuth(false);
  } finally {
    authResolved = true;
  }
}

void initializeAuth();
window.addEventListener('pagehide', () => authListener.subscription.unsubscribe(), { once: true });

passwordSignInBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const password = loginPasswordEl.value;
  if (!email || !password) { authMsg.textContent = 'Enter your email and password.'; return; }
  authMsg.textContent = 'Signing in...';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authMsg.textContent = `Error: ${error.message}`;
    return;
  }
  authMsg.textContent = 'Signed in. Opening DOME Home...';
  redirectToDomeHome();
};

sendLinkBtn.onclick = async () => {
  const email = emailEl.value.trim();
  if (!email) { authMsg.textContent = 'Enter an email.'; return; }
  authMsg.textContent = 'Sending magic link...';
  const emailRedirectTo = `${window.location.origin}${window.location.pathname}?return=home`;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  authMsg.textContent = error ? `Error: ${error.message}` : 'Check your email!';
};

setPasswordBtn.onclick = async () => {
  const password = newPasswordEl.value;
  const confirm = confirmPasswordEl.value;
  if (!password || !confirm) { securityMsg.textContent = 'Enter and confirm the new password.'; return; }
  if (password !== confirm) { securityMsg.textContent = 'Passwords do not match.'; return; }
  if (password.length < 8) { securityMsg.textContent = 'Use at least 8 characters.'; return; }
  securityMsg.textContent = 'Setting password...';
  const { error } = await supabase.auth.updateUser({ password });
  if (error) { securityMsg.textContent = `Error: ${error.message}`; return; }
  newPasswordEl.value = '';
  confirmPasswordEl.value = '';
  securityMsg.textContent = 'Password set successfully.';
};

signOutBtn.onclick = async () => {
  signOutBtn.disabled = true;
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  loginPasswordEl.value = '';
  toggleAuth(false);
  signOutBtn.disabled = false;
  authMsg.textContent = error ? `Sign-out warning: ${error.message}` : 'Signed out.';
};

function toggleAuth(isAuthed) {
  const authenticated = isAuthed === true;
  authCard.hidden = authenticated;
  securityCard.hidden = !authenticated;
  editorCard.hidden = !authenticated;
  authCard.classList.toggle('hidden', authenticated);
  securityCard.classList.toggle('hidden', !authenticated);
  editorCard.classList.toggle('hidden', !authenticated);
  securityCard.setAttribute('aria-hidden', String(!authenticated));
  editorCard.setAttribute('aria-hidden', String(!authenticated));
  authCard.setAttribute('aria-hidden', String(authenticated));
}

function parseScripture() { const txt = scriptureEl.value.trim(); if (!txt) return null; try { return JSON.parse(txt); } catch { return null; } }
function parseTags() { const t = tagsEl.value.trim(); if (!t) return []; return t.split(',').map(s => s.trim()).filter(Boolean); }
function nowIso() { return new Date().toISOString(); }

async function upsertTeaching(publish) {
  saveMsg.textContent = 'Saving...';
  const row = { title:titleEl.value.trim(), slug:slugEl.value.trim(), scripture:parseScripture(), tags:parseTags(), content_md:contentEl.value, status:publish?'published':'draft', published_at:publish?nowIso():null, updated_at:nowIso() };
  if (!row.title || !row.slug) { saveMsg.textContent = 'Title and Slug are required.'; return; }
  const { error } = await supabase.from('teachings').upsert(row, { onConflict:'slug' });
  saveMsg.textContent = error ? `Error: ${error.message}` : publish ? 'Published ✅' : 'Draft saved ✅';
}

saveDraftBtn.onclick = () => upsertTeaching(false);
publishBtn.onclick = () => upsertTeaching(true);
loadBtn.onclick = async () => {
  const slug = slugEl.value.trim(); if (!slug) { saveMsg.textContent = 'Enter a slug to load.'; return; }
  const { data, error } = await supabase.from('teachings').select('*').eq('slug', slug).maybeSingle();
  if (error) { saveMsg.textContent = `Error: ${error.message}`; return; }
  if (!data) { saveMsg.textContent = 'Not found.'; return; }
  titleEl.value=data.title??''; statusEl.value=data.status??'draft'; scriptureEl.value=data.scripture?JSON.stringify(data.scripture):''; tagsEl.value=(data.tags??[]).join(', '); contentEl.value=data.content_md??''; saveMsg.textContent='Loaded.';
};
newBtn.onclick = () => { titleEl.value=''; slugEl.value=''; statusEl.value='draft'; scriptureEl.value=''; tagsEl.value=''; contentEl.value=''; saveMsg.textContent='New entry.'; };
titleEl.addEventListener('input', () => { if (!slugEl.value.trim()) slugEl.value=titleEl.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); });
