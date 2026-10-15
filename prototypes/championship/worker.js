// Spartans1st Countdown — daily dynamic content (Word, Mindset, Declaration).
// One message per Oklahoma date, generated once by Workers AI, stored in KV, and
// served to every visitor so both pages and the Journey archive stay consistent.
// Scripture text always comes from the bundled KJV pool; AI only chooses the verse.
import POOL from './kjv-pool.json';

const TZ = 'America/Chicago';
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

async function generate(date, env) {
  const stage = stageFor(date);
  let recent = [];
  try { recent = JSON.parse((await env.DAILY.get('recent-refs')) || '[]'); } catch (e) {}
  const choices = POOL.filter((p) => !recent.includes(p.ref)).map((p) => `${p.ref.replace(' (KJV)', '')} — ${p.theme}`).join('\n');
  const system = `You write the daily encouragement for Spartans1st XC, a Christian high-school cross country team (boys and girls) in Bixby, Oklahoma. Tone: bold, faithful, athletic, encouraging, never preachy or political. Audience: teenage runners and their families.
Return ONLY a JSON object (no markdown) with these keys. Every value must be written in complete, properly punctuated sentences:
"ref": exactly one reference copied from the CHOICES list (book chapter:verse as written there), chosen to fit today's season status,
"insight": two complete sentences (25 to 45 words total) explaining what the verse means for a runner today,
"mindset": one complete, memorable sentence (12 to 25 words) about discipline, effort, team or finishing; original wording; do not quote or name any real person,
"declaration": three complete first-person sentences (35 to 60 words total) that the athlete speaks aloud, drawn from the chosen verse, each beginning with "I",
"phrase": a short motto of 3 to 8 words.
Style example (do not copy): {"ref":"Isaiah 40:31","insight":"Strength for the final mile does not come from your legs alone. When you trust God, He renews you so you can keep running without fainting.","mindset":"The miles nobody sees in practice are the ones that carry you past the runner beside you.","declaration":"I wait upon the Lord and He renews my strength. I will run and not be weary. I will finish this race with everything I have.","phrase":"Renewed strength. Relentless finish."}`;
  const user = `Date: ${date}. Season status: ${stage.text}\nCHOICES:\n${choices}`;
  const out = await env.AI.run(MODEL, { messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_tokens: 500, temperature: 0.8 });
  const raw = typeof out === 'string' ? out : out.response;
  const obj = typeof raw === 'object' ? raw : JSON.parse(String(raw).slice(String(raw).indexOf('{'), String(raw).lastIndexOf('}') + 1));
  const p = poolByRef.get(String(obj.ref || '').replace(/\s*\(KJV\)$/, '').trim());
  const entry = {
    date, verse: p && p.text, ref: p && p.ref,
    insight: clean(obj.insight, 280), mindset: clean(obj.mindset, 220), source: 'Spartans1st',
    declaration: clean(obj.declaration, 400), phrase: clean(obj.phrase, 90), origin: 'ai',
  };
  if (!entry.verse || entry.mindset.length < 50 || entry.declaration.length < 100 || entry.insight.length < 60) throw new Error('invalid AI output');
  await env.DAILY.put('recent-refs', JSON.stringify([entry.ref, ...recent].slice(0, 30)));
  return entry;
}

async function getOrCreate(date, env) {
  const key = 'daily:v2:' + date;
  const hit = await env.DAILY.get(key, 'json');
  if (hit) return hit;
  let entry;
  if (MODE === 'library') entry = libraryEntry(date);
  else {
    try { entry = await generate(date, env); }
    catch (e) { try { entry = await generate(date, env); } catch (e2) { entry = libraryEntry(date); entry.note = 'AI unavailable; approved list used'; } }
  }
  entry.stage = stageFor(date).kind;
  if (entry.origin === 'ai') await env.DAILY.put(key, JSON.stringify(entry));
  else await env.DAILY.put(key, JSON.stringify(entry), { expirationTtl: 3600 }); // retry AI within the hour
  return entry;
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const pathDate = (url.pathname.match(/^\/api\/daily\/(\d{4}-\d{2}-\d{2})\/?$/) || [])[1];
    if (url.pathname === '/api/daily' || pathDate) {
      const today = todayChicago();
      const date = pathDate || url.searchParams.get('date') || today;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'bad date' }, 400);
      if (date > today) return json({ error: 'future dates are not available yet' }, 404);
      if (date < SEASON_START) return json({ error: 'before season' }, 404);
      try { return json(await getOrCreate(date, env)); }
      catch (e) { return json(libraryEntry(date)); }
    }
    return env.ASSETS.fetch(req);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(getOrCreate(todayChicago(), env));
  },
};
