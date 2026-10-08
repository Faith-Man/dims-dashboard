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
  governed=(data||[]).filter(t=>(t.status||'').toLowerCase()!=='archived');
  renderGovernedLibrary();
}

function renderGovernedLibrary(){
  const cards=governed.length?governed.map(t=>`<button class="card" style="text-align:left;cursor:pointer" data-governed-id="${esc(t.id)}"><span class="badge">${esc(t.content_type||'Teaching')}</span><h3>${esc(t.title||'Untitled')}</h3><p>${esc(t.summary||'')}</p><p style="color:var(--muted);font-size:.82rem">${esc(t.status||'draft')}${dateOf(t)?' · '+esc(dateOf(t)):''}</p></button>`).join(''):'<div class="card"><h3>No governed teachings found</h3><p>Publish from OrEl to begin building this library.</p></div>';
  app.innerHTML=`<section class="hero"><div class="kicker">Governed Knowledge Store</div><h2>YARATHĒKĒ Library</h2><p>Teachings and governed content written through OrEl are presented here from the existing DIMS source of truth.</p></section><div class="grid">${cards}</div>`;
  app.querySelectorAll('[data-governed-id]').forEach(el=>el.onclick=()=>openGoverned(el.dataset.governedId));
}

function openGoverned(id){
  const t=governed.find(x=>String(x.id)===String(id));
  if(!t)return;
  app.innerHTML=`<div class="reader-shell"><article class="reader" data-title="${esc(t.title||'Teaching')}"><div class="series-mark">${esc(t.series||'Dominion1st™')}</div><h2>${esc(t.title||'Teaching')}</h2><div class="subtitle">${esc(t.summary||'')}</div><div class="scripture">${esc((t.tags||[]).join(' · '))}</div><div class="reader-content" style="white-space:pre-wrap">${esc(t.content_md||'')}</div></article><aside class="side"><div class="card"><span class="badge">Governed Reader</span><h3>Artifact details</h3><div class="meta-row"><span>Format</span><b>${esc(t.content_type||'Teaching')}</b></div><div class="meta-row"><span>Status</span><b>${esc(t.status||'draft')}</b></div><div class="meta-row"><span>Updated</span><b>${esc(dateOf(t))}</b></div><button id="backGoverned" class="btn ghost" style="margin-top:12px">Back to library</button></div></aside></div>`;
  document.getElementById('backGoverned').onclick=renderGovernedLibrary;
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
nav.appendChild(governedBtn);

// Keep the existing curated reader intact. The governed-store view is an EBYC extension,
// not a replacement for established static/curated content.
