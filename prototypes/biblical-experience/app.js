const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let step=1,currentSubject='VISION';
function show(n){step=n;$$('.stage').forEach(x=>x.classList.toggle('active',+x.dataset.step===n));$$('[data-go]').forEach(x=>x.classList.toggle('on',+x.dataset.go===n));$('#experience').scrollIntoView({behavior:'smooth',block:'center'});}
$$('[data-go]').forEach(b=>b.onclick=()=>show(+b.dataset.go));
function render(subject){
 const key=subject.trim().toUpperCase(), x=window.D1_EXPERIENCES[key];
 if(!x){$('#subjectSub').textContent='This subject is ready for live AI generation. The prototype currently includes VISION, FAITH, and DOMINION.';return false}
 currentSubject=key;document.body.dataset.scene=x.scene;$('#subjectTitle').textContent=key;$('#subjectInput').value=key;$('#subjectSub').textContent=x.subtitle;
 $('#scriptureText').textContent='“'+x.scripture.text+'”';$('#scriptureRef').textContent=x.scripture.ref;$('#scriptureThought').textContent=x.scripture.thought;
 $('#seeLead').textContent=x.see.lead;$('#vistaOverline').textContent=x.see.overline;$('#vistaTitle').textContent=x.see.title;$('#seeBody').textContent=x.see.body;
 $('#mindsetLead').textContent=x.mindset.lead;$('#mindsetBody').textContent=x.mindset.body;
 $('#declarationText').innerHTML=x.declaration.map((v,i)=>i===x.declaration.length-1?'<strong>'+v+'</strong>':v).join('<br>');
 $('#doitLead').textContent=x.doit.lead;$('#doitBody').textContent=x.doit.body;refresh();return true;
}
$('#generateBtn').onclick=()=>{if(render($('#subjectInput').value))show(1)};
$('#subjectInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('#generateBtn').click()});
const mode=$('#mode'),dur=$('#duration'),date=$('#targetDate'),status=$('#journeyStatus');
function modeUI(){const m=mode.value;$('#durationWrap').hidden=m!=='journey';$('#dateWrap').hidden=m!=='countdown';status.hidden=m==='theme';refresh();}
function refresh(){if(mode.value==='journey')status.textContent='A '+dur.value+'-DAY '+currentSubject+' JOURNEY';if(mode.value==='countdown'){if(!date.value){status.textContent='SELECT THE APPOINTED DATE';return}const d=Math.ceil((new Date(date.value+'T23:59:59')-new Date())/86400000);status.textContent=d>0?d+' DAYS UNTIL THE APPOINTED TIME':d===0?'THE APPOINTED DAY IS HERE':'THE APPOINTED DATE HAS PASSED';}}
mode.onchange=modeUI;dur.oninput=refresh;date.onchange=refresh;modeUI();render('VISION');
$('#beginBtn').onclick=()=>show(1);
$('#declareBtn').onclick=e=>{e.currentTarget.textContent='DECLARED ✓';setTimeout(()=>show(5),650)};
$('#completeBtn').onclick=()=>{const key='d1-biblical-'+currentSubject.toLowerCase()+'-progress',saved=JSON.parse(localStorage.getItem(key)||'{}');saved.completed=(saved.completed||0)+1;saved.last=new Date().toISOString();saved.see=$('#seeInput').value;saved.action=$('#doInput').value;localStorage.setItem(key,JSON.stringify(saved));if(mode.value==='journey'&&saved.completed>=+dur.value){$('#teleios').hidden=false;$('#teleios').scrollIntoView({behavior:'smooth'});}else $('#completeBtn').textContent='TODAY ESTABLISHED ✓';};
$('#soundBtn').onclick=e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',on);e.currentTarget.textContent='SOUND: '+(on?'READY':'OFF');};
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&step<5)show(step+1);if(e.key==='ArrowLeft'&&step>1)show(step-1)});