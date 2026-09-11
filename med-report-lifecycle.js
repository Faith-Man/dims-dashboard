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
  .med-report-panel{margin-top:20px;border:1px solid #cbd4f2;background:#fff;border-radius:22px;padding:22px;box-shadow:0 14px 36px rgba(34,49,126,.1)}
  .med-report-panel h2,.med-report-panel h3{color:#10184f}.med-report-state{display:inline-block;padding:7px 11px;border-radius:999px;background:#eef2ff;color:#24317e;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
  .med-report-panel textarea{width:100%;min-height:420px;border:1px solid #cbd4f2;border-radius:14px;padding:16px;font:15px/1.55 ui-sans-serif,system-ui;background:#fbfcff;color:#10184f;resize:vertical}
  .med-report-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.med-report-actions button{border:0;border-radius:12px;padding:11px 16px;font-weight:800;cursor:pointer}
  .med-report-primary{background:linear-gradient(180deg,#2d82ff,#126bff);color:white}.med-report-gold{background:#d8b64c;color:#10184f}.med-report-secondary{background:#eef2ff;color:#24317e;border:1px solid #cbd4f2!important}
  .med-report-copy{white-space:pre-wrap;line-height:1.6;border:1px solid #dbe2f5;border-radius:14px;padding:18px;background:#fbfcff}.med-report-note{font-size:13px;color:#687196;line-height:1.5}
  @media(max-width:760px){.med-report-panel{padding:16px}.med-report-panel textarea{min-height:360px}.med-report-actions button{width:100%}}
  `;
  document.head.appendChild(style);
}

async function membership(userId){
  const {data}=await sb.from('med_case_participants').select('role').eq('case_id',caseId).eq('user_id',userId).maybeSingle();
  return data?.role || null;
}

async function releasedReport(){
  const {data,error}=await sb.from('med_released_reports').select('id,version,instrument_version,report_body,released_at').eq('case_id',caseId).order('version',{ascending:false}).limit(1).maybeSingle();
  if(error) throw error;
  return data;
}

async function renderSpouseReport(){
  if(document.getElementById('medCoupleReport')) return;
  const spouse=document.getElementById('spouse'); if(!spouse) return;
  const panel=document.createElement('section'); panel.id='medCoupleReport'; panel.className='med-report-panel';
  const report=await releasedReport();
  if(report){
    panel.innerHTML=`<span class="med-report-state">Report Available</span><h2>MED™ Marriage Evaluation Report</h2><p class="med-report-note">Counselor approved • Version ${esc(report.version)} • Released ${esc(new Date(report.released_at).toLocaleDateString())}</p><div class="med-report-copy">${esc(report.report_body)}</div>`;
  }else{
    panel.innerHTML=`<span class="med-report-state">Counselor Review in Progress</span><h2>What happens next?</h2><p class="med-report-note">Your assessment has been securely submitted. MED™ analyzes the assessment for counselor review. Raw spouse-to-spouse answers, hidden RAD™ scores, safety flags, and preliminary algorithmic conclusions are not released automatically.</p><p class="med-report-note">After the counselor reviews and approves the couple-facing report, return to this secure case and sign in. This section will change to <strong>Report Available</strong>.</p>`;
  }
  spouse.appendChild(panel);
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
  lines.push('MED™ MARRIAGE EVALUATION REPORT — COUNSELOR DRAFT');
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
    lines.push(`• ${d.name}: ${level}${d.safety?' — counselor safety review required':''} (${SCRIPTURE[d.name]||'Matthew 19:6'})`);
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
  lines.push('MITIGATION / ACTION PLAN — COUNSELOR TO REVIEW AND EDIT');
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
    if(current){
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
  const {data:{session}}=await sb.auth.getSession(); if(!session) return;
  const role=await membership(session.user.id); if(!role) return;
  const wait=async()=>{
    const target=role==='counselor'?document.getElementById('counselor'):document.getElementById('spouse');
    if(!target || target.classList.contains('hidden')){setTimeout(wait,250);return;}
    if(role==='counselor') await renderCounselorReport(); else await renderSpouseReport();
  };
  wait().catch(console.error);
}

bootReportLifecycle().catch(console.error);
