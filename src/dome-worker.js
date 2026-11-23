import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-10-med-admin-provisioning-v1';

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

async function wireMedPasswordRecovery(response) {
  const html = await response.text();
  const hookMarker = '/* med-password-recovery-hook:v7 */';
  const clientMarker = "const sb=createClient('https://sdquzhsylqpbhrmqjqgk.supabase.co','sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How');";
  const hook = `${clientMarker}\n${hookMarker}\nimport('/med-password-recovery.js')\n  .then(({ installMedPasswordRecovery }) => installMedPasswordRecovery(sb))\n  .catch(error => {\n    const msg = document.getElementById('authMsg');\n    if (msg) msg.textContent = 'Password recovery unavailable: ' + (error?.message || 'module load failed');\n  });\nimport('/med-counselor-dashboard.js')\n  .then(({ installMedCounselorDashboard }) => installMedCounselorDashboard(sb))\n  .catch(error => {\n    console.error('MED counselor dashboard enhancement unavailable', error);\n  });\nimport('/med-admin.js')\n  .then(({ installMedAdminConsole }) => installMedAdminConsole(sb))\n  .catch(error => {\n    console.error('MED administrator console unavailable', error);\n  });\nsetTimeout(async () => {\n  const notice = document.getElementById('caseNotice');\n  const signin = document.getElementById('signin');\n  if (!notice || !signin) return;\n  try {\n    const { data: { session } } = await sb.auth.getSession();\n    if (!session) return;\n    const { data: isAdmin, error: adminError } = await sb.rpc('med_is_admin');\n    if (adminError) console.error('MED administrator check failed', adminError);\n    if (isAdmin) {\n      if (typeof role !== 'undefined') role = 'counselor';\n      if (typeof hide === 'function') hide('signin'); else signin.classList.add('hidden');\n      if (typeof message === 'function') message('DIMS administrator access verified.'); else notice.textContent = 'DIMS administrator access verified.';\n      if (typeof loadCounselor === 'function') await loadCounselor();\n      if (typeof show === 'function') show('counselor'); else document.getElementById('counselor')?.classList.remove('hidden');\n      return;\n    }\n    if (/access denied/i.test(notice.textContent || '')) {\n      signin.classList.remove('hidden');\n      const msg = document.getElementById('authMsg');\n      if (msg) msg.textContent = 'Signed in as ' + (session.user?.email || 'this account') + '. This account is not authorized for this MED™ case. Sign out and switch accounts.';\n      if (!document.getElementById('medSwitchAccountBtn')) {\n        const switchButton = document.createElement('button');\n        switchButton.type = 'button';\n        switchButton.id = 'medSwitchAccountBtn';\n        switchButton.className = 'secondary';\n        switchButton.textContent = 'Sign out / Switch account';\n        switchButton.addEventListener('click', async () => {\n          switchButton.disabled = true;\n          await sb.auth.signOut();\n          location.reload();\n        });\n        (document.getElementById('signInBtn')?.parentElement || signin).appendChild(switchButton);\n      }\n    }\n  } catch (error) {\n    console.error('MED administrator access bridge failed', error);\n  }\n}, 800);\nsetTimeout(() => {\n  const notice = document.getElementById('caseNotice');\n  const signin = document.getElementById('signin');\n  if (!notice || !signin) return;\n  if (!/loading secure case context/i.test(notice.textContent || '')) return;\n  signin.classList.remove('hidden');\n  notice.textContent = 'Secure case verification is taking longer than expected. Sign in to continue; MED™ will verify your case assignment before any assessment data is shown.';\n  const msg = document.getElementById('authMsg');\n  if (msg && !msg.textContent) msg.textContent = 'If sign-in does not complete, refresh once and try again. No case data is exposed until authorization succeeds.';\n}, 12000);`;

  let injected = html;
  if (!html.includes(hookMarker) && html.includes(clientMarker)) injected = html.replace(clientMarker, hook);

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('x-dome-med-password-recovery', injected !== html ? 'canonical-client-v7' : html.includes(hookMarker) ? 'present-v7' : 'hook-missing');
  headers.set('x-dome-med-counselor-dashboard', injected !== html ? 'enhanced-v1' : html.includes(hookMarker) ? 'present-v1' : 'hook-missing');
  headers.set('x-dome-med-admin-access', injected !== html ? 'administrator-provisioning-v1' : html.includes('medSwitchAccountBtn') ? 'present-v1' : 'hook-missing');
  return new Response(injected, { status: response.status, statusText: response.statusText, headers });
}

function medJson(data, status = 200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

async function medAdminContext(request, env) {
  const bearer = request.headers.get('authorization') || '';
  if (!/^Bearer\s+\S+$/i.test(bearer)) return { ok: false, status: 401, error: 'Authentication required.' };
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 503, error: 'MED administrator service is not configured.' };
  }

  const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, authorization: bearer }
  });
  if (!userRes.ok) return { ok: false, status: 401, error: 'Invalid or expired administrator session.' };
  const user = await userRes.json();

  const adminRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/med_is_admin`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      authorization: bearer,
      'content-type': 'application/json'
    },
    body: '{}'
  });
  if (!adminRes.ok) return { ok: false, status: 403, error: 'Administrator authorization check failed.' };
  const isAdmin = await adminRes.json();
  if (isAdmin !== true) return { ok: false, status: 403, error: 'DIMS administrator access required.' };
  return { ok: true, user };
}

function serviceHeaders(env, extra = {}) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra
  };
}

async function findAuthUserByEmail(env, email) {
  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: serviceHeaders(env)
    });
    if (!response.ok) throw new Error(`Unable to list Auth users (${response.status}).`);
    const payload = await response.json();
    const users = payload.users || payload || [];
    const found = users.find(user => String(user.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (!Array.isArray(users) || users.length < 200) break;
  }
  return null;
}

async function authAdminRequest(env, path, options = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin${path}`, {
    ...options,
    headers: serviceHeaders(env, { 'content-type': 'application/json', ...(options.headers || {}) })
  });
  const body = await response.json().catch(async () => ({ message: await response.text().catch(() => '') }));
  if (!response.ok) throw new Error(body.msg || body.message || body.error_description || `Auth administrator request failed (${response.status}).`);
  return body;
}

async function restService(env, path, options = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: serviceHeaders(env, { 'content-type': 'application/json', ...(options.headers || {}) })
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(body?.message || body?.hint || `MED persistence request failed (${response.status}).`);
  return body;
}

async function listMedCaseUsers(env, caseId) {
  const participants = await restService(env, `med_case_participants?select=user_id,role,created_at&case_id=eq.${encodeURIComponent(caseId)}&order=role.asc`);
  const out = [];
  for (const participant of participants || []) {
    const user = await authAdminRequest(env, `/users/${participant.user_id}`, { method: 'GET' });
    out.push({
      id: user.id,
      email: user.email,
      role: participant.role,
      email_confirmed: Boolean(user.email_confirmed_at || user.confirmed_at),
      last_sign_in_at: user.last_sign_in_at || null
    });
  }
  return out;
}

async function provisionMedUser(env, payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const role = String(payload.role || '').trim().toLowerCase();
  const caseId = String(payload.case_id || '').trim();
  const password = String(payload.temporary_password || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid email address is required.');
  if (!['husband', 'wife', 'counselor'].includes(role)) throw new Error('Role must be husband, wife, or counselor.');
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) throw new Error('A valid MED case ID is required.');
  if (password.length < 10) throw new Error('Temporary password must be at least 10 characters.');

  let user = await findAuthUserByEmail(env, email);
  if (!user) {
    user = await authAdminRequest(env, '/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, email_confirm: payload.confirm_email !== false })
    });
  } else {
    user = await authAdminRequest(env, `/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ password, email_confirm: payload.confirm_email !== false })
    });
  }

  await restService(env, `med_case_participants?case_id=eq.${encodeURIComponent(caseId)}&role=eq.${encodeURIComponent(role)}&user_id=neq.${encodeURIComponent(user.id)}`, {
    method: 'DELETE',
    headers: { prefer: 'return=minimal' }
  });

  await restService(env, 'med_case_participants?on_conflict=case_id,user_id', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ case_id: caseId, user_id: user.id, role }])
  });

  const verified = (await listMedCaseUsers(env, caseId)).find(item => item.id === user.id);
  if (!verified || verified.role !== role) throw new Error('Provisioning write completed but read-back verification failed.');
  return verified;
}

async function handleMedAdmin(request, env) {
  if (request.method !== 'POST') return medJson({ error: 'Method not allowed.' }, 405);
  const context = await medAdminContext(request, env);
  if (!context.ok) return medJson({ error: context.error }, context.status);

  let payload;
  try { payload = await request.json(); }
  catch { return medJson({ error: 'Invalid JSON request.' }, 400); }

  try {
    if (payload.action === 'list_case_users') {
      const caseId = String(payload.case_id || '').trim();
      if (!/^[0-9a-f-]{36}$/i.test(caseId)) return medJson({ error: 'A valid MED case ID is required.' }, 400);
      return medJson({ ok: true, users: await listMedCaseUsers(env, caseId) });
    }
    if (payload.action === 'provision_user') {
      const user = await provisionMedUser(env, payload);
      return medJson({ ok: true, user });
    }
    return medJson({ error: 'Unsupported MED administrator action.' }, 400);
  } catch (error) {
    console.error(JSON.stringify({ event: 'med_admin_failure', action: payload.action, error: String(error) }));
    return medJson({ error: error?.message || 'MED administrator action failed.' }, 400);
  }
}

async function verifyMedProduction(request) {
  const origin = new URL(request.url).origin;
  const caseId = '3c31f603-473f-4d33-aed8-e3fb03a49705';
  const suffix = `?case=${caseId}&runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`;
  const checks = [];

  try {
    const [htmlRes, extRes, recoveryRes, counselorRes, adminRes, companionRes, orbRes] = await Promise.all([
      fetch(`${origin}/med-marriage-evaluation-dome-secure.html${suffix}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-marriage-evaluation-dome-secure${suffix}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-password-recovery.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-counselor-dashboard.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-admin.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/di-companion.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/assets/med-orb-canonical.jpg?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } })
    ]);

    const [html, ext, recovery, counselor, admin, companion, orbBytes] = await Promise.all([
      htmlRes.text(), extRes.text(), recoveryRes.text(), counselorRes.text(), adminRes.text(), companionRes.text(), orbRes.arrayBuffer()
    ]);
    const orb = new Uint8Array(orbBytes);

    const requiredPageMarkers = [
      'MED™ — Secure Marriage Evaluation Dome',
      'med-password-recovery-hook:v7',
      "import('/med-counselor-dashboard.js')",
      "import('/med-admin.js')",
      'medSwitchAccountBtn',
      'DIMS administrator access verified.',
      'Secure case verification is taking longer than expected.',
      'id="signin"',
      'id="counselor"'
    ];

    for (const marker of requiredPageMarkers) {
      checks.push({ name: `html:${marker}`, ok: htmlRes.ok && html.includes(marker) });
      checks.push({ name: `extensionless:${marker}`, ok: extRes.ok && ext.includes(marker) });
    }

    checks.push({ name: 'html:no-fallback-orb', ok: !html.includes('data-med-orb-runtime="fallback-badge"') });
    checks.push({ name: 'extensionless:no-fallback-orb', ok: !ext.includes('data-med-orb-runtime="fallback-badge"') });
    checks.push({ name: 'recovery:rate-limit-hour-lockout', ok: recoveryRes.ok && recovery.includes('RATE_LIMIT_COOLDOWN_MS = 60 * 60 * 1000') });
    checks.push({ name: 'recovery:supabase-rate-limit-detection', ok: recoveryRes.ok && recovery.includes('over_email_send_rate_limit') });
    checks.push({ name: 'counselor:question-instrument', ok: counselorRes.ok && counselor.includes('MED™ Assessment Instrument') });
    checks.push({ name: 'counselor:rad-matrix', ok: counselorRes.ok && counselor.includes('RAD™ Risk Assessment Matrix') });
    checks.push({ name: 'counselor:safety-override', ok: counselorRes.ok && counselor.includes('Safety override') });
    checks.push({ name: 'admin:console', ok: adminRes.ok && admin.includes('MED™ User Administration') });
    checks.push({ name: 'admin:provisioning-client', ok: adminRes.ok && admin.includes('provision_user') });
    checks.push({ name: 'companion:canonical-med-orb', ok: companionRes.ok && companion.includes('/assets/med-orb-canonical.jpg') });
    checks.push({ name: 'orb:jpeg', ok: orbRes.ok && orb.length > 2 && orb[0] === 0xff && orb[1] === 0xd8 });
  } catch (error) {
    checks.push({ name: 'runtime-verifier-request', ok: false, error: error?.message || 'verification request failed' });
  }

  const failed = checks.filter(check => !check.ok);
  return { ok: failed.length === 0, checks, failed: failed.map(check => check.name) };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/med/admin') return handleMedAdmin(request, env);

    if (url.pathname === '/api/dome/deploy') {
      const medVerification = await verifyMedProduction(request);
      return Response.json({
        ok: medVerification.ok,
        worker: 'dome-dashboard',
        deploy_marker: DOME_DEPLOY_MARKER,
        tetelestai_mode: 'canonical-restored',
        tetelestai_source_commit: 'a349f15f45eab093f8e1aa3fbcd52e176bd4fa2e',
        tetelestai: '/projects-tasks.html',
        rad_guide: '/rac-epi-apn-guide.html',
        med_orb_mode: medVerification.ok ? 'canonical-image' : 'verification-failed',
        med_password_recovery: 'canonical-client-v7-auth-boot-watchdog',
        med_counselor_dashboard: 'enhanced-v1-question-instrument-rad-matrix',
        med_admin_access: 'administrator-provisioning-v1',
        med_runtime_verified: medVerification.ok,
        med_runtime_failed_checks: medVerification.failed
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER } });
    }

    let response = await shamarWorker.fetch(request, env, ctx);
    if (url.pathname === '/med-marriage-evaluation-dome-secure.html' || url.pathname === '/med-marriage-evaluation-dome-secure') {
      response = await wireMedPasswordRecovery(response);
    }
    return withDomeHeaders(response);
  },
  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};
