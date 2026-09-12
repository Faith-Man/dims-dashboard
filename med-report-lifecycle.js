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
const DOMAIN_SHORT = {
  'Communication':'Communication',
  'Finances':'Finances',
  'Sexual Intimacy':'Sexual Intimacy',
  'Covenant & Trust':'Covenant & Trust',
  'Safety':'Safety',
  'Spiritual Unity & Purpose':'Spiritual Unity',
  'Roles, Responsibilities & Family Stewardship':'Roles & Stewardship'
};
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function addStyles(){
  if(document.getElementById('medLifecycleStyles')) return;
  const style=document.createElement('style');
  style.id='medLifecycleStyles';
  style.textContent=`
  .med-report-panel{margin-top:20px;border:1px solid #244977;background:linear-gradient(180deg,#0d1f42,#071125);border-radius:24px;padding:22px;box-shadow:0 18px 46px rgba(0,0,0,.28);color:#eef5ff}
  .med-report-panel h2,.med-report-panel h3{color:#fff}.med-report-state{display:inline-block;padding:7px 11px;border-radius:999px;background:#12274a;color:#dce9ff;border:1px solid #315d99;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}
  .med-report-panel textarea{width:100%;min-height:420px;border:1px solid #cbd4f2;border-radius:14px;padding:16px;font:15px/1.55 ui-sans-serif,system-ui;background:#fbfcff;color:#10184f;resize:vertical}
  .med-report-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.med-report-actions button{border:0;border-radius:12px;padding:11px 16px;font-weight:800;cursor:pointer}
  .med-report-primary{background:linear-gradient(180deg,#2f83ff,#0b5cff);color:white;box-shadow:0 8px 24px rgba(11,92,255,.34)}.med-report-gold{background:#d8b64c;color:#10184f}.med-report-secondary{background:#12274a;color:#dce9ff;border:1px solid #315d99!important}
  .med-report-note{font-size:13px;color:#9fb4d8;line-height:1.55}.med-load-error{border:1px solid #9c3547;background:#561d28;color:#ffd8dd;border-radius:14px;padding:14px;margin-top:14px;line-height:1.5}
  .med-full-report{margin-top:18px}.med-full-report.hidden{display:none!important}.med-report-document{border:1px solid #dbe2f5;border-radius:18px;background:#fff;padding:28px;box-shadow:0 8px 24px rgba(0,0,0,.18);color:#10184f}.med-doc-title{font-size:28px;line-height:1.15;margin:0 0 8px;color:#10184f!important}.med-doc-meta{font-size:13px;color:#687196;margin:4px 0}.med-doc-section{margin:22px 0}.med-doc-section h3{font-size:16px;letter-spacing:.05em;text-transform:uppercase;margin:0 0 10px;color:#24317e!important}.med-doc-section p{line-height:1.65;margin:8px 0;color:#202957}.med-doc-section ul,.med-doc-section ol{padding-left:22px;line-height:1.65;color:#202957}.med-doc-section li{margin:6px 0}
  body.med-central-mode{background:#03142b!important;color:#0a1f4a!important}.med-central-mode>.shell{display:none!important}
  #medCentralDashboard{min-height:100vh;background:radial-gradient(circle at 50% 0,#0c4b91 0,#062a58 25%,#02142d 63%,#010b1b 100%);color:#10214e;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .med-shell{max-width:1600px;margin:0 auto;padding:14px}.med-topbar{display:grid;grid-template-columns:1fr auto 1fr;gap:18px;align-items:center;padding:10px 18px 16px;color:#fff}.med-brandline{display:flex;align-items:center;gap:12px}.med-brandorb{width:64px;height:64px;border-radius:50%;background:url('/assets/med-orb-canonical.jpg') center/cover;border:2px solid #d8b64c;box-shadow:0 0 20px rgba(54,191,255,.45)}.med-brandtext strong{font-size:28px;letter-spacing:.04em}.med-brandtext span{display:block;font-size:11px;letter-spacing:.12em;color:#dce9ff}.med-title{text-align:center}.med-title h1{margin:0;font-size:clamp(24px,3vw,40px);letter-spacing:.04em}.med-title p{margin:2px 0 0;color:#dbe9ff;letter-spacing:.08em;font-size:12px}.med-verse{text-align:right;color:#f5d786;font-family:Georgia,serif;font-style:italic;font-size:17px}.med-verse small{display:block;color:#fff;font-size:12px;margin-top:3px}
  .med-app{display:grid;grid-template-columns:190px minmax(0,1fr);gap:14px}.med-sidebar{border:1px solid #1f5e9b;border-radius:20px;background:linear-gradient(180deg,rgba(3,44,91,.96),rgba(2,25,57,.98));box-shadow:0 18px 50px rgba(0,0,0,.35);padding:16px 10px;position:sticky;top:12px;height:calc(100vh - 28px)}.med-navbtn{width:100%;display:flex;align-items:center;gap:10px;margin:7px 0;padding:12px;border-radius:10px;background:transparent;color:#eef7ff;border:1px solid transparent;text-align:left;font-weight:750;cursor:pointer}.med-navbtn:hover,.med-navbtn.active{background:linear-gradient(90deg,#0873d5,#0e4f98);border-color:#1da7ff;box-shadow:0 0 18px rgba(0,153,255,.35)}.med-navicon{width:23px;text-align:center;font-size:18px}.med-sideverse{position:absolute;left:12px;right:12px;bottom:64px;padding:14px;border-radius:12px;border:1px solid #1b5489;color:#fff;background:rgba(1,22,49,.55);font-family:Georgia,serif;font-style:italic;font-size:13px}.med-signout{position:absolute;left:12px;right:12px;bottom:12px;width:calc(100% - 24px);padding:10px;border-radius:10px;background:#102d54;border:1px solid #2b6ba5;color:#fff;font-weight:800;cursor:pointer}
  .med-main{background:linear-gradient(180deg,#edf7ff,#dcecff);border-radius:22px;padding:16px;border:1px solid rgba(255,255,255,.8);box-shadow:0 18px 60px rgba(0,0,0,.28)}.med-kpis{display:grid;grid-template-columns:1.1fr 1.1fr .8fr .9fr;gap:10px}.med-kpi{background:linear-gradient(180deg,#fff,#eaf3fb);border:1px solid #bbd1e7;border-radius:14px;padding:14px;box-shadow:0 5px 15px rgba(19,71,119,.1)}.med-kpi-label{font-size:12px;font-weight:900;color:#092a61;text-transform:uppercase;letter-spacing:.03em}.med-kpi-value{font-size:23px;font-weight:900;color:#081d4d;margin-top:4px}.med-kpi-sub{font-size:12px;color:#526989;margin-top:2px}.med-progressline{height:8px;border-radius:999px;background:#c9d9e7;margin-top:8px;overflow:hidden}.med-progressline>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#0fb74b,#36d869)}.med-alertline>span{background:linear-gradient(90deg,#ef233c,#ff6a33)}
  .med-coregrid{display:grid;grid-template-columns:minmax(520px,1.55fr) minmax(280px,.65fr);gap:12px;margin-top:12px}.med-panel{background:#fff;border:1px solid #b8d0e8;border-radius:15px;box-shadow:0 8px 20px rgba(20,66,108,.09)}.med-riskpanel{background:linear-gradient(145deg,#07356c,#021d44);padding:18px;color:#fff;border-color:#1769ae}.med-panel-title{font-size:19px;font-weight:950;letter-spacing:.02em}.med-panel-sub{font-size:12px;color:#cfe4fb;margin-top:2px}.med-riskbody{display:grid;grid-template-columns:180px minmax(300px,1fr) 185px;gap:12px;align-items:center;margin-top:10px}.med-legend{background:rgba(3,27,63,.65);border:1px solid #1e5d99;border-radius:14px;padding:13px}.med-legend-row{display:flex;gap:10px;align-items:center;margin:11px 0;font-size:12px}.med-dot{width:24px;height:24px;border-radius:50%;box-shadow:inset 0 2px 5px rgba(255,255,255,.35),0 0 8px rgba(255,255,255,.08);flex:0 0 auto}.med-dot.eh{background:#f01f2f}.med-dot.h{background:#f77716}.med-dot.s{background:#f2c416}.med-dot.m{background:#35b95b}.med-dot.l{background:#1689d8}.med-wheelwrap{position:relative;min-height:430px;display:grid;place-items:center}.med-wheel{width:min(390px,100%);aspect-ratio:1;border-radius:50%;position:relative;background:var(--wheel);border:10px solid #dfb850;box-shadow:0 0 0 5px #123c67,0 0 36px rgba(29,163,255,.48),inset 0 0 34px rgba(0,0,0,.55)}.med-wheel:after{content:'';position:absolute;inset:27%;border-radius:50%;background:radial-gradient(circle at 35% 28%,#135aa9,#06265a 55%,#031733);border:5px solid #68d5ff;box-shadow:0 0 0 4px #0a3b78,0 0 24px rgba(35,203,255,.75);z-index:2}.med-wheelcenter{position:absolute;inset:33%;z-index:3;display:grid;place-items:center;text-align:center;color:#fff;font-weight:950;font-size:30px;letter-spacing:.05em}.med-wheelcenter small{display:block;font-size:11px;letter-spacing:.12em;margin-top:-18px}.med-domain-label{position:absolute;z-index:4;width:115px;text-align:center;font-size:11px;font-weight:900;color:#fff;text-shadow:0 1px 3px #000;line-height:1.15}.med-domain-label b{display:block;font-size:12px;margin-bottom:2px}.med-atglance{background:#fff;color:#0b285b;border-radius:12px;padding:14px}.med-atglance h3{margin:0 0 8px;font-size:17px}.med-glance-row{padding:8px 0;border-bottom:1px solid #d5e1ed;font-size:12px}.med-glance-row:last-child{border:0}.med-glance-row b{display:block;font-size:16px;margin-top:2px}.med-glance-risk{color:#d51f38!important}
  .med-insights{padding:0;overflow:hidden}.med-insight-head{background:linear-gradient(180deg,#0b4b8a,#06396f);color:#fff;padding:14px 16px;font-weight:950}.med-insight-list{padding:8px 16px}.med-insight{display:grid;grid-template-columns:40px 1fr;gap:9px;padding:10px 0;border-bottom:1px solid #d6e1ed}.med-insight:last-child{border:0}.med-insight-badge{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:950;box-shadow:0 3px 8px rgba(0,0,0,.18)}.med-insight h4{margin:0 0 3px;font-size:14px}.med-insight p{margin:0;font-size:11px;line-height:1.4;color:#435a78}
  .med-lower{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px}.med-lower .med-panel{padding:15px}.med-lower h3{margin:0 0 10px;color:#082b62;font-size:16px}.med-priority{display:flex;gap:9px;margin:8px 0;font-size:12px;line-height:1.35}.med-rank{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:950;flex:0 0 auto}.med-check{display:flex;gap:8px;margin:8px 0;font-size:12px;line-height:1.35}.med-checkmark{width:20px;height:20px;border-radius:5px;background:#0d5ba8;color:#fff;display:grid;place-items:center;flex:0 0 auto}.med-actionbtn{width:100%;margin-top:10px;border:0;border-radius:999px;padding:11px;background:linear-gradient(180deg,#e2bd58,#b98718);color:#10214e;font-weight:950;cursor:pointer;box-shadow:0 5px 13px rgba(137,94,9,.25)}.med-resource{display:flex;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #d8e3ee;font-size:12px;color:#14386e}.med-resource:last-child{border:0}.med-reporthost{display:none;margin-top:12px}.med-reporthost.open{display:block}.med-reporthost .med-report-document{max-width:980px;margin:0 auto}.med-dashboard-footer{text-align:center;color:#d6e7fb;padding:14px 10px 2px;font-family:Georgia,serif;font-style:italic;font-size:13px}
  .med-emptydash{padding:26px;text-align:center;background:linear-gradient(145deg,#0b4b8a,#05295b);color:#fff;border-radius:16px}.med-emptydash h2{margin:5px 0 8px}.med-emptydash p{color:#dcecff}.med-retry{padding:10px 16px;border-radius:10px;border:0;background:#2e81ff;color:#fff;font-weight:900;cursor:pointer}
  @media(max-width:1180px){.med-app{grid-template-columns:150px minmax(0,1fr)}.med-riskbody{grid-template-columns:145px minmax(260px,1fr);}.med-atglance{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.med-atglance h3{grid-column:1/-1}.med-glance-row{border:1px solid #d5e1ed;border-radius:8px;padding:8px}.med-coregrid{grid-template-columns:1fr}.med-insights{margin-top:0}.med-lower{grid-template-columns:1fr 1fr}.med-lower .med-panel:last-child{grid-column:1/-1}}
  @media(max-width:800px){.med-shell{padding:8px}.med-topbar{grid-template-columns:1fr auto}.med-title{grid-column:1/-1;grid-row:2}.med-verse{display:none}.med-app{grid-template-columns:1fr}.med-sidebar{position:static;height:auto;display:flex;gap:6px;overflow-x:auto;padding:8px}.med-navbtn{min-width:120px;margin:0}.med-sideverse{display:none}.med-signout{position:static;width:auto;min-width:95px;margin-left:auto}.med-kpis{grid-template-columns:1fr 1fr}.med-riskbody{grid-template-columns:1fr}.med-legend{display:grid;grid-template-columns:1fr 1fr}.med-wheelwrap{min-height:390px}.med-atglance{grid-template-columns:1fr 1fr}.med-lower{grid-template-columns:1fr}.med-lower .med-panel:last-child{grid-column:auto}}
  @media(max-width:520px){.med-brandtext strong{font-size:21px}.med-brandorb{width:50px;height:50px}.med-title h1{font-size:24px}.med-main{padding:10px}.med-kpis{grid-template-columns:1fr}.med-riskpanel{padding:12px}.med-wheelwrap{min-height:340px}.med-wheel{width:300px}.med-domain-label{width:88px;font-size:9px}.med-domain-label b{font-size:10px}.med-legend{grid-template-columns:1fr}.med-atglance{grid-template-columns:1fr 1fr}.med-report-document{padding:17px}.med-doc-title{font-size:22px}}
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

function parseDomainSummaries(body=''){
  const lines=String(body).split(/\r?\n/);
  const headings=['SEVEN-DOMAIN SUMMARY','DOMAIN SUMMARY'];
  const start=lines.findIndex(x=>headings.includes(x.trim().toUpperCase()));
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

function levelKey(level=''){
  const v=String(level).toLowerCase();
  if(v.includes('extremely')) return 'Extremely High';
  if(v==='high'||v.startsWith('high ')) return 'High';
  if(v.includes('serious')) return 'Serious';
  if(v.includes('medium')||v.includes('moderate')) return 'Medium';
  if(v.includes('low')||v.includes('strong')||v.includes('healthy')) return 'Low';
  if(v.includes('counselor-directed')||v.includes('mitigation priority')) return 'Priority Review';
  return level||'Review';
}
function levelRank(level=''){
  const k=levelKey(level); return {'Extremely High':1,'High':2,'Priority Review':2,'Serious':3,'Medium':4,'Low':5}[k]||4;
}
function levelColor(level=''){
  const r=levelRank(level); return {1:'#f01f2f',2:'#f77716',3:'#f2c416',4:'#35b95b',5:'#1689d8'}[r]||'#1689d8';
}
function levelTextColor(level=''){return levelRank(level)<=2?'#d51f38':'#12386e'}

function formatReport(body=''){
  const lines=String(body).split(/\r?\n/);
  const headings=new Set(['BIBLICAL FRAMEWORK','PURPOSE','SEVEN-DOMAIN SUMMARY','DOMAIN SUMMARY','STRENGTHS TO PRESERVE','PRIORITY GROWTH AREAS','MITIGATION / ACTION PLAN','BIBLICAL FOUNDATION','NEXT STEPS']);
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

function wheelGradient(domains){
  const defaultDomains=['Communication','Finances','Sexual Intimacy','Covenant & Trust','Safety','Spiritual Unity & Purpose','Roles, Responsibilities & Family Stewardship'];
  const list=domains.length?domains:defaultDomains.map(name=>({name,level:'Medium'}));
  const n=list.length,step=360/n;
  return `conic-gradient(from -${step/2}deg,${list.map((d,i)=>`${levelColor(d.level)} ${i*step}deg ${(i+1)*step-1.2}deg,#0d3765 ${(i+1)*step-1.2}deg ${(i+1)*step}deg`).join(',')})`;
}
function wheelLabels(domains){
  const list=domains.length?domains:[]; if(!list.length) return '';
  const n=list.length;
  return list.map((d,i)=>{
    const angle=(360/n)*i-90;
    const r=42;
    const rad=angle*Math.PI/180;
    const x=50+Math.cos(rad)*r,y=50+Math.sin(rad)*r;
    return `<div class="med-domain-label" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%)"><b>${esc(DOMAIN_SHORT[d.name]||d.name)}</b>${esc(levelKey(d.level))}</div>`;
  }).join('');
}
function insightText(domain,level){
  const k=levelKey(level),serious=levelRank(level)<=3;
  const map={
    'Communication':serious?'Communication needs focused attention. Use clear listening, respectful speech, and counselor-guided conflict repair.':'Communication is a relative strength. Continue clear, respectful listening and speech.',
    'Finances':serious?'Financial stewardship needs focused alignment around goals, decisions, transparency, and responsibilities.':'Financial stewardship is comparatively stable. Continue shared planning and transparency.',
    'Sexual Intimacy':serious?'Intimacy needs careful, respectful counselor-guided attention to communication, connection, consent, and health concerns.':'Sexual intimacy is a relative strength. Continue open, respectful communication and connection.',
    'Covenant & Trust':serious?'Covenant and trust need focused repair, consistency, truthfulness, forgiveness, and accountability.':'Covenant and trust are comparative strengths to preserve and deepen.',
    'Safety':'Counselor-directed safety review remains separate from ordinary couple discussion. Follow the counselor-approved plan.',
    'Spiritual Unity & Purpose':serious?'Spiritual unity and shared purpose need renewed alignment around values, priorities, prayer, and direction.':'Spiritual unity and purpose are comparative strengths. Continue pursuing shared direction.',
    'Roles, Responsibilities & Family Stewardship':serious?'Roles, responsibilities, and family stewardship need clearer agreement, accountability, and follow-through.':'Roles and stewardship are comparatively stable. Continue clear expectations and mutual support.'
  };
  return map[domain]||`${domain} is currently assessed as ${k}. Review the counselor-approved guidance for this domain.`;
}

function centralizedDashboard(report,assessment){
  const domains=report?parseDomainSummaries(report.report_body):[];
  const sorted=[...domains].sort((a,b)=>levelRank(a.level)-levelRank(b.level));
  const highest=sorted[0]||null;
  const strengths=domains.filter(d=>levelRank(d.level)>=5).length;
  const growth=domains.filter(d=>levelRank(d.level)<=3).length;
  const overall=highest?(levelRank(highest.level)<=2?'Needs Immediate Attention':levelRank(highest.level)===3?'Needs Focus':levelRank(highest.level)===4?'Monitor & Improve':'Strong'):'Counselor Review';
  const releaseReady=!!report;
  const husbandStatus=releaseReady?'Complete':'Assessment received';
  const wifeStatus=releaseReady?'Complete':'Assessment received';
  const riskName=highest?levelKey(highest.level):'Pending Release';
  const wheel=wheelGradient(domains);
  const domainInsights=(domains.length?domains.slice().sort((a,b)=>levelRank(a.level)-levelRank(b.level)).slice(0,5):[]).map(d=>`<div class="med-insight"><div class="med-insight-badge" style="background:${levelColor(d.level)}">${levelRank(d.level)<=2?'!':'✓'}</div><div><h4 style="color:${levelTextColor(d.level)}">${esc(DOMAIN_SHORT[d.name]||d.name)}</h4><p>${esc(insightText(d.name,d.level))}</p></div></div>`).join('');
  const priorities=(sorted.length?sorted.slice(0,5):[]).map((d,i)=>`<div class="med-priority"><span class="med-rank" style="background:${levelColor(d.level)}">${i+1}</span><div><b>${esc(DOMAIN_SHORT[d.name]||d.name)}</b> — ${esc(insightText(d.name,d.level))}</div></div>`).join('')||'<p style="font-size:12px;color:#526989">Priority areas will appear after the counselor releases the couple-facing results.</p>';
  const releasedMeta=report?`${esc(report.instrument_version)} • Report Version ${esc(report.version)} • Released ${esc(new Date(report.released_at).toLocaleDateString())}`:`${esc(assessment.version)} • Counselor Review in Progress`;
  return `<div id="medCentralDashboard"><div class="med-shell">
    <header class="med-topbar"><div class="med-brandline"><div class="med-brandorb"></div><div class="med-brandtext"><strong>MED™</strong><span>MARRIAGE EVALUATION DOME</span><span>ASSESS • ALIGN • RESTORE • THRIVE</span></div></div><div class="med-title"><h1>ASSESSMENT RESULTS</h1><p>INSIGHTS FOR A STRONGER TOMORROW</p></div><div class="med-verse">“Two are better than one...”<small>Ecclesiastes 4:9 (KJV)</small></div></header>
    <div class="med-app"><aside class="med-sidebar"><button class="med-navbtn active" data-target="medOverview"><span class="med-navicon">⌂</span>Dashboard</button><button class="med-navbtn" data-target="medAssessmentStatus"><span class="med-navicon">▤</span>Assessment</button><button class="med-navbtn" data-target="medResults"><span class="med-navicon">▥</span>Results</button><button class="med-navbtn" data-target="medInsights"><span class="med-navicon">◉</span>Insights</button><button class="med-navbtn" data-target="medActionPlan"><span class="med-navicon">☑</span>Action Plan</button><button class="med-navbtn" data-target="medResources"><span class="med-navicon">▣</span>Resources</button><div class="med-sideverse">“Speak the truth in love...”<br><small>Ephesians 4:15 (KJV)</small></div><button class="med-signout" id="medCentralSignOut">Sign out</button></aside>
    <main class="med-main" id="medOverview">
      <section class="med-kpis" id="medAssessmentStatus"><div class="med-kpi"><div class="med-kpi-label">Husband</div><div class="med-kpi-value">${husbandStatus}</div><div class="med-kpi-sub">Governed assessment status</div><div class="med-progressline"><span style="width:${releaseReady?100:85}%"></span></div></div><div class="med-kpi"><div class="med-kpi-label">Wife</div><div class="med-kpi-value">${wifeStatus}</div><div class="med-kpi-sub">Governed assessment status</div><div class="med-progressline"><span style="width:${releaseReady?100:85}%"></span></div></div><div class="med-kpi"><div class="med-kpi-label">Domains</div><div class="med-kpi-value">${domains.length||7}</div><div class="med-kpi-sub">MED™ governed domains</div><div class="med-progressline"><span style="width:100%"></span></div></div><div class="med-kpi"><div class="med-kpi-label">Highest Risk</div><div class="med-kpi-value" style="font-size:18px;color:${highest?levelColor(highest.level):'#526989'}">${esc(riskName)}</div><div class="med-kpi-sub">Overall couple-facing result</div><div class="med-progressline med-alertline"><span style="width:${highest?Math.max(25,(6-levelRank(highest.level))*20):15}%"></span></div></div></section>
      ${releaseReady?`<section class="med-coregrid" id="medResults"><div class="med-panel med-riskpanel"><div class="med-panel-title">OVERALL RISK ASSESSMENT</div><div class="med-panel-sub">A visual summary of your marriage’s seven key MED™ domains</div><div class="med-riskbody"><div class="med-legend"><div class="med-legend-row"><span class="med-dot eh"></span><span><b>Extremely High</b><br>Immediate Attention</span></div><div class="med-legend-row"><span class="med-dot h"></span><span><b>High</b><br>Needs Focus</span></div><div class="med-legend-row"><span class="med-dot s"></span><span><b>Serious</b><br>Priority Growth Area</span></div><div class="med-legend-row"><span class="med-dot m"></span><span><b>Medium</b><br>Monitor & Improve</span></div><div class="med-legend-row"><span class="med-dot l"></span><span><b>Low</b><br>Comparative Strength</span></div></div><div class="med-wheelwrap"><div class="med-wheel" style="--wheel:${wheel}"></div><div class="med-wheelcenter">MED™<small>STRONGER TOGETHER</small></div>${wheelLabels(domains)}</div><div class="med-atglance"><h3>AT A GLANCE</h3><div class="med-glance-row">Total Questions<b>${assessment.total}</b></div><div class="med-glance-row">Domains<b>${domains.length||7}</b></div><div class="med-glance-row">Highest Risk<b class="med-glance-risk">${esc(riskName)}</b></div><div class="med-glance-row">Strengths<b>${strengths}</b></div><div class="med-glance-row">Growth Areas<b>${growth}</b></div><div class="med-glance-row">Overall Health<b class="${levelRank(highest?.level)<=3?'med-glance-risk':''}">${esc(overall)}</b></div></div></div></div><div class="med-panel med-insights" id="medInsights"><div class="med-insight-head">KEY INSIGHTS</div><div class="med-insight-list">${domainInsights||'<p style="font-size:12px;color:#526989">Counselor-approved insights are being prepared.</p>'}</div></div></section>
      <section class="med-lower"><div class="med-panel"><h3>TOP AREAS TO ADDRESS</h3>${priorities}</div><div class="med-panel" id="medActionPlan"><h3>RECOMMENDED NEXT STEPS</h3><div class="med-check"><span class="med-checkmark">✓</span>Review the overall domain results together with your counselor.</div><div class="med-check"><span class="med-checkmark">✓</span>Confirm the counselor-approved priority areas and mitigation plan.</div><div class="med-check"><span class="med-checkmark">✓</span>Set specific, observable actions for the next counseling interval.</div><div class="med-check"><span class="med-checkmark">✓</span>Use the approved resources and conversation guides.</div><div class="med-check"><span class="med-checkmark">✓</span>Schedule follow-up and reassessment to measure progress.</div><button class="med-actionbtn" id="medOpenReport">Read Full Counselor-Approved Report</button></div><div class="med-panel" id="medResources"><h3>RESOURCES & SUPPORT</h3><div class="med-resource"><span>Communication & Conflict Resolution</span><span>›</span></div><div class="med-resource"><span>Financial Stewardship</span><span>›</span></div><div class="med-resource"><span>Intimacy & Connection</span><span>›</span></div><div class="med-resource"><span>Covenant & Trust</span><span>›</span></div><div class="med-resource"><span>Spiritual Unity & Purpose</span><span>›</span></div><div class="med-resource"><span>Roles & Family Stewardship</span><span>›</span></div></div></section>
      <section class="med-reporthost" id="medReportHost"><div class="med-report-document">${formatReport(report.report_body)}</div></section>`:`<section class="med-emptydash" id="medResults"><span class="med-report-state">Counselor Review in Progress</span><h2>Your assessment is complete.</h2><p>You do not need to return to the questionnaire. When the counselor approves and releases the couple-facing results, this same dashboard will display the seven-domain overall marriage assessment, insights, action plan, resources, and full report.</p><p>${releasedMeta}</p></section>`}
      <div class="med-dashboard-footer">“A threefold cord is not quickly broken.” — Ecclesiastes 4:12 (KJV)</div>
    </main></div></div></div>`;
}

async function renderCentralSpouseDashboard(userId){
  if(document.getElementById('medCentralDashboard')) return;
  const assessment=await spouseAssessmentComplete(userId);
  if(!assessment.complete) return;
  let report=null;
  try{report=await releasedReport();}catch(e){console.error('MED released report load failed',e);}
  document.body.classList.add('med-central-mode');
  document.body.insertAdjacentHTML('beforeend',centralizedDashboard(report,assessment));
  document.querySelectorAll('.med-navbtn[data-target]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.med-navbtn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');document.getElementById(btn.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});}));
  document.getElementById('medCentralSignOut')?.addEventListener('click',async()=>{await sb.auth.signOut();location.reload();});
  const open=document.getElementById('medOpenReport');
  if(open) open.addEventListener('click',()=>{const host=document.getElementById('medReportHost');host?.classList.toggle('open');open.textContent=host?.classList.contains('open')?'Hide Full Counselor-Approved Report':'Read Full Counselor-Approved Report';if(host?.classList.contains('open'))host.scrollIntoView({behavior:'smooth',block:'start'});});
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
  if(priorities.length){for(const d of priorities) lines.push(`• ${d.name}: ${d.safety?'Address privately with the counselor before ordinary joint discussion.':'Give focused attention in the counseling plan.'}`);} else lines.push('• No Extremely High, High, or Serious domain priority was identified in the current scoring. Continue strengthening healthy patterns.');
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
  panel.querySelector('#medReleaseReport').onclick=async()=>{try{if(!confirm('Approve this exact report and release it to both spouses? Counselor-only raw answers, scores and safety details are not included unless you manually placed them in the report text.')) return;msg.textContent='Approving and releasing…';const approved=await save('approved');const {error}=await sb.from('med_released_reports').insert({case_id:caseId,counselor_report_id:approved.id,instrument_version:approved.instrument_version,version:approved.version,report_body:approved.report_body});if(error){if(error.code==='23505') throw new Error('This report version has already been released.');throw error;}state.textContent='Released';msg.textContent=`Report Version ${approved.version} approved and released. Husband and Wife can now sign into the secure MED™ case and go directly to the centralized dashboard.`;}catch(e){msg.textContent=`Release failed: ${e.message}`}};
}

async function bootReportLifecycle(){
  if(!caseId) return;
  addStyles();
  const {data:{session},error}=await sb.auth.getSession(); if(error) throw error; if(!session) return;
  const role=await membership(session.user.id); if(!role) return;
  const wait=async()=>{
    const target=role==='counselor'?document.getElementById('counselor'):document.getElementById('spouse');
    if(!target || target.classList.contains('hidden')){setTimeout(wait,150);return;}
    if(role==='counselor') await renderCounselorReport(); else await renderCentralSpouseDashboard(session.user.id);
  };
  wait().catch(e=>console.error('MED report lifecycle failed',e));
}

bootReportLifecycle().catch(console.error);