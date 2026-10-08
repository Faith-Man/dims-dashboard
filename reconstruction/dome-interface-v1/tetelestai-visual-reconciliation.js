(() => {
  const bands = {
    extreme: { label: 'EXTREMELY HIGH', color: '#e9152b', glow: 'rgba(233,21,43,.48)' },
    high: { label: 'HIGH', color: '#ff7b16', glow: 'rgba(255,123,22,.48)' },
    serious: { label: 'SERIOUS', color: '#efc312', glow: 'rgba(239,195,18,.52)' },
    medium: { label: 'MEDIUM', color: '#21bd55', glow: 'rgba(33,189,85,.48)' },
    low: { label: 'LOW', color: '#1678ee', glow: 'rgba(22,120,238,.48)' }
  };
  const racMap = { '1':'extreme','2':'high','3':'serious','4':'medium','5':'low' };

  const style = document.createElement('style');
  style.id = 'tetelestaiCircularRacV3';
  style.textContent = `
    .tet-rac-legend{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 14px;padding:12px 14px;border:1px solid #b7cbea;border-radius:14px;background:linear-gradient(180deg,#fafdff,#eef5ff);box-shadow:0 8px 22px rgba(8,43,114,.08)}
    .tet-rac-legend-title{font-weight:950;color:#0a2868;margin-right:4px}.tet-rac-legend-item{display:flex;align-items:center;gap:6px;color:#17376e;font-size:.72rem;font-weight:900}.tet-rac-dot{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:.67rem;font-weight:1000;border:2px solid rgba(255,255,255,.94);box-shadow:inset 0 3px 5px rgba(255,255,255,.5),inset 0 -4px 7px rgba(0,0,0,.22),0 0 0 2px #0c2c70,0 3px 8px rgba(0,0,0,.2)}
    .rac-trigger,.dims-grid td[data-label="RAC"]{text-align:center!important}.rac-trigger{width:42px;height:42px;border-radius:50%!important;display:inline-grid!important;place-items:center!important;padding:0!important;color:#fff!important;font-weight:1000!important;border:2px solid rgba(255,255,255,.94)!important;box-shadow:inset 0 4px 6px rgba(255,255,255,.48),inset 0 -5px 8px rgba(0,0,0,.25),0 0 0 2px #0b2b6b,0 4px 10px rgba(5,27,72,.25)!important}
    .rac-trigger[data-rac-band="extreme"]{background:radial-gradient(circle at 38% 30%,#ff7f8b,#e9152b 56%,#8a0011)}.rac-trigger[data-rac-band="high"]{background:radial-gradient(circle at 38% 30%,#ffc06a,#ff7b16 56%,#a83b00)}.rac-trigger[data-rac-band="serious"]{background:radial-gradient(circle at 38% 30%,#fff58a,#efc312 56%,#9c7600);color:#172033!important}.rac-trigger[data-rac-band="medium"]{background:radial-gradient(circle at 38% 30%,#8df6a7,#21bd55 56%,#087032)}.rac-trigger[data-rac-band="low"]{background:radial-gradient(circle at 38% 30%,#8fd2ff,#1678ee 56%,#1438a6)}
    .epi-priority{min-width:92px!important;max-width:116px!important;padding:0!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important}.epi-priority-track{width:42px!important;height:42px!important;padding:0!important;display:grid!important;place-items:center!important;border-radius:50%!important;border:2px solid rgba(255,255,255,.95)!important;box-shadow:inset 0 4px 6px rgba(255,255,255,.48),inset 0 -5px 8px rgba(0,0,0,.25),0 0 0 2px #0b2b6b,0 4px 10px rgba(5,27,72,.25)!important;background:#1678ee!important;overflow:hidden!important}.epi-priority-seg,.epi-priority-marker{display:none!important}.epi-priority-label{margin:0!important;text-align:left!important;font-size:.63rem!important;line-height:1.1!important;white-space:normal!important;max-width:62px!important}.epi-priority[data-level="extreme"] .epi-priority-track{background:radial-gradient(circle at 38% 30%,#ff7f8b,#e9152b 56%,#8a0011)!important}.epi-priority[data-level="high"] .epi-priority-track{background:radial-gradient(circle at 38% 30%,#ffc06a,#ff7b16 56%,#a83b00)!important}.epi-priority[data-level="serious"] .epi-priority-track{background:radial-gradient(circle at 38% 30%,#fff58a,#efc312 56%,#9c7600)!important}.epi-priority[data-level="medium"] .epi-priority-track{background:radial-gradient(circle at 38% 30%,#8df6a7,#21bd55 56%,#087032)!important}.epi-priority[data-level="low"] .epi-priority-track{background:radial-gradient(circle at 38% 30%,#8fd2ff,#1678ee 56%,#1438a6)!important}
    .dims-grid th{background:linear-gradient(180deg,#0d4da6,#082f78)!important}.section-title{background:linear-gradient(100deg,#082b72,#0d4da6)!important}
    @media(max-width:900px){.tet-rac-legend{gap:8px;padding:10px}.tet-rac-legend-item{font-size:.66rem}.rac-trigger{width:38px;height:38px}.epi-priority{justify-content:flex-start!important;max-width:none!important}}
  `;
  document.head.appendChild(style);

  function legend() {
    if (document.querySelector('.tet-rac-legend')) return;
    const wrap = document.querySelector('.wrap');
    if (!wrap) return;
    const el = document.createElement('section');
    el.className = 'tet-rac-legend';
    el.setAttribute('aria-label','RAC level legend');
    el.innerHTML = `<span class="tet-rac-legend-title">RAC</span>` +
      Object.entries(bands).map(([key,b],i)=>`<span class="tet-rac-legend-item"><span class="tet-rac-dot" style="background:radial-gradient(circle at 38% 30%,#fff8,${b.color} 58%,#06255c);box-shadow:inset 0 3px 5px rgba(255,255,255,.5),inset 0 -4px 7px rgba(0,0,0,.22),0 0 0 2px #0c2c70,0 0 10px ${b.glow}">${i+1}</span>${b.label}</span>`).join('');
    wrap.insertBefore(el, wrap.firstChild);
  }

  function reconcileRacButtons() {
    document.querySelectorAll('.rac-trigger').forEach(btn => {
      const txt = (btn.textContent || '').trim();
      const m = txt.match(/[1-5]/);
      if (m) {
        btn.dataset.racBand = racMap[m[0]];
        btn.textContent = m[0];
        btn.title = `${bands[racMap[m[0]]].label} RAC ${m[0]}`;
      }
    });
  }

  function reconcilePriorityCoins() {
    document.querySelectorAll('.epi-priority').forEach(el => {
      const track = el.querySelector('.epi-priority-track');
      if (!track || track.dataset.coinReady) return;
      track.dataset.coinReady = '1';
      const level = el.dataset.level || 'medium';
      track.innerHTML = `<span style="color:${level==='serious'?'#172033':'#fff'};font-weight:1000;font-size:.68rem;text-shadow:${level==='serious'?'none':'0 1px 3px rgba(0,0,0,.55)'}">${({extreme:'EH',high:'H',serious:'S',medium:'M',low:'L'})[level]||'M'}</span>`;
    });
  }

  function run(){ legend(); reconcileRacButtons(); reconcilePriorityCoins(); }
  run();
  new MutationObserver(run).observe(document.body,{subtree:true,childList:true});
})();