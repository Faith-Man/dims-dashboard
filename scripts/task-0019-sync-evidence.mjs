// TASK-0019: Pure evidence normalization; no credentials, network, or database writes.
// All events remain proposals for governed review, never automatic completion.
const TASK_PATTERN = /\bTASK-\d{4,}\b/g;
const ALLOWED = new Set(['github','cloudflare']);
export function normalizeEvidence(input) {
  if (!input || typeof input !== 'object') throw new TypeError('Evidence object required');
  const provider = String(input.provider || '').toLowerCase();
  if (!ALLOWED.has(provider)) throw new Error('Unsupported provider');
  const eventId = String(input.eventId || '').trim();
  if (!/^[a-zA-Z0-9_.:\/-]{1,180}$/.test(eventId)) throw new Error('Invalid event identifier');
  const reference = String(input.reference || '').slice(0, 2048);
  const description = String(input.description || '').slice(0, 4000);
  const tasks = [...new Set((description + ' ' + reference).match(TASK_PATTERN) || [])];
  return Object.freeze({
    provider, eventId, dedupeKey: provider + ':' + eventId,
    reference, description, taskNumbers: tasks,
    disposition: tasks.length === 1 ? 'pending_review' : 'needs_manual_matching',
    proposedStatus: null, verifiedClosed: false
  });
}
export function collectEvidence(events) {
  const seen = new Set();
  return events.map(normalizeEvidence).filter(event => {
    if (seen.has(event.dedupeKey)) return false;
    seen.add(event.dedupeKey);
    return true;
  });
}
