(function(){
  function $(s,root){return (root||document).querySelector(s)}
  async function ensureClient(){ if(!window.orElCall){ await new Promise((ok,err)=>{ const s=document.createElement('script'); s.src='/orai.js'; s.onload=ok; s.onerror=err; document.head.appendChild(s); }); } }
  function wire(){
    const brief=$('#btn-brief'); const proph=$('#btn-proph');
    if(brief){ brief.addEventListener('click', async (e)=>{ e.preventDefault(); await ensureClient(); const txt=await orElCall('dims_brief','Generate today’s compact brief for DIMS.'); renderCard('ai-brief','⚡ DIMS Brief (AI)',txt); }); }
    if(proph){ proph.addEventListener('click', async (e)=>{ e.preventDefault(); await ensureClient(); const txt=await orElCall('prophesy_flow','Flow a short Now Word + Confession.'); renderCard('ai-proph','🕊️ PROPHESY! (AI)',txt); }); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
