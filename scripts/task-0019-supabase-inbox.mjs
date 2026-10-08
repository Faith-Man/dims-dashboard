// TASK-0019 — Supabase persistence adapter for a private server-side gateway.
// The adapter never updates TETELESTAI tasks. Caller must provide an authenticated,
// least-privilege database client and provision the reviewed private table separately.
import { intakeGithubWebhook } from './task-0019-github-webhook.mjs';

export class SupabaseEvidenceInbox {
  constructor(client) {
    if (!client || typeof client.from !== 'function') throw new TypeError('Server-side database client required');
    this.client = client;
  }
  async receiveGithub(args) {
    // No database access occurs before HMAC and repository verification.
    const evidence = intakeGithubWebhook(args);
    const row = {
      provider: evidence.provider,
      event_id: evidence.eventId,
      reference: evidence.reference,
      description: evidence.description,
      task_numbers: evidence.taskNumbers,
      disposition: evidence.disposition,
      review_state: 'unreviewed',
      verified_closed: false
    };
    const { data, error } = await this.client.from('sync_evidence_inbox')
      .upsert(row, { onConflict: 'provider,event_id', ignoreDuplicates: true })
      .select('provider,event_id,review_state,verified_closed')
      .maybeSingle();
    if (error) throw new Error('Evidence persistence failed');
    return { accepted: Boolean(data), duplicate: !data, evidence };
  }
}
