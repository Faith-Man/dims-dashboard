import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-07T22:40-05:00-med-admin-access-v1';

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
  const hookMarker = '/* med-password-recovery-hook:v6 */';
  const clientMarker = "const sb=createClient('https://sdquzhsylqpbhrmqjqgk.supabase.co','sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How');";
  const hook = `${clientMarker}\n${hookMarker}\nimport('/med-password-recovery.js')\n  .then(({ installMedPasswordRecovery }) => installMedPasswordRecovery(sb))\n  .catch(error => {\n    const msg = document.getElementById('authMsg');\n    if (msg) msg.textContent = 'Password recovery unavailable: ' + (error?.message || 'module load failed');\n  });\nimport('/med-counselor-dashboard.js')\n  .then(({ installMedCounselorDashboard }) => installMedCounselorDashboard(sb))\n  .catch(error => {\n    console.error('MED counselor dashboard enhancement unavailable', error);\n  });\nsetTimeout(async () => {\n  const notice = document.getElementById('caseNotice');\n  const signin = document.getElementById('signin');\n  if (!notice || !signin) return;\n  try {\n    const { data: { session } } = await sb.auth.getSession();\n    if (!session) return;\n    const { data: isAdmin, error: adminError } = await sb.rpc('med_is_admin');\n    if (adminError) console.error('MED administrator check failed', adminError);\n    if (isAdmin) {\n      if (typeof role !== 'undefined') role = 'counselor';\n      if (typeof hide === 'function') hide('signin'); else signin.classList.add('hidden');\n      if (typeof message === 'function') message('DIMS administrator access verified.'); else notice.textContent = 'DIMS administrator access verified.';\n      if (typeof loadCounselor === 'function') await loadCounselor();\n      if (typeof show === 'function') show('counselor'); else document.getElementById('counselor')?.classList.remove('hidden');\n      return;\n    }\n    if (/access denied/i.test(notice.textContent || '')) {\n      signin.classList.remove('hidden');\n      const msg = document.getElementById('authMsg');\n      if (msg) msg.textContent = 'Signed in as ' + (session.user?.email || 'this account') + '. This account is not authorized for this MED™ case. Sign out and switch accounts.';\n      if (!document.getElementById('medSwitchAccountBtn')) {\n        const switchButton = document.createElement('button');\n        switchButton.type = 'button';\n        switchButton.id = 'medSwitchAccountBtn';\n        switchButton.className = 'secondary';\n        switchButton.textContent = 'Sign out / Switch account';\n        switchButton.addEventListener('click', async () => {\n          switchButton.disabled = true;\n          await sb.auth.signOut();\n          location.reload();\n        });\n        (document.getElementById('signInBtn')?.parentElement || signin).appendChild(switchButton);\n      }\n    }\n  } catch (error) {\n    console.error('MED administrator access bridge failed', error);\n  }\n}, 800);\nsetTimeout(() => {\n  const notice = document.getElementById('caseNotice');\n  const signin = document.getElementById('signin');\n  if (!notice || !signin) return;\n  if (!/loading secure case context/i.test(notice.textContent || '')) return;\n  signin.classList.remove('hidden');\n  notice.textContent = 'Secure case verification is taking longer than expected. Sign in to continue; MED™ will verify your case assignment before any assessment data is shown.';\n  const msg = document.getElementById('authMsg');\n  if (msg && !msg.textContent) msg.textContent = 'If sign-in does not complete, refresh once and try again. No case data is exposed until authorization succeeds.';\n}, 12000);`;

  let injected = html;
  if (!html.includes(hookMarker) && html.includes(clientMarker)) {
    injected = html.replace(clientMarker, hook);
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('x-dome-med-password-recovery', injected !== html ? 'canonical-client-v6' : html.includes(hookMarker) ? 'present-v6' : 'hook-missing');
  headers.set('x-dome-med-counselor-dashboard', injected !== html ? 'enhanced-v1' : html.includes(hookMarker) ? 'present-v1' : 'hook-missing');
  headers.set('x-dome-med-admin-access', injected !== html ? 'administrator-bridge-v1' : html.includes('medSwitchAccountBtn') ? 'present-v1' : 'hook-missing');
  return new Response(injected, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function verifyMedProduction(request) {
  const origin = new URL(request.url).origin;
  const caseId = '3c31f603-473f-4d33-aed8-e3fb03a49705';
  const suffix = `?case=${caseId}&runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`;
  const checks = [];

  try {
    const [htmlRes, extRes, recoveryRes, counselorRes, companionRes, orbRes] = await Promise.all([
      fetch(`${origin}/med-marriage-evaluation-dome-secure.html${suffix}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-marriage-evaluation-dome-secure${suffix}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-password-recovery.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/med-counselor-dashboard.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/di-companion.js?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } }),
      fetch(`${origin}/assets/med-orb-canonical.jpg?runtime_contract=${encodeURIComponent(DOME_DEPLOY_MARKER)}`, { headers: { 'Cache-Control': 'no-cache' } })
    ]);

    const [html, ext, recovery, counselor, companion, orbBytes] = await Promise.all([
      htmlRes.text(), extRes.text(), recoveryRes.text(), counselorRes.text(), companionRes.text(), orbRes.arrayBuffer()
    ]);
    const orb = new Uint8Array(orbBytes);

    const requiredPageMarkers = [
      'MED™ — Secure Marriage Evaluation Dome',
      'med-password-recovery-hook:v6',
      "import('/med-counselor-dashboard.js')",
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
        med_password_recovery: 'canonical-client-v6-auth-boot-watchdog',
        med_counselor_dashboard: 'enhanced-v1-question-instrument-rad-matrix',
        med_admin_access: 'administrator-read-override-switch-account-v1',
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