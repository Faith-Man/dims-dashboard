// Dominion1st / DEA™ RAC model adapted from the DAFI 91-202 4x4 Safety and Ergonomic Hazard RAC matrix.
// Users select severity and probability; the RAC is calculated and displayed only as the result.
export const RAC_MATRIX={I:{A:1,B:1,C:2,D:3},II:{A:1,B:2,C:3,D:4},III:{A:2,B:3,C:4,D:5},IV:{A:3,B:4,C:5,D:5}};
export const RAC_LABEL={1:'Critical',2:'Serious',3:'Moderate',4:'Minor',5:'Negligible'};
export const RAC_SEVERITY={
 I:{name:'Catastrophic',definition:'Imminent and immediate danger of death, permanent disability, mission failure, or equivalent catastrophic loss.'},
 II:{name:'Critical',definition:'Major permanent or temporary loss, serious mission degradation, or equivalent critical consequence.'},
 III:{name:'Significant',definition:'Meaningful but reversible loss, degraded capability, or condition requiring corrective action.'},
 IV:{name:'Minor',definition:'Limited consequence, minor treatment/correction, or small localized operational impact.'}
};
export const RAC_PROBABILITY={
 A:{name:'Frequent',definition:'Immediate exposure or expected to occur repeatedly or continuously.'},
 B:{name:'Likely',definition:'Probably will occur in time if not corrected, or may occur one or more times.'},
 C:{name:'Occasional',definition:'Possible to occur in time if not corrected.'},
 D:{name:'Rarely',definition:'Unlikely to occur; exposure may exist, but occurrence is not expected.'}
};
export function racCode(severity,probability){return RAC_MATRIX[severity]?.[probability]??null}
export function renderDeaRiskMatrix(systemSeverity='',systemProbability=''){
 const probs=Object.entries(RAC_PROBABILITY);
 const rows=Object.entries(RAC_SEVERITY).map(([s,v])=>`<tr><th scope="row"><button type="button" class="rac-choice severity-choice${s===systemSeverity?' system-choice':''}" data-severity="${s}"><strong>${s} — ${v.name}</strong><span>${v.definition}</span></button></th>${probs.map(([p])=>`<td class="matrix-intersection" data-cell="${s}${p}"></td>`).join('')}</tr>`).join('');
 return `<div class="rac-workspace"><div class="rac-intro"><div><span class="rac-kicker">DEA™ RISK CONTROL</span><h3>Risk Assessment Code (RAC)</h3><p>Choose one Severity and one Probability. DEA calculates the RAC automatically. The matrix shows the definitions so the assessment can be performed without a separate legend.</p></div><div class="system-rac"><span>SYSTEM RAC</span><strong>${systemSeverity&&systemProbability?`RAC ${racCode(systemSeverity,systemProbability)}`:'Not assessed'}</strong><small>${systemSeverity&&systemProbability?`${systemSeverity}/${systemProbability} — ${RAC_LABEL[racCode(systemSeverity,systemProbability)]}`:'Awaiting system assessment'}</small></div></div><div class="dea-matrix-wrap"><table class="dea-matrix"><caption>Dominion1st™ Risk Assessment Matrix</caption><thead><tr><th>SEVERITY</th>${probs.map(([p,v])=>`<th><button type="button" class="rac-choice probability-choice${p===systemProbability?' system-choice':''}" data-probability="${p}"><strong>${p} — ${v.name}</strong><span>${v.definition}</span></button></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="rac-result" id="racUserResult"><span>USER ASSESSMENT</span><strong>Select Severity + Probability</strong><p>RAC = Severity × Probability matrix intersection.</p></div><p class="dea-matrix-note">System RAC remains authoritative for DEA™. A user assessment may be saved or challenged, but it does not silently change the System RAC.</p></div>`;
}
export function activateRacAssessment(root=document,{onSave,onChallenge}={}){
 let s=null,p=null;const refresh=()=>{root.querySelectorAll('.matrix-intersection').forEach(x=>x.classList.remove('user-selected'));if(s&&p){root.querySelector(`[data-cell="${s}${p}"]`)?.classList.add('user-selected');const code=racCode(s,p),out=root.querySelector('#racUserResult');if(out)out.innerHTML=`<span>USER ASSESSMENT</span><strong>RAC ${code} — ${RAC_LABEL[code]}</strong><p><b>Formula:</b> Severity ${s} × Probability ${p} → RAC ${code}</p><div class="control-actions"><button type="button" data-rac-save>Save User Assessment</button><button type="button" class="rac-challenge" data-rac-challenge>Challenge / Request Review</button></div>`;out?.querySelector('[data-rac-save]')?.addEventListener('click',()=>onSave?.({severity:s,probability:p,rac:code}));out?.querySelector('[data-rac-challenge]')?.addEventListener('click',()=>onChallenge?.({severity:s,probability:p,rac:code}))}};
 root.querySelectorAll('[data-severity]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-severity]').forEach(x=>x.classList.remove('user-choice'));b.classList.add('user-choice');s=b.dataset.severity;refresh()}));
 root.querySelectorAll('[data-probability]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-probability]').forEach(x=>x.classList.remove('user-choice'));b.classList.add('user-choice');p=b.dataset.probability;refresh()}));
}
