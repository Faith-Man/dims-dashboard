// TASK-0019 — read-only readiness inspection; no migrations or task writes.
// Requires a trusted server-side Supabase client. This checks the Data API
// visibility of the proposed evidence table, not full RLS/grant correctness.
export async function inspectEvidenceStorage(client) {
 if (!client || typeof client.from !== 'function') throw new TypeError('Server-side client required');
 const result = await client.from('sync_evidence_inbox')
   .select('provider,event_id,review_state,verified_closed')
   .limit(1);
 if (result.error) {
   return Object.freeze({ready:false,tableReadable:false,reason:'Evidence table unavailable or inaccessible'});
 }
 if (!Array.isArray(result.data)) {
   return Object.freeze({ready:false,tableReadable:false,reason:'Unexpected read-back response'});
 }
 return Object.freeze({ready:true,tableReadable:true,reason:'Read-only table query succeeded; write and RLS verification still required'});
}
