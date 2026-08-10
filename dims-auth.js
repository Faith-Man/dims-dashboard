import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://sdquzhsylqpbhrmqjqgk.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session ?? null, error };
}

export async function requireSession(messageElement) {
  const { session, error } = await getSession();
  if (session) return session;
  if (messageElement) messageElement.textContent = error ? 'Unable to verify your session. Try signing in again.' : 'Sign in before saving changes.';
  return null;
}

export function mountAuthUI(root = document.querySelector('[data-dims-auth]')) {
  if (!root) return () => {};
  root.innerHTML = `<section class="dims-auth" aria-labelledby="dims-auth-title">
    <strong id="dims-auth-title">Session</strong>
    <span data-auth-status role="status" aria-live="polite">Checking session…</span>
    <form data-auth-form><label for="dims-auth-email">Email</label><input id="dims-auth-email" name="email" type="email" autocomplete="email" required><button class="btn" type="submit">Send sign-in link</button></form>
    <button class="btn" type="button" data-auth-sign-out hidden>Sign out</button>
  </section>`;
  const status = root.querySelector('[data-auth-status]');
  const form = root.querySelector('[data-auth-form]');
  const signOut = root.querySelector('[data-auth-sign-out]');
  const writeControls = [...document.querySelectorAll('[data-auth-write]')];

  function render(session) {
    const signedIn = Boolean(session);
    status.textContent = signedIn ? `Signed in as ${session.user.email || 'authenticated user'}.` : 'Not signed in. Read-only access remains available where supported.';
    form.hidden = signedIn;
    signOut.hidden = !signedIn;
    writeControls.forEach((control) => {
      control.disabled = !signedIn;
      control.setAttribute('aria-disabled', String(!signedIn));
    });
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = new FormData(form).get('email')?.toString().trim();
    if (!email) return;
    status.textContent = 'Sending sign-in link…';
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    status.textContent = error ? `Sign-in link could not be sent: ${error.message}` : 'Check your email for the sign-in link.';
  });
  signOut.addEventListener('click', async () => {
    status.textContent = 'Signing out…';
    await supabase.auth.signOut();
  });
  getSession().then(({ session }) => render(session));
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => render(session));
  return () => listener.subscription.unsubscribe();
}
