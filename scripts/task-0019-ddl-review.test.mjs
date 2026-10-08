import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('proposed evidence DDL denies public roles and has review-only constraints', async () => {
 const sql = await readFile(new URL('../docs/governance/TASK-0019-EVIDENCE-DDL-REVIEW.sql', import.meta.url), 'utf8');
 assert.match(sql, /unique \(provider, event_id\)/i);
 assert.match(sql, /enable row level security/i);
 assert.match(sql, /force row level security/i);
 assert.match(sql, /revoke all on public\.sync_evidence_inbox from public, anon, authenticated/i);
 assert.match(sql, /review_state = 'unreviewed'/i);
 assert.match(sql, /verified_closed = false/i);
 assert.doesNotMatch(sql, /\b(update|delete|truncate)\s+(?:public\.)?(?:tetelestai_)?(?:tasks|projects)\b/i);
});
