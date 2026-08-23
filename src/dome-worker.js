import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-08-23T03:20-05:00-tetelestai-diagnostics';

const LIVE_ASSET_ALIASES = new Map([
  ['/rac-epi-apn-guide.html', '/rad-guide-live-20260822.html'],
  ['/projects-tasks.html', '/projects-tasks-live-20260822.html'],
  ['/tetelestai-rac-ui-v3.js', '/tetelestai-rac-ui-v4.js']
]);

const TETELESTAI_CRITICAL_ASSETS = [
  '/projects-tasks-live-20260822.html',
  '/tetelestai-closed-loop.js',
  '/tetelestai-risk-ui-v2.js',
  '/tetelestai-deep-links.js',
  '/tetelestai-rac-priority-prototype.js',
  '/tetelestai-rac-ui-v4.js',
  '/dea-risk-matrix.js',
  '/dea-execution-priority.js',
  '/dims-shared.css'
];

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

async function inspectAssets(request, env) {
  const origin = new URL(request.url).origin;
  const results = [];
  for (const path of TETELESTAI_CRITICAL_ASSETS) {
    try {
      const response = await env.ASSETS.fetch(new Request(origin + path, { method: 'GET' }));
      const text = await response.clone().text();
      results.push({
        path,
        status: response.status,
        ok: response.ok,
        content_type: response.headers.get('content-type'),
        bytes: new TextEncoder().encode(text).byteLength,
        signature: text.slice(0, 120).replace(/\s+/g, ' ')
      });
    } catch (error) {
      results.push({ path, ok: false, error: String(error) });
    }
  }
  return Response.json({
    ok: results.every(item => item.ok),
    worker: 'dome-dashboard',
    deploy_marker: DOME_DEPLOY_MARKER,
    critical_assets: results
  }, { headers: { 'Cache-Control': 'no-store' } });
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
        tetelestai_rac_restore: true,
        diagnostics: '/api/dome/assets',
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

    if (url.pathname === '/api/dome/assets') {
      return inspectAssets(request, env);
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
