import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-06T16:18-05:00-med-auth-boot-watchdog';

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
  const hookMarker = '/* med-password-recovery-hook:v5 */';
  const clientMarker = "const sb=createClient('https://sdquzhsylqpbhrmqjqgk.supabase.co','sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How');";
  const hook = `${clientMarker}\n${hookMarker}\nimport('/med-password-recovery.js')\n  .then(({ installMedPasswordRecovery }) => installMedPasswordRecovery(sb))\n  .catch(error => {\n    const msg = document.getElementById('authMsg');\n    if (msg) msg.textContent = 'Password recovery unavailable: ' + (error?.message || 'module load failed');\n  });\nsetTimeout(() => {\n  const notice = document.getElementById('caseNotice');\n  const signin = document.getElementById('signin');\n  if (!notice || !signin) return;\n  if (!/loading secure case context/i.test(notice.textContent || '')) return;\n  signin.classList.remove('hidden');\n  notice.textContent = 'Secure case verification is taking longer than expected. Sign in to continue; MED™ will verify your case assignment before any assessment data is shown.';\n  const msg = document.getElementById('authMsg');\n  if (msg && !msg.textContent) msg.textContent = 'If sign-in does not complete, refresh once and try again. No case data is exposed until authorization succeeds.';\n}, 12000);`;

  let injected = html;
  if (!html.includes(hookMarker) && html.includes(clientMarker)) {
    injected = html.replace(clientMarker, hook);
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('x-dome-med-password-recovery', injected !== html ? 'canonical-client-v5' : html.includes(hookMarker) ? 'present-v5' : 'hook-missing');
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
        med_password_recovery: 'canonical-client-v5-auth-boot-watchdog'
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