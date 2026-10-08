import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { intakeGithubWebhook } from './task-0019-github-webhook.mjs';

const secret = 'local-test-secret';
const payload = { repository: { full_name: 'Faith-Man/dims-dashboard' }, commits: [{ message: 'Work on TASK-0019' }], compare: 'https://github.com/Faith-Man/dims-dashboard/compare/abc...def' };
function signed(data = payload, overrides = {}) {
  const rawBody = Buffer.from(JSON.stringify(data));
  const signature = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex');
  return { rawBody, secret, headers: { 'X-Hub-Signature-256': signature, 'X-GitHub-Event': 'push', 'X-GitHub-Delivery': 'd123-1234', ...overrides } };
}
test('valid signed event becomes review-only evidence', () => {
 const result = intakeGithubWebhook(signed());
 assert.equal(result.disposition, 'pending_review');
 assert.deepEqual(result.taskNumbers, ['TASK-0019']);
 assert.equal(result.verifiedClosed, false);
 assert.equal(result.proposedStatus, null);
});
test('rejects tampered signature', () => {
 const input = signed(); input.rawBody = Buffer.from(JSON.stringify({...payload, commits: [{message:'tampered'}]}));
 assert.throws(() => intakeGithubWebhook(input), /Signature verification failed/);
});
test('rejects missing secret and signature', () => {
 assert.throws(() => intakeGithubWebhook({...signed(), secret:''}), /secret required/);
 assert.throws(() => intakeGithubWebhook(signed(payload, {'X-Hub-Signature-256':''})), /signature/);
});
test('rejects unexpected repo', () => {
 assert.throws(() => intakeGithubWebhook(signed({...payload, repository:{full_name:'other/repo'}})), /Unexpected repository/);
});
test('rejects unsupported event and oversized payload', () => {
 assert.throws(() => intakeGithubWebhook(signed(payload, {'X-GitHub-Event':'workflow_run'})), /Unsupported event/);
 assert.throws(() => intakeGithubWebhook({...signed(),rawBody:Buffer.alloc(1024*1024+1)}), /Payload too large/);
});
test('valid PR event extracts task ID but does not close', () => {
 const data={repository:{full_name:'Faith-Man/dims-dashboard'},pull_request:{title:'TASK-0077 changes',body:'Review only',html_url:'https://github.com/Faith-Man/dims-dashboard/pull/65'}};
 const result=intakeGithubWebhook(signed(data,{'X-GitHub-Event':'pull_request'}));
 assert.deepEqual(result.taskNumbers,['TASK-0077']);
 assert.equal(result.verifiedClosed,false);
});
