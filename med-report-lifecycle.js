import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient('https://sdquzhsylqpbhrmqjqgk.supabase.co','sb_publishable_volaz6N52Pc4rdh8a4dfEw_MjJ73How');
const caseId = new URLSearchParams(location.search).get('case');
const RAC = {1:'Extremely High',2:'High',3:'Serious',4:'Medium',5:'Low'};
const SCRIPTURE = {
  'Communication':'Ephesians 4:29',
  'Finances':'Luke 14:28',
  'Sexual Intimacy':'1 Corinthians 7:3–5',
  'Covenant & Trust':'Matthew 19:6',
  'Safety':'Ephesians 5:28–29',
  'Spiritual Unity & Purpose':'Matthew 6:33',
  'Roles, Responsibilities & Family Stewardship':'Ephesians 5:33'
};
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function addStyles(){
  const style=document.createElement('style');
  style.textContent=`
  .med-report-panel{margin-top:20px;border:1px solid #244977;background:linear-gradient(180deg,#0d1f42,#071125);border-radius:24px;padding:22px;box-shadow:0 18px 46px rgba(0,0,0,.28);color:#eef5ff}
  .med-report-panel h2,.med-report-panel h3{color:#fff}.med-report-state{display:inline-block;padding:7px 11px;border-radius:999px;background:#12274a;color:#dce9ff;border:1px solid #315d99;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
  .med-report-panel textarea{width:100%;min-height:420px;border:1px solid #cbd4f2;border-radius:14px;padding:16px;font:15px/1.55 ui-sans-serif,system-ui;background:#fbfcff;color:#10184f;resize:vertical}
  .med-report-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.med-report-actions button{border:0;border-radius:12px;padding:11px 16px;font-weight:800;cursor:pointer}
  .med-report-primary{background:linear-gradient(180deg,#2f83ff,#0b5cff);color:white;box-shadow:0 8px 24px rgba(11,92,255,.34)}.med-report-gold{background:#d8b64c;color:#10184f}.med-report-secondary{background:#12274a;color:#dce9ff;border:1px solid #315d99!important}
  .med-report-note{font-size:13px;color:#9fb4d8;line-height:1.55}
  .med-results-hero{margin-top:4px;padding:22px;border-radius:20px;background:linear-gradient(145deg,rgba(16,75,175,.92),rgba(6,19,47,.96));color:#fff;border:1px solid #2c62ab;box-shadow:0 16px 38px rgba(0,0,0,.25),inset 0 0 34px rgba(73,145,255,.12)}
  .med-results-hero h2{color:#fff;margin:8px 0}.med-results-hero p{color:#dbe9ff;margin:6px 0;line-height:1.55}
  .med-results-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:18px 0}
  .med-result-card{border:1px solid #244977;border-radius:18px;padding:17px;background:#07152d;min-height:124px;box-shadow:inset 0 0 20px rgba(31,101,214,.06)}
  .med-result-card h3{font-size:15px;margin:0 0 10px;color:#fff}.med-result-level{font-size:20px;font-weight:900;color:#d9b86c}.med-result-scripture{font-size:12px;color:#9bc1ff;margin-top:8px;font-weight:700}
  .med-dashboard-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.med-dashboard-actions button{border:0;border-radius:12px;padding:11px 16px;font-weight:800;cursor:pointer}
  .med-full-report{margin-top:18px;border-top:1px solid #244977;padding-top:18px}.med-full-report.hidden{display:none!important}
  .med-report-document{border:1px solid #dbe2f5;border-radius:18px;background:#fff;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,.18);color:#10184f}
  .med-doc-title{font-size:28px;line-height:1.15;margin:0 0 8px;color:#10184f!important}.med-doc-meta{font-size:13px;color:#687196;margin:4px 0}
  .med-doc-section{margin:22px 0}.med-doc-section h3{font-size:16px;letter-spacing:.05em;text-transform:uppercase;margin:0 0 10px;color:#24317e!important}
  .med-doc-section p{line-height:1.65;margin:8px 0;color:#202957}.med-doc-section ul,.med-doc-section ol{padding-left:22px;line-height:1.65;color:#202957}.med-doc-section li{margin:6px 0}
  .med-load-error{border:1px solid #9c3547;background:#561d28;color:#ffd8dd;border-radius:14px;padding:14px;margin-top:14px;line-height:1.5}
  @media(max-width:900px){.med-results-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:760px){.med-report-panel{padding:16px}.med-report-panel textarea{min-height:360px}.med-report-actions button,.med-dashboard-actions button{width:100%}.med-results-grid{grid-template-columns:1fr}.med-report-document{padding:18px}.med-doc-title{font-size:23px}}
  `;
  document.head.appendChild(style);
}

async function membership(userId){
  const {data,error}=await sb.from('med_case_participants').select('role').eq('case_id',caseId).eq('user_id',userId).maybeSingle();
  if(error) throw error;
  return data?.role || null;
}

async function releasedReport(){
  const {data,error}=await sb.from('med_released_reports').select('id,version,instrument_version,report_body,released_at').eq('case_id',caseId).order('version',{ascending:false}).limit(1).maybeSingle();
  if(error) throw error;
  return data;
}

async function spouseAssessmentComplete(userId){
  const {data:medCase,error:ce}=await sb.from('med_cases').select('instrument_version').eq('id',caseId).single();
  if(ce) throw ce;
  const version=medCase.instrument_version||'MED-1.0';
  const {data:questions,error:qe}=await sb.from('med_question_catalog').select('question_id').eq('instrument_version',version).eq('active',true);
  if(qe) throw qe;
  const {data:inputs,error:ie}=await sb.from('med_response_inputs').select('question_id,frequency_answer,impact_answer').eq('case_id',caseId).eq('user_id',userId);
  if(ie) throw ie;
  const total=(questions||[]).length;
  const completed=new Set((inputs||[]).filter(r=>r.frequency_answer&&r.impact_answer).map(r=>r.question_id)).size;
  return {complete:total>0&&completed>=total,total,completed,version};
}

function enterCompletedSpouseDashboard(){
  const spouse=document.getElementById('spouse');
  if(!spouse) return;
  const questions=document.getElementById('questions');
  const progress=document.querySelector('#spouse .progress');
  const progressText=document.getElementById('progressText');
  const saveRow=document.getElementById('saveBtn')?.parentElement;
  [questions,progress,progressText,saveRow].forEach(el=>{if(el)el.style.display='none';});
  const title=spouse.querySelector('.row.between h2');
  if(title) title.textContent='MED™ Results Dashboard';
  const roleLabel=document.getElementById('roleLabel');
  if(roleLabel) roleLabel.textContent='Marriage1st™ • Couple Results';
  const instrument=document.getElementById('instrumentLabel');
  if(instrument) instrument.textContent='Assessment complete • counselor-approved couple results';
}

function parseDomainSummaries(body=''){
  const lines=String(body).split(/\r?\n/);
  const start=lines.findIndex(x=>x.trim()==='SEVEN-DOMAIN SUMMARY');
  if(start<0) return [];
  const out=[];
  for(let i=start+1;i<lines.length;i++){
    const line=lines[i].trim();
    if(!line) continue;
    if(/^[A-Z][A-Z0-9 /&™-]+$/.test(line)) break;
    const m=line.match(/^•\s*(.+?):\s*(.+?)(?:\s+\(([^)]+)\))?$/);
    if(m) out.push({name:m[1].trim(),level:m[2].trim(),scripture:(m[3]||SCRIPTURE[m[1].trim()]||'').trim()});
  }
  return out;
}

function formatReport(body=''){
  const lines=String(body).split(/\r?\n/);
  const headings=new Set(['BIBLICAL FRAMEWORK','PURPOSE','SEVEN-DOMAIN SUMMARY','STRENGTHS TO PRESERVE','PRIORITY GROWTH AREAS','MITIGATION / ACTION PLAN','BIBLICAL FOUNDATION','NEXT STEPS']);
  let html='',listType=null,sectionOpen=false;
  const closeList=()=>{if(listType){html+=`</${listType}>`;listType=null;}};
  const closeSection=()=>{closeList();if(sectionOpen){html+='</section>';sectionOpen=false;}};
  lines.forEach((raw,index)=>{
    const line=raw.trim();
    if(!line){closeList();return;}
    if(index===0){closeSection();html+=`<h2 class="med-doc-title">${esc(line)}</h2>`;return;}
    if(index<=3 && (line.startsWith('Instrument:')||line.includes('Marriage1st')||line.includes('Identify • Assess • Mitigate'))){closeList();html+=`<div class="med-doc-meta">${esc(line)}</div>`;return;}
    if(headings.has(line)){closeSection();html+=`<section class="med-doc-section"><h3>${esc(line)}</h3>`;sectionOpen=true;return;}
    if(line.startsWith('• ')){if(listType!=='ul'){closeList();html+='<ul>';listType='ul';}html+=`<li>${esc(line.slice(2))}</li>`;return;}
    if(/^\d+\.\s/.test(line)){if(listType!=='ol'){closeList();html+='<ol>';listType='ol';}html+=`<li>${esc(line.replace(/^\d+\.\s*/,''))}</li>`;return;}
    closeList();html+=`<p>${esc(line)}</p>`;
  });
  closeSection();
  return html;
}

function dashboardMarkup(report){
  const domains=parseDomainSummaries(report.report_body);
  const cards=domains.length?domains.map(d=>`<article class="med-result-card"><h3>${esc(d.name)}</h3><div class="med-result-level">${esc(d.level)}</div>${d.scripture?`<div class="med-result-scripture">${esc(d.scripture)}</div>`:''}</article>`).join(''):`<article class="med-result-card"><h3>Overall Marriage Results</h3><div class="med-result-level">Counselor-approved report available</div><div class="med-result-scripture">Open the full report for the complete couple-facing summary.</div></article>`;
  return `<div class="med-results-hero"><span class="med-report-state">Overall Results Available</span><h2>MED™ Marriage Results</h2><p>This is the counselor-approved <strong>overall marriage assessment</strong>. It combines the governed MED™ findings into one couple-facing view without exposing either spouse's private answers or individual RAD™ scoring.</p><p><strong>${esc(report.instrument_version)}</strong> • Report Version ${esc(report.version)} • Released ${esc(new Date(report.released_at).toLocaleDateString())}</p></div><div class="med-results-grid">${cards}</div><div class="med-dashboard-actions"><button class="med-report-primary" id="medOpenReport">Read Full Counselor-Approved Report</button></div><p class="med-report-note">Only the overall couple-facing results are shown here. Individual spouse responses, hidden RAD™ scoring rows, safety flags, and counselor-only notes remain private.</p><div class="med-full-report hidden" id="medFullReport"><div class="med-report-document">${formatReport(report.report_body)}</div></div>`;
}

async function renderSpouseReport(userId){
  if(document.getElementById('medCoupleReport')) return;
  const spouse=document.getElementById('spouse'); if(!spouse) return;
  const assessment=await spouseAssessmentComplete(userId);
  if(!assessment.complete) return;
  enterCompletedSpouseDashboard();
  const panel=document.createElement('section'); panel.id='medCoupleReport'; panel.className='med-report-panel';
  spouse.prepend(panel);
  panel.innerHTML=`<span class="med-report-state">Loading Results</span><h2>MED™ Results Dashboard</h2><p class="med-report-note">Loading the latest counselor-approved overall marriage results…</p>`;
  try{
    const report=await releasedReport();
    if(report){
      panel.innerHTML=dashboardMarkup(report);
      panel.querySelector('#medOpenReport')?.addEventListener('click',()=>{const full=panel.querySelector('#medFullReport');full.classList.toggle('hidden');const button=panel.querySelector('#medOpenReport');button.textContent=full.classList.contains('hidden')?'Read Full Counselor-Approved Report':'Hide Full Report';if(!full.classList.contains('hidden'))full.scrollIntoView({behavior:'smooth',block:'start'});});
    }else{
      panel.innerHTML=`<div class="med-results-hero"><span class="med-report-state">Counselor Review in Progress</span><h2>MED™ Results Dashboard</h2><p>Your assessment is complete. The counselor is reviewing the combined marriage results. You do not need to return to the questionnaire.</p></div><p class="med-report-note">When the counselor approves the couple-facing results, this same dashboard will display the overall results and the full approved report.</p>`;
    }
  }catch(e){
    console.error('MED spouse report load failed',e);
    panel.innerHTML=`<span class="med-report-state">Results Could Not Load</span><h2>MED™ Results Dashboard</h2><div class="med-load-error"><strong>The released results are not displaying in this browser session.</strong><br>${esc(e.message||'Unknown report-loading error')}</div><div class="med-dashboard-actions"><button class="med-report-primary" id="medRetryReport">Retry Results</button></div><p class="med-report-note">Your completed assessment remains securely stored. You do not need to repeat the questionnaire.</p>`;
    panel.querySelector('#medRetryReport')?.addEventListener('click',()=>{panel.remove();renderSpouseReport(userId);});
  }
}

async function buildDraft(){
  const {data:medCase,error:ce}=await sb.from('med_cases').select('instrument_version,title').eq('id',caseId).single(); if(ce) throw ce;
  const version=medCase.instrument_version||'MED-1.0';
  const {data:questions,error:qe}=await sb.from('med_question_catalog').select('question_id,domain,sort_order').eq('instrument_version',version).eq('active',true).order('sort_order'); if(qe) throw qe;
  const {data:scores,error:se}=await sb.from('med_response_scores').select('question_id,user_id,rac,safety_override').eq('case_id',caseId); if(se) throw se;
  const domainMap=new Map();
  for(const q of questions||[]){
    if(!domainMap.has(q.domain)) domainMap.set(q.domain,{racs:[],safety:0});
    const d=domainMap.get(q.domain);
    for(const s of (scores||[]).filter(x=>x.question_id===q.question_id)){
      if(s.rac) d.racs.push(s.rac);
      if(s.safety_override) d.safety++;
    }
  }
  const domains=[...domainMap.entries()].map(([name,d])=>({name,rac:d.racs.length?Math.min(...d.racs):null,safety:d.safety}));
  const priorities=domains.filter(d=>d.safety||d.rac<=3).sort((a,b)=>(b.safety-a.safety)||((a.rac||9)-(b.rac||9)));
  const strengths=domains.filter(d=>d.rac>=4).map(d=>d.name);
  const lines=[];
  lines.push('MED™ MARRIAGE EVALUATION REPORT');
  lines.push(`Instrument: ${version}`);
  lines.push('Marriage1st™ • Powered by RAD™ / IAM');
  lines.push('Identify • Assess • Mitigate');
  lines.push('');
  lines.push('BIBLICAL FRAMEWORK');
  lines.push('“From the beginning it was not so.” — Matthew 19:8');
  lines.push('“What therefore God hath joined together, let not man put asunder.” — Matthew 19:6');
  lines.push('');
  lines.push('PURPOSE');
  lines.push('This counselor-approved report summarizes patterns identified through the MED™ assessment. It is a pastoral triage and discussion aid, not a medical or mental-health diagnosis. Individual spouse answers, hidden RAD™ scoring rows, and counselor-only safety details are intentionally excluded from the couple-facing report.');
  lines.push('');
  lines.push('SEVEN-DOMAIN SUMMARY');
  for(const d of domains){
    const level=d.rac?RAC[d.rac]:'Not yet scored';
    const displayLevel=d.safety?'Counselor-directed review and mitigation priority':level;
    lines.push(`• ${d.name}: ${displayLevel} (${SCRIPTURE[d.name]||'Matthew 19:6'})`);
  }
  lines.push('');
  lines.push('STRENGTHS TO PRESERVE');
  lines.push(strengths.length?strengths.map(x=>`• ${x}`).join('\n'):'• Counselor to identify and affirm demonstrated strengths during review.');
  lines.push('');
  lines.push('PRIORITY GROWTH AREAS');
  if(priorities.length){
    for(const d of priorities) lines.push(`• ${d.name}: ${d.safety?'Address privately with the counselor before ordinary joint discussion.':'Give focused attention in the counseling plan.'}`);
  }else lines.push('• No High/Extremely High/Serious domain priority was identified in the current scoring. Continue strengthening healthy patterns.');
  lines.push('');
  lines.push('MITIGATION / ACTION PLAN');
  lines.push('• Identify the specific behavior or pattern to address in each priority domain.');
  lines.push('• Agree on one observable action for each spouse where joint work is appropriate.');
  lines.push('• Establish a follow-up date and reassess progress rather than relying on intention alone.');
  lines.push('• Handle any safety-sensitive disclosure privately and separately from ordinary couple discussion.');
  lines.push('');
  lines.push('BIBLICAL FOUNDATION');
  lines.push('Genesis 2:18, 21–24 • Matthew 19:4–8 • Ephesians 5:33');
  lines.push('');
  lines.push('NEXT STEPS');
  lines.push('1. Review this report with the counselor.');
  lines.push('2. Confirm the priority areas and counselor-approved action plan.');
  lines.push('3. Practice the agreed actions between sessions.');
  lines.push('4. Follow up and reassess at the counselor-determined interval.');
  return {body:lines.join('\n'),instrumentVersion:version};
}

async function latestCounselorDraft(){
  const {data,error}=await sb.from('med_counselor_reports').select('*').eq('case_id',caseId).order('version',{ascending:false}).limit(1).maybeSingle(); if(error) throw error; return data;
}

async function renderCounselorReport(){
  if(document.getElementById('medCounselorReport')) return;
  const counselor=document.getElementById('counselor'); if(!counselor) return;
  const panel=document.createElement('section'); panel.id='medCounselorReport'; panel.className='med-report-panel';
  panel.innerHTML=`<span class="med-report-state" id="medReportState">Report Draft</span><h2>MED™ Report Lifecycle</h2><p class="med-report-note">Generate the algorithm-assisted draft, review/edit it, save it, then explicitly approve and release the couple-facing report. Nothing is released to either spouse until you choose <strong>Approve & Release Report</strong>.</p><div class="med-report-actions"><button class="med-report-primary" id="medGenerateReport">Generate / Refresh Draft</button><button class="med-report-secondary" id="medSaveDraft">Save Draft</button><button class="med-report-gold" id="medReleaseReport">Approve & Release Report</button></div><textarea id="medReportEditor" aria-label="MED counselor report editor" placeholder="Generate the counselor draft to begin."></textarea><p id="medReportMsg" class="med-report-note"></p>`;
  counselor.appendChild(panel);
  const editor=panel.querySelector('#medReportEditor'),msg=panel.querySelector('#medReportMsg'),state=panel.querySelector('#medReportState');
  let current=await latestCounselorDraft();
  if(current){editor.value=current.report_body;state.textContent=current.status==='approved'?'Approved':'Draft Saved';}
  const save=async(status='draft')=>{
    if(!editor.value.trim()) throw new Error('Generate or enter report content first.');
    const {data:medCase,error:ce}=await sb.from('med_cases').select('instrument_version').eq('id',caseId).single(); if(ce) throw ce;
    if(current && current.status!=='approved'){
      const payload={report_body:editor.value,status,updated_at:new Date().toISOString(),approved_at:status==='approved'?new Date().toISOString():null};
      const {data,error}=await sb.from('med_counselor_reports').update(payload).eq('id',current.id).select().single(); if(error) throw error; current=data;
    }else{
      const {data:maxRows,error:me}=await sb.from('med_counselor_reports').select('version').eq('case_id',caseId).order('version',{ascending:false}).limit(1); if(me) throw me;
      const next=(maxRows?.[0]?.version||0)+1;
      const {data,error}=await sb.from('med_counselor_reports').insert({case_id:caseId,instrument_version:medCase.instrument_version,version:next,status,report_body:editor.value,approved_at:status==='approved'?new Date().toISOString():null}).select().single(); if(error) throw error; current=data;
    }
    return current;
  };
  panel.querySelector('#medGenerateReport').onclick=async()=>{try{msg.textContent='Generating counselor draft…';const d=await buildDraft();editor.value=d.body;state.textContent='Report Draft';msg.textContent='Draft generated from current governed MED™ scoring. Review and edit before release.';}catch(e){msg.textContent=`Draft generation failed: ${e.message}`}};
  panel.querySelector('#medSaveDraft').onclick=async()=>{try{msg.textContent='Saving draft…';await save('draft');state.textContent='Draft Saved';msg.textContent='Counselor draft saved. It is still private and has not been released to either spouse.';}catch(e){msg.textContent=`Save failed: ${e.message}`}};
  panel.querySelector('#medReleaseReport').onclick=async()=>{try{if(!confirm('Approve this exact report and release it to both spouses? Counselor-only raw answers, scores and safety details are not included unless you manually placed them in the report text.')) return;msg.textContent='Approving and releasing…';const approved=await save('approved');const {error}=await sb.from('med_released_reports').insert({case_id:caseId,counselor_report_id:approved.id,instrument_version:approved.instrument_version,version:approved.version,report_body:approved.report_body});if(error){if(error.code==='23505') throw new Error('This report version has already been released.');throw error;}state.textContent='Released';msg.textContent=`Report Version ${approved.version} approved and released. Husband and Wife can now sign back into this secure MED™ case and view it.`;}catch(e){msg.textContent=`Release failed: ${e.message}`}};
}

async function bootReportLifecycle(){
  if(!caseId) return;
  addStyles();
  const {data:{session},error}=await sb.auth.getSession(); if(error) throw error; if(!session) return;
  const role=await membership(session.user.id); if(!role) return;
  const wait=async()=>{
    const target=role==='counselor'?document.getElementById('counselor'):document.getElementById('spouse');
    if(!target || target.classList.contains('hidden')){setTimeout(wait,250);return;}
    if(role==='counselor') await renderCounselorReport(); else await renderSpouseReport(session.user.id);
  };
  wait().catch(async e=>{
    console.error('MED report lifecycle failed',e);
    if(role!=='counselor'){
      const spouse=document.getElementById('spouse');
      if(spouse && !document.getElementById('medCoupleReport')){
        const panel=document.createElement('section'); panel.id='medCoupleReport'; panel.className='med-report-panel';
        panel.innerHTML=`<span class="med-report-state">Results Could Not Load</span><h2>MED™ Results Dashboard</h2><div class="med-load-error"><strong>The results dashboard could not initialize.</strong><br>${esc(e.message||'Unknown error')}</div>`;
        spouse.prepend(panel);
      }
    }
  });
}

bootReportLifecycle().catch(console.error);