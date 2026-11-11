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
function calloutClass(tag){
  const x=tag.toLowerCase();
  if(/scripture/.test(x))return'special-scripture';
  if(/principle/.test(x))return'special-principle';
  if(/revelation/.test(x))return'special-revelation';
  if(/word study/.test(x))return'special-wordstudy';
  if(/application|assignment/.test(x))return'special-application';
  if(/reflection/.test(x))return'special-reflection';
  if(/warning/.test(x))return'special-warning';
  if(/declaration/.test(x))return'special-declaration';
  if(/prayer/.test(x))return'special-prayer';
  return'';
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
.special-scripture{background:#eef6ff;border-left:6px solid #2b65b0}
.special-principle{background:linear-gradient(135deg,#08155f,#102a86);color:#fff;border-left:6px solid #d3ad3d}
.special-principle>strong,.special-principle p,.special-principle li{color:#fff}
.special-revelation{background:#fff7dc;border-left:6px solid #c5a23b}
.special-wordstudy{background:#f1f7ff;border-left:6px solid #526fa5}
.special-application{background:#effaf2;border-left:6px solid #2f7d46}
.special-reflection{background:#f6f1ff;border-left:6px solid #7355a6}
.special-warning{background:#fff2f0;border-left:6px solid #a64235}
.special-declaration,.special-prayer{background:#f5f8ff;border-left:6px solid #0c2075}
.special-principle{print-color-adjust:exact}
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
  md=md.split('\n').map(line=>{
    const m=line.trim().match(CALLOUT_TAGS);
    if(!m)return line;
    return `\n<section class="special ${calloutClass(m[1])}"><strong>${esc(m[1].toUpperCase())}</strong><p>${marked.parseInline(m[2]||'')}</p></section>\n`;
  }).join('\n');
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

function cardHtml(t){
  const meta=[t.series&&String(t.series).toLowerCase()!=='standalone'?t.series:'',dateOf(t)].filter(Boolean).join(' · ');
  return `<button class="card lib-card" style="text-align:left;cursor:pointer" data-governed-id="${esc(t.id)}"><span class="badge">${esc(t.content_type||'Teaching')}</span><h3>${esc(t.title||'Untitled')}</h3><p>${esc(t.summary||'')}</p>${meta?`<p class="meta">${esc(meta)}</p>`:''}</button>`;
}

function renderResults(){
  const items=visibleItems();
  document.getElementById('teachingCount').textContent=`${items.length} of ${governed.length} teachings, messages and perspectives`;
  const results=document.getElementById('teachingResults');
  results.innerHTML=items.length?items.map(cardHtml).join(''):'<div class="card"><h3>No matching teachings</h3><p>Try another search or filter.</p></div>';
  results.querySelectorAll('[data-governed-id]').forEach(el=>el.onclick=()=>openGoverned(el.dataset.governedId));
}

function renderGovernedLibrary(){
  const chips=FILTERS.map(f=>`<button class="chip" type="button" data-filter="${f.key}" aria-pressed="${state.filter===f.key}">${f.label}</button>`).join('');
  const series=seriesList().map(([s,n])=>`<option value="${esc(s)}"${state.series===s?' selected':''}>${esc(s)} (${n})</option>`).join('');
  app.innerHTML=`<section class="lib-hero"><div class="kicker">Wells of Knowledge</div><h2>YARATHĒKĒ™ Library</h2><p>${governed.length} teachings, messages and perspectives.</p><label for="teachingSearch">Search</label><input id="teachingSearch" class="lib-search" type="search" placeholder="Search title, series, topic…" value="${esc(state.query)}"/><div class="lib-controls" role="group" aria-label="Filter by type">${chips}<select id="seriesFilter" class="lib-series" aria-label="Filter by series"><option value="">All series</option>${series}</select></div><p id="teachingCount" class="lib-count" aria-live="polite"></p></section><div class="grid" id="teachingResults"></div>`;
  document.getElementById('teachingSearch').addEventListener('input',e=>{state.query=e.target.value;renderResults();});
  app.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;app.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderResults();});
  document.getElementById('seriesFilter').onchange=e=>{state.series=e.target.value;renderResults();};
  renderResults();
}

function openGoverned(id){
  const t=governed.find(x=>String(x.id)===String(id));
  if(!t)return;
  app.innerHTML=`<div class="reader-shell"><article class="reader" data-title="${esc(t.title||'Teaching')}"><div class="series-mark">${esc(t.series||'Dominion1st™')}</div><h2>${esc(t.title||'Teaching')}</h2><div class="subtitle">${esc(t.summary||'')}</div><div class="scripture">${esc((t.tags||[]).join(' · '))}</div><div class="reader-content governed-content">${renderContent(t)}</div></article><aside class="side"><div class="card"><span class="badge">YARATHĒKĒ™ Reader</span><h3>Details</h3><div class="meta-row"><span>Format</span><b>${esc(t.content_type||'Teaching')}</b></div><div class="meta-row"><span>Series</span><b>${esc(t.series||'—')}</b></div><div class="meta-row"><span>Updated</span><b>${esc(dateOf(t))}</b></div><button id="backGoverned" class="btn ghost" style="margin-top:12px">Back to library</button></div></aside></div>`;
  document.getElementById('backGoverned').onclick=()=>{renderGovernedLibrary();scrollTo({top:0});};
  scrollTo({top:0});
  app.focus({preventScroll:true});
}

// Single library view (owner-approved 2026-11-11): the old curated buttons
// (Library, KEEP THE GARDEN, Lesson One, SHAMAR, Content Types) are retired from the nav;
// those teachings remain findable through search, type filters and the series menu.
if(nav)nav.innerHTML='';
loadGoverned();
