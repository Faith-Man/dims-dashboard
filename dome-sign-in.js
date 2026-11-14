// DOME shared sign-in (TASK security follow-up to TASK-0058/0059).
// Pages that read projects/tasks load this before their own scripts. If the browser is
// already signed in on this address (the session TETELESTAI also uses), it does nothing.
// Otherwise it shows a sign-in panel once; the session is then kept on this device.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

function showPanel() {
  if (document.getElementById('domeSignIn')) return;
  const wrap = document.createElement('div');
  wrap.id = 'domeSignIn';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-labelledby', 'domeSignInTitle');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(5,11,61,.72);padding:16px';
  wrap.innerHTML = `
    <form id="domeSignInForm" style="width:100%;max-width:380px;background:#fff;border-radius:16px;padding:22px;border-top:4px solid #d6b75d;box-shadow:0 18px 44px rgba(5,11,61,.35);font-family:Inter,system-ui,sans-serif;color:#14213d">
      <div style="font-size:.72rem;font-weight:800;letter-spacing:.1em;color:#a97800">DOME™ · DIMS</div>
      <h2 id="domeSignInTitle" style="margin:.2rem 0 .4rem;color:#0c1475;font-size:1.25rem">Sign in to continue</h2>
      <p style="margin:0 0 12px;color:#64708b;font-size:.88rem">Projects and tasks are private. Sign in once on this device and you'll stay signed in.</p>
      <label for="domeSignInEmail" style="display:block;font-size:.75rem;font-weight:800;color:#0c1475">Email</label>
      <input id="domeSignInEmail" type="email" autocomplete="username" required style="width:100%;padding:10px;border:1px solid #b9c7dc;border-radius:8px;margin:4px 0 10px;font:inherit">
      <label for="domeSignInPassword" style="display:block;font-size:.75rem;font-weight:800;color:#0c1475">Password</label>
      <input id="domeSignInPassword" type="password" autocomplete="current-password" style="width:100%;padding:10px;border:1px solid #b9c7dc;border-radius:8px;margin:4px 0 14px;font:inherit">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="submit" style="flex:1;min-width:120px;background:#0c1475;color:#fff;border:0;border-radius:9px;padding:11px;font-weight:800;cursor:pointer">Sign in</button>
        <button type="button" id="domeSignInLink" style="flex:1;min-width:120px;background:#fff;color:#0c1475;border:1px solid #c8d8ff;border-radius:9px;padding:11px;font-weight:800;cursor:pointer">Email me a link</button>
      </div>
      <p id="domeSignInMsg" aria-live="polite" style="margin:10px 0 0;font-size:.85rem;color:#64708b"></p>
    </form>`;
  document.body.appendChild(wrap);
  const email = document.getElementById('domeSignInEmail');
  const password = document.getElementById('domeSignInPassword');
  const msg = document.getElementById('domeSignInMsg');
  email.focus();
  document.getElementById('domeSignInForm').onsubmit = async (e) => {
    e.preventDefault();
    if (!email.value.trim() || !password.value) { msg.textContent = 'Enter your email and password.'; return; }
    msg.textContent = 'Signing in…';
    const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
    if (error) { msg.textContent = `Error: ${error.message}`; return; }
    location.reload();
  };
  document.getElementById('domeSignInLink').onclick = async () => {
    if (!email.value.trim()) { msg.textContent = 'Enter your email first.'; return; }
    msg.textContent = 'Sending link…';
    const { error } = await sb.auth.signInWithOtp({ email: email.value.trim(), options: { emailRedirectTo: location.href } });
    msg.textContent = error ? `Error: ${error.message}` : 'Check your email for the sign-in link.';
  };
}

async function check() {
  const { data } = await sb.auth.getSession();
  if (data?.session) return;
  if (document.body) showPanel(); else addEventListener('DOMContentLoaded', showPanel, { once: true });
}

// A magic-link return signs in and then reloads so the page's own queries run signed in.
let reloaded = false;
sb.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session && document.getElementById('domeSignIn') && !reloaded) {
    reloaded = true;
    location.reload();
  }
});

// Loaded as /dome-sign-in.js?optional (by the DI² orb), the panel is not forced on the page:
// the orb asks for a fresh session token and opens the panel only when DI² needs a sign-in.
// Asking supabase-js for the session also renews an expired token, so DI² keeps working
// on pages (like DOME Home) that don't otherwise run Supabase.
window.domeShowSignIn = showPanel;
window.domeAccessToken = async () => { const { data } = await sb.auth.getSession(); return data?.session?.access_token || ''; };
if (!new URL(import.meta.url).searchParams.has('optional')) void check();
