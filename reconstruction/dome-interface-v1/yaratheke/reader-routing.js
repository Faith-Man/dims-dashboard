(function(){
  function normalizeView(value){
    return ['library','series','garden','shamar','formats'].includes(value) ? value : null;
  }

  function requestedView(){
    const params=new URLSearchParams(window.location.search);
    return normalizeView(params.get('view'));
  }

  function openView(view){
    if(typeof window.show==='function'){
      window.show(view);
      const url=new URL(window.location.href);
      url.searchParams.set('view',view);
      history.replaceState({view},'',url);
    }
  }

  // Reader-first routing: when a user selects a teaching card, open the
  // complete canonical teaching rather than stopping at descriptive metadata.
  const app=document.getElementById('app');
  if(app){
    app.addEventListener('click',function(event){
      const card=event.target.closest('.card');
      if(!card) return;
      const heading=card.querySelector('h3')?.textContent?.trim()||'';
      if(heading==='KEEP THE GARDEN™'){
        event.preventDefault();
        event.stopImmediatePropagation();
        openView('garden');
      }else if(heading==='SHAMAR™'){
        event.preventDefault();
        event.stopImmediatePropagation();
        openView('shamar');
      }
    },true);
  }

  // Direct-review links such as ?view=garden and ?view=shamar are supported.
  const initial=requestedView();
  if(initial && initial!=='library'){
    queueMicrotask(()=>openView(initial));
  }

  window.addEventListener('popstate',()=>{
    const view=requestedView()||'library';
    if(typeof window.show==='function') window.show(view);
  });
})();
