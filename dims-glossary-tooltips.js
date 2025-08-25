(function(){
  const fetchGloss = async () => {
    try{ const r=await fetch('/glossary/glossary.json',{cache:'no-store'}); const j=await r.json(); return j.terms||[]; }catch(e){ return []; }
  };
  function addStyle(){
    if(document.getElementById('gloss-tip-style')) return;
    const s=document.createElement('style'); s.id='gloss-tip-style';
    s.textContent=`.gloss-tip{position:relative;cursor:help}
    .gloss-tip:hover::after{content:attr(data-tip); position:absolute; left:0; top:120%; width:320px; background:#0C1475; color:#fff; padding:10px 12px; border-radius:10px; box-shadow:0 4px 16px rgba(0,0,0,.25); white-space:normal; z-index:9999}`;
    document.head.appendChild(s);
  }
  function apply(terms){
    addStyle(); const map=Object.fromEntries(terms.map(t=>[t.term.toLowerCase(),t]));
    document.querySelectorAll('[data-gloss]').forEach(el=>{
      const key=(el.getAttribute('data-gloss')||'').toLowerCase(); const t=map[key]; if(!t) return;
      const def=t.definition||''; const dims=(t.dimensions||[])[0]||'';
      el.classList.add('gloss-tip'); el.setAttribute('data-tip', `${t.term}: ${def}${dims?(' — '+dims):''}`);
    });
  }
  fetchGloss().then(apply);
})();
