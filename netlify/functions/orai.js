const MAX_BODY_BYTES = 16 * 1024;
const MAX_INPUT_CHARS = 4_000;
const MAX_TEACHINGS = 20;
const MAX_TITLE_CHARS = 200;
const REQUEST_TIMEOUT_MS = 15_000;
const PROMPT_VERSION = process.env.ORAI_PROMPT_VERSION || 'orai-assistance-v1';
const MODEL_VERSION = process.env.ORAI_MODEL || 'gpt-4o-mini';
const ALLOWED_MODES = new Set(['dims_brief', 'doctrine_draft']);

export async function handler(event) {
  const requestId = event.headers?.['x-nf-request-id'] || crypto.randomUUID();

  if (event.httpMethod !== 'POST') {
    return json({ ok: false, error: 'Method not allowed', requestId }, 405, { Allow: 'POST' });
  }

  const contentType = event.headers?.['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json({ ok: false, error: 'Content-Type must be application/json', requestId }, 415);
  }

  const encodedBody = event.body || '';
  if (Buffer.byteLength(encodedBody, event.isBase64Encoded ? 'base64' : 'utf8') > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Request body is too large', requestId }, 413);
  }
  const bodyText = event.isBase64Encoded ? Buffer.from(encodedBody, 'base64').toString('utf8') : encodedBody;

  // Repository-side authentication hook. When ORAI_SHARED_TOKEN is configured,
  // requests must present it. Production still requires platform identity, rate
  // limiting, quotas, and secret rotation; this optional hook is not a claim that
  // those external controls exist.
  const authFailure = authorize(event);
  if (authFailure) return json({ ok: false, error: authFailure, requestId }, 401);

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return json({ ok: false, error: 'Malformed JSON request body', requestId }, 400);
  }

  const validationError = validatePayload(body);
  if (validationError) return json({ ok: false, error: validationError, requestId }, 422);

  const { mode, input = '', teachings = [] } = body;
  const systemPrompts = {
    dims_brief: 'You are OrEl embedded in DIMS. Produce a concise planning brief. Clearly label unverified claims, do not imply access to current intelligence, and do not generate or represent divine revelation, prophecy, a Now Word, or divine directives. Sections: Context, Evidence gaps, Operational considerations, and Suggested next actions.',
    doctrine_draft: 'You are OrEl providing writing assistance. Draft a Markdown study outline for human review. Do not claim divine authority or generate prophecy, revelation, a Now Word, or divine directives. Distinguish supplied Scripture references from interpretation and label all output as an AI-assisted draft.'
  };
  const messages = [
    { role: 'system', content: systemPrompts[mode] },
    { role: 'user', content: input || 'Create a concise, non-prophetic planning draft from the supplied context.' }
  ];
  if (teachings.length) {
    messages.push({
      role: 'system',
      content: `User-supplied context titles (not verified sources): ${teachings.map(({ title }) => title).join('; ')}`
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json({
      ok: false,
      error: 'AI assistance is unavailable',
      code: 'ORAI_NOT_CONFIGURED',
      requestId
    }, 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL_VERSION, messages, temperature: 0.3, max_tokens: 700 }),
      signal: controller.signal
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: 'orai_upstream_error', requestId, status: response.status, promptVersion: PROMPT_VERSION, model: MODEL_VERSION }));
      return json({ ok: false, error: 'AI assistance failed', code: 'ORAI_UPSTREAM_ERROR', requestId }, 502);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      console.error(JSON.stringify({ event: 'orai_empty_response', requestId, promptVersion: PROMPT_VERSION, model: MODEL_VERSION }));
      return json({ ok: false, error: 'AI assistance returned no content', code: 'ORAI_EMPTY_RESPONSE', requestId }, 502);
    }
    console.info(JSON.stringify({ event: 'orai_success', requestId, promptVersion: PROMPT_VERSION, model: MODEL_VERSION }));
    return json({ ok: true, data: content, meta: { requestId, promptVersion: PROMPT_VERSION, model: MODEL_VERSION, aiAssistedDraft: true } });
  } catch (error) {
    const code = error?.name === 'AbortError' ? 'ORAI_TIMEOUT' : 'ORAI_INTERNAL_ERROR';
    console.error(JSON.stringify({ event: 'orai_failure', requestId, code, promptVersion: PROMPT_VERSION, model: MODEL_VERSION }));
    return json({ ok: false, error: 'AI assistance failed', code, requestId }, code === 'ORAI_TIMEOUT' ? 504 : 500);
  } finally {
    clearTimeout(timeout);
  }
}

function authorize(event) {
  const expected = process.env.ORAI_SHARED_TOKEN;
  if (!expected) return null;
  const supplied = event.headers?.authorization;
  return supplied === `Bearer ${expected}` ? null : 'Authentication required';
}

function validatePayload(body) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return 'Request body must be an object';
  const keys = Object.keys(body);
  if (keys.some((key) => !['mode', 'input', 'teachings'].includes(key))) return 'Request contains unsupported fields';
  if (typeof body.mode !== 'string' || !ALLOWED_MODES.has(body.mode)) return 'Unsupported mode';
  if (body.input !== undefined && (typeof body.input !== 'string' || body.input.length > MAX_INPUT_CHARS)) return `input must be a string of at most ${MAX_INPUT_CHARS} characters`;
  if (body.teachings !== undefined && !Array.isArray(body.teachings)) return 'teachings must be an array';
  if ((body.teachings || []).length > MAX_TEACHINGS) return `teachings may contain at most ${MAX_TEACHINGS} items`;
  if ((body.teachings || []).some((item) => !item || typeof item !== 'object' || typeof item.title !== 'string' || item.title.length > MAX_TITLE_CHARS)) return `each teaching must contain a title of at most ${MAX_TITLE_CHARS} characters`;
  return null;
}

function json(body, statusCode = 200, additionalHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...additionalHeaders },
    body: JSON.stringify(body)
  };
}
