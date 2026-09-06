import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-06T15:12-05:00-med-password-recovery';

function withDomeHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-DOME-Deploy', DOME_DEPLOY_MARKER);
  headers.set('X-DOME-TETELESTAI-Mode', 'canonical-restored');
  if (headers.get('content-type')?.includes('text/html') || headers.get('content-type')?.includes('javascript')) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function injectMedPasswordRecovery(response) {
  const html = await response.text();
  const recoveryScript = `
<script data-med-password-recovery="v1">
(() => {
  const byId = id => document.getElementById(id);
  const caseId = new URLSearchParams(location.search).get('case') || '';

  function ensureRecoveryUi() {
    const signInBtn = byId('signInBtn');
    const createBtn = byId('createAccountBtn');
    if (signInBtn && !byId('forgotPasswordBtn')) {
      const forgot = document.createElement('button');
      forgot.type = 'button';
      forgot.id = 'forgotPasswordBtn';
      forgot.className = 'secondary';
      forgot.textContent = 'Forgot password?';
      createBtn?.insertAdjacentElement('afterend', forgot);
      forgot.addEventListener('click', sendRecovery);
    }

    document.querySelectorAll('[id^="signOut"]').forEach(signOut => {
      const id = 'changePasswordBtn-' + signOut.id;
      if (byId(id)) return;
      const change = document.createElement('button');
      change.type = 'button';
      change.id = id;
      change.className = 'secondary';
      change.textContent = 'Change password';
      signOut.insertAdjacentElement('beforebegin', change);
      change.addEventListener('click', () => openPasswordDialog('Change password'));
    });
  }

  async function sendRecovery() {
    const email = byId('email')?.value?.trim();
    const msg = byId('authMsg');
    if (!email) {
      if (msg) msg.textContent = 'Enter your email address first.';
      return;
    }
    if (msg) msg.textContent = 'Sending password-reset email…';
    const redirect = new URL(location.href);
    redirect.hash = '';
    redirect.searchParams.set('recover', '1');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirect.toString() });
    if (msg) msg.textContent = error
      ? 'Password reset failed: ' + error.message
      : 'Password-reset email sent. Check your inbox and follow the secure link.';
  }

  function openPasswordDialog(title = 'Create new password') {
    let modal = byId('medPasswordModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'medPasswordModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(4,9,48,.72);display:flex;align-items:center;justify-content:center;padding:20px';
      modal.innerHTML = '<div class="card" style="width:min(480px,100%);position:relative"><h2 id="medPasswordTitle">Create new password</h2><p class="muted">Enter a new password for your MED™ account.</p><label>New password</label><input id="medNewPassword" type="password" autocomplete="new-password" minlength="8"><label style="margin-top:12px">Confirm new password</label><input id="medConfirmPassword" type="password" autocomplete="new-password" minlength="8"><div class="row" style="margin-top:14px"><button class="primary" type="button" id="medSavePassword">Save new password</button><button class="secondary" type="button" id="medCancelPassword">Cancel</button><span class="status" id="medPasswordMsg"></span></div></div>';
      document.body.appendChild(modal);
      byId('medCancelPassword').addEventListener('click', () => { modal.style.display = 'none'; });
      byId('medSavePassword').addEventListener('click', savePassword);
    }
    byId('medPasswordTitle').textContent = title;
    byId('medPasswordMsg').textContent = '';
    byId('medNewPassword').value = '';
    byId('medConfirmPassword').value = '';
    modal.style.display = 'flex';
    setTimeout(() => byId('medNewPassword')?.focus(), 0);
  }

  async function savePassword() {
    const password = byId('medNewPassword')?.value || '';
    const confirm = byId('medConfirmPassword')?.value || '';
    const msg = byId('medPasswordMsg');
    if (password.length < 8) {
      msg.textContent = 'Use at least 8 characters.';
      return;
    }
    if (password !== confirm) {
      msg.textContent = 'Passwords do not match.';
      return;
    }
    msg.textContent = 'Updating password…';
    const { error } = await sb.auth.updateUser({ password });
    if (error) {
      msg.textContent = 'Password update failed: ' + error.message;
      return;
    }
    msg.textContent = 'Password updated successfully.';
    const clean = new URL(location.href);
    clean.hash = '';
    clean.searchParams.delete('recover');
    history.replaceState({}, '', clean.pathname + clean.search);
    setTimeout(() => {
      byId('medPasswordModal').style.display = 'none';
    }, 900);
  }

  function handleRecoveryEvent(event) {
    if (event === 'PASSWORD_RECOVERY') openPasswordDialog('Create new password');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureRecoveryUi, { once: true });
  else ensureRecoveryUi();

  const observer = new MutationObserver(ensureRecoveryUi);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  sb.auth.onAuthStateChange((event) => handleRecoveryEvent(event));
  if (new URLSearchParams(location.search).get('recover') === '1') {
    setTimeout(() => openPasswordDialog('Create new password'), 500);
  }
})();
</script>`;

  const injected = html.includes('data-med-password-recovery="v1"')
    ? html
    : html.replace('</body>', recoveryScript + '\n</body>');

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('x-dome-med-password-recovery', injected !== html ? 'injected' : 'present');
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/dome/deploy') {
      return Response.json({
        ok: true,
        worker: 'dome-dashboard',
        deploy_marker: DOME_DEPLOY_MARKER,
        tetelestai_mode: 'canonical-restored',
        tetelestai_source_commit: 'a349f15f45eab093f8e1aa3fbcd52e176bd4fa2e',
        tetelestai: '/projects-tasks.html',
        rad_guide: '/rac-epi-apn-guide.html',
        med_orb_mode: 'canonical-image',
        med_password_recovery: 'forgot-reset-change-v1'
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER } });
    }

    let response = await shamarWorker.fetch(request, env, ctx);
    if (url.pathname === '/med-marriage-evaluation-dome-secure.html' || url.pathname === '/med-marriage-evaluation-dome-secure') {
      response = await injectMedPasswordRecovery(response);
    }
    return withDomeHeaders(response);
  },
  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};