import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DurableEvidenceInbox } from './task-0019-durable-inbox.mjs';

function signed(delivery='delivery-1') {
 const secret='local-secret';
 const rawBody=Buffer.from(JSON.stringify({repository:{full_name:'Faith-Man/dims-dashboard'},commits:[{message:'TASK-0019 evidence'}]}));
 return {rawBody,secret,headers:{'x-hub-signature-256':'sha256='+createHmac('sha256',secret).update(rawBody).digest('hex'),'x-github-event':'push','x-github-delivery':delivery}};
}
test('evidence persists across inbox instances, without status mutation', async () => {
 const dir=await mkdtemp(join(tmpdir(),'task-0019-'));
 try {
  const first=new DurableEvidenceInbox(dir);
  assert.equal((await first.receiveGithub(signed())).accepted,true);
  const second=new DurableEvidenceInbox(dir);
  const saved=await second.list();
  assert.equal(saved.length,1);
  assert.equal(saved[0].reviewState,'unreviewed');
  assert.equal(saved[0].verifiedClosed,false);
  assert.equal((await second.receiveGithub(signed())).duplicate,true);
  assert.equal((await first.list()).length,1);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test('invalid signature does not write evidence', async () => {
 const dir=await mkdtemp(join(tmpdir(),'task-0019-'));
 try {
  const inbox=new DurableEvidenceInbox(dir);
  const bad=signed('delivery-2');
  bad.headers['x-hub-signature-256']='sha256='+'0'.repeat(64);
  await assert.rejects(inbox.receiveGithub(bad),/Signature verification failed/);
  assert.deepEqual(await inbox.list(),[]);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
