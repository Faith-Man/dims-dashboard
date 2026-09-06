import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-06T10:53-05:00-med-fallback-badge';

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

async function injectMedFallbackBadge(response) {
  const html = await response.text();
  const badgeHtml = `<div class="orb" aria-label="MED Marriage Evaluation Dome" data-med-orb-runtime="fallback-badge" style="width:112px!important;height:112px!important;border-radius:50%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;flex:0 0 auto!important;overflow:hidden!important;border:3px solid #D8B64C!important;background:radial-gradient(circle at 35% 28%,#2F8BFF 0%,#1355D7 34%,#111D6C 68%,#0C1262 100%)!important;box-shadow:0 0 0 2px rgba(255,255,255,.16) inset,0 0 24px rgba(36,232,255,.48),0 8px 28px rgba(4,10,70,.42)!important;color:#fff!important;text-align:center!important"><span style="font:900 31px/1 Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial!important;letter-spacing:2px!important;color:#fff!important;text-shadow:0 2px 7px rgba(0,0,0,.35)!important">MED</span><span aria-hidden="true" style="font:800 23px/1 Georgia,serif!important;color:#F4D976!important;letter-spacing:-6px!important;margin-left:-4px!important;text-shadow:0 0 8px rgba(244,217,118,.55)!important">◯◯</span><span style="font:700 7px/1.15 Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial!important;letter-spacing:.7px!important;color:#DDEBFF!important">MARRIAGE EVALUATION</span></div>`;

  const replaced = html.replace(
    /<div class="orb"[^>]*>.*?<\/div>/s,
    badgeHtml
  );

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('x-dome-med-orb-injected', replaced !== html ? 'fallback-badge' : 'no-match');
  return new Response(replaced, {
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
        med_orb_mode: 'fallback-badge-no-image-dependency'
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER } });
    }

    let response = await shamarWorker.fetch(request, env, ctx);
    if (url.pathname === '/med-marriage-evaluation-dome-secure.html') {
      response = await injectMedFallbackBadge(response);
    }
    return withDomeHeaders(response);
  },
  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};