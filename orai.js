async function orElCall(mode,input='',teachings=[]){
  const r=await fetch('/.netlify/functions/orai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,input,teachings})});
  const j=await r.json(); if(!j.ok) throw new Error(j.error||'Unknown'); return j.data;
}
function renderCard(id,title,body){
  const wrap=document.getElementById(id) || (function(){const d=document.createElement('div'); d.id=id; document.body.prepend(d); return d;})();
  wrap.innerHTML=`<section style="border:1px solid #e6e9ef;border-radius:14px;padding:14px;margin:12px 0;background:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial">
    <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <h3 style="margin:0;color:#0C1475;text-shadow:0 0 6px #E6F0FF">${title}</h3>
      <div><button onclick="window.print()" style="background:#0C1475;color:#fff;border:0;border-radius:10px;padding:8px 12px;cursor:pointer">Print</button></div>
    </header>
    <pre style="white-space:pre-wrap;margin:0;line-height:1.45">${body.replace(/</g,'&lt;')}</pre>
  </section>`;
}
