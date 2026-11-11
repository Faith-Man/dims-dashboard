import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { marked } from 'https://esm.sh/marked@12';
import DOMPurify from 'https://esm.sh/dompurify@3';

// Reader formatting for governed teachings: render Markdown and style scripture
// blockquotes as the gold callout boxes used by DIMS-TEACH-0006 (DOME™ — Dominion Over My Everything).
const governedStyle=document.createElement('style');
governedStyle.textContent=`
.governed-content h1,.governed-content h2{font-family:Cinzel,serif;color:var(--blue);font-size:1.45rem;line-height:1.25;margin:2.1rem 0 .7rem}
.governed-content h3{font-family:Cinzel,serif;color:var(--blue);font-size:1.18rem;margin:1.8rem 0 .6rem}
.governed-content h4{font-family:Inter,sans-serif;color:var(--blue);font-size:1rem;margin:1.4rem 0 .5rem}
.governed-content blockquote{border-left:4px solid #a97800;background:#fffaf0;padding:13px 16px;border-radius:0 10px 10px 0;margin:1.3rem 0;color:#5c4820}
.governed-content blockquote p{margin:.35rem 0}
.governed-content ul,.governed-content ol{padding-left:1.4rem}
.governed-content li{margin:.25rem 0}
.governed-content table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:.9rem;margin:1.2rem 0;display:block;overflow-x:auto}
.governed-content th,.governed-content td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
.governed-content th{background:#edf2ff;color:var(--blue)}
.governed-content hr{border:0;border-top:1px solid var(--line);margin:2rem 0}
.governed-content img{max-width:100%;height:auto}
.governed-content{overflow-wrap:anywhere}
`;
document.head.appendChild(governedStyle);

function renderContent(t){
  let md=String(t.content_md||'');
  // The title is already shown above the article; drop a leading H1 that repeats it.
  const first=md.match(/^\s*#\s+(.+)\n/);
  if(first&&first[1].trim().toLowerCase()===String(t.title||'').trim().toLowerCase())md=md.slice(first[0].length);
  return DOMPurify.sanitize(marked.parse(md,{gfm:true,breaks:false}));
}

const supabase=createClient(
  'https://sdquzhsylqpbhrmqjqgk.supabase.co',
  'sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How'
);

const app=document.getElementById('app');
const nav=document.getElementById('nav');
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
let governed=[];

function dateOf(t){
  const raw=t.published_date||t.published_at||t.updated_at||t.created_at;
  if(!raw)return '';
  const d=new Date(raw);
  return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}

async function loadGoverned(){
  app.innerHTML='<section class="hero"><div class="kicker">Governed Knowledge Store</div><h2>Loading YARATHĒKĒ…</h2><p>Reading from the existing DIMS governed teaching source.</p></section>';
  const {data,error}=await supabase.from('teachings').select('*').order('updated_at',{ascending:false});
  if(error){
    app.innerHTML=`<section class="hero"><div class="kicker">Governed Knowledge Store</div><h2>Unable to load</h2><p>${esc(error.message)}</p></section>`;
    return;
  }
  governed=data||[];
  renderGovernedLibrary();
}

function renderGovernedLibrary(query=''){
  const q=String(query).trim().toLowerCase();
  const visible=governed.filter(t=>!q||[t.title,t.summary,t.series,t.category,t.status,t.content_type,...(Array.isArray(t.tags)?t.tags:[])].some(v=>String(v||'').toLowerCase().includes(q)));
  const cards=visible.length?visible.map(t=>`<button class="card" style="text-align:left;cursor:pointer" data-governed-id="${esc(t.id)}"><span class="badge">${esc(t.content_type||'Teaching')}</span><h3>${esc(t.title||'Untitled')}</h3><p>${esc(t.summary||'')}</p><p style="color:var(--muted);font-size:.82rem">${esc(t.status||'draft')}${dateOf(t)?' · '+esc(dateOf(t)):''}</p></button>`).join(''):'<div class="card"><h3>No matching teachings</h3><p>Try another search.</p></div>';
  app.innerHTML=`<section class="hero"><div class="kicker">Governed Knowledge Store · DIMS-v3</div><h2>YARATHĒKĒ Library</h2><p>All ${governed.length} teaching records from the existing DIMS-v3 source of truth, including draft and archived records. Read-only browsing; no records are modified.</p><label for="teachingSearch">Search teachings</label><input id="teachingSearch" type="search" placeholder="Search title, series, status, tags…" value="${esc(query)}" style="display:block;width:100%;max-width:600px;padding:12px;margin-top:10px;border-radius:9px;border:1px solid #9ab5df;background:#fff;color:#10204d"/><p id="teachingCount" aria-live="polite">${visible.length} of ${governed.length} teachings</p></section><div class="grid" id="teachingResults">${cards}</div>`;
  const input=document.getElementById('teachingSearch');
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    const items=governed.filter(t=>!q||[t.title,t.summary,t.series,t.category,t.status,t.content_type,...(Array.isArray(t.tags)?t.tags:[])].some(v=>String(v||'').toLowerCase().includes(q)));
    document.getElementById('teachingCount').textContent=`${items.length} of ${governed.length} teachings`;
    document.querySelectorAll('[data-governed-id]').forEach(el=>{
      const t=governed.find(t=>String(t.id)===el.dataset.governedId);
      el.hidden=!items.includes(t);
    });
  });
  app.querySelectorAll('[data-governed-id]').forEach(el=>el.onclick=()=>openGoverned(el.dataset.governedId));
}

function openGoverned(id){
  const t=governed.find(x=>String(x.id)===String(id));
  if(!t)return;
  app.innerHTML=`<div class="reader-shell"><article class="reader" data-title="${esc(t.title||'Teaching')}"><div class="series-mark">${esc(t.series||'Dominion1st™')}</div><h2>${esc(t.title||'Teaching')}</h2><div class="subtitle">${esc(t.summary||'')}</div><div class="scripture">${esc((t.tags||[]).join(' · '))}</div><div class="reader-content governed-content">${renderContent(t)}</div></article><aside class="side"><div class="card"><span class="badge">Governed Reader</span><h3>Artifact details</h3><div class="meta-row"><span>Format</span><b>${esc(t.content_type||'Teaching')}</b></div><div class="meta-row"><span>Status</span><b>${esc(t.status||'draft')}</b></div><div class="meta-row"><span>Updated</span><b>${esc(dateOf(t))}</b></div><button id="backGoverned" class="btn ghost" style="margin-top:12px">Back to library</button></div></aside></div>`;
  document.getElementById('backGoverned').onclick=()=>renderGovernedLibrary();
  app.focus();
}

const governedBtn=document.createElement('button');
governedBtn.textContent='Governed Library';
governedBtn.dataset.liveLibrary='true';
governedBtn.onclick=()=>{
  [...nav.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b===governedBtn));
  nav.classList.remove('open');
  loadGoverned();
};
nav.prepend(governedBtn);
// The authoritative Supabase-backed teaching collection is the default Reader view.
// Curated static lessons remain available through the existing navigation.
loadGoverned().then(()=>{[...nav.querySelectorAll('button')].forEach(b=>b.classList.toggle('active',b===governedBtn));});

// Keep the existing curated reader intact. The governed-store view is an EBYC extension,
// not a replacement for established static/curated content.
