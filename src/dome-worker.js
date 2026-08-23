import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-08-23T04:52-05:00-tetelestai-same-origin-recovery';

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
  '/tetelestai-recovery-loader.js',
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
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
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
      results.push({ path, status: response.status, ok: response.ok, content_type: response.headers.get('content-type'), bytes: new TextEncoder().encode(text).byteLength, signature: text.slice(0, 120).replace(/\s+/g, ' ') });
    } catch (error) {
      results.push({ path, ok: false, error: String(error) });
    }
  }
  return Response.json({ ok: results.every(item => item.ok), worker: 'dome-dashboard', deploy_marker: DOME_DEPLOY_MARKER, critical_assets: results }, { headers: { 'Cache-Control': 'no-store' } });
}

async function inspectTetelestaiData(env) {
  const base = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  const checks = [];
  for (const table of ['projects', 'tasks']) {
    try {
      const response = await fetch(`${base}/rest/v1/${table}?select=id&limit=1`, { headers });
      const text = await response.text();
      let payload = null;
      try { payload = JSON.parse(text); } catch (_) { payload = text.slice(0, 300); }
      checks.push({ table, status: response.status, ok: response.ok, content_type: response.headers.get('content-type'), payload });
    } catch (error) {
      checks.push({ table, ok: false, error: String(error) });
    }
  }
  return Response.json({ ok: checks.every(item => item.ok), worker: 'dome-dashboard', deploy_marker: DOME_DEPLOY_MARKER, supabase_url: base, checks }, { headers: { 'Cache-Control': 'no-store' } });
}

async function tetelestaiRecoveryData(env) {
  const base = env.SUPABASE_URL;
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };
  try {
    const [pRes,tRes] = await Promise.all([
      fetch(`${base}/rest/v1/projects?select=*&order=created_at.asc`, { headers }),
      fetch(`${base}/rest/v1/tasks?select=*&order=created_at.asc`, { headers })
    ]);
    if (!pRes.ok || !tRes.ok) {
      return Response.json({ ok:false, error:'Supabase recovery read failed', projects_status:pRes.status, tasks_status:tRes.status }, { status:502, headers:{'Cache-Control':'no-store'} });
    }
    const [projects,tasks] = await Promise.all([pRes.json(),tRes.json()]);
    return Response.json({ ok:true, worker:'dome-dashboard', deploy_marker:DOME_DEPLOY_MARKER, projects, tasks }, { headers:{'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0'} });
  } catch (error) {
    return Response.json({ ok:false, error:String(error) }, { status:500, headers:{'Cache-Control':'no-store'} });
  }
}

async function injectTetelestaiRecovery(response, originalPath) {
  if (originalPath !== '/projects-tasks.html' || !response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  const marker = '<script src="tetelestai-recovery-loader.js?v=20260823-0452" defer></script>';
  const body = html.includes('tetelestai-recovery-loader.js') ? html : html.replace('</body>', `${marker}</body>`);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('X-DOME-TETELESTAI-Recovery', 'same-origin');
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
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
        tetelestai_browser_recovery: true,
        tetelestai_same_origin_recovery: true,
        diagnostics: '/api/dome/assets',
        data_diagnostics: '/api/dome/tetelestai-data',
        recovery_data: '/api/dome/tetelestai-recovery-data',
        rad_guide: '/rac-epi-apn-guide.html',
        rad_asset: '/rad-guide-live-20260822.html',
        tetelestai: '/projects-tasks.html',
        tetelestai_asset: '/projects-tasks-live-20260822.html',
        rac_ui_asset: '/tetelestai-rac-ui-v4.js',
        recovery_asset: '/tetelestai-recovery-loader.js'
      }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0', 'X-DOME-Deploy': DOME_DEPLOY_MARKER, 'X-DOME-Asset-Bypass': 'active' } });
    }

    if (url.pathname === '/api/dome/assets') return inspectAssets(request, env);
    if (url.pathname === '/api/dome/tetelestai-data') return inspectTetelestaiData(env);
    if (url.pathname === '/api/dome/tetelestai-recovery-data') return tetelestaiRecoveryData(env);

    const liveRequest = rewriteLiveAssetRequest(request, url);
    let response = await shamarWorker.fetch(liveRequest, env, ctx);
    response = await injectTetelestaiRecovery(response, url.pathname);
    return withDomeHeaders(response);
  },

  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') return shamarWorker.scheduled(controller, env, ctx);
  }
};
