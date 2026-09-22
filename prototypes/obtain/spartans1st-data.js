// Spartans1st browser data client. Publishable key only; RLS is the authorization boundary.
const S1_URL='https://sdquzhsylqpbhrmqjqgk.supabase.co',S1_KEY='sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How';
async function s1(path,options={}){const token=localStorage.getItem('spartans1st_access_token');const headers={apikey:S1_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(options.headers||{})};const r=await fetch(S1_URL+'/rest/v1/'+path,{...options,headers});if(!r.ok)throw new Error('S1 data '+r.status);const t=await r.text();return t?JSON.parse(t):null}
function esc(v){const d=document.createElement('div');d.textContent=v??'';return d.innerHTML}
async function s1LoadAthleteHome(){if(localStorage.getItem('spartans1st_demo_mode')==='1'){window.s1Demo=true;document.documentElement.dataset.s1Data='demo';document.querySelector('.hero h1').textContent='Today · Test Athlete';document.querySelector('.mark span').textContent='Test MARK — demonstrate disciplined daily progress toward a measurable season goal.';const w=document.querySelectorAll('#word .word small');w[0].textContent='Test LOGOS — governing truth / standard';w[1].textContent='Test RHEMA — apply today’s standard to today’s work';w[2].textContent='Test DECLARATION — I will train with purpose, fight through challenge, and press toward the mark.';document.querySelector('#doit p').innerHTML='<b>Coach-assigned workout:</b> Test progression run — fictional sample assignment for functional testing.';return}if(!localStorage.getItem('spartans1st_access_token')){document.documentElement.dataset.s1Data='awaiting-auth';return}try{const aa=await s1('spartans1st_athletes?select=id,display_name&limit=1');if(!aa?.length){document.documentElement.dataset.s1Data='no-athlete-profile';return}const a=aa[0],today=new Date().toISOString().slice(0,10);const [m,w,r,t]=await Promise.all([s1('spartans1st_marks?select=mark&athlete_id=eq.'+a.id+'&status=eq.active&order=updated_at.desc&limit=1'),s1('spartans1st_daily_content?select=logos,rhema,declaration&content_date=eq.'+today+'&audience=eq.athlete&limit=1'),s1('spartans1st_readiness?select=status,note&athlete_id=eq.'+a.id+'&readiness_date=eq.'+today+'&limit=1'),s1('spartans1st_training_assignments?select=id,title,instructions,status&athlete_id=eq.'+a.id+'&training_date=eq.'+today+'&limit=1')]);document.querySelector('.hero h1').textContent='Today · '+a.display_name;if(m?.[0])document.querySelector('.mark span').textContent=m[0].mark;if(w?.[0]){const z=document.querySelectorAll('#word .word small');z[0].textContent=w[0].logos||'—';z[1].textContent=w[0].rhema||'—';z[2].textContent=w[0].declaration||'—'}if(r?.[0]){const q=document.getElementById('readinessSelect');if(q){q.value=r[0].status||'';readinessChanged(q.value)}const n=document.getElementById('readinessNote');if(n)n.value=r[0].note||'';}if(t?.[0]){document.querySelector('#doit p').innerHTML='<b>Coach-assigned workout:</b> '+esc(t[0].title)+(t[0].instructions?' — '+esc(t[0].instructions):'');window.s1TrainingId=t[0].id;if(t[0].status==='completed'){localStorage.setItem('s1_demo_training','completed');document.getElementById('bar').style.width='100%';document.getElementById('trainingStatus').textContent='COMPLETED · 100%'}}window.s1AthleteId=a.id;const [rr,vv]=await Promise.all([s1('spartans1st_results?select=id,result_text,is_pr,prize&athlete_id=eq.'+a.id+'&result_date=eq.'+today+'&order=created_at.desc&limit=1'),s1('spartans1st_reviews?select=integrity,effectiveness,efficiency,excellence,improve_next,result_id&athlete_id=eq.'+a.id+'&order=created_at.desc&limit=1')]);if(rr?.[0]){window.s1ResultId=rr[0].id;let rd={};try{rd=JSON.parse(rr[0].result_text||'{}')}catch{};localStorage.setItem('s1_demo_result',JSON.stringify(rd));localStorage.setItem('s1_demo_pr',rr[0].is_pr?'1':'0')}if(vv?.[0]&&(!rr?.[0]||!vv[0].result_id||vv[0].result_id===rr[0].id)){localStorage.setItem('s1_demo_review',JSON.stringify({integrity:vv[0].integrity,effectiveness:vv[0].effectiveness,efficiency:vv[0].efficiency,excellence:vv[0].excellence,improve:vv[0].improve_next}))}if(typeof restoreFlow==='function')restoreFlow();document.documentElement.dataset.s1Data='connected'}catch(e){document.documentElement.dataset.s1Data='error';console.error(e)}}
async function s1SaveReadiness(status,note=''){if(window.s1Demo){localStorage.setItem('spartans1st_demo_readiness',status);localStorage.setItem('s1_demo_readiness_note',note);return say('Test readiness saved locally: '+status)}if(!window.s1AthleteId)return say('Sign-in/profile connection required before saving.');const today=new Date().toISOString().slice(0,10);try{await s1('spartans1st_readiness?on_conflict=athlete_id,readiness_date',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({athlete_id:window.s1AthleteId,readiness_date:today,status,note:note||null})});say('Readiness saved.')}catch(e){say('Readiness was not saved.')}}
window.addEventListener('DOMContentLoaded',s1LoadAthleteHome);
async function s1CompleteTraining(){
 if(window.s1Demo||!window.s1TrainingId)return true;
 try{await s1('spartans1st_training_assignments?id=eq.'+window.s1TrainingId,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'completed',completed_at:new Date().toISOString()})});return true}catch(e){say('Training completion was not saved.');return false}
}
async function s1SaveResult(data){
 if(window.s1Demo){localStorage.setItem('s1_demo_result',JSON.stringify(data));return {id:'demo-result'}}
 if(!window.s1AthleteId)return say('Sign-in/profile connection required before saving.');
 try{const rows=await s1('spartans1st_results',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({athlete_id:window.s1AthleteId,training_assignment_id:window.s1TrainingId||null,result_date:new Date().toISOString().slice(0,10),result_text:JSON.stringify(data),is_pr:!!data.is_pr,prize:data.prize||null})});window.s1ResultId=rows?.[0]?.id||null;return rows?.[0]||null}catch(e){say('Result was not saved.');return null}
}
async function s1SaveReview(data){
 if(window.s1Demo){localStorage.setItem('s1_demo_review',JSON.stringify(data));return true}
 if(!window.s1AthleteId)return say('Sign-in/profile connection required before saving.');
 try{await s1('spartans1st_reviews',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({athlete_id:window.s1AthleteId,result_id:window.s1ResultId||null,integrity:data.integrity||null,effectiveness:data.effectiveness||null,efficiency:data.efficiency||null,excellence:data.excellence||null,improve_next:data.improve||null})});return true}catch(e){say('Review was not saved.');return false}
}

async function s1LoadCoachHome(){
 if(localStorage.getItem('spartans1st_demo_mode')==='1'){window.s1Demo=true;return}
 if(!localStorage.getItem('spartans1st_access_token'))return;
 try{
  const links=await s1('spartans1st_coach_assignments?select=athlete_id&active=eq.true');
  const ids=(links||[]).map(x=>x.athlete_id);
  if(!ids.length)return;
  const athletes=await s1('spartans1st_athletes?select=id,display_name&id=in.('+ids.join(',')+')&active=eq.true&order=display_name');
  const q=document.getElementById('assignAthlete');if(q){q.innerHTML='<option value="">Select athlete</option>';(athletes||[]).forEach(a=>q.insertAdjacentHTML('beforeend','<option value="'+esc(a.id)+'">'+esc(a.display_name)+'</option>'))}
  window.s1CoachRoster=athletes||[];
 }catch(e){console.error(e);const x=document.getElementById('assignSaved');if(x)x.textContent='Coach roster could not be loaded.'}
}
async function s1AssignWorkout(data){
 if(window.s1Demo){localStorage.setItem('spartans1st_demo_coach_assignment',JSON.stringify(data));return true}
 if(!data.athlete_id)return false;
 try{
  const token=localStorage.getItem('spartans1st_access_token');const payload=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));const uid=payload.sub;
  await s1('spartans1st_training_assignments',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({athlete_id:data.athlete_id,assigned_by:uid,training_date:data.training_date,title:data.title,instructions:data.instructions,status:'assigned'})});return true
 }catch(e){console.error(e);return false}
}

async function s1LoadParentHome(){
 if(localStorage.getItem('spartans1st_demo_mode')==='1'){window.s1Demo=true;return}
 if(!localStorage.getItem('spartans1st_access_token'))return;
 const msg=document.getElementById('parentStatus');
 try{
  const links=await s1('spartans1st_parent_links?select=athlete_id&active=eq.true&limit=1');
  if(!links?.length){if(msg)msg.textContent='No athlete is linked to this parent account.';return}
  const id=links[0].athlete_id;
  const [ath,train,res]=await Promise.all([
   s1('spartans1st_athletes?select=id,display_name&id=eq.'+id+'&limit=1'),
   s1('spartans1st_training_assignments?select=training_date,title,status&athlete_id=eq.'+id+'&order=training_date.desc&limit=7'),
   s1('spartans1st_results?select=result_date,result_text,is_pr,prize&athlete_id=eq.'+id+'&order=result_date.desc&limit=1')
  ]);
  if(ath?.[0]){const x=document.getElementById('parentAthlete');if(x)x.textContent=ath[0].display_name}
  const assigned=(train||[]).length,completed=(train||[]).filter(x=>x.status==='completed').length,next=(train||[]).find(x=>x.status!=='completed');
  if(document.getElementById('parentAssigned'))parentAssigned.textContent=assigned;
  if(document.getElementById('parentCompleted'))parentCompleted.textContent=completed;
  if(document.getElementById('parentNext'))parentNext.textContent=next?.title||'No pending session';
  if(res?.[0]){let d={};try{d=JSON.parse(res[0].result_text||'{}')}catch{};const x=document.getElementById('parentResult');if(x)x.textContent=d.result||res[0].result_text||'Result recorded';const y=document.getElementById('parentResultNote');if(y)y.textContent=(res[0].is_pr?'Personal record • ':'')+(res[0].prize||'Latest recorded result')}
  if(msg)msg.textContent='';
 }catch(e){console.error(e);if(msg)msg.textContent='Parent-visible progress could not be loaded.'}
}
