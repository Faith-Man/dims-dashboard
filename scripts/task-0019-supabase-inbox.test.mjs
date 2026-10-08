import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { SupabaseEvidenceInbox } from './task-0019-supabase-inbox.mjs';

function signed() {
 const secret='test-secret';
 const rawBody=Buffer.from(JSON.stringify({repository:{full_name:'Faith-Man/dims-dashboard'},commits:[{message:'TASK-0019'}]}));
 return {secret,rawBody,headers:{'x-hub-signature-256':'sha256='+createHmac('sha256',secret).update(rawBody).digest('hex'),'x-github-event':'push','x-github-delivery':'abc-123'}};
}
test('signed event writes only review evidence, never tasks',async()=>{
 const calls=[];
 const client={from(table){calls.push(['from',table]);return {upsert(row,opts){calls.push(['upsert',row,opts]);return {select(){return {async maybeSingle(){return {data:{provider:'github',event_id:'abc-123',review_state:'unreviewed',verified_closed:false},error:null};}};}};}};}};
 const result=await new SupabaseEvidenceInbox(client).receiveGithub(signed());
 assert.equal(result.accepted,true);
 assert.deepEqual(calls.filter(c=>c[0]==='from').map(c=>c[1]),['sync_evidence_inbox']);
 assert.equal(calls[1][1].review_state,'unreviewed');
 assert.equal(calls[1][1].verified_closed,false);
});
test('invalid signature does not touch database',async()=>{
 let accessed=false;
 const client={from(){accessed=true;throw new Error('should not access database');}};
 const input=signed();input.headers['x-hub-signature-256']='sha256='+'0'.repeat(64);
 await assert.rejects(new SupabaseEvidenceInbox(client).receiveGithub(input),/Signature verification failed/);
 assert.equal(accessed,false);
});
test('duplicate requires verified database read-back',async()=>{
 const stored={provider:'github',event_id:'abc-123',review_state:'unreviewed',verified_closed:false};
 const client={from(){return {
  upsert(){return {select(){return {async maybeSingle(){return {data:null,error:null};}};}};},
  select(){return {eq(){return this;},async maybeSingle(){return {data:stored,error:null};}};}
 };}};
 const result=await new SupabaseEvidenceInbox(client).receiveGithub(signed());
 assert.equal(result.duplicate,true);
});
test('invisible duplicate must not be acknowledged',async()=>{
 const client={from(){return {
  upsert(){return {select(){return {async maybeSingle(){return {data:null,error:null};}};}};},
  select(){return {eq(){return this;},async maybeSingle(){return {data:null,error:null};}};}
 };}};
 await assert.rejects(new SupabaseEvidenceInbox(client).receiveGithub(signed()),/could not be verified/);
});
