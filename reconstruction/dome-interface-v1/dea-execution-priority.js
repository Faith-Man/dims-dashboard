// DIMS / DEA™ execution-priority model
// RAC remains the primary risk assessment. Impact is the DIMS analogue for breadth of consequence;
// it is NOT Air Force personnel Exposure and this module does not label the result APN.

export const DIMS_IMPACT = Object.freeze({
  5: { key: 'enterprise', label: 'Enterprise', definition: 'Broad DIMS/DOME or mission-critical effect; many dependent operations may be affected.' },
  4: { key: 'major', label: 'Major', definition: 'Affects multiple projects, systems, users, or important dependencies.' },
  3: { key: 'moderate', label: 'Moderate', definition: 'Significant effect on one project/system or several related tasks.' },
  2: { key: 'limited', label: 'Limited', definition: 'Localized effect with few downstream consequences.' },
  1: { key: 'minimal', label: 'Minimal', definition: 'Isolated item with little effect beyond itself.' }
});

export function racNotation(row) {
  const rac = Number(row.system_rac);
  if (!rac) return '—';
  const severity = row.risk_severity || '—';
  const probability = row.risk_probability || '—';
  return `${rac} (${severity}, ${probability})`;
}

export function impactScore(row) {
  const n = Number(row.impact_level ?? row.impact_score ?? 0);
  return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
}

// Impact is one governed DEA factor. Existing deadline, follow-up, readiness, age,
// ownership, dependencies, and executive override logic remain authoritative inputs.
export function impactPriorityPoints(row) {
  return ({ 5: 150, 4: 110, 3: 70, 2: 35, 1: 10 })[impactScore(row)] || 0;
}

export function deaPriorityDisclosure(row, rankInfo = {}) {
  const impact = DIMS_IMPACT[impactScore(row)];
  return {
    rac: racNotation(row),
    executionRank: row._rank ?? '—',
    impact: impact ? `${impactScore(row)} — ${impact.label}` : 'Not assessed',
    impactDefinition: impact?.definition || 'Impact has not yet been assessed.',
    score: rankInfo.score ?? null,
    reason: rankInfo.reason || 'Standard DEA execution queue'
  };
}
