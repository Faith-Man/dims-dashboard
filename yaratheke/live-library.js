import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { marked } from 'https://esm.sh/marked@12';
import DOMPurify from 'https://esm.sh/dompurify@3';

const supabase=createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const app=document.getElementById('app');
const nav=document.getElementById('nav');
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

// Readers see finished work only; drafts and archived records stay in OrEl (matches the live reader).
const HIDDEN_STATUSES=['draft','archived'];

// Content-type filters (owner-approved 2026-11-11). Other types still appear under "All".
const FILTERS=[
  {key:'all',label:'All',match:()=>true},
  {key:'teaching',label:'Teachings',match:t=>['teaching','framework','curriculum'].includes(type(t))},
  {key:'perspective',label:'Perspectives',match:t=>type(t)==='perspective'},
  {key:'diagnosis',label:'Diagnosis',match:t=>type(t)==='diagnosis'},
  {key:'principle',label:'Principles',match:t=>type(t)==='principle'}
];
const type=t=>String(t.content_type||'').trim().toLowerCase();

// Callout types and colors copied from the live YARATHĒKĒ reader (dims-dashboard Worker).
// Writers mark a callout by starting a line with a tag, e.g. "[SCRIPTURE] ..." or "[DOMINION PRINCIPLE] ...".
const CALLOUT_TAGS=/^\[(SCRIPTURE|FOUNDATION SCRIPTURES?|DOMINION PRINCIPLE|KEY REVELATION|WORD STUDY|KINGDOM APPLICATION|APPLICATION|REFLECTION|WARNING|DECLARATION|PRAYER|KINGDOM ASSIGNMENT)\]\s*(.*)$/i;
// Five callout colors (owner-approved 2026-11-11). Every tag still shows its own label;
// related tags share a color: Revelation → Principle; Reflection, Declaration, Prayer,
// Assignment → Application; Foundation Scriptures → Scripture.
function calloutClass(tag){
  const x=tag.toLowerCase();
  if(/scripture/.test(x))return'special-scripture';
  if(/word study/.test(x))return'special-wordstudy';
  if(/principle|revelation/.test(x))return'special-principle';
  if(/warning/.test(x))return'special-warning';
  return'special-application';
}

const style=document.createElement('style');
style.textContent=`
/* Library view */
.nav,#menuBtn{display:none!important}
.lib-hero{background:linear-gradient(135deg,#06113f,#0d1f78 66%,#17399a);color:#fff;border-radius:22px;padding:clamp(22px,4vw,40px);margin-bottom:20px;box-shadow:0 10px 30px rgba(5,11,61,.18)}
.lib-hero .kicker{color:#d6b75d}
.lib-hero h2{font:900 clamp(1.7rem,4.5vw,2.8rem) Cinzel,serif;color:#fff;margin:.25rem 0 .4rem}
.lib-hero p{color:#dbe6ff;margin:.2rem 0 1rem;font-size:1.02rem}
.lib-hero label{display:block;color:#fff;font-weight:700;font-size:.85rem;margin-bottom:6px}
.lib-search{display:block;width:100%;max-width:640px;padding:12px 14px;border-radius:10px;border:1px solid #c8d8ff;background:#fff;color:#10204d;font:inherit}
.lib-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:14px}
.chip{border:1px solid rgba(255,255,255,.7);background:transparent;color:#fff;border-radius:999px;padding:7px 13px;font-weight:800;font-size:.78rem;cursor:pointer}
.chip[aria-pressed="true"]{background:#fff;color:#0c1475;border-color:#fff}
.lib-series{border:1px solid rgba(255,255,255,.7);background:#0d1f78;color:#fff;border-radius:999px;padding:7px 12px;font-weight:800;font-size:.78rem;max-width:100%}
.lib-count{color:#fff!important;font-weight:700;margin:12px 0 0!important}
.lib-card h3{color:var(--blue)}
.lib-card .meta{color:var(--muted);font-size:.82rem;margin:0}
/* About YARATHĒKĒ (collapsed module identity) */
.about-yaratheke{margin:0;background:linear-gradient(110deg,#050b3d,#0c1475 58%,#13258f);border-bottom:4px solid #d6b75d;padding:10px clamp(18px,4vw,42px)}
.about-yaratheke>summary{color:#fff;font-weight:800;font-size:.85rem;cursor:pointer;list-style:revert}
.about-yaratheke .dome-module-identity{background:none!important;border:0!important;padding:10px 0 4px!important}
.about-yaratheke .dome-module-identity-inner{margin:0!important;max-width:980px}
/* Reader formatting — matches the live reader's .pub-body rules */
.governed-content{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1rem,2vw,1.14rem);line-height:1.85;overflow-wrap:anywhere}
.governed-content h1,.governed-content h2,.governed-content h3{font-family:Cinzel,serif;color:#0c2075;margin:1.65em 0 .6em;line-height:1.25}
.governed-content h2{border-bottom:1px solid #dbe4f5;padding-bottom:.35em;font-size:1.4rem}
.governed-content h3{font-size:1.18rem}
.governed-content ul,.governed-content ol{margin:1em 0 1.25em;padding-left:2.2em}
.governed-content li{padding-left:.25em;margin:.32em 0}
.governed-content hr{border:0;border-top:1px solid #dbe4f5;margin:1.8em 0}
.governed-content blockquote{margin:1.55em 0;padding:20px 24px;border-left:5px solid #c5a23b;background:#fffaf0;border-radius:0 12px 12px 0}
.governed-content blockquote p{margin:.3rem 0}
.governed-content table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:.9rem;margin:1.2rem 0;display:block;overflow-x:auto}
.governed-content th,.governed-content td{border:1px solid #d8e1f2;padding:8px 10px;text-align:left;vertical-align:top}
.governed-content th{background:#edf2ff;color:#0c2075}
.governed-content img{max-width:100%;height:auto}
.special{border:1px solid #d8e1f2;border-radius:16px;padding:20px 22px;margin:24px 0;background:#f7faff;box-shadow:0 8px 22px rgba(12,32,117,.06)}
.special>strong{display:block;font-family:'Cinzel',serif;color:#0c2075;margin-bottom:9px;font-size:.82rem;letter-spacing:.09em}
.special p{margin:0}
.special ol,.special ul{margin:.2rem 0 0;padding-left:1.4rem}
.special li{margin:.45rem 0}
.special-scripture{background:#fffaf0;border-left:6px solid #c5a23b}
.special-wordstudy{background:#f6f1ff;border-left:6px solid #7355a6}
.special-principle{background:linear-gradient(135deg,#08155f,#102a86);color:#fff;border-left:6px solid #d3ad3d}
.special-principle>strong,.special-principle p,.special-principle li{color:#fff}
.special-application{background:#effaf2;border-left:6px solid #2f7d46}
.special-warning{background:#fff2f0;border-left:6px solid #a64235}
.special-principle{print-color-adjust:exact;-webkit-print-color-adjust:exact}
/* Split view */
.lib-split{display:grid;grid-template-columns:1fr;gap:20px}
.lib-pane{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(18,36,85,.05)}
.lib-head{background:linear-gradient(135deg,#06113f,#0d1f78 66%,#17399a);color:#fff;padding:18px}
.lib-head .kicker{color:#d6b75d}
.lib-head h2{font:900 1.45rem Cinzel,serif;color:#fff;margin:.2rem 0 .7rem}
.lib-head .lib-controls{margin-top:10px}
.lib-head .lib-series{margin-top:10px;width:100%}
.lib-count{color:#dbe6ff!important;font:600 .8rem Inter,sans-serif;margin:10px 0 0!important}
.lib-list{display:flex;flex-direction:column}
.lib-entry{display:block;width:100%;text-align:left;background:#fff;border:0;border-bottom:1px solid var(--line);padding:13px 16px;cursor:pointer;font:inherit;color:inherit;border-left:4px solid transparent}
.lib-entry:hover{background:#f4f8ff}
.lib-entry.active{background:#eef4ff;border-left-color:#c5a23b}
.lib-entry strong{display:block;font:700 .95rem Cinzel,serif;color:var(--blue);overflow-wrap:anywhere}
.lib-sum{display:block;color:var(--muted);font-size:.84rem;line-height:1.45;margin-top:4px}
.lib-meta{display:block;color:#7a86a3;font-size:.74rem;margin-top:5px}
.lib-empty{padding:16px;color:var(--muted)}
.read-pane:empty{display:none}
@media(max-width:899px){.lib-split.reading .lib-pane{display:none}.lib-split:not(.reading) .read-pane{display:none}}
@media(min-width:900px){
  .lib-split{grid-template-columns:340px minmax(0,1fr);align-items:start}
  .lib-pane{position:sticky;top:96px;max-height:calc(100vh - 116px);display:flex;flex-direction:column}
  .lib-list{overflow:auto;flex:1}
  .lib-sum{display:none}
  .read-pane .reader-toolbar .back-only{display:none}
  .read-pane .reader-toolbar{top:96px}
}
/* Reader layout: full-width article, toolbar, details line, bottom player bar */
.reader-solo{max-width:820px;margin:0 auto}
.reader-toolbar{position:sticky;top:96px;z-index:15;display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border:1px solid var(--line);border-radius:14px;padding:8px 10px;margin-bottom:14px;box-shadow:0 6px 18px rgba(12,32,117,.06)}
.reader-toolbar .spacer{flex:1}
.tb-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;color:var(--blue);border-radius:999px;padding:7px 12px;font:800 .78rem Inter,sans-serif;cursor:pointer;text-decoration:none;white-space:nowrap}
.tb-btn:hover,.tb-btn:focus-visible{border-color:var(--blue);outline:none}
.tb-btn.primary{background:var(--blue);color:#fff;border-color:var(--blue)}
.tb-menu{position:relative;border:0!important;padding:0!important;margin:0!important;background:none!important;box-shadow:none!important}
.tb-menu>summary{list-style:none}.tb-menu>summary::-webkit-details-marker{display:none}
.tb-menu-panel{position:absolute;right:0;top:calc(100% + 6px);min-width:200px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:6px;box-shadow:0 14px 34px rgba(5,11,61,.18);z-index:30}
.tb-menu-panel button,.tb-menu-panel a{display:flex;gap:8px;width:100%;border:0;background:none;text-align:left;padding:10px 11px;border-radius:9px;font:700 .84rem Inter,sans-serif;color:var(--blue);cursor:pointer;text-decoration:none}
.tb-menu-panel button:hover,.tb-menu-panel a:hover{background:#eef5ff}
.reader-meta{font:600 .84rem Inter,sans-serif;color:var(--muted);margin:.2rem 0 .8rem}
.tool-toast{font:600 .8rem Inter,sans-serif;color:var(--muted);margin:0 2px}
.player-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:40;display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 24px);background:#0c1475;color:#fff;border:1px solid #d6b75d;border-radius:16px;padding:8px 12px;box-shadow:0 14px 34px rgba(5,11,61,.35)}
.player-bar[hidden]{display:none}
.player-bar button{border:1px solid rgba(255,255,255,.6);background:transparent;color:#fff;border-radius:999px;width:36px;height:36px;font-size:.95rem;cursor:pointer}
.player-bar select{background:#13258f;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:9px;padding:6px 8px;font:600 .78rem Inter,sans-serif;max-width:150px}
.player-bar .p-status{font:700 .78rem Inter,sans-serif;min-width:64px}
@media(max-width:620px){.reader-toolbar{top:88px}.tb-btn .lbl{display:none}.tb-btn.primary .lbl{display:inline}.player-bar{bottom:10px}.player-bar select{max-width:120px}}
@media print{.about-yaratheke,.dome-module-identity,#dome-global-nav,.dome-global-drawer,[class*="di-companion"],.side,.reader-toolbar,.player-bar{display:none!important}.governed-content blockquote,.special{break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;
document.head.appendChild(style);

// Collapse the module identity rows (injected by dome-global-nav.js) behind "About YARATHĒKĒ".
function collapseIdentity(){
  const section=document.querySelector('.dome-module-identity,.module-identity');
  if(!section||section.closest('.about-yaratheke'))return !!section;
  const box=document.createElement('details');
  box.className='about-yaratheke';
  box.innerHTML='<summary>About YARATHĒKĒ™</summary>';
  section.replaceWith(box);
  box.appendChild(section);
  return true;
}
if(!collapseIdentity()){
  const obs=new MutationObserver(()=>{if(collapseIdentity())obs.disconnect();});
  obs.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>obs.disconnect(),15000);
}

let governed=[];
let state={query:'',filter:'all',series:''};

function dateOf(t){
  const raw=t.published_date||t.published_at||t.updated_at||t.created_at;
  if(!raw)return '';
  const d=new Date(raw);
  return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}

function renderContent(t){
  let md=String(t.content_md||'');
  const first=md.match(/^\s*#\s+(.+)\n/);
  if(first&&first[1].trim().toLowerCase()===String(t.title||'').trim().toLowerCase())md=md.slice(first[0].length);
  // A tagged callout is the [TAG] line plus any lines directly under it (until a blank line),
  // so a box can hold a short list such as reflection questions.
  const lines=md.split('\n'),out=[];
  for(let i=0;i<lines.length;i++){
    const m=lines[i].trim().match(CALLOUT_TAGS);
    if(!m){out.push(lines[i]);continue;}
    const body=[m[2]||''];
    while(i+1<lines.length&&lines[i+1].trim()!==''&&!CALLOUT_TAGS.test(lines[i+1].trim()))body.push(lines[++i]);
    const inner=body.join('\n').trim();
    const html=body.length>1?marked.parse(inner,{gfm:true}):`<p>${marked.parseInline(inner)}</p>`;
    out.push(`\n<section class="special ${calloutClass(m[1])}"><strong>${esc(m[1].toUpperCase())}</strong>${html}</section>\n`);
  }
  md=out.join('\n');
  return DOMPurify.sanitize(marked.parse(md,{gfm:true,breaks:false}));
}

async function loadGoverned(){
  app.innerHTML='<section class="lib-hero"><div class="kicker">YARATHĒKĒ™ Library</div><h2>Loading…</h2></section>';
  const {data,error}=await supabase.from('teachings').select('*').order('updated_at',{ascending:false});
  if(error){
    app.innerHTML=`<section class="lib-hero"><div class="kicker">YARATHĒKĒ™ Library</div><h2>Unable to load</h2><p>${esc(error.message)}</p></section>`;
    return;
  }
  governed=(data||[]).filter(t=>!HIDDEN_STATUSES.includes(String(t.status||'').toLowerCase()));
  renderGovernedLibrary();
  // Deep link (?t=<teaching id>) so DI² citations open the exact teaching.
  const linked=new URLSearchParams(location.search).get('t');
  if(linked&&!governed.some(t=>t.id===linked)){
    // A linked draft (e.g. saved by DI²) opens directly but stays out of the library list.
    const hidden=(data||[]).find(t=>t.id===linked);
    if(hidden){governed.push({...hidden,title:`${String(hidden.status).toUpperCase()==='DRAFT'?'[DRAFT] ':''}${hidden.title}`});}
  }
  if(linked&&governed.some(t=>t.id===linked))openGoverned(linked);
}

function seriesList(){
  const counts={};
  governed.forEach(t=>{const s=String(t.series||'').trim();if(s&&s.toLowerCase()!=='standalone')counts[s]=(counts[s]||0)+1;});
  return Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0]));
}

function visibleItems(){
  const q=state.query.trim().toLowerCase();
  const f=FILTERS.find(x=>x.key===state.filter)||FILTERS[0];
  return governed.filter(t=>f.match(t)
    &&(!state.series||String(t.series||'').trim()===state.series)
    &&(!q||[t.title,t.summary,t.series,t.category,t.content_type,...(Array.isArray(t.tags)?t.tags:[])].some(v=>String(v||'').toLowerCase().includes(q))));
}

const isWide=()=>matchMedia('(min-width:900px)').matches;
let currentId=null;

function cardHtml(t){
  const meta=[t.content_type||'Teaching',t.series&&String(t.series).toLowerCase()!=='standalone'?t.series:'',dateOf(t)].filter(Boolean).join(' · ');
  return `<button class="lib-entry${String(t.id)===String(currentId)?' active':''}" type="button" data-governed-id="${esc(t.id)}"><strong>${esc(t.title||'Untitled')}</strong>${t.summary?`<span class="lib-sum">${esc(t.summary)}</span>`:''}<span class="lib-meta">${esc(meta)}</span></button>`;
}

function renderResults(){
  const items=visibleItems();
  document.getElementById('teachingCount').textContent=`${items.length} of ${governed.length}`;
  const results=document.getElementById('teachingResults');
  results.innerHTML=items.length?items.map(cardHtml).join(''):'<p class="lib-empty">No matching teachings. Try another search or filter.</p>';
  results.querySelectorAll('[data-governed-id]').forEach(el=>el.onclick=()=>openGoverned(el.dataset.governedId));
}

// Split view (owner request 2026-11-11, matches live reader): list on the left, teaching on the
// right on desktop; one screen at a time with ← Library on phones. The list is never rebuilt
// when a teaching opens, so search, filters and scroll position are kept.
function renderGovernedLibrary(){
  const chips=FILTERS.map(f=>`<button class="chip" type="button" data-filter="${f.key}" aria-pressed="${state.filter===f.key}">${f.label}</button>`).join('');
  const series=seriesList().map(([s,n])=>`<option value="${esc(s)}"${state.series===s?' selected':''}>${esc(s)} (${n})</option>`).join('');
  app.innerHTML=`<div class="lib-split" id="libSplit">
<aside class="lib-pane" aria-label="Library">
  <div class="lib-head"><div class="kicker">Wells of Knowledge</div><h2>YARATHĒKĒ™ Library</h2>
  <input id="teachingSearch" class="lib-search" type="search" aria-label="Search teachings" placeholder="Search title, series, topic…" value="${esc(state.query)}"/>
  <div class="lib-controls" role="group" aria-label="Filter by type">${chips}</div>
  <select id="seriesFilter" class="lib-series" aria-label="Filter by series"><option value="">All series</option>${series}</select>
  <p class="lib-count"><span id="teachingCount"></span> teachings, messages and perspectives</p></div>
  <div class="lib-list" id="teachingResults"></div>
</aside>
<section class="read-pane" id="readPane" aria-live="polite"></section>
</div>
<div class="player-bar" id="playerBar" hidden role="region" aria-label="Listen">
  <button id="ttsPlay" aria-label="Play from start">▶</button><button id="ttsPause" aria-label="Pause">⏸</button><button id="ttsStop" aria-label="Stop">⏹</button>
  <select id="ttsVoice" aria-label="Voice"></select>
  <select id="ttsRate" aria-label="Speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>
  <span class="p-status" id="ttsStatus" aria-live="polite">Ready</span><button id="ttsClose" aria-label="Close player">✕</button>
</div>`;
  document.getElementById('teachingSearch').addEventListener('input',e=>{state.query=e.target.value;renderResults();});
  app.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;app.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderResults();});
  document.getElementById('seriesFilter').onchange=e=>{state.series=e.target.value;renderResults();};
  bindPlayer();
  renderResults();
  const first=visibleItems()[0];
  if(isWide()&&first)openGoverned(first.id,{quiet:true});
  else document.getElementById('readPane').innerHTML='';
}

function closeReader(){
  stopSpeech();document.getElementById('playerBar').hidden=true;
  document.getElementById('libSplit').classList.remove('reading');
}

function openGoverned(id,opts={}){
  const t=governed.find(x=>String(x.id)===String(id));
  if(!t)return;
  stopSpeech();
  currentId=t.id;
  document.querySelectorAll('.lib-entry').forEach(e=>e.classList.toggle('active',e.dataset.governedId===String(t.id)));
  const meta=[t.content_type||'Teaching',t.series&&String(t.series).toLowerCase()!=='standalone'?t.series:'',dateOf(t)?'Updated '+dateOf(t):''].filter(Boolean).join(' · ');
  const pane=document.getElementById('readPane');
  pane.innerHTML=`<div class="reader-toolbar" role="toolbar" aria-label="Teaching tools">
  <button class="tb-btn back-only" id="backGoverned">← <span class="lbl">Library</span></button>
  <span class="spacer"></span>
  <span class="tool-toast" id="docStatus" aria-live="polite"></span>
  <button class="tb-btn primary" id="ttsOpen">🔊 <span class="lbl">Listen</span></button>
  <button class="tb-btn" id="docCopy" title="Copy all">📋 <span class="lbl">Copy</span></button>
  <details class="tb-menu"><summary class="tb-btn" title="Save, print or edit">⬇️ <span class="lbl">Save</span> ▾</summary><div class="tb-menu-panel">
    <button id="docPdf">⬇️ Save as PDF</button><button id="docWord">⬇️ Download Word</button><button id="docPrint">🖨️ Print</button>
    <a id="docOrel" href="../orel-studio.html?id=${encodeURIComponent(t.id)}">✍️ Open in OrEl™</a></div></details>
</div>
<article class="reader" data-title="${esc(t.title||'Teaching')}"><div class="series-mark">${esc(t.series||'Dominion1st™')}</div><h2>${esc(t.title||'Teaching')}</h2><p class="reader-meta">${esc(meta)}</p><div class="subtitle">${esc(t.summary||'')}</div><div class="scripture">${esc((t.tags||[]).join(' · '))}</div><div class="reader-content governed-content">${renderContent(t)}</div></article>`;
  document.getElementById('backGoverned').onclick=closeReader;
  bindTools(t);
  pane.scrollTop=0;
  if(isWide()){
    if(!opts.quiet){const top=document.getElementById('libSplit').getBoundingClientRect().top+scrollY-110;if(scrollY>top)scrollTo({top});}
  }else{
    document.getElementById('libSplit').classList.add('reading');
    scrollTo({top:0});
  }
}

// ---- Document and Listen tools (ported from the live reader) ----
const speechOK='speechSynthesis' in window;
function stopSpeech(){if(speechOK)speechSynthesis.cancel();}
function speechText(t){
  return [t.title,String(t.content_md||'')].filter(Boolean).join('\n\n')
    .replace(/https?:\/\/\S+/g,' ').replace(/[`*_#>~|]/g,' ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,' ')
    .replace(/\[(.*?)\]/g,'$1.').replace(/-{3,}/g,' ').replace(/[ \t]{2,}/g,' ').trim();
}
function fillVoices(){
  const sel=document.getElementById('ttsVoice');if(!sel)return;
  const voices=speechOK?speechSynthesis.getVoices():[];
  const en=voices.filter(v=>/^en/i.test(v.lang));
  const keep=sel.value;
  sel.innerHTML='<option value="">Device default</option>'+en.map(v=>`<option value="${esc(v.name)}">${esc(v.name)}${/samantha/i.test(v.name)?' · US':''}</option>`).join('');
  const sam=en.find(v=>/samantha/i.test(v.name));
  sel.value=keep||(sam?sam.name:'');
}
if(speechOK)speechSynthesis.onvoiceschanged=fillVoices;
function exportHtml(t){
  const body=document.querySelector('.governed-content')?.innerHTML||'';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t.title)}</title><style>${style.textContent.split('/* Reader formatting')[1]?'/* Reader formatting'+style.textContent.split('/* Reader formatting')[1].split('/* Document and Listen')[0]:''}
body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#0b1733}h1.title{font-family:Cinzel,Georgia,serif;color:#0c2075}.summary{color:#4b5878}
.governed-content{font-size:12pt}.special,.governed-content blockquote{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body><h1 class="title">${esc(t.title)}</h1>${t.summary?`<p class="summary">${esc(t.summary)}</p>`:''}<div class="governed-content">${body}</div></body></html>`;
}
function bindTools(t){
  const status=m=>{const el=document.getElementById('docStatus');el.textContent=m;clearTimeout(status.t);status.t=setTimeout(()=>el.textContent='',4000);};
  document.getElementById('docCopy').onclick=async()=>{
    try{await navigator.clipboard.writeText(document.querySelector('.governed-content').innerText.trim()?[t.title,document.querySelector('.governed-content').innerText].join('\n\n'):t.title);status('Copied to clipboard.');}
    catch{status('Copy was blocked by the browser.');}
  };
  document.getElementById('docPrint').onclick=()=>{status('');print();};
  document.getElementById('docPdf').onclick=()=>{status('Choose "Save as PDF" in the print dialog.');print();};
  document.getElementById('docWord').onclick=()=>{
    const blob=new Blob(['\ufeff'+exportHtml(t)],{type:'application/msword'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download=(t.slug||String(t.title||'teaching').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'teaching')+'.doc';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    status('Word file downloaded in reader format.');
  };
  const menu=document.querySelector('.tb-menu');
  menu.querySelectorAll('button,a').forEach(el=>el.addEventListener('click',()=>menu.open=false));
  document.getElementById('ttsOpen').onclick=()=>{
    if(!speechOK){status('Listening is not supported in this browser.');return;}
    document.getElementById('playerBar').hidden=false;fillVoices();playCurrent();
  };
}

function playCurrent(){
  const t=governed.find(x=>String(x.id)===String(currentId));if(!t||!speechOK)return;
  const tts=m=>{document.getElementById('ttsStatus').textContent=m;};
  const pauseBtn=document.getElementById('ttsPause');
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(speechText(t));
  u.rate=Number(document.getElementById('ttsRate').value)||1;
  const name=document.getElementById('ttsVoice').value;
  const v=speechSynthesis.getVoices().find(x=>x.name===name);if(v)u.voice=v;
  u.onstart=()=>{tts('Playing');pauseBtn.textContent='⏸';};u.onend=()=>tts('Finished');u.onerror=()=>tts('Stopped');
  speechSynthesis.speak(u);
}

function bindPlayer(){
  if(!speechOK)return;
  const tts=m=>{document.getElementById('ttsStatus').textContent=m;};
  const pauseBtn=document.getElementById('ttsPause');
  document.getElementById('ttsPlay').onclick=playCurrent;
  pauseBtn.onclick=()=>{
    if(speechSynthesis.paused){speechSynthesis.resume();pauseBtn.textContent='⏸';tts('Playing');}
    else{speechSynthesis.pause();pauseBtn.textContent='⏵';tts('Paused');}
  };
  document.getElementById('ttsStop').onclick=()=>{speechSynthesis.cancel();pauseBtn.textContent='⏸';tts('Stopped');};
  document.getElementById('ttsClose').onclick=()=>{speechSynthesis.cancel();document.getElementById('playerBar').hidden=true;};
  document.getElementById('ttsRate').onchange=()=>{if(speechSynthesis.speaking)playCurrent();};
  document.getElementById('ttsVoice').onchange=()=>{if(speechSynthesis.speaking)playCurrent();};
}

// Single library view (owner-approved 2026-11-11): the old curated buttons
// (Library, KEEP THE GARDEN, Lesson One, SHAMAR, Content Types) are retired from the nav;
// those teachings remain findable through search, type filters and the series menu.
if(nav)nav.innerHTML='';
loadGoverned();
