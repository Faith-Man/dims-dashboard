import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-09-06T10:20-05:00-med-orb-path-rewrite';
const MED_ORB_ROUTE = '/med-orb-canonical-runtime.jpg';
const MED_ORB_ASSET = '/assets/med-orb-canonical.jpg';

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

async function medOrbResponse(request, env) {
  const sourceUrl = new URL(MED_ORB_ASSET, request.url);
  const source = await env.ASSETS.fetch(new Request(sourceUrl, {
    method: 'GET',
    headers: { accept: 'image/jpeg,image/*;q=0.9,*/*;q=0.8' }
  }));
  if (!source.ok) {
    return new Response('MED orb asset unavailable', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
    });
  }
  return new Response(source.body, {
    status: 200,
    headers: {
      'content-type': 'image/jpeg',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'x-content-type-options': 'nosniff',
      'x-dome-med-orb': 'canonical-worker-route'
    }
  });
}

function injectMedOrb(response) {
  return new HTMLRewriter()
    .on('.orb', {
      element(element) {
        element.setInnerContent(
          `<img src="${MED_ORB_ROUTE}?v=20260906-1020" alt="MED Marriage Evaluation Dome" style="display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:50%!important;opacity:1!important;visibility:visible!important">`,
          { html: true }
        );
        element.setAttribute('style', 'background:none!important;overflow:hidden!important');
        element.setAttribute('data-med-orb-runtime', 'worker-jpeg');
      }
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === MED_ORB_ROUTE) {
      return medOrbResponse(request, env);
    }

    if (url.pathname === '/api/dome/deploy') {
      return Response.json({
        ok: true,
        worker: 'dome-dashboard',
        deploy_marker: DOME_DEPLOY_MARKER,
        tetelestai_mode: 'canonical-restored',
        tetelestai_source_commit: 'a349f15f45eab093f8e1aa3fbcd52e176bd4fa2e',
        tetelestai: '/projects-tasks.html',
        rad_guide: '/rac-epi-apn-guide.html',
        med_orb_mode: 'worker-served-canonical-jpeg-path-rewrite',
        med_orb_route: MED_ORB_ROUTE
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER } });
    }

    let response = await shamarWorker.fetch(request, env, ctx);
    if (url.pathname === '/med-marriage-evaluation-dome-secure.html') {
      response = injectMedOrb(response);
    }
    return withDomeHeaders(response);
  },
  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};