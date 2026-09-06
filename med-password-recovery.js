export function installMedPasswordRecovery(sb) {
  const $ = id => document.getElementById(id);
  const RECOVER_PARAM = 'recover';
  const RECOVER_VALUE = '1';

  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms))
    ]);
  }

  function recoveryRedirectUrl() {
    const url = new URL(location.href);
    url.hash = '';
    url.searchParams.set(RECOVER_PARAM, RECOVER_VALUE);
    return url.toString();
  }

  function authErrorFromUrl() {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const code = query.get('error_code') || hash.get('error_code') || query.get('error') || hash.get('error');
    const description = query.get('error_description') || hash.get('error_description');
    return code ? { code, description: description || code } : null;
  }

  function cleanRecoveryUrl() {
    const url = new URL(location.href);
    url.hash = '';
    url.searchParams.delete(RECOVER_PARAM);
    ['error', 'error_code', 'error_description'].forEach(key => url.searchParams.delete(key));
    history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  }

  function ensureRecoveryUi() {
    const signInBtn = $('signInBtn');
    const createBtn = $('createAccountBtn');
    if (signInBtn && !$('forgotPasswordBtn')) {
      const forgot = document.createElement('button');
      forgot.type = 'button';
      forgot.id = 'forgotPasswordBtn';
      forgot.className = 'secondary';
      forgot.textContent = 'Forgot password?';
      createBtn?.insertAdjacentElement('afterend', forgot);
      forgot.addEventListener('click', sendRecovery);
    }

    document.querySelectorAll('[id^="signOut"]').forEach(signOut => {
      const id = `changePasswordBtn-${signOut.id}`;
      if ($(id)) return;
      const change = document.createElement('button');
      change.type = 'button';
      change.id = id;
      change.className = 'secondary';
      change.textContent = 'Change password';
      signOut.insertAdjacentElement('beforebegin', change);
      change.addEventListener('click', () => openPasswordDialog('Change password', false));
    });
  }

  async function sendRecovery() {
    const email = $('email')?.value?.trim();
    const button = $('forgotPasswordBtn');
    if (!email) {
      setText('authMsg', 'Enter your email address first.');
      return;
    }

    if (button) button.disabled = true;
    setText('authMsg', 'Sending password-reset email…');

    try {
      const { error } = await withTimeout(
        sb.auth.resetPasswordForEmail(email, { redirectTo: recoveryRedirectUrl() }),
        15000,
        'reset-request-timeout'
      );
      if (error) throw error;
      setText('authMsg', 'Password-reset email sent. Check your inbox and follow the secure link.');
    } catch (error) {
      setText(
        'authMsg',
        error?.message === 'reset-request-timeout'
          ? 'Password reset request timed out. Check your connection and try again.'
          : `Password reset failed: ${error?.message || 'Supabase/network error'}`
      );
    } finally {
      if (button) button.disabled = false;
    }
  }

  function openPasswordDialog(title = 'Create new password', recovery = true) {
    let modal = $('medPasswordModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'medPasswordModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.cssText = 'position:fixed;inset:0;z-index:30000;background:rgba(4,9,48,.72);display:flex;align-items:center;justify-content:center;padding:20px';
      modal.innerHTML = '<div class="card" style="width:min(480px,100%);position:relative"><h2 id="medPasswordTitle">Create new password</h2><p class="muted" id="medPasswordHelp">Enter a new password for your MED™ account.</p><label>New password</label><input id="medNewPassword" type="password" autocomplete="new-password" minlength="8"><label style="margin-top:12px">Confirm new password</label><input id="medConfirmPassword" type="password" autocomplete="new-password" minlength="8"><div class="row" style="margin-top:14px"><button class="primary" type="button" id="medSavePassword">Save new password</button><button class="secondary" type="button" id="medCancelPassword">Cancel</button></div><p class="status" id="medPasswordMsg" style="margin:12px 0 0"></p></div>';
      document.body.appendChild(modal);
      $('medCancelPassword').addEventListener('click', () => { modal.style.display = 'none'; });
      $('medSavePassword').addEventListener('click', savePassword);
    }

    modal.dataset.recovery = recovery ? '1' : '0';
    setText('medPasswordTitle', title);
    setText('medPasswordHelp', recovery
      ? 'Enter a new password for your MED™ account.'
      : 'Enter a new password for your signed-in MED™ account.');
    setText('medPasswordMsg', '');
    $('medNewPassword').value = '';
    $('medConfirmPassword').value = '';
    modal.style.display = 'flex';
    setTimeout(() => $('medNewPassword')?.focus(), 0);
  }

  async function savePassword() {
    const password = $('medNewPassword')?.value || '';
    const confirm = $('medConfirmPassword')?.value || '';
    const save = $('medSavePassword');
    const isRecovery = $('medPasswordModal')?.dataset.recovery === '1';

    if (password.length < 8) {
      setText('medPasswordMsg', 'Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setText('medPasswordMsg', 'Passwords do not match.');
      return;
    }

    if (save) save.disabled = true;
    setText('medPasswordMsg', 'Updating password…');

    try {
      const { data: sessionData, error: sessionError } = await withTimeout(
        sb.auth.getSession(),
        10000,
        'session-timeout'
      );
      if (sessionError) throw sessionError;
      if (!sessionData?.session) {
        throw new Error(isRecovery
          ? 'This recovery link is invalid or expired. Request a new password-reset email.'
          : 'Your sign-in session has expired. Sign in again before changing your password.');
      }

      const { error } = await withTimeout(
        sb.auth.updateUser({ password }),
        15000,
        'password-update-timeout'
      );
      if (error) throw error;

      setText('medPasswordMsg', 'New password saved. You can now sign in with it.');
      cleanRecoveryUrl();

      if (isRecovery) {
        await sb.auth.signOut({ scope: 'local' }).catch(() => {});
        setTimeout(() => location.reload(), 900);
      } else {
        setTimeout(() => {
          const modal = $('medPasswordModal');
          if (modal) modal.style.display = 'none';
        }, 900);
      }
    } catch (error) {
      const message = error?.message === 'session-timeout'
        ? 'The secure recovery session could not be verified. Request a new password-reset email.'
        : error?.message === 'password-update-timeout'
          ? 'Password update timed out. Check your connection and try again.'
          : error?.message || 'Supabase/network error';
      setText('medPasswordMsg', `Password update failed: ${message}`);
    } finally {
      if (save) save.disabled = false;
    }
  }

  function handleAuthEvent(event) {
    if (event === 'PASSWORD_RECOVERY') {
      openPasswordDialog('Create new password', true);
    }
  }

  ensureRecoveryUi();
  const observer = new MutationObserver(ensureRecoveryUi);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  sb.auth.onAuthStateChange(handleAuthEvent);

  const urlError = authErrorFromUrl();
  if (urlError) {
    ensureRecoveryUi();
    setText('authMsg', `Password recovery link is invalid or expired: ${urlError.description}`);
    cleanRecoveryUrl();
    return;
  }

  if (new URLSearchParams(location.search).get(RECOVER_PARAM) === RECOVER_VALUE) {
    sb.auth.getSession().then(({ data, error }) => {
      if (error || !data?.session) {
        ensureRecoveryUi();
        setText('authMsg', 'Password recovery link is invalid or expired. Request a new password-reset email.');
        return;
      }
      openPasswordDialog('Create new password', true);
    }).catch(error => {
      ensureRecoveryUi();
      setText('authMsg', `Password recovery failed: ${error?.message || 'Supabase/network error'}`);
    });
  }
}
