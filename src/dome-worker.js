import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-08-22T22:23-05:00-rad-tetelestai-asset-bypass';

const LIVE_ASSET_ALIASES = new Map([
  ['/rac-epi-apn-guide.html', '/rad-guide-live-20260822.html'],
  ['/projects-tasks.html', '/projects-tasks-live-20260822.html'],
  ['/tetelestai-rac-ui-v3.js', '/tetelestai-rac-ui-v4.js']
]);

function withDomeHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-DOME-Deploy', DOME_DEPLOY_MARKER);
  headers.set('X-DOME-Asset-Bypass', 'active');
  if (headers.get('content-type')?.includes('text/html') || headers.get('content-type')?.includes('javascript')) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function rewriteLiveAssetRequest(request, url) {
  const alias = LIVE_ASSET_ALIASES.get(url.pathname);
  if (!alias) return request;
  const rewritten = new URL(url);
  rewritten.pathname = alias;
  return new Request(rewritten, request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/dome/deploy') {
      return Response.json({
        ok: true,
        worker: 'dome-dashboard',
        deploy_marker: DOME_DEPLOY_MARKER,
        asset_bypass: true,
        rad_guide: '/rac-epi-apn-guide.html',
        rad_asset: '/rad-guide-live-20260822.html',
        tetelestai: '/projects-tasks.html',
        tetelestai_asset: '/projects-tasks-live-20260822.html',
        rac_ui_asset: '/tetelestai-rac-ui-v4.js'
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'X-DOME-Deploy': DOME_DEPLOY_MARKER,
          'X-DOME-Asset-Bypass': 'active'
        }
      });
    }

    const liveRequest = rewriteLiveAssetRequest(request, url);
    const response = await shamarWorker.fetch(liveRequest, env, ctx);
    return withDomeHeaders(response);
  },

  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') {
      return shamarWorker.scheduled(controller, env, ctx);
    }
  }
};
