(function(){
  function slug(){const r=document.querySelector('.reader');return (r?.dataset.title||'Dominion1st-Teaching').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}
  function readerNode(){return document.querySelector('.reader')}
  function readerText(){const r=readerNode();return r?r.innerText.replace(/\n{3,}/g,'\n\n').trim()+"\n\n— H. Michael Daniels | Dominion1st™":""}
  function readerHtml(){const r=readerNode();return `<!doctype html><html><head><meta charset="utf-8"><title>${slug()}</title><style>body{font:16px/1.7 Georgia,serif;max-width:760px;margin:40px auto;padding:0 24px;color:#17213c}h1,h2,h3{font-family:Arial,sans-serif;color:#0c1475}.principle{font-family:Arial,sans-serif;font-weight:bold;padding:14px;background:#edf2ff;border:1px solid #c8d8ff;margin:18px 0;text-align:center}.actions,.side{display:none}</style></head><body>${r?r.innerHTML:''}<p>— H. Michael Daniels | Dominion1st™</p></body></html>`}
  function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
  window.download=function(type='txt'){
    if(type==='pdf'){toastMsg('Print dialog opened — choose Save as PDF');window.print();return}
    if(type==='doc'){save(new Blob([readerHtml()],{type:'application/msword'}),slug()+'.doc');toastMsg('Word-compatible copy downloaded');return}
    save(new Blob([readerText()],{type:'text/plain;charset=utf-8'}),slug()+'.txt');toastMsg('Plain-text copy downloaded')
  };
  window.actions=function(){return `<div class="actions"><button class="btn" data-act="copy">Copy Full Teaching</button><details class="download-menu"><summary class="btn secondary">Download</summary><div class="download-pop"><button data-download="pdf">PDF / Print</button><button data-download="doc">Word</button><button data-download="txt">Plain Text</button></div></details><button class="btn ghost" data-act="share">Share</button><button class="btn ghost" data-act="print">Print</button></div>`};
  const prior=window.bindActions;
  window.bindActions=function(){if(prior)prior();document.querySelectorAll('[data-download]').forEach(b=>b.onclick=e=>{e.preventDefault();window.download(b.dataset.download);const d=b.closest('details');if(d)d.open=false})};
})();
