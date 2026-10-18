// Spartans1st Countdown — daily dynamic content (Word, Mindset, Declaration).
// One message per Oklahoma date, generated once by Workers AI, stored in KV, and
// served to every visitor so both pages and the Journey archive stay consistent.
// Scripture text always comes from the bundled KJV pool; AI only chooses the verse.
import POOL from './kjv-pool.json';

const TZ = 'America/Chicago';
const COACH_DAD = "Coach Daniels’ Dad";
const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MODE = 'auto'; // 'auto' = publish immediately. Switch to 'library' to use only the approved list.
const SEASON_START = '2026-10-01';
const MEETS = [
  { date: '2026-10-13', name: 'Conference Championship' },
  { date: '2026-10-24', name: 'Class 6A Regional Championship' },
  { date: '2026-10-31', name: 'Class 6A State Championship' },
];
// Approved fallback (the original production list) if AI is unavailable.
const LIBRARY = [
 [
  "1 John 5:4 (KJV)",
  "The will to win means nothing without the will to prepare.",
  "Juma Ikangaa",
  "I overcome by faith. I run with purpose, courage, and discipline. I am prepared, I am focused, and I will finish strong."
 ],
 [
  "Philippians 3:14 (KJV)",
  "To give anything less than your best is to sacrifice the gift.",
  "Steve Prefontaine",
  "I press toward the mark. I will not quit, back down, or lose focus. God has strengthened me for the race before me. I run with purpose. I PRESS. I FINISH. I WIN!"
 ],
 [
  "Hebrews 12:1 (KJV)",
  "Success is where preparation and opportunity meet.",
  "Bobby Unser",
  "I run with patience and discipline. I stay focused on the race before me, and I will finish what I started."
 ],
 [
  "Philippians 4:13 (KJV)",
  "The battles that count are not the ones for gold medals.",
  "Jesse Owens",
  "Christ strengthens me. I am equipped for every challenge before me. I run strong, focused, and confident."
 ],
 [
  "Psalm 60:12 (KJV)",
  "Run when you can, walk if you have to, crawl if you must; just never give up.",
  "Dean Karnazes",
  "Through God I shall do valiantly. I meet this challenge with courage, strength, and determination."
 ],
 [
  "Psalm 18:29 (KJV)",
  "A lot of people run a race to see who is fastest. I run to see who has the most guts.",
  "Steve Prefontaine",
  "God strengthens my steps. I push beyond every obstacle. I keep moving, keep pressing, and keep believing."
 ],
 [
  "Joshua 1:9 (KJV)",
  "You have to wonder at times what you’re doing out there. Over the years, I’ve given myself a thousand reasons to keep running.",
  "Steve Prefontaine",
  "I am strong and courageous. I refuse fear and discouragement. I run with confidence because God is with me."
 ],
 [
  "1 Corinthians 9:24 (KJV)",
  "Champions keep playing until they get it right.",
  "Billie Jean King",
  "I run to obtain. I have prepared for this moment. I compete with purpose, discipline, courage, and faith. Today I PRESS. Today I WIN!"
 ],
 [
  "2 Timothy 4:7 (KJV)",
  "It is not the size of a man but the size of his heart that matters.",
  "Evander Holyfield",
  "I fought the good fight. I finished my course. I kept the faith. I gave my best, and I finish with gratitude and honor."
 ],
 [
  "Psalm 8:6 (KJV)",
  "Excellence is not a singular act, but a habit. You are what you do repeatedly.",
  "Shaquille O’Neal",
  "God has given me dominion. I lead myself with discipline, steward my gifts well, and pursue excellence with purpose."
 ]
];

const json = (o, s = 200, extra = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const todayChicago = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dn = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const poolByRef = new Map(POOL.map((p) => [p.ref.replace(/\s*\(KJV\)$/, ''), p]));

function stageFor(date) {
  const next = MEETS.find((m) => m.date >= date);
  if (!next) return { kind: 'season-complete', text: 'The season is complete; the team has finished its course.' };
  const left = dn(next.date) - dn(date);
  if (left === 0) return { kind: 'race-day', text: `Today is race day: the ${next.name}.`, meet: next.name, left };
  if (left === 1) return { kind: 'eve', text: `Tomorrow is the ${next.name}.`, meet: next.name, left };
  return { kind: 'countdown', text: `${left} days until the ${next.name}.`, meet: next.name, left };
}

function libraryEntry(date) {
  const i = ((dn(date) % LIBRARY.length) + LIBRARY.length) % LIBRARY.length;
  const [ref, mindset, source, declaration] = LIBRARY[i];
  const p = poolByRef.get(ref.replace(/\s*\(KJV\)$/, ''));
  return { date, verse: p.text, ref: p.ref, insight: '', mindset, source, declaration, phrase: '', origin: 'library' };
}

function clean(s, max) {
  if (typeof s !== 'string') return '';
  s = s.replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim();
  return s.length > max ? '' : s;
}

async function generate(date, env, preview = false) {
  const stage = stageFor(date);
  let recent = [];
  try { recent = JSON.parse((await env.DAILY.get('recent-refs')) || '[]'); } catch (e) {}
  const choices = POOL.filter((p) => !recent.includes(p.ref)).map((p) => `${p.ref.replace(' (KJV)', '')} — ${p.theme}`).join('\n');
  const system = `You write the daily encouragement for Spartans1st XC, a Christian high-school cross country team (boys and girls) in Bixby, Oklahoma. Tone: bold, faithful, athletic, encouraging, never preachy or political. Audience: teenage runners and their families.
Return ONLY a JSON object (no markdown) with these keys. Every value must be written in complete, properly punctuated sentences:
"ref": exactly one reference copied from the CHOICES list (book chapter:verse as written there), chosen to fit today's season status,
"insight": two complete sentences (25 to 45 words total) explaining what the verse means for a runner today,
"mindset": one complete, memorable sentence (12 to 25 words) about discipline, effort, team or finishing; original wording; do not quote or name any real person,
"declaration": three short, complete first-person sentences (25 to 40 words total) that the athlete speaks aloud, drawn from the chosen verse, each beginning with "I",
"phrase": a short motto of 3 to 8 words.
Style example (do not copy): {"ref":"Isaiah 40:31","insight":"Strength for the final mile does not come from your legs alone. When you trust God, He renews you so you can keep running without fainting.","mindset":"The miles nobody sees in practice are the ones that carry you past the runner beside you.","declaration":"I wait upon the Lord and He renews my strength. I will run and not be weary. I will finish this race with everything I have.","phrase":"Renewed strength. Relentless finish."}`;
  let recentMindsets = [];
  try { recentMindsets = JSON.parse((await env.DAILY.get('recent-mindsets')) || '[]'); } catch (e) {}
  const avoid = ['Discipline fuels the fire...', ...recentMindsets].map((m) => '- ' + m).join('\n');
  const user = `Date: ${date}. Season status: ${stage.text}\nFor "mindset", write something fresh; do not reuse or closely paraphrase any of these:\n${avoid}\nCHOICES:\n${choices}`;
  const out = await env.AI.run(MODEL, { messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 500, temperature: 0.8 });
  const raw = typeof out === 'string' ? out : out.response;
  const obj = typeof raw === 'object' ? raw : JSON.parse(String(raw).slice(String(raw).indexOf('{'), String(raw).lastIndexOf('}') + 1));
  const p = poolByRef.get(String(obj.ref || '').replace(/\s*\(KJV\)$/, '').trim());
  const entry = {
    date, verse: p && p.text, ref: p && p.ref,
    insight: clean(obj.insight, 280), mindset: clean(obj.mindset, 220), source: COACH_DAD, // AI-written Mindsets are credited to Coach Daniels’ Dad, never Spartans1st
    declaration: clean(obj.declaration, 280), phrase: clean(obj.phrase, 90), origin: 'ai',
  };
  if (!entry.verse || entry.mindset.length < 50 || entry.declaration.length < 80 || entry.insight.length < 60) throw new Error('invalid AI output');
  await env.DAILY.put('recent-refs', JSON.stringify([entry.ref, ...recent].slice(0, 30)));
  return entry;
}

// ---------------------------------------------------------------------------
// Champion's Mindset: one combined, random pool (approved by Michael, Oct 17 2026).
// Each new day's Mindset is either the AI-written line or a quote drawn at random
// from ALL approved quotes (athletes + Coach Daniels' Dad) with equal odds per quote.
// No sequence, no reserved days. The choice is stored with that date, so it stays
// the same all day and past days are never rewritten.
const COACH_DAD_QUOTES = [
  "Every championship starts as a hunger. Feed it daily, and it will carry you farther than talent ever could.",
  "Decide before the hill shows up that you are not stopping on it.",
  "Dedication is giving your whole heart to the work when no one is watching and nothing is on the line yet.",
  "Diligence is the mile nobody counts. Run it right anyway, because that's the one that shows up on race day.",
  "Discipline is order on the inside showing up as strength on the outside.",
  "You can be making progress and still be headed the wrong way. Settle your direction before you measure your speed.",
  "You must see it before you get it. Run the finish in your mind before you run the start.",
  "Integrity asks 'Was it right?' before the watch asks 'Was it fast?'",
  "Knowing the race plan isn't enough. Own it, then run it.",
  "Race day doesn't create who you are. It reveals what you've already built.",
  "Desire got you started. Determination kept you going. Dedication, diligence, and discipline brought you here. Now go run what you've built.",
  "The best finish isn't only the one you cross. It's the one you help a teammate reach next season.",
  "Desire says 'I want it.' Determination says 'I'm not stopping until I have it.'",
  "Want it enough to train for it, not just talk about it.",
  "Resistance isn't a sign to stop. It's proof you're climbing.",
  "Commit to the work before you ever see the reward.",
  "Consistency beats intensity that only shows up sometimes.",
  "Small things done right every day become big things on race day.",
  "Discipline today is freedom on race day.",
  "What's planted in practice is what shows up in the race.",
  "Lay aside every weight. Run light, run focused, run forward.",
  "Forget what's behind you. Reach for what's in front of you.",
  "Effective plus efficient, under integrity, equals excellence.",
  "Don't just run the race. Run it to win the prize.",
  "A Quality Decision Determines the Direction You Want To Go.",
  "Discipline Develops Consistency, and Consistency Keeps You Headed in the Right Direction.",
];
// Daily odds (set by Michael, Oct 17 2026): 60% an athlete quote, 40% Coach Daniels’ Dad.
// The Coach Daniels’ Dad share is split evenly between his approved quotes and the AI-written line.
const ATHLETE_SHARE = 0.6;
const AI_WITHIN_COACH_DAD = 0.5;
const RECENT_MINDSETS = 10; // a quote is not reused within this many days
// Lines Michael has rejected; an AI Mindset containing one of these is never used.
const REJECTED_MINDSETS = ['discipline fuels the fire', 'discipline fuels the final push'];
const words = (t) => String(t).toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((w) => w.length > 3);
function tooSimilar(a, b) {
  const A = new Set(words(a)), B = new Set(words(b));
  if (!A.size || !B.size) return false;
  let same = 0; for (const w of A) if (B.has(w)) same++;
  return same / Math.min(A.size, B.size) >= 0.6;
}
const ATHLETE_QUOTES = () => LIBRARY.map(([, mindset, source]) => ({ mindset, source }));
const COACH_QUOTES = () => COACH_DAD_QUOTES.map((mindset) => ({ mindset, source: COACH_DAD }));

async function chooseMindset(entry, env, rand = Math.random) {
  let recent = [];
  try { recent = JSON.parse((await env.DAILY.get('recent-mindsets')) || '[]'); } catch (e) {}
  const open = (list) => list.filter((q) => !recent.includes(q.mindset));
  const any = (list) => list[Math.floor(rand() * list.length)];
  const lower = String(entry.mindset).toLowerCase();
  const aiUsable = !!entry.mindset && !REJECTED_MINDSETS.some((r) => lower.includes(r)) && !recent.some((r) => tooSimilar(r, entry.mindset));
  let pick = null, origin = 'quote';
  if (rand() < ATHLETE_SHARE && open(ATHLETE_QUOTES()).length) pick = any(open(ATHLETE_QUOTES()));
  else if (rand() < AI_WITHIN_COACH_DAD && aiUsable) origin = 'ai';
  else if (open(COACH_QUOTES()).length) pick = any(open(COACH_QUOTES()));
  else if (open(ATHLETE_QUOTES()).length) pick = any(open(ATHLETE_QUOTES()));
  else origin = 'ai';
  if (pick) { entry.mindset = pick.mindset; entry.source = pick.source; }
  else entry.source = COACH_DAD;
  entry.mindsetOrigin = origin;
  await env.DAILY.put('recent-mindsets', JSON.stringify([entry.mindset, ...recent].slice(0, RECENT_MINDSETS)));
  return entry;
}

async function getOrCreate(date, env, preview = false) {
  const key = (preview ? 'preview:v5:' : 'daily:v3:') + date;
  const hit = await env.DAILY.get(key, 'json');
  if (hit) return hit;
  let entry;
  if (MODE === 'library') entry = libraryEntry(date);
  else {
    try { entry = await generate(date, env, preview); }
    catch (e) { try { entry = await generate(date, env, preview); } catch (e2) { entry = libraryEntry(date); entry.note = 'AI unavailable; approved list used'; } }
  }
  if (entry.origin === 'ai') await chooseMindset(entry, env);
  entry.stage = stageFor(date).kind;
  if (entry.origin === 'ai') await env.DAILY.put(key, JSON.stringify(entry));
  else await env.DAILY.put(key, JSON.stringify(entry), { expirationTtl: 3600 }); // retry AI within the hour
  return entry;
}

// ---------------------------------------------------------------------------
// AI scene for Page 2 (test Worker only; enabled by AI_SCENES = "1").
// The picture is drawn from the same day's verse and Champion's Mindset, so the
// scene, the Word and the Mindset carry one message. Cached per date in this
// Worker's own KV; "fresh=1" paints a new one.
const IMAGE_MODEL = '@cf/black-forest-labs/flux-2-klein-9b';
const IMAGE_FALLBACK = '@cf/black-forest-labs/flux-1-schnell';
const LIGHTS = [
  'cool blue dawn before sunrise, soft blue and silver tones',
  'crisp frosty morning, pale blue sky, white frost on the grass',
  'misty gray morning with soft diffused light',
  'clear bright midday with a deep blue sky and white clouds',
  'dramatic storm clouds breaking apart with shafts of light',
  'rain falling, wet ground and reflections, moody blue-gray light',
  'clear night under a starry sky with a faint glow on the horizon',
  'fresh green spring-like hills under a bright blue sky',
  'early evening blue hour, deep navy sky and city or stadium lights',
  'warm golden sunrise (use sparingly)',
];
const STYLE = 'Photorealistic cinematic photograph, vivid natural color, sharp detail, portrait orientation. ' +
  'Any athlete wears a navy blue sleeveless team singlet with a small white Spartan helmet emblem and navy shorts; ' +
  'athletes are seen from behind or from the side, faces not the focus. ' +
  'Absolutely no text, no letters, no words, no numbers, no logos, no watermark, no signage. ' +
  'Keep the main subject in the middle of the frame; keep the top and bottom of the frame simple and uncluttered.';

function dayHash(date) { let h = 0; for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

async function scenePrompt(date, entry) {
  const stage = stageFor(date);
  const light = stage.kind === 'race-day' || stage.kind === 'season-complete'
    ? 'bright, triumphant light (golden light allowed)'
    : LIGHTS[dayHash(date) % (LIGHTS.length - 1)];
  return { stage, light };
}

async function writeScene(date, entry, env) {
  const { stage, light } = await scenePrompt(date, entry);
  const system = `You design one photograph for a Christian high-school cross country team's daily devotional page. The photo must visually express the day's Bible verse and Champion's Mindset so a runner looking at it feels the same message.
Rules: describe ONE concrete, physical scene in 45 to 80 words. It may show a cross country runner or team, OR another sport (track, basketball, football, swimming, wrestling, tennis, cycling, rowing, climbing) when that expresses the message better, OR a meaningful scene with no person (a course, a mountain summit, an eagle, a river cutting rock, a seed sprouting, a storm breaking, shoes at a start line, hands joined in a huddle). Use this lighting and mood: ${light}. Never include any text, words, signs, scoreboards with writing, or real people. Return ONLY JSON: {"scene":"..."}`;
  const user = `Season status: ${stage.text}\nVerse (${entry.ref}): ${entry.verse}\nChampion's Mindset: ${entry.mindset}\nMotto: ${entry.phrase || ''}`;
  const out = await env.AI.run(MODEL, { messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 300, temperature: 0.9 });
  const raw = typeof out === 'string' ? out : out.response;
  let scene = '';
  try {
    const obj = typeof raw === 'object' ? raw : JSON.parse(String(raw).slice(String(raw).indexOf('{'), String(raw).lastIndexOf('}') + 1));
    scene = String(obj.scene || '').trim();
  } catch (e) {}
  if (scene.length < 40) scene = `A cross country runner in a navy Spartan singlet running a hillside trail, ${light}.`;
  return `${scene} Lighting and mood: ${light}. ${STYLE}`;
}

function b64ToBytes(b64) { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

async function toBytes(out) {
  if (!out) throw new Error('empty image result');
  if (out instanceof ReadableStream) return new Uint8Array(await new Response(out).arrayBuffer());
  if (out instanceof ArrayBuffer) return new Uint8Array(out);
  if (out instanceof Uint8Array) return out;
  const img = out.image || (out.result && out.result.image);
  if (typeof img === 'string') return b64ToBytes(img.replace(/^data:[^,]+,/, ''));
  throw new Error('unrecognized image result');
}

function imageType(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b[0] === 0x52 && b[1] === 0x49) return 'image/webp';
  return 'image/jpeg';
}

async function paint(prompt, env) {
  try {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', '768');
    form.append('height', '1152');
    const body = new Response(form);
    const out = await env.AI.run(IMAGE_MODEL, { multipart: { body: body.body, contentType: body.headers.get('content-type') } });
    return await toBytes(out);
  } catch (e) {
    const out = await env.AI.run(IMAGE_FALLBACK, { prompt, steps: 8 });
    return await toBytes(out);
  }
}

async function sceneResponse(date, env, fresh) {
  const key = 'scene:v2:' + date;
  if (!fresh) {
    const hit = await env.DAILY.getWithMetadata(key, 'arrayBuffer');
    if (hit && hit.value) {
      const b = new Uint8Array(hit.value);
      return new Response(b, { headers: { 'content-type': imageType(b), 'cache-control': 'no-store', 'x-scene-prompt': encodeURIComponent((hit.metadata && hit.metadata.prompt) || '').slice(0, 1800) } });
    }
  }
  const entry = await getOrCreate(date, env, date > todayChicago());
  if (!entry || !entry.verse) throw new Error('no daily message for this date');
  const prompt = await writeScene(date, entry, env);
  const bytes = await paint(prompt, env);
  await env.DAILY.put(key, bytes, { metadata: { prompt: prompt.slice(0, 700) } });
  return new Response(bytes, { headers: { 'content-type': imageType(bytes), 'cache-control': 'no-store', 'x-scene-prompt': encodeURIComponent(prompt).slice(0, 1800) } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const pathDate = (url.pathname.match(/^\/api\/daily\/(\d{4}-\d{2}-\d{2})\/?$/) || [])[1];
    if (url.pathname === '/api/daily' || pathDate) {
      const today = todayChicago();
      const date = pathDate || url.searchParams.get('date') || today;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'bad date' }, 400);
      const preview = date > today;
      if (preview && env.PREVIEW_FUTURE !== '1') return json({ error: 'future dates are not available yet' }, 404);
      if (date < SEASON_START) return json({ error: 'before season' }, 404);
      try { return json(await getOrCreate(date, env, preview)); }
      catch (e) { return json(libraryEntry(date)); }
    }
    const statusDate = (url.pathname.match(/^\/api\/scene-status(?:\/(\d{4}-\d{2}-\d{2})(\/start)?)?\/?$/) || []);
    if (statusDate[0]) {
      const date = statusDate[1] || url.searchParams.get('date') || todayChicago();
      if (statusDate[2]) url.searchParams.set('start', '1');
      const info = { date, aiScenes: env.AI_SCENES || null, previewFuture: env.PREVIEW_FUTURE || null, hasAI: !!env.AI, hasKV: !!env.DAILY };
      try {
        const hit = await env.DAILY.getWithMetadata('scene:v2:' + date, 'arrayBuffer');
        info.cached = !!(hit && hit.value); info.bytes = hit && hit.value ? hit.value.byteLength : 0;
        info.prompt = (hit && hit.metadata && hit.metadata.prompt) || '';
        info.lastError = await env.DAILY.get('scene-err:' + date);
        if (!info.cached && url.searchParams.get('start') === '1') {
          ctx.waitUntil(sceneResponse(date, env, true).catch((e) => env.DAILY.put('scene-err:' + date, String(e && e.stack || e).slice(0, 900), { expirationTtl: 86400 })));
          info.started = true;
        }
      } catch (e) { info.statusError = String(e && e.stack || e); }
      return json(info);
    }
    if (url.pathname === '/api/scene') {
      if (env.AI_SCENES !== '1') return json({ error: 'not enabled' }, 404);
      const today = todayChicago();
      const date = url.searchParams.get('date') || today;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < SEASON_START) return json({ error: 'bad date' }, 400);
      if (date > today && env.PREVIEW_FUTURE !== '1') return json({ error: 'future dates are not available yet' }, 404);
      if (url.searchParams.get('format') === 'json') {
        // Readable check: report what is cached; start painting in the background if nothing is.
        const hit = await env.DAILY.getWithMetadata('scene:v2:' + date, 'arrayBuffer');
        const err = await env.DAILY.get('scene-err:' + date);
        if (hit && hit.value) return json({ ok: true, date, cached: true, bytes: hit.value.byteLength, prompt: (hit.metadata && hit.metadata.prompt) || '' });
        ctx.waitUntil(sceneResponse(date, env, true).catch((e) => env.DAILY.put('scene-err:' + date, String(e && e.stack || e).slice(0, 900), { expirationTtl: 86400 })));
        return json({ ok: true, date, cached: false, painting: true, lastError: err || null });
      }
      try { return await sceneResponse(date, env, url.searchParams.get('fresh') === '1'); }
      catch (e) { await env.DAILY.put('scene-err:' + date, String(e && e.stack || e).slice(0, 900), { expirationTtl: 86400 }); return json({ ok: false, error: 'scene unavailable', detail: String(e && e.message || e) }, 502); }
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(getOrCreate(todayChicago(), env));
  },
};
