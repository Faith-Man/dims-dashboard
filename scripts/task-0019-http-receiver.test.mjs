import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createEvidenceServer } from './task-0019-http-receiver.mjs';

test('HTTP receiver accepts signed delivery and acknowledges replay', async () => {
 const directory = await mkdtemp(join(tmpdir(),'task-0019-http-'));
 const secret = 'test-secret';
 const server = createEvidenceServer({ secret, directory });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 try {
  const port=server.address().port;
  const body=JSON.stringify({repository:{full_name:'Faith-Man/dims-dashboard'},commits:[{message:'TASK-0019'}]});
  const signature='sha256='+createHmac('sha256',secret).update(body).digest('hex');
  const url='http://127.0.0.1:'+port+'/webhooks/github';
  const headers={'x-hub-signature-256':signature,'x-github-event':'push','x-github-delivery':'abc123-def456'};
  const first=await fetch(url,{method:'POST',body,headers});
  assert.equal(first.status,202);
  const second=await fetch(url,{method:'POST',body,headers});
  assert.equal(second.status,200);
  const invalid=await fetch(url,{method:'POST',body,headers:{...headers,'x-hub-signature-256':'sha256='+'0'.repeat(64)}});
  assert.equal(invalid.status,401);
  const unknown=await fetch('http://127.0.0.1:'+port+'/other');
  assert.equal(unknown.status,404);
 } finally {
  await new Promise(resolve=>server.close(resolve));
  await rm(directory,{recursive:true,force:true});
 }
});
