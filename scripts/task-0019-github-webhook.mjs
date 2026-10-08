// TASK-0019 — isolated GitHub webhook intake; no persistence or task mutations.
// Call only behind an HTTPS endpoint with a configured, nonempty webhook secret.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { normalizeEvidence } from './task-0019-sync-evidence.mjs';

const MAX_BYTES = 1024 * 1024;
const DELIVERY = /^[0-9a-fA-F-]{1,80}$/;
const SHA256 = /^sha256=([a-f0-9]{64})$/i;
const EVENTS = new Set(['push', 'pull_request']);

export function intakeGithubWebhook({ rawBody, headers, secret }) {
  if (typeof secret !== 'string' || !secret) throw new Error('Webhook secret required');
  if (!Buffer.isBuffer(rawBody)) throw new TypeError('Raw body Buffer required');
  if (rawBody.length > MAX_BYTES) throw new Error('Payload too large');
  const h = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const signature = String(h['x-hub-signature-256'] || '');
  const match = SHA256.exec(signature);
  if (!match) throw new Error('Missing or invalid signature');
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const actual = Buffer.from(match[1], 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Signature verification failed');
  const eventType = String(h['x-github-event'] || '');
  const delivery = String(h['x-github-delivery'] || '');
  if (!DELIVERY.test(delivery)) throw new Error('Invalid delivery ID');
  if (!EVENTS.has(eventType)) throw new Error('Unsupported event type');
  const payload = JSON.parse(rawBody.toString('utf8'));
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload');
  const repo = payload.repository?.full_name;
  if (repo !== 'Faith-Man/dims-dashboard') throw new Error('Unexpected repository');
  let description, reference;
  if (eventType === 'push') {
    description = (payload.commits || []).map(c => String(c.message || '')).join(' ').slice(0, 4000);
    reference = String(payload.compare || '');
  } else {
    description = String(payload.pull_request?.title || '') + ' ' + String(payload.pull_request?.body || '');
    reference = String(payload.pull_request?.html_url || '');
  }
  return normalizeEvidence({ provider: 'github', eventId: delivery, description, reference });
}
