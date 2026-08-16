// DEA™ risk matrix prototype. Labels follow the current DAF-style 4x5 model.
export const DEA_RISK_MATRIX = {
  I:  { A:'extremely_high', B:'extremely_high', C:'high', D:'high', E:'medium' },
  II: { A:'extremely_high', B:'high', C:'high', D:'medium', E:'low' },
  III:{ A:'high', B:'medium', C:'medium', D:'low', E:'low' },
  IV: { A:'medium', B:'low', C:'low', D:'low', E:'low' }
};

export const DEA_SEVERITY = {
  I:'Catastrophic', II:'Critical', III:'Moderate', IV:'Negligible'
};
export const DEA_PROBABILITY = {
  A:'Frequent', B:'Likely', C:'Occasional', D:'Seldom', E:'Rarely'
};

export function deaRiskLevel(severity, probability) {
  return DEA_RISK_MATRIX[severity]?.[probability] || null;
}

export function renderDeaRiskMatrix(selectedSeverity='', selectedProbability='') {
  const probabilities = Object.entries(DEA_PROBABILITY);
  const rows = Object.entries(DEA_SEVERITY).map(([severity,label]) => {
    const cells = probabilities.map(([probability]) => {
      const level = deaRiskLevel(severity, probability);
      const selected = severity === selectedSeverity && probability === selectedProbability ? ' selected' : '';
      return `<td class="risk-cell risk-${level}${selected}" data-severity="${severity}" data-probability="${probability}"><strong>${level.replaceAll('_',' ')}</strong></td>`;
    }).join('');
    return `<tr><th scope="row">${severity} — ${label}</th>${cells}</tr>`;
  }).join('');
  return `<div class="dea-matrix-wrap"><table class="dea-matrix"><caption>DEA™ Risk Assessment Matrix — Severity × Probability</caption><thead><tr><th>Severity / Probability</th>${probabilities.map(([key,label])=>`<th>${key} — ${label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><p class="dea-matrix-note">Color is supplemental. Every cell carries a written risk classification.</p></div>`;
}
