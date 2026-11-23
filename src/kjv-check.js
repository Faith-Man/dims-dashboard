// TASK-0220 — DI² KJV scripture check.
// Finds scripture references (e.g. "James 1:12", "Philippians 4:6‑7", "(Job 13:15)"), pairs each with the quotation
// written right beside it, compares that quotation to the exact KJV text stored in DIMS (public.kjv_verses), and
// replaces any quotation that is not word-for-word KJV (wording, spelling, capitalisation or punctuation) with the
// exact KJV text of the cited verse(s). References to verses that don't exist are flagged, never "fixed".

const BOOKS = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];

// name (lower-case, no number) → canonical book name without number
const ALIASES = {
  genesis:'Genesis',gen:'Genesis',exodus:'Exodus',exod:'Exodus',ex:'Exodus',leviticus:'Leviticus',lev:'Leviticus',numbers:'Numbers',num:'Numbers',
  deuteronomy:'Deuteronomy',deut:'Deuteronomy',joshua:'Joshua',josh:'Joshua',judges:'Judges',judg:'Judges',ruth:'Ruth',samuel:'Samuel',sam:'Samuel',
  kings:'Kings',kgs:'Kings',chronicles:'Chronicles',chron:'Chronicles',ezra:'Ezra',nehemiah:'Nehemiah',neh:'Nehemiah',esther:'Esther',job:'Job',
  psalms:'Psalms',psalm:'Psalms',ps:'Psalms',psa:'Psalms',proverbs:'Proverbs',prov:'Proverbs',ecclesiastes:'Ecclesiastes',eccl:'Ecclesiastes',eccles:'Ecclesiastes',
  'song of solomon':'Song of Solomon','song of songs':'Song of Solomon',isaiah:'Isaiah',isa:'Isaiah',jeremiah:'Jeremiah',jer:'Jeremiah',lamentations:'Lamentations',lam:'Lamentations',
  ezekiel:'Ezekiel',ezek:'Ezekiel',daniel:'Daniel',dan:'Daniel',hosea:'Hosea',hos:'Hosea',joel:'Joel',amos:'Amos',obadiah:'Obadiah',obad:'Obadiah',jonah:'Jonah',
  micah:'Micah',mic:'Micah',nahum:'Nahum',nah:'Nahum',habakkuk:'Habakkuk',hab:'Habakkuk',zephaniah:'Zephaniah',zeph:'Zephaniah',haggai:'Haggai',hag:'Haggai',
  zechariah:'Zechariah',zech:'Zechariah',malachi:'Malachi',mal:'Malachi',matthew:'Matthew',matt:'Matthew',mt:'Matthew',mark:'Mark',mk:'Mark',luke:'Luke',lk:'Luke',
  john:'John',jn:'John',acts:'Acts',romans:'Romans',rom:'Romans',corinthians:'Corinthians',cor:'Corinthians',galatians:'Galatians',gal:'Galatians',
  ephesians:'Ephesians',eph:'Ephesians',philippians:'Philippians',phil:'Philippians',colossians:'Colossians',col:'Colossians',thessalonians:'Thessalonians',thess:'Thessalonians',
  timothy:'Timothy',tim:'Timothy',titus:'Titus',philemon:'Philemon',philem:'Philemon',hebrews:'Hebrews',heb:'Hebrews',james:'James',jas:'James',peter:'Peter',pet:'Peter',
  jude:'Jude',revelation:'Revelation',revelations:'Revelation',rev:'Revelation'
};
const NUMBERED = new Set(['Samuel','Kings','Chronicles','Corinthians','Thessalonians','Timothy','Peter','John']);
const NAME_ALT = Object.keys(ALIASES).sort((a,b)=>b.length-a.length).map(n=>n.replace(/ /g,'\\s+')).join('|');
const REF_RE = new RegExp(`(?<![A-Za-z0-9])(?:([123]|I{1,3}|First|Second|Third|1st|2nd|3rd)\\s*)?(${NAME_ALT})\\.?\\s+(\\d{1,3}):(\\d{1,3})(?:\\s*[-–‑—]\\s*(\\d{1,3}))?(?![\\d:])`, 'gi');
const QUOTE_RE = /“([^”]{6,3000})”|"([^"\n]{6,3000})"/g;
const NUM_WORD = { i:'1', ii:'2', iii:'3', first:'1', second:'2', third:'3', '1st':'1', '2nd':'2', '3rd':'3', '1':'1', '2':'2', '3':'3' };

export function kjvParseRefs(text) {
  const out=[];
  for (const m of String(text).matchAll(REF_RE)) {
    const base=ALIASES[m[2].toLowerCase().replace(/\s+/g,' ')]; if (!base) continue;
    const n=m[1]?NUM_WORD[m[1].toLowerCase()]:null;
    let book;
    if (NUMBERED.has(base)) { if (base==='John' && !n) book='John'; else if (!n) continue; else book=`${n} ${base}`; }
    else { if (n) continue; book=base; }
    if (!BOOKS.includes(book)) continue;
    const ch=Number(m[3]), v1=Number(m[4]), v2=m[5]?Number(m[5]):v1;
    if (v2<v1 || v2-v1>30) continue;
    out.push({ book, chapter:ch, v1, v2, label:`${book} ${ch}:${v1}${v2!==v1?`–${v2}`:''}`, start:m.index, end:m.index+m[0].length });
  }
  return out;
}

const strict = s => String(s).replace(/[*_`]/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\\([\[\]*_])/g,'$1').replace(/\s+/g,' ').trim();
const loose = s => strict(s).toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();

function pairQuotes(text, refs) {
  const quotes=[...String(text).matchAll(QUOTE_RE)].map(m=>({ start:m.index, end:m.index+m[0].length, innerStart:m.index+1, innerEnd:m.index+m[0].length-1, inner:m[1]??m[2] }));
  const used=new Set(); const GAP=/^[\s*_—–\-‑:,.()>\[\]]{0,14}$/;
  for (const r of refs) {
    let best=null;
    for (const [i,q] of quotes.entries()) {
      if (used.has(i)) continue;
      const gap = q.end<=r.start ? text.slice(q.end,r.start) : q.start>=r.end ? text.slice(r.end,q.start) : null;
      if (gap==null || !GAP.test(gap) || /\n\s*\n/.test(gap)) continue;
      const d=gap.length; if (!best || d<best.d) best={ i, q, d };
    }
    if (best) { used.add(best.i); r.quote=best.q; }
  }
  return refs;
}

// fetchVerses(refs) → Map key "Book|ch|v" → text
export async function kjvCheck(markdown, fetchVerses) {
  const text=String(markdown||'');
  const refs=pairQuotes(text, kjvParseRefs(text)).slice(0,80);
  const report={ checked:0, exact:0, corrected:[], mismatched:[], missing:[], unquoted:[] };
  if (!refs.length) return { markdown:text, report };
  const verses=await fetchVerses(refs);
  const edits=[];
  for (const r of refs) {
    const parts=[]; for (let v=r.v1; v<=r.v2; v+=1) parts.push(verses.get(`${r.book}|${r.chapter}|${v}`));
    if (parts.some(p=>!p)) { report.missing.push(r.label); continue; }
    if (!r.quote) { report.unquoted.push(r.label); continue; }
    report.checked+=1;
    const kjv=parts.join(' ');
    const q=strict(r.quote.inner);
    const segs=q.split(/\s*(?:…|\.\.\.)\s*/).filter(Boolean);
    let pos=0, okPartial=segs.length>0;
    for (const s of segs) { const at=kjv.indexOf(s.replace(/[.,;:]$/,''),pos); if (at<0) { okPartial=false; break; } pos=at+s.length-1; }
    if (q===kjv || q===kjv.replace(/[.,;:]$/,'') || okPartial) { report.exact+=1; continue; }
    // If most of the quoted words aren't in this verse at all, the quote belongs to a different verse (or was made up):
    // flag it for the owner instead of silently swapping in an unrelated verse.
    const qw=loose(q).split(' ').filter(w=>w.length>2), kw=new Set(loose(kjv).split(' '));
    const overlap=qw.length?qw.filter(w=>kw.has(w)).length/qw.length:0;
    if (overlap<0.6) { report.mismatched.push({ ref:r.label, quote:r.quote.inner.replace(/\s+/g,' ').trim(), kjv }); continue; }
    edits.push({ start:r.quote.innerStart, end:r.quote.innerEnd, to:kjv });
    report.corrected.push({ ref:r.label, from:r.quote.inner.replace(/\s+/g,' ').trim(), to:kjv });
  }
  let out=text;
  for (const e of edits.sort((a,b)=>b.start-a.start)) out=out.slice(0,e.start)+e.to+out.slice(e.end);
  return { markdown:out, report };
}

export function kjvReportText(report) {
  if (!report || (!report.checked && !report.missing.length && !report.unquoted.length && !report.mismatched?.length)) return '📖 KJV check: no scripture quotations with references were found.';
  const lines=[`📖 KJV check: ${report.checked} quoted verse${report.checked===1?'':'s'} checked against the KJV — ${report.exact} exact, ${report.corrected.length} corrected${report.mismatched.length?`, ${report.mismatched.length} not matching their reference`:''}${report.missing.length?`, ${report.missing.length} reference${report.missing.length===1?'':'s'} not found`:''}.`];
  for (const c of report.corrected) lines.push(`  ✏️ ${c.ref}: “${c.from.slice(0,140)}${c.from.length>140?'…':''}” → exact KJV`);
  for (const m of report.mismatched) lines.push(`  ⚠️ ${m.ref}: the quoted words are not this verse — please check. (${m.ref} reads: “${m.kjv.slice(0,160)}${m.kjv.length>160?'…':''}”) Left unchanged.`);
  for (const m of report.missing) lines.push(`  ⚠️ ${m}: no such verse in the KJV — please check this reference (left unchanged).`);
  if (report.unquoted.length) lines.push(`  ℹ️ Cited without the verse text beside it: ${report.unquoted.slice(0,12).join(', ')}${report.unquoted.length>12?'…':''}.`);
  return lines.join('\n');
}

export function kjvRestFilter(refs) {
  const uniq=[...new Map(refs.map(r=>[`${r.book}|${r.chapter}|${r.v1}|${r.v2}`,r])).values()];
  return `or=(${uniq.map(r=>`and(book.eq."${r.book}",chapter.eq.${r.chapter},verse.gte.${r.v1},verse.lte.${r.v2})`).join(',')})`;
}
