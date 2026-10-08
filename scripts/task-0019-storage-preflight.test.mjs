import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectEvidenceStorage } from './task-0019-storage-preflight.mjs';

test('read-only preflight reports reachable table without writes',async()=>{
 const operations=[];
 const client={from(table){operations.push(['from',table]);return {select(cols){operations.push(['select',cols]);return {async limit(n){operations.push(['limit',n]);return {data:[],error:null};}};}};}};
 const result=await inspectEvidenceStorage(client);
 assert.equal(result.ready,true);
 assert.deepEqual(operations.map(x=>x[0]),['from','select','limit']);
 assert.equal(operations[0][1],'sync_evidence_inbox');
});
test('read-only preflight fails closed on inaccessible table',async()=>{
 const client={from(){return {select(){return {async limit(){return {data:null,error:{message:'permission denied'}};}};}};}};
 const result=await inspectEvidenceStorage(client);
 assert.equal(result.ready,false);
 assert.equal(result.tableReadable,false);
});
test('read-only preflight fails closed on malformed response',async()=>{
 const client={from(){return {select(){return {async limit(){return {data:null,error:null};}};}};}};
 assert.equal((await inspectEvidenceStorage(client)).ready,false);
});
