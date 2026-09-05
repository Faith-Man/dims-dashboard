const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sdquzhsylqpbhrmqjqgk.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How';
const ALLOWED_MODES = new Set(['dims_brief','prophesy_flow','doctrine_draft']);
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const buckets = new Map();

export async function handler(event) {
  try {
    if (event.httpMethod === 'OPTIONS') return json({ ok:true }, 204);
    if (event.httpMethod !== 'POST') return json({ ok:false, error:'Method not allowed' }, 405);

    const raw = event.body || '';
    if (Buffer.byteLength(raw, 'utf8') > 32_768) return json({ ok:false, error:'Request too large' }, 413);

    const auth = event.headers?.authorization || event.headers?.Authorization || '';
    if (!auth.startsWith('Bearer ')) return json({ ok:false, error:'Authentication required' }, 401);
    const token = auth.slice(7).trim();
    const user = await authenticatedUser(token);
    if (!user) return json({ ok:false, error:'Invalid or expired session' }, 401);

    const clientIp = event.headers?.['x-nf-client-connection-ip'] || event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const rateKey = `${user.id}:${clientIp}`;
    if (!allowRequest(rateKey)) return json({ ok:false, error:'Rate limit exceeded. Try again shortly.' }, 429);

    let body;
    try { body = JSON.parse(raw || '{}'); }
    catch { return json({ ok:false, error:'Invalid JSON' }, 400); }

    const mode = typeof body.mode === 'string' ? body.mode : 'dims_brief';
    if (!ALLOWED_MODES.has(mode)) return json({ ok:false, error:'Unsupported mode' }, 400);
    const userInput = typeof body.input === 'string' ? body.input.trim() : '';
    if (userInput.length > 4_000) return json({ ok:false, error:'Input exceeds 4000 characters' }, 400);

    const teachings = Array.isArray(body.teachings) ? body.teachings.slice(0,20) : [];
    const safeTitles = teachings.map(t => String(t?.title || '').slice(0,200)).filter(Boolean);

    const systemDims = `You are OrEl embedded in DIMS. Use Optimized DIMS Style: concise, Dominion1st blue voice, italics for scripture. Sections: Now Word, World Intel (3), Bridge Intel (3), Personal Intel (3), Divine Directives (2–4 imperatives), 2 scripture lines. Never claim current/live intelligence unless it was supplied in the user input.`;
    const systemProphesy = `You are OrEl (Prophetic Flow). Generate a Now Word + Confession with 1–2 scripture lines (italicized with refs).`;
    const systemDoctrine = `You are OrEl (Doctrine Draft). Create a Markdown doctrine: Title; Status line; ## Core Points (3–6); ## Scriptures (italicized quotes with refs); **Declaration:** one sentence in italics.`;
    const sys = mode === 'prophesy_flow' ? systemProphesy : mode === 'doctrine_draft' ? systemDoctrine : systemDims;
    const prompt = [{role:'system',content:sys},{role:'user',content:userInput || 'Generate a compact DIMS brief without claiming live/current facts.'}];
    if (safeTitles.length) prompt.push({role:'system',content:'Context titles: '+safeTitles.join('; ')});

    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) return json({ ok:false, error:'AI service is not configured' }, 503);

    console.log(JSON.stringify({ event:'orai_request', user_id:user.id, mode, input_chars:userInput.length, teaching_count:safeTitles.length }));
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-4o-mini',messages:prompt,temperature:mode==='prophesy_flow'?0.9:0.5,max_tokens:700})
    });
    if (!resp.ok) {
      console.error(JSON.stringify({ event:'orai_upstream_error', user_id:user.id, status:resp.status }));
      return json({ ok:false, error:'AI service request failed' }, 502);
    }
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || '(no content)';
    return json({ ok:true, data:content });
  } catch (e) {
    console.error(JSON.stringify({ event:'orai_error', name:e?.name || 'Error' }));
    return json({ ok:false, error:'Internal service error' }, 500);
  }
}

async function authenticatedUser(token) {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers:{ apikey:SUPABASE_PUBLISHABLE_KEY, Authorization:`Bearer ${token}` }
    });
    if (!r.ok) return null;
    const user = await r.json();
    return user?.id ? user : null;
  } catch { return null; }
}

function allowRequest(key) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.started >= WINDOW_MS) {
    buckets.set(key,{started:now,count:1});
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function json(obj,status=200) {
  return { statusCode:status, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body:status===204?'':JSON.stringify(obj) };
}
