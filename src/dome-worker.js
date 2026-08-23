import shamarWorker from './shamar-worker.js';

const DOME_DEPLOY_MARKER = '2026-08-22T21:04-05:00-rad-tetelestai-recovery';

function withDomeHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-DOME-Deploy', DOME_DEPLOY_MARKER);
  if (headers.get('content-type')?.includes('text/html')) {
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/dome/deploy') {
      return Response.json({
        ok: true,
        worker: 'dome-dashboard',
        deploy_marker: DOME_DEPLOY_MARKER,
        rad_guide: '/rac-epi-apn-guide.html',
        tetelestai: '/projects-tasks.html'
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'X-DOME-Deploy': DOME_DEPLOY_MARKER
        }
      });
    }

    const response = await shamarWorker.fetch(request, env, ctx);
    return withDomeHeaders(response);
  },

  async scheduled(controller, env, ctx) {
    if (typeof shamarWorker.scheduled === 'function') {
      return shamarWorker.scheduled(controller, env, ctx);
    }
  }
};
