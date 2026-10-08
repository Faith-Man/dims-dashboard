// TASK-0019 — in-memory review queue contract for isolated tests only.
// Production must replace this adapter with a durable transactional store.
import { intakeGithubWebhook } from './task-0019-github-webhook.mjs';

export class EvidenceReviewQueue {
  #events = new Map();
  receiveGithub(args) {
    // Authentication and provider checks run before any state change.
    const evidence = intakeGithubWebhook(args);
    const previous = this.#events.get(evidence.dedupeKey);
    if (previous) return { accepted: false, duplicate: true, evidence: previous };
    const record = Object.freeze({ ...evidence, reviewState: 'unreviewed' });
    this.#events.set(evidence.dedupeKey, record);
    return { accepted: true, duplicate: false, evidence: record };
  }
  list() { return [...this.#events.values()]; }
  get size() { return this.#events.size; }
}
