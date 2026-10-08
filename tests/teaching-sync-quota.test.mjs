import test from 'node:test';
import assert from 'node:assert/strict';
import { createHarness } from './helpers/apps-script-teaching-harness.mjs';

// Arrays built inside the VM context have a different prototype; compare as plain JSON.
const plain = v => JSON.parse(JSON.stringify(v));
const settle = (h, runs = 6) => { for (let i = 0; i < runs; i++) h.gas.processAutomaticTeachingTwoWaySync({}); };

function production() {
  const h = createHarness();
  for (let i = 1; i <= 77; i++) h.addTeaching('T' + String(i).padStart(3, '0'));
  for (let i = 1; i <= 3; i++) h.addTeaching('U' + i, { mode: 'unenrolled', driveBody: 'edited in Drive ' + i });
  return h;
}

test('empty candidate set costs a single request', () => {
  const h = createHarness();
  const result = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.equal(result.processed, 0);
  assert.equal(h.fetchCount(), 1);
});

test('settled teachings cost two requests per run and no Docs API calls', () => {
  const h = production();
  settle(h);
  h.resetCounters();
  const result = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.equal(result.processed, 0);
  assert.equal(result.unchanged_skipped, 80);
  assert.equal(h.counters.supabase, 2);
  assert.equal(h.counters.docsApi, 0);
});

test('full comparisons per run are capped and the rest are deferred, not dropped', () => {
  const h = production();
  const first = h.gas.processAutomaticTeachingTwoWaySync(25);
  assert.equal(first.processed, 25);
  assert.equal(first.deferred, 55);
  // Unenrolled teachings are still prioritized.
  assert.deepEqual(plain(first.results.slice(0, 3).map(r => r.asset_code)), ['U1', 'U2', 'U3']);
  settle(h);
  assert.equal(h.gas.processAutomaticTeachingTwoWaySync({}).unchanged_skipped, 80);
});

test('a Supabase edit is pushed to Drive exactly once and then settles', () => {
  const h = production();
  settle(h);
  h.db.teachings.find(t => t.id === 'T010').content_md = 'Rewritten in OrEl';

  const run = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.deepEqual(plain(run.results.map(r => [r.asset_code, r.action])), [['T010', 'supabase_to_drive_executed']]);
  assert.equal(h.driveBody('T010'), 'Rewritten in OrEl');
  const registry = h.db.asset_registry.find(r => r.asset_code === 'T010');
  assert.equal(registry.supabase_content_hash, h.hashBody('Rewritten in OrEl'));
  assert.equal(registry.drive_body_hash, h.hashBody('Rewritten in OrEl'));

  const recheck = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.deepEqual(plain(recheck.results.map(r => r.action)), ['no_op']);
  assert.equal(h.gas.processAutomaticTeachingTwoWaySync({}).processed, 0);
});

test('a Drive edit is pulled into Supabase exactly once', () => {
  const h = production();
  settle(h);
  h.editDrive('T020', 'Edited in Google Docs');

  const run = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.deepEqual(plain(run.results.map(r => [r.asset_code, r.action])), [['T020', 'drive_to_supabase_executed']]);
  assert.equal(h.db.teachings.find(t => t.id === 'T020').content_md, 'Edited in Google Docs');
  settle(h, 2);
  assert.equal(h.gas.processAutomaticTeachingTwoWaySync({}).processed, 0);
});

test('fixing an unenrolled mismatch in Drive is noticed and auto-enrolls', () => {
  const h = production();
  settle(h);
  h.editDrive('U2', 'Line one\nLine two U2');
  const run = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.deepEqual(plain(run.results.map(r => [r.asset_code, r.action])), [['U2', 'auto_enrolled_two_way']]);
  assert.equal(h.db.asset_registry.find(r => r.asset_code === 'U2').sync_mode, 'two_way');
});

test('an overlapping run exits without any request', () => {
  const h = production();
  h.props.set('TEACHING_SYNC_LEASE_TWO_WAY', String(Date.parse('2026-10-08T13:00:00Z')));
  const result = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.equal(result.skipped, 'previous_run_still_active');
  assert.equal(h.fetchCount(), 0);
});

test('an expired lease from a crashed run does not block the worker', () => {
  const h = production();
  h.props.set('TEACHING_SYNC_LEASE_TWO_WAY', String(Date.parse('2026-10-08T11:00:00Z')));
  assert.equal(h.gas.processAutomaticTeachingTwoWaySync({}).skipped, undefined);
  assert.equal(h.props.has('TEACHING_SYNC_LEASE_TWO_WAY'), false);
});

test('quota exhaustion pauses cleanly and pending work resumes afterwards', () => {
  const h = production();
  settle(h);
  h.db.teachings.find(t => t.id === 'T030').content_md = 'Pending change';
  h.editDrive('T040', 'Pending Drive change');

  h.faults.quotaAfter = h.fetchCount() + 3; // dies inside the first comparison
  const stopped = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.equal(stopped.stopped, 'quota_exhausted');
  assert.ok(stopped.resume_after);

  // While paused: no requests at all, repeated firings do not fail.
  h.faults.quotaAfter = Infinity;
  h.resetCounters();
  for (let i = 0; i < 5; i++) assert.equal(h.gas.processAutomaticTeachingTwoWaySync({}).skipped, 'quota_paused');
  assert.equal(h.fetchCount(), 0);

  // Pause expires: both pending changes are synchronized once.
  h.advance(2 * 60 * 60 * 1000 + 1);
  const resumed = h.gas.processAutomaticTeachingTwoWaySync({});
  const actions = Object.fromEntries(resumed.results.map(r => [r.asset_code, r.action]));
  assert.equal(actions.T030, 'supabase_to_drive_executed');
  assert.equal(actions.T040, 'drive_to_supabase_executed');
  assert.equal(h.driveBody('T030'), 'Pending change');
  assert.equal(h.db.teachings.find(t => t.id === 'T040').content_md, 'Pending Drive change');
  assert.equal(h.db.teaching_sync_conflicts.length, 0);
});

test('quota exhaustion on the first request pauses instead of throwing', () => {
  const h = production();
  h.faults.quotaAfter = 0;
  const result = h.gas.processAutomaticTeachingTwoWaySync({});
  assert.equal(result.skipped, 'quota_exhausted');
  assert.ok(Number(h.props.get('TEACHING_SYNC_QUOTA_PAUSED_UNTIL')) > Date.parse('2026-10-08T12:00:00Z'));
  assert.equal(h.props.has('TEACHING_SYNC_LEASE_TWO_WAY'), false);
});

test('transient read failures are retried a bounded number of times; writes are not', () => {
  const h = createHarness();
  h.faults.transient.push({ method: 'get', code: 503, times: 1 });
  assert.equal(h.gas.teachingSyncRequest_('sync_log', 'get', null, 'limit=1').code, 200);

  h.faults.transient.push({ method: 'get', code: 503, times: 5 });
  h.resetCounters();
  assert.equal(h.gas.teachingSyncRequest_('sync_log', 'get', null, 'limit=1').code, 503);
  assert.equal(h.counters.supabase, 3);

  h.faults.transient.length = 0;
  h.faults.transient.push({ method: 'post', code: 503, times: 1 });
  h.resetCounters();
  assert.equal(h.gas.teachingSyncRequest_('sync_log', 'post', { a: 1 }, null).code, 503);
  assert.equal(h.counters.supabase, 1);
});

test('queue worker: a quota-interrupted job is re-queued and processed once', () => {
  const h = createHarness();
  h.db.sync_log.push({ id: 'job-1', asset_code: 'T001', sync_status: 'queued', source: 'TeachingArtifactSyncTrigger', created_at: '1' });
  h.db.sync_log.push({ id: 'job-2', asset_code: 'T002', sync_status: 'queued', source: 'TeachingArtifactSyncTrigger', created_at: '2' });
  h.addTeaching('T001');
  h.addTeaching('T002');

  // Drive persistence is exercised elsewhere; here only the queue control flow is under test.
  const persisted = [];
  let quotaOnce = true;
  h.gas.persistTeachingToYaratheke_ = t => {
    if (quotaOnce) { quotaOnce = false; throw new Error('Service invoked too many times for one day: urlfetch.'); }
    persisted.push(t.id);
    return { file_id: 'doc-' + t.id, url: 'u' };
  };
  h.gas.reconcileTeachingAssetRegistry_ = () => ({ action: 'updated' });
  h.gas.publishTeachingMarkdownIfConfigured_ = () => ({ status: 'not_applicable_or_not_configured' });
  h.gas.verifyTeachingPersistence_ = () => ({ verified: true });

  const first = h.gas.processTeachingArtifactSyncQueue({});
  assert.equal(first.results[0].status, 'interrupted_quota');
  assert.equal(first.remaining_queued, 1);
  assert.equal(h.db.sync_log.find(j => j.id === 'job-1').sync_status, 'processing');
  assert.equal(h.db.sync_log.find(j => j.id === 'job-2').sync_status, 'queued');
  assert.equal(h.gas.processTeachingArtifactSyncQueue({}).skipped, 'quota_paused');

  h.advance(2 * 60 * 60 * 1000 + 1);
  const resumed = h.gas.processTeachingArtifactSyncQueue({});
  assert.deepEqual(plain(resumed.results.map(r => [r.job_id, r.status])), [['job-1', 'verified'], ['job-2', 'verified']]);
  assert.deepEqual(plain(persisted), ['T001', 'T002']);
  assert.equal(h.gas.processTeachingArtifactSyncQueue({}).processed, 0);
});
