import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
  app.innerHTML=`<div class="reader-shell"><article class="reader" data-title="${esc(t.title||'Teaching')}"><div class="series-mark">${esc(t.series||'Dominion1st™')}</div><h2>${esc(t.title||'Teaching')}</h2><div class="subtitle">${esc(t.summary||'')}</div><div class="scripture">${esc((t.tags||[]).join(' · '))}</div><div class="reader-content" style="white-space:pre-wrap">${esc(t.content_md||'')}</div></article><aside class="side"><div class="card"><span class="badge">Governed Reader</span><h3>Artifact details</h3><div class="meta-row"><span>Format</span><b>${esc(t.content_type||'Teaching')}</b></div><div class="meta-row"><span>Status</span><b>${esc(t.status||'draft')}</b></div><div class="meta-row"><span>Updated</span><b>${esc(dateOf(t))}</b></div><button id="backGoverned" class="btn ghost" style="margin-top:12px">Back to library</button></div></aside></div>`;
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
