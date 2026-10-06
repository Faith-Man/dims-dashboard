const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let step=1;
function show(n){step=n;$$('.stage').forEach(x=>x.classList.toggle('active',+x.dataset.step===n));$$('[data-go]').forEach(x=>x.classList.toggle('on',+x.dataset.go===n));$('#experience').scrollIntoView({behavior:'smooth',block:'center'});}
$$('[data-go]').forEach(b=>b.onclick=()=>show(+b.dataset.go));
const mode=$('#mode'), dur=$('#duration'), date=$('#targetDate'), status=$('#journeyStatus');
function modeUI(){const m=mode.value;$('#durationWrap').hidden=m!=='journey';$('#dateWrap').hidden=m!=='countdown';status.hidden=m==='theme';refresh();}
function refresh(){if(mode.value==='journey') status.textContent='A '+dur.value+'-DAY WORD → VISION → ACTION JOURNEY';if(mode.value==='countdown'){if(!date.value){status.textContent='SELECT THE APPOINTED DATE';return}const d=Math.ceil((new Date(date.value+'T23:59:59')-new Date())/86400000);status.textContent=d>0?d+' DAYS UNTIL THE APPOINTED TIME':d===0?'THE APPOINTED DAY IS HERE':'THE APPOINTED DATE HAS PASSED';}}
mode.onchange=modeUI;dur.oninput=refresh;date.onchange=refresh;modeUI();
$('#beginBtn').onclick=()=>show(1);
$('#declareBtn').onclick=e=>{e.currentTarget.textContent='DECLARED ✓';e.currentTarget.classList.add('on');setTimeout(()=>show(5),650)};
$('#completeBtn').onclick=()=>{const key='d1-biblical-vision-progress';const saved=JSON.parse(localStorage.getItem(key)||'{}');saved.completed=(saved.completed||0)+1;saved.last=new Date().toISOString();saved.see=$('#seeInput').value;saved.action=$('#doInput').value;localStorage.setItem(key,JSON.stringify(saved));if(mode.value==='journey'&&saved.completed>=+dur.value){$('#teleios').hidden=false;$('#teleios').scrollIntoView({behavior:'smooth'});}else{$('#completeBtn').textContent='TODAY ESTABLISHED ✓';}};
$('#soundBtn').onclick=e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',on);e.currentTarget.textContent='SOUND: '+(on?'READY':'OFF');};
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&step<5)show(step+1);if(e.key==='ArrowLeft'&&step>1)show(step-1)});