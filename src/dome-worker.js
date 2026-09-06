import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-06T08:24-05:00-med-orb-same-origin-svg';

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

function injectMedOrb(response) {
  return new HTMLRewriter()
    .on('.hero .brand .orb', {
      element(element) {
        element.setInnerContent(
          '<img src="/assets/med-orb-canonical-live.svg?v=20260906-0824" alt="MED Marriage Evaluation Dome" style="display:block;width:100%;height:100%;object-fit:cover;border-radius:50%">',
          { html: true }
        );
        element.setAttribute('style', 'background:none!important;overflow:hidden');
      }
    })
    .transform(response);
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
        med_orb_mode: 'same-origin-svg-img'
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER } });
    }
    let response = await shamarWorker.fetch(request, env, ctx);
    if (
      url.pathname === '/med-marriage-evaluation-dome-secure.html' &&
      response.headers.get('content-type')?.includes('text/html')
    ) {
      response = injectMedOrb(response);
    }
    return withDomeHeaders(response);
  },
  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};
