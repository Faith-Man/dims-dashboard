import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEvidence, collectEvidence } from './task-0019-sync-evidence.mjs';
test('single task is pending review, never complete', () => {
 const e = normalizeEvidence({provider:'github',eventId:'push-123',description:'Implements TASK-0019'});
 assert.deepEqual(e.taskNumbers,['TASK-0019']);
 assert.equal(e.disposition,'pending_review');
 assert.equal(e.proposedStatus,null);
 assert.equal(e.verifiedClosed,false);
});
test('ambiguous task IDs require manual matching', () => {
 const e=normalizeEvidence({provider:'cloudflare',eventId:'deploy-1',description:'TASK-0019 and TASK-0077'});
 assert.equal(e.disposition,'needs_manual_matching');
});
test('duplicate provider event IDs are deduplicated', () => {
 const x={provider:'github',eventId:'push-123',description:'TASK-0019'};
 assert.equal(collectEvidence([x,x]).length,1);
});
test('unsupported providers and empty IDs fail closed', () => {
 assert.throws(()=>normalizeEvidence({provider:'other',eventId:'abc'}));
 assert.throws(()=>normalizeEvidence({provider:'github',eventId:''}));
});
