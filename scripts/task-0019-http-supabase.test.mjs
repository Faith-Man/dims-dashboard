import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createEvidenceServer } from './task-0019-http-receiver.mjs';
import { SupabaseEvidenceInbox } from './task-0019-supabase-inbox.mjs';

test('HTTP receiver writes verified evidence through injected Supabase adapter', async () => {
 const records = new Map();
 const client = { from(table) {
   assert.equal(table, 'sync_evidence_inbox');
   return { select() { return { eq() { return this; }, async maybeSingle() { return {data:[...records.values()][0] || null,error:null}; } }; }, upsert(row, options) {
     assert.deepEqual(options, {onConflict:'provider,event_id',ignoreDuplicates:true});
     assert.equal(row.review_state,'unreviewed');
     assert.equal(row.verified_closed,false);
     const key=row.provider+':'+row.event_id;
     const duplicate=records.has(key);
     if(!duplicate) records.set(key,row);
     return { select() { return { async maybeSingle() {
       return { data: duplicate ? null : {provider:row.provider,event_id:row.event_id},error:null };
     }}; }};
   }};
 }};
 const secret='test-secret';
 const server=createEvidenceServer({secret,inbox:new SupabaseEvidenceInbox(client)});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const body=JSON.stringify({repository:{full_name:'Faith-Man/dims-dashboard'},commits:[{message:'TASK-0019 implementation evidence'}]});
  const headers={'x-github-event':'push','x-github-delivery':'abc-123','x-hub-signature-256':'sha256='+createHmac('sha256',secret).update(body).digest('hex')};
  const url='http://127.0.0.1:'+server.address().port+'/webhooks/github';
  assert.equal((await fetch(url,{method:'POST',headers,body})).status,202);
  assert.equal((await fetch(url,{method:'POST',headers,body})).status,200);
  assert.equal(records.size,1);
  assert.equal(records.get('github:abc-123').review_state,'unreviewed');
  assert.equal(records.get('github:abc-123').verified_closed,false);
 } finally { await new Promise(resolve=>server.close(resolve)); }
});
