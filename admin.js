import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// TODO: set your current project values:
const SUPABASE_URL = 'https://tfbfkitdenxgcxkxhydw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYmZraXRkZW54Z2N4a3hoeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjY3NDcsImV4cCI6MjA3MjIwMjc0N30.8EtOV90zyP2bn3ZrP35vOwnZkRo4nc72uD1xa964hC4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- auth UI ---
const authCard = document.getElementById('auth-card');
const editorCard = document.getElementById('editor-card');
const emailEl = document.getElementById('email');
const sendLinkBtn = document.getElementById('send-link');
const authMsg = document.getElementById('auth-msg');
const signOutBtn = document.getElementById('sign-out');

// editor fields
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

// show editor if logged in
supabase.auth.getSession().then(({ data }) => toggleAuth(!!data.session));
supabase.auth.onAuthStateChange((_e, session) => toggleAuth(!!session));

sendLinkBtn.onclick = async () => {
  const email = emailEl.value.trim();
  if (!email) { authMsg.textContent = 'Enter an email.'; return; }
  authMsg.textContent = 'Sending magic link...';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href }
  });
  authMsg.textContent = error ? `Error: ${error.message}` : 'Check your email!';
};

signOutBtn.onclick = async () => { await supabase.auth.signOut(); };

function toggleAuth(isAuthed) {
  authCard.classList.toggle('hidden', isAuthed);
  editorCard.classList.toggle('hidden', !isAuthed);
}

function parseScripture() {
  const txt = scriptureEl.value.trim();
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return null; }
}
function parseTags() {
  const t = tagsEl.value.trim();
  if (!t) return [];
  return t.split(',').map(s => s.trim()).filter(Boolean);
}
function nowIso() { return new Date().toISOString(); }

async function upsertTeaching(publish) {
  saveMsg.textContent = 'Saving...';
  const row = {
    title: titleEl.value.trim(),
    slug: slugEl.value.trim(),
    scripture: parseScripture(),
    tags: parseTags(),
    content_md: contentEl.value,
    status: publish ? 'published' : 'draft',
    published_at: publish ? nowIso() : null,
    updated_at: nowIso()
  };
  if (!row.title || !row.slug) { saveMsg.textContent = 'Title and Slug are required.'; return; }

  const { error } = await supabase.from('teachings').upsert(row, { onConflict: 'slug' });
  saveMsg.textContent = error ? `Error: ${error.message}` :
    (publish ? 'Published ✅' : 'Draft saved ✅');
}

saveDraftBtn.onclick = () => upsertTeaching(false);
publishBtn.onclick = () => upsertTeaching(true);

loadBtn.onclick = async () => {
  const slug = slugEl.value.trim();
  if (!slug) { saveMsg.textContent = 'Enter a slug to load.'; return; }
  const { data, error } = await supabase.from('teachings').select('*').eq('slug', slug).maybeSingle();
  if (error) { saveMsg.textContent = `Error: ${error.message}`; return; }
  if (!data) { saveMsg.textContent = 'Not found.'; return; }
  titleEl.value = data.title ?? '';
  statusEl.value = data.status ?? 'draft';
  scriptureEl.value = data.scripture ? JSON.stringify(data.scripture) : '';
  tagsEl.value = (data.tags ?? []).join(', ');
  contentEl.value = data.content_md ?? '';
  saveMsg.textContent = 'Loaded.';
};

newBtn.onclick = () => {
  titleEl.value = ''; slugEl.value = ''; statusEl.value = 'draft';
  scriptureEl.value = ''; tagsEl.value = ''; contentEl.value = '';
  saveMsg.textContent = 'New entry.';
};

titleEl.addEventListener('input', () => {
  if (!slugEl.value.trim()) {
    slugEl.value = titleEl.value.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});
