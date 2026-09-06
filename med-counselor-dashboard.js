export function installMedCounselorDashboard(sb) {
  const caseId = new URLSearchParams(location.search).get('case');
  if (!caseId) return;

  const MATRIX = {
    I:   { A:1, B:1, C:2, D:3, E:4 },
    II:  { A:1, B:2, C:3, D:4, E:5 },
    III: { A:2, B:3, C:4, D:5, E:5 },
    IV:  { A:3, B:4, C:5, D:5, E:5 },
    V:   { A:4, B:5, C:5, D:5, E:5 }
  };
  const RAC_LABELS = {1:'Extremely High',2:'High',3:'Serious',4:'Medium',5:'Low'};

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const counselor = () => document.getElementById('counselor');

  function addStyles() {
    if (document.getElementById('medCounselorEnhancementStyles')) return;
    const style = document.createElement('style');
    style.id = 'medCounselorEnhancementStyles';
    style.textContent = `
      #medCounselorEnhancement{margin:20px 0 24px;display:grid;gap:18px}
      #medCounselorEnhancement .medc-panel{border:1px solid #cbd4f2;background:linear-gradient(180deg,#fff 0%,#f7f9ff 100%);border-radius:20px;padding:18px;box-shadow:0 10px 28px rgba(34,49,126,.08)}
      #medCounselorEnhancement h3{margin:0 0 8px;color:#10184f;font-size:1.15rem}
      #medCounselorEnhancement .medc-muted{color:#687196;margin:0}
      #medCounselorEnhancement .medc-status-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
      #medCounselorEnhancement .medc-status{border:1px solid #d8def5;border-radius:16px;padding:14px;background:#fff}
      #medCounselorEnhancement .medc-status strong{display:block;color:#111d6c;font-size:1.05rem;margin-bottom:5px}
      #medCounselorEnhancement .medc-status span{color:#687196;font-size:.92rem}
      #medCounselorEnhancement .medc-matrix-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
      #medCounselorEnhancement .medc-matrix{border-collapse:separate;border-spacing:4px;min-width:620px;width:100%;text-align:center}
      #medCounselorEnhancement .medc-matrix th{background:#111d6c;color:white;padding:10px;border-radius:8px;font-size:.88rem}
      #medCounselorEnhancement .medc-matrix td{padding:10px;border:1px solid #d8def5;border-radius:8px;background:#fff;font-weight:800;color:#111d6c}
      #medCounselorEnhancement .medc-matrix td small{display:block;font-weight:600;color:#687196;margin-top:2px}
      #medCounselorEnhancement .medc-legend{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
      #medCounselorEnhancement .medc-legend div{border:1px solid #e0e5f7;border-radius:12px;padding:12px;background:#fbfcff;color:#4f5b88;font-size:.9rem;line-height:1.45}
      #medCounselorEnhancement .medc-question-list{display:grid;gap:10px;margin-top:14px}
      #medCounselorEnhancement details.medc-question{border:1px solid #d8def5;border-radius:14px;background:#fff;overflow:hidden}
      #medCounselorEnhancement details.medc-question summary{cursor:pointer;padding:13px 14px;list-style:none;display:grid;grid-template-columns:90px minmax(0,1fr) auto;gap:10px;align-items:center}
      #medCounselorEnhancement details.medc-question summary::-webkit-details-marker{display:none}
      #medCounselorEnhancement .medc-qid{font-weight:800;color:#111d6c}
      #medCounselorEnhancement .medc-domain{font-weight:700;color:#24317e}
      #medCounselorEnhancement .medc-badge{font-size:.75rem;font-weight:800;border-radius:999px;padding:5px 8px;background:#eef2ff;color:#24317e;white-space:nowrap}
      #medCounselorEnhancement .medc-badge.safety{background:#fff1f3;color:#a92f48;border:1px solid #f0bcc6}
      #medCounselorEnhancement .medc-qbody{border-top:1px solid #e4e8f7;padding:14px;display:grid;gap:12px}
      #medCounselorEnhancement .medc-qtext{font-weight:700;color:#10184f;line-height:1.45}
      #medCounselorEnhancement .medc-compare{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      #medCounselorEnhancement .medc-person{border:1px solid #e0e5f7;border-radius:12px;padding:11px;background:#fbfcff;min-width:0}
      #medCounselorEnhancement .medc-person strong{display:block;color:#111d6c;margin-bottom:5px}
      #medCounselorEnhancement .medc-person span{display:block;color:#5f698f;font-size:.88rem;line-height:1.4}
      #medCounselorEnhancement .medc-empty{font-style:italic;color:#7b84a7}
      @media(max-width:760px){
        #medCounselorEnhancement .medc-status-grid{grid-template-columns:1fr 1fr}
        #medCounselorEnhancement .medc-legend{grid-template-columns:1fr}
        #medCounselorEnhancement details.medc-question summary{grid-template-columns:72px minmax(0,1fr);}
        #medCounselorEnhancement .medc-badge{grid-column:1/-1;width:max-content}
        #medCounselorEnhancement .medc-compare{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  function statusText(role, userId, inputs) {
    if (!userId) return 'Not assigned';
    const count = inputs.filter(r => r.user_id === userId).length;
    return `${count}/34 answered`;
  }

  function answerBlock(label, userId, questionId, inputs, scores) {
    if (!userId) return `<div class="medc-person"><strong>${label}</strong><span class="medc-empty">Not assigned</span></div>`;
    const input = inputs.find(r => r.user_id === userId && r.question_id === questionId);
    const score = scores.find(r => r.user_id === userId && r.question_id === questionId);
    if (!input) return `<div class="medc-person"><strong>${label}</strong><span class="medc-empty">Awaiting response</span></div>`;
    return `<div class="medc-person"><strong>${label}</strong><span>Frequency: ${esc(input.frequency_answer)}</span><span>Impact: ${esc(input.impact_answer)}</span>${score ? `<span>RAD: ${esc(score.probability)} / ${esc(score.severity)} · RAC ${esc(score.rac)} (${esc(score.rac_category)})</span>` : '<span>RAD: awaiting calculated score</span>'}</div>`;
  }

  function renderMatrix() {
    const severities = ['I','II','III','IV','V'];
    const probs = ['A','B','C','D','E'];
    const rows = severities.map(sev => `<tr><th>Severity ${sev}</th>${probs.map(prob => { const rac=MATRIX[sev][prob]; return `<td>RAC ${rac}<small>${RAC_LABELS[rac]}</small></td>`; }).join('')}</tr>`).join('');
    return `<div class="medc-panel"><h3>RAD™ Risk Assessment Matrix</h3><p class="medc-muted">Counselor reference. MED™ derives Probability from frequency and Severity from impact; individual spouse scores remain separate and are never averaged.</p><div class="medc-matrix-wrap"><table class="medc-matrix"><thead><tr><th>Severity ↓ / Probability →</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead><tbody>${rows}</tbody></table></div><div class="medc-legend"><div><strong>Frequency → Probability</strong><br>Very Often = A · Often = B · Sometimes = C · Rarely = D · Never = E</div><div><strong>Impact → Severity</strong><br>Threatens safety/continuation = I · Major disruption = II · Significant strain = III · Recurring/moderate tension = IV · Little/no lasting impact = V</div></div></div>`;
  }

  async function load() {
    const host = counselor();
    if (!host || host.classList.contains('hidden')) return false;
    if (document.getElementById('medCounselorEnhancement')) return true;

    addStyles();
    const mount = document.createElement('div');
    mount.id = 'medCounselorEnhancement';
    const header = host.querySelector('.row.between') || host.firstElementChild;
    if (header?.insertAdjacentElement) header.insertAdjacentElement('afterend', mount); else host.prepend(mount);
    mount.innerHTML = '<div class="medc-panel"><h3>Counselor dashboard</h3><p class="medc-muted">Loading governed MED™ counselor reference…</p></div>';

    try {
      const [qRes,pRes,iRes,sRes] = await Promise.all([
        sb.from('med_question_catalog').select('question_id,domain,question_text,sort_order,safety_override').eq('active',true).order('sort_order'),
        sb.from('med_case_participants').select('user_id,role').eq('case_id',caseId),
        sb.from('med_response_inputs').select('user_id,question_id,frequency_answer,impact_answer,submitted_at').eq('case_id',caseId),
        sb.from('med_response_scores').select('user_id,question_id,probability,severity,rac,rac_category,safety_override').eq('case_id',caseId)
      ]);
      const firstError = [qRes,pRes,iRes,sRes].find(r => r.error)?.error;
      if (firstError) throw firstError;

      const questions = qRes.data || [];
      const parts = pRes.data || [];
      const inputs = iRes.data || [];
      const scores = sRes.data || [];
      const husbandId = parts.find(p => p.role === 'husband')?.user_id || null;
      const wifeId = parts.find(p => p.role === 'wife')?.user_id || null;
      const husbandCount = inputs.filter(r => r.user_id === husbandId).length;
      const wifeCount = inputs.filter(r => r.user_id === wifeId).length;
      const safetyReviews = scores.filter(s => s.safety_override).length;
      const elevated = scores.filter(s => Number(s.rac) <= 2).length;

      const questionRows = questions.map(q => `<details class="medc-question"><summary><span class="medc-qid">${esc(q.question_id)}</span><span class="medc-domain">${esc(q.domain)}</span><span class="medc-badge ${q.safety_override ? 'safety' : ''}">${q.safety_override ? 'Safety override' : 'Assessment item'}</span></summary><div class="medc-qbody"><div class="medc-qtext">${esc(q.question_text)}</div><div class="medc-compare">${answerBlock('Husband',husbandId,q.question_id,inputs,scores)}${answerBlock('Wife',wifeId,q.question_id,inputs,scores)}<div class="medc-person"><strong>Counselor review</strong><span>${q.safety_override ? 'Safety-sensitive item; review disclosures counselor-first.' : 'Comparison becomes actionable as spouse responses arrive.'}</span></div></div></div></details>`).join('');

      mount.innerHTML = `<div class="medc-panel"><h3>Counselor Case Readiness</h3><p class="medc-muted">The assessment instrument is available now. Spouse answers and RAD™ results populate here only as governed case responses are recorded.</p><div class="medc-status-grid"><div class="medc-status"><strong>Husband</strong><span>${esc(statusText('husband',husbandId,inputs))}</span></div><div class="medc-status"><strong>Wife</strong><span>${esc(statusText('wife',wifeId,inputs))}</span></div><div class="medc-status"><strong>Safety Reviews</strong><span>${safetyReviews}</span></div><div class="medc-status"><strong>High / Extremely High</strong><span>${elevated}</span></div></div></div>${renderMatrix()}<div class="medc-panel"><h3>MED™ Assessment Instrument</h3><p class="medc-muted">${questions.length} governed questions. Tap any item to review the full wording and the husband/wife comparison status.</p><div class="medc-question-list">${questionRows}</div></div>`;
      return true;
    } catch (error) {
      mount.innerHTML = `<div class="medc-panel"><h3>Counselor reference unavailable</h3><p class="medc-muted">${esc(error?.message || 'Unable to load counselor reference data.')}</p></div>`;
      return true;
    }
  }

  let attempts = 0;
  const timer = setInterval(async () => {
    attempts += 1;
    const done = await load();
    if (done || attempts >= 60) clearInterval(timer);
  }, 500);
  load();
}
