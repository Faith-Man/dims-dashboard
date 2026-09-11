export function installMedCounselorDashboard(sb) {
  const caseId = new URLSearchParams(location.search).get('case');
  if (!caseId) return;

  const RAC_LABELS = {1:'Extremely High',2:'High',3:'Serious',4:'Medium',5:'Low'};
  const DOMAINS = ['Communication','Finances','Sexual Intimacy','Covenant & Trust','Safety','Spiritual Unity & Purpose','Roles, Responsibilities & Family Stewardship'];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const counselor = () => document.getElementById('counselor');
  const severityRank = rac => Number(rac || 5);

  function addStyles() {
    if (document.getElementById('medCounselorEnhancementStyles')) return;
    const style = document.createElement('style');
    style.id = 'medCounselorEnhancementStyles';
    style.textContent = `
      #medCounselorEnhancement{margin:20px 0 24px;display:grid;gap:18px;color:#eef5ff}
      #medCounselorEnhancement .medc-report{background:radial-gradient(circle at 50% -20%,#173b91 0,#0b1c52 42%,#050d28 100%);border:1px solid #3558a6;border-radius:28px;padding:22px;box-shadow:0 20px 60px rgba(5,13,40,.35)}
      #medCounselorEnhancement .medc-head{display:flex;justify-content:space-between;gap:18px;align-items:center;border-bottom:1px solid rgba(216,182,76,.45);padding-bottom:16px}
      #medCounselorEnhancement .medc-title{display:flex;gap:14px;align-items:center}.medc-mark{width:64px;height:64px;border-radius:50%;background:url('/assets/med-orb-canonical.jpg') center/cover;border:2px solid #d8b64c;box-shadow:0 0 24px rgba(36,232,255,.35)}
      #medCounselorEnhancement h3{margin:0;color:#fff;font-size:1.2rem}.medc-gold{color:#e5c968;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:.75rem}.medc-muted{color:#aebde8;margin:4px 0 0;line-height:1.45}
      #medCounselorEnhancement .medc-scripture{text-align:right;max-width:420px;color:#dce7ff;font-size:.9rem;line-height:1.4}.medc-scripture strong{color:#e5c968}
      #medCounselorEnhancement .medc-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;margin-top:16px}.medc-panel{border:1px solid #28488e;background:linear-gradient(180deg,rgba(15,35,91,.92),rgba(7,20,58,.95));border-radius:20px;padding:17px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
      #medCounselorEnhancement .medc-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.medc-kpi{border:1px solid #31539b;border-radius:15px;padding:13px;background:#0a1945}.medc-kpi b{display:block;color:#fff;font-size:1.45rem}.medc-kpi span{font-size:.78rem;color:#9fb3e4}
      #medCounselorEnhancement .medc-ring{width:min(330px,78vw);aspect-ratio:1;margin:12px auto;position:relative;border-radius:50%;background:conic-gradient(#c63f55 0 14.28%,#df8a36 14.28% 28.56%,#e0bd42 28.56% 42.84%,#3f77c9 42.84% 57.12%,#37a987 57.12% 71.4%,#765bc4 71.4% 85.68%,#3e9fc4 85.68% 100%);box-shadow:0 0 28px rgba(36,232,255,.18)}
      #medCounselorEnhancement .medc-ring:before{content:'';position:absolute;inset:26%;border-radius:50%;background:#071437;border:2px solid #d8b64c;box-shadow:0 0 22px rgba(216,182,76,.25)}.medc-ring-center{position:absolute;inset:32%;display:grid;place-items:center;text-align:center;z-index:2;color:#fff;font-weight:900}.medc-ring-center small{display:block;color:#e5c968;font-size:.62rem;letter-spacing:.08em}
      #medCounselorEnhancement .medc-domains{display:grid;gap:8px;margin-top:10px}.medc-domainrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;border-bottom:1px solid rgba(83,111,178,.35);padding:8px 0}.medc-domainrow:last-child{border:0}.medc-domainrow strong{color:#eef5ff}.medc-risk{font-weight:900}.medc-r1{color:#ff6b7c}.medc-r2{color:#ff9b5b}.medc-r3{color:#f2d263}.medc-r4{color:#79aaff}.medc-r5{color:#71d7b1}
      #medCounselorEnhancement .medc-priorities{display:grid;gap:10px;margin-top:12px}.medc-priority{border-left:4px solid #e5c968;background:#0a1945;border-radius:12px;padding:12px}.medc-priority.r1{border-left-color:#ff536b}.medc-priority.r2{border-left-color:#ff9b5b}.medc-priority strong{color:#fff}.medc-priority p{margin:5px 0 0;color:#b8c8ed;line-height:1.45;font-size:.9rem}
      #medCounselorEnhancement .medc-actions{display:grid;gap:9px;margin-top:12px}.medc-action{background:#0a1945;border:1px solid #31539b;border-radius:12px;padding:11px;color:#dbe7ff;line-height:1.4}.medc-action b{color:#fff}
      #medCounselorEnhancement .medc-disclaimer{margin-top:14px;padding-top:12px;border-top:1px solid rgba(216,182,76,.35);font-size:.78rem;color:#94a8d7;line-height:1.45}
      #medCounselorEnhancement details.medc-detail{margin-top:14px;border:1px solid #31539b;border-radius:14px;background:#08163c;overflow:hidden}.medc-detail summary{cursor:pointer;padding:13px;color:#dce8ff;font-weight:800}.medc-detail-body{padding:0 13px 13px;display:grid;gap:8px}.medc-q{border-top:1px solid #263f7a;padding-top:8px;color:#b9c9ed;font-size:.86rem;line-height:1.4}
      @media(max-width:820px){#medCounselorEnhancement .medc-head{display:block}.medc-scripture{text-align:left!important;margin-top:12px}.medc-grid{grid-template-columns:1fr!important}.medc-kpis{grid-template-columns:1fr 1fr!important}.medc-mark{width:54px;height:54px}}
    `;
    document.head.appendChild(style);
  }

  const adviceFor = (domain, rac, safety) => {
    if (safety) return 'Counselor-first private safety review. Do not use ordinary joint-session scoring until immediate safety, coercion, threats and appropriate referral needs are evaluated.';
    if (rac <= 2) return `Prioritize ${domain.toLowerCase()} in the next counseling session. Identify the recurring behavior, agree on one concrete corrective action, assign responsibility and set a near-term review date.`;
    if (rac === 3) return `Address ${domain.toLowerCase()} with a specific improvement plan, measurable commitments and follow-up at the next review.`;
    return `Preserve current strengths in ${domain.toLowerCase()} and monitor for changes; no elevated intervention is indicated by the present responses.`;
  };

  function domainSummary(domain, questions, scores) {
    const ids = new Set(questions.filter(q => q.domain === domain).map(q => q.question_id));
    const ds = scores.filter(s => ids.has(s.question_id));
    if (!ds.length) return {domain,rac:5,label:'Awaiting data',safety:false,count:0};
    const worst = ds.reduce((a,b) => severityRank(b.rac) < severityRank(a.rac) ? b : a);
    return {domain,rac:Number(worst.rac),label:worst.rac_category || RAC_LABELS[worst.rac] || 'Review',safety:ds.some(s=>s.safety_override),count:ds.length};
  }

  async function load() {
    const host = counselor();
    if (!host || host.classList.contains('hidden')) return false;
    if (document.getElementById('medCounselorEnhancement')) return true;
    addStyles();
    const mount = document.createElement('div'); mount.id='medCounselorEnhancement';
    const header=host.querySelector('.row.between')||host.firstElementChild;
    if(header?.insertAdjacentElement) header.insertAdjacentElement('afterend',mount); else host.prepend(mount);
    mount.innerHTML='<div class="medc-report"><h3>Building MED™ counselor report…</h3></div>';
    try {
      const [qRes,pRes,iRes,sRes]=await Promise.all([
        sb.from('med_question_catalog').select('question_id,domain,question_text,sort_order,safety_override').eq('active',true).order('sort_order'),
        sb.from('med_case_participants').select('user_id,role').eq('case_id',caseId),
        sb.from('med_response_inputs').select('user_id,question_id,frequency_answer,impact_answer,submitted_at').eq('case_id',caseId),
        sb.from('med_response_scores').select('user_id,question_id,probability,severity,rac,rac_category,safety_override').eq('case_id',caseId)
      ]);
      const err=[qRes,pRes,iRes,sRes].find(r=>r.error)?.error; if(err) throw err;
      const questions=qRes.data||[], parts=pRes.data||[], inputs=iRes.data||[], scores=sRes.data||[];
      const husbandId=parts.find(p=>p.role==='husband')?.user_id||null, wifeId=parts.find(p=>p.role==='wife')?.user_id||null;
      const hc=inputs.filter(r=>r.user_id===husbandId).length, wc=inputs.filter(r=>r.user_id===wifeId).length;
      const safety=scores.filter(s=>s.safety_override).length, elevated=scores.filter(s=>Number(s.rac)<=2).length;
      const existingDomains=[...new Set(questions.map(q=>q.domain))];
      const summaries=DOMAINS.map(d=>domainSummary(d,questions,scores));
      const actionable=summaries.filter(d=>d.count && (d.rac<=3||d.safety)).sort((a,b)=>(b.safety-a.safety)||(a.rac-b.rac));
      const highest=actionable[0]||summaries.find(d=>d.count)||{rac:5,label:'Awaiting data'};
      const domainRows=summaries.map(d=>`<div class="medc-domainrow"><strong>${esc(d.domain)}</strong><span class="medc-risk medc-r${d.rac}">${d.count ? `RAC ${d.rac} · ${esc(d.label)}` : (existingDomains.includes(d.domain)?'Awaiting responses':'Planned domain')}</span></div>`).join('');
      const priorities=(actionable.length?actionable:[{domain:'Assessment',rac:5,label:'No elevated domain',safety:false}]).slice(0,5).map((d,i)=>`<div class="medc-priority r${d.rac}"><strong>${i+1}. ${esc(d.domain)} — ${esc(d.label)}</strong><p>${esc(adviceFor(d.domain,d.rac,d.safety))}</p></div>`).join('');
      const details=questions.map(q=>{const hs=scores.find(s=>s.user_id===husbandId&&s.question_id===q.question_id), ws=scores.find(s=>s.user_id===wifeId&&s.question_id===q.question_id);return `<div class="medc-q"><b>${esc(q.question_id)} · ${esc(q.domain)}</b> — ${esc(q.question_text)}<br>Husband: ${hs?`RAC ${esc(hs.rac)} (${esc(hs.rac_category)})`:'awaiting'} · Wife: ${ws?`RAC ${esc(ws.rac)} (${esc(ws.rac_category)})`:'awaiting'}${(hs?.safety_override||ws?.safety_override)?' · SAFETY REVIEW':''}</div>`}).join('');
      mount.innerHTML=`<div class="medc-report">
        <div class="medc-head"><div class="medc-title"><div class="medc-mark" aria-label="MED emblem"></div><div><div class="medc-gold">Marriage1st™ · Powered by RAD™ / IAM</div><h3>MED™ Marriage Evaluation Report</h3><p class="medc-muted">Identify · Assess · Mitigate</p></div></div><div class="medc-scripture"><strong>“From the beginning it was not so.” — Matthew 19:8</strong><br>“What therefore God hath joined together, let not man put asunder.” — Matthew 19:6</div></div>
        <div class="medc-kpis" style="margin-top:16px"><div class="medc-kpi"><b>${hc}/34</b><span>Husband responses</span></div><div class="medc-kpi"><b>${wc}/34</b><span>Wife responses</span></div><div class="medc-kpi"><b>${safety}</b><span>Safety reviews</span></div><div class="medc-kpi"><b>${elevated}</b><span>High / Extremely High items</span></div></div>
        <div class="medc-grid"><div class="medc-panel"><div class="medc-gold">Circular domain assessment</div><h3>Seven-Domain MED™ Risk View</h3><div class="medc-ring"><div class="medc-ring-center"><div>MED™<small>${highest.label}<br>RAC ${highest.rac}</small></div></div></div><div class="medc-domains">${domainRows}</div></div>
        <div class="medc-panel"><div class="medc-gold">Counselor interpretation</div><h3>Priority Action Areas</h3><p class="medc-muted">Algorithm-generated draft for counselor review and editing. Spouse scores remain separate; the most serious applicable score governs triage.</p><div class="medc-priorities">${priorities}</div></div></div>
        <div class="medc-grid"><div class="medc-panel"><div class="medc-gold">Mitigate</div><h3>Recommended Next Steps</h3><div class="medc-actions"><div class="medc-action"><b>1. Counselor review:</b> validate context before releasing recommendations to the couple.</div><div class="medc-action"><b>2. Safety first:</b> any safety override receives private counselor-first review before ordinary joint work.</div><div class="medc-action"><b>3. Action plan:</b> convert each approved priority into a concrete behavior, responsible person, target date and follow-up.</div><div class="medc-action"><b>4. Reassess:</b> repeat targeted MED items after the intervention period and compare risk movement.</div></div></div>
        <div class="medc-panel"><div class="medc-gold">Biblical foundation</div><h3>God’s Design for Marriage</h3><p class="medc-muted"><b>Genesis 2:18, 21–24</b> — creation, help meet and one-flesh union.</p><p class="medc-muted"><b>Matthew 19:4–8</b> — Jesus returns marriage questions to God’s design “from the beginning.”</p><p class="medc-muted"><b>Ephesians 5:33</b> — the husband’s responsibility to love and the wife’s responsibility to reverence her husband.</p></div></div>
        <details class="medc-detail"><summary>Detailed Assessment Evidence (${questions.length} governed questions)</summary><div class="medc-detail-body">${details}</div></details>
        <div class="medc-disclaimer">MED™ is a pastoral counseling triage and discussion aid, not a medical or mental-health diagnosis. Algorithmic recommendations are drafts for counselor review, modification and approval. Safety disclosures override ordinary couple-scoring logic and require appropriate private safety-focused review and referral when indicated.</div>
      </div>`;
      return true;
    } catch(error){mount.innerHTML=`<div class="medc-report"><h3>Counselor report unavailable</h3><p class="medc-muted">${esc(error?.message||'Unable to load counselor report data.')}</p></div>`;return true;}
  }
  let attempts=0;const timer=setInterval(async()=>{attempts++;const done=await load();if(done||attempts>=60)clearInterval(timer)},500);load();
}
