(function(){
  function $(s,root){return (root||document).querySelector(s)}
  async function ensureClient(){ if(!window.orElCall){ await new Promise((ok,err)=>{ const s=document.createElement('script'); s.src='/orai.js'; s.onload=ok; s.onerror=err; document.head.appendChild(s); }); } }
  function wire(){
    const brief=$('#btn-brief'); const proph=$('#btn-proph');
    if(brief){ brief.addEventListener('click', async (e)=>{ e.preventDefault(); await ensureClient(); const txt=await orElCall('dims_brief','Create a compact operational planning brief. Label unknown or unverified information.'); renderCard('ai-brief','⚡ AI-Assisted Planning Draft',txt); }); }
    if(proph){
      proph.setAttribute('aria-disabled','true');
      proph.title='AI prophetic generation is disabled; prophetic authorship and discernment remain human-governed.';
      proph.addEventListener('click',(e)=>{ e.preventDefault(); alert('AI prophetic generation is disabled. Prophetic authorship and discernment remain human-governed.'); });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', wire); else wire();
})();
