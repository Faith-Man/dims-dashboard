import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { EvidenceReviewQueue } from './task-0019-evidence-review-queue.mjs';
const secret='test-secret';
function input(delivery='abc-123', description='TASK-0019') {
 const rawBody=Buffer.from(JSON.stringify({repository:{full_name:'Faith-Man/dims-dashboard'},commits:[{message:description}]}));
 return {rawBody,secret,headers:{'x-hub-signature-256':'sha256='+createHmac('sha256',secret).update(rawBody).digest('hex'),'x-github-event':'push','x-github-delivery':delivery}};
}
test('valid signed evidence is queued for review, never completion',()=>{
 const q=new EvidenceReviewQueue();
 const r=q.receiveGithub(input());
 assert.equal(r.accepted,true);
 assert.equal(q.size,1);
 assert.equal(q.list()[0].reviewState,'unreviewed');
 assert.equal(q.list()[0].verifiedClosed,false);
});
test('replayed delivery does not duplicate evidence',()=>{
 const q=new EvidenceReviewQueue();
 q.receiveGithub(input());
 const r=q.receiveGithub(input());
 assert.equal(r.duplicate,true);
 assert.equal(q.size,1);
});
test('bad signature cannot create evidence',()=>{
 const q=new EvidenceReviewQueue();
 const bad=input();
 bad.headers['x-hub-signature-256']='sha256='+'0'.repeat(64);
 assert.throws(()=>q.receiveGithub(bad),/Signature verification failed/);
 assert.equal(q.size,0);
});
test('multiple task IDs stay unreviewed',()=>{
 const q=new EvidenceReviewQueue();
 q.receiveGithub(input('abc-456','TASK-0019 and TASK-0077'));
 assert.equal(q.list()[0].disposition,'needs_manual_matching');
 assert.equal(q.list()[0].proposedStatus,null);
});
