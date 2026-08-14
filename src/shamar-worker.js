const SOURCES = [
  { name: 'UN News — Peace and Security', url: 'https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml' },
  { name: 'UN News — Middle East', url: 'https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml' },
  { name: 'ReliefWeb — Updates', url: 'https://reliefweb.int/updates/rss.xml' }
];

const MAX_FEED_BYTES = 512000;
const MAX_ITEMS_PER_SOURCE = 12;
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

async function boundedText(response, limit = MAX_FEED_BYTES) {
  if (!response.body) return '';
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > limit) throw new Error(`Feed exceeds ${limit} bytes`);
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) throw new Error(`Feed exceeds ${limit} bytes`);
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

function tag(item, name) {
  return decodeXml(item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return blocks.slice(0, MAX_ITEMS_PER_SOURCE).map((item) => {
    const linkTag = tag(item, 'link');
    const href = item.match(/<link[^>]+href=["']([^"']+)/i)?.[1];
    return { source: source.name, title: tag(item, 'title'), summary: tag(item, 'description') || tag(item, 'summary') || tag(item, 'content'), url: href || linkTag, published_at: tag(item, 'pubDate') || tag(item, 'published') || tag(item, 'updated') };
  }).filter((item) => item.title && item.url);
}

async function collectSources() {
  const settled = await Promise.allSettled(SOURCES.map(async (source) => {
    const response = await fetch(source.url, { headers: { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'user-agent': 'Dominion1st-SHAMAR/1.0' }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
    return parseFeed(await boundedText(response), source);
  }));
  const items = settled.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const errors = settled.flatMap((result) => result.status === 'rejected' ? [String(result.reason)] : []);
  if (!items.length) throw new Error(`No source items collected. ${errors.join('; ')}`);
  return { items, errors };
}

const responseSchema = {
  type: 'object',
  properties: {
    global_overview: { type: 'string' },
    risk_barometer: { type: 'object', properties: { peace_index: { type: 'string' }, security_volatility: { type: 'string' }, diplomatic_momentum: { type: 'string' }, global_risk: { type: 'string' }, note: { type: 'string' } }, required: ['peace_index','security_volatility','diplomatic_momentum','global_risk','note'] },
    regions: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, status: { type: 'string' }, trend: { type: 'string' }, detail: { type: 'string' } }, required: ['name','status','trend','detail'] } },
    trackers: { type: 'array', items: { type: 'object', properties: { theme: { type: 'string' }, current_action: { type: 'string' }, next_trigger: { type: 'string' } }, required: ['theme','current_action','next_trigger'] } },
    watchpoints: { type: 'array', items: { type: 'object', properties: { rank: { type: 'integer' }, title: { type: 'string' }, priority: { type: 'string' }, description: { type: 'string' } }, required: ['rank','title','priority','description'] } },
    scripture_anchor: { type: 'string' }
  },
  required: ['global_overview','risk_barometer','regions','trackers','watchpoints','scripture_anchor']
};

function buildPrompt(items, observedAt) {
  return `You are the analytical engine for Dominion1st SHAMAR Peace & Safety Intelligence. Produce a sober, factual operational brief from only the supplied source items observed at ${observedAt}. Distinguish observed facts from analysis. Do not invent facts, dates, quotations, casualty figures, agreements, prophecy fulfillment, or divine revelation. If evidence is incomplete, say so. Focus on global peace/security, Israel and the Middle East, war/conflict, terrorism, persecution/religious freedom when present, and ministry-relevant watchpoints. Scripture provides context, never a fabricated claim of fulfillment. Use 1 Thessalonians 5:3-6 or Mark 13:33 as the scripture anchor. Return concise structured JSON.\n\nSOURCE ITEMS:\n${JSON.stringify(items)}`;
}

async function analyze(env, items, observedAt) {
  const result = await env.AI.run(AI_MODEL, { messages: [{ role: 'system', content: 'Follow the SHAMAR intelligence discipline: OBSERVED EVENT → ANALYSIS → BIBLICAL CONTEXT → MINISTRY IMPACT → PRAYER/PREPARATION/RESPONSE.' }, { role: 'user', content: buildPrompt(items, observedAt) }], response_format: { type: 'json_schema', json_schema: { name: 'shamar_brief', strict: true, schema: responseSchema } } });
  const payload = result?.response ?? result;
  return typeof payload === 'string' ? JSON.parse(payload) : payload;
}

function validateBrief(brief) {
  if (!brief || typeof brief.global_overview !== 'string' || !Array.isArray(brief.regions) || !Array.isArray(brief.trackers) || !Array.isArray(brief.watchpoints) || !brief.risk_barometer) throw new Error('Workers AI returned an invalid SHAMAR brief');
  return brief;
}

async function publish(env, brief, items, observedAt) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  const sourceMap = new Map(items.map((item) => [item.url, `${item.source} — ${item.title} — ${item.url}`]));
  const row = { brief_date: observedAt.slice(0,10), global_overview: brief.global_overview, risk_barometer: brief.risk_barometer, regions: brief.regions.slice(0,8), trackers: brief.trackers.slice(0,8), watchpoints: brief.watchpoints.slice(0,8).map((w, index) => ({ ...w, rank: index + 1 })), scripture_anchor: brief.scripture_anchor, sources: [...sourceMap.values()].slice(0,24), observed_at: observedAt, updated_at: observedAt, generation_status: 'published', source_count: sourceMap.size };
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/peace_safety_briefs?on_conflict=brief_date`, { method: 'POST', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json', prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(row) });
  if (!response.ok) throw new Error(`Supabase publish failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function runIngestion(env) {
  const observedAt = new Date().toISOString();
  const { items, errors } = await collectSources();
  const brief = validateBrief(await analyze(env, items, observedAt));
  const published = await publish(env, brief, items, observedAt);
  console.log(JSON.stringify({ event: 'shamar_ingestion_complete', observed_at: observedAt, source_items: items.length, source_errors: errors, rows: published.length }));
  return { ok: true, observed_at: observedAt, source_items: items.length, source_errors: errors, rows: published.length };
}

async function authorized(request, env) {
  if (!env.SHAMAR_REFRESH_TOKEN) return false;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const encoder = new TextEncoder();
  const [expectedHash, suppliedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(env.SHAMAR_REFRESH_TOKEN)),
    crypto.subtle.digest('SHA-256', encoder.encode(supplied))
  ]);
  return crypto.subtle.timingSafeEqual(expectedHash, suppliedHash);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/shamar/status') return json({ service: 'SHAMAR Intelligence Pipeline', schedule: '0 */6 * * *', status: env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'awaiting-service-secret' });
    if (url.pathname === '/api/shamar/refresh' && request.method === 'POST') {
      if (!(await authorized(request, env))) return json({ error: 'Unauthorized' }, 401);
      try { return json(await runIngestion(env)); } catch (error) { console.error(JSON.stringify({ event: 'shamar_manual_ingestion_failed', error: String(error) })); return json({ error: 'SHAMAR refresh failed' }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(controller, env) {
    try { await runIngestion(env); } catch (error) { console.error(JSON.stringify({ event: 'shamar_scheduled_ingestion_failed', scheduled_time: controller.scheduledTime, cron: controller.cron, error: String(error) })); throw error; }
  }
};
