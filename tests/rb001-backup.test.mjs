// RB-001 v3 backup engine — simulation tests against an in-memory Drive.
// Run: node --test tests/rb001-backup.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = fs.readFileSync(
  new URL('../enterprise/google-apps-script/rb001/BackupBuilder.gs', import.meta.url), 'utf8');
const NOTIFY = fs.readFileSync(
  new URL('../enterprise/google-apps-script/rb001/RB001Notification.gs', import.meta.url), 'utf8');

const SOURCE_ID = '1PMjJLQWLJqTmvQP53UBw3pyGdjhJxTtE';
const BACKUPS_ID = '1sW3qo0AovZ4MW74TpMUGPCEMfBDHlz2I';

class Kill extends Error {}

function makeWorld(startMs) {
  const world = {
    now: startMs, seq: 0, items: new Map(), props: new Map(), triggers: [],
    dead: false, killAfterCopies: null, copies: 0, poisonIds: new Set(), mails: [],
    lockHeld: false, triggerDelays: [], nameLookups: 0,
  };
  const tick = () => { if (world.dead) throw new Kill('killed'); world.now += 5; };
  const id = () => 'id' + (++world.seq);
  const iter = (arr) => { let i = 0; return { hasNext: () => i < arr.length, next: () => arr[i++] }; };
  const children = (pid, kind) => [...world.items.values()]
    .filter((x) => x.parent === pid && x.kind === kind && !x.trashed)
    .sort((a, b) => a.order - b.order);

  function wrapFolder(rec) {
    return {
      getId: () => (tick(), rec.id),
      getName: () => (tick(), rec.name),
      getDateCreated: () => (tick(), new Date(rec.created)),
      getFiles: () => (tick(), iter(children(rec.id, 'file').map(wrapFile))),
      getFolders: () => (tick(), iter(children(rec.id, 'folder').map(wrapFolder))),
      getFilesByName: (n) => (tick(), /\.json$/.test(n) || world.nameLookups++, iter(children(rec.id, 'file').filter((f) => f.name === n).map(wrapFile))),
      getFoldersByName: (n) => (tick(), iter(children(rec.id, 'folder').filter((f) => f.name === n).map(wrapFolder))),
      createFolder: (n) => (tick(), wrapFolder(addFolder(rec.id, n))),
      createFile: (n, content) => (tick(), wrapFile(addFile(rec.id, n, { content }))),
      setTrashed: (v) => { tick(); rec.trashed = v; },
    };
  }
  function wrapFile(rec) {
    return {
      getId: () => (tick(), rec.id),
      getName: () => (tick(), rec.name),
      getSize: () => (tick(), rec.size),
      getMimeType: () => (tick(), rec.mime),
      getLastUpdated: () => (tick(), new Date(rec.updated)),
      getDescription: () => (tick(), rec.description || null),
      setDescription: (d) => { tick(); rec.description = d; },
      getBlob: () => ({ getDataAsString: () => (tick(), rec.content) }),
      setContent: (c) => { tick(); rec.content = c; rec.updated = world.now; },
      makeCopy: (n, dest) => {
        tick();
        if (world.poisonIds.has(rec.id)) { world.dead = true; throw new Kill('timeout on poison file'); }
        const copy = addFile(dest.getId(), n, { size: rec.size, mime: rec.mime, content: rec.content, srcOf: rec.id });
        world.copies++;
        if (world.killAfterCopies !== null && world.copies >= world.killAfterCopies) {
          world.killAfterCopies = null; world.dead = true; throw new Kill('6-minute limit');
        }
        return wrapFile(copy);
      },
    };
  }
  function addFolder(parent, name, created) {
    const rec = { id: id(), kind: 'folder', parent, name, created: created ?? world.now, order: world.seq };
    world.items.set(rec.id, rec); return rec;
  }
  function addFile(parent, name, o = {}) {
    const rec = { id: id(), kind: 'file', parent, name, size: o.size ?? 100, mime: o.mime ?? 'text/plain',
      updated: o.updated ?? world.now, content: o.content ?? 'x', order: world.seq, srcOf: o.srcOf };
    world.items.set(rec.id, rec); return rec;
  }
  world.addFolder = addFolder; world.addFile = addFile;

  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(world.now); else super(...a); }
    static now() { return world.now; }
  }
  const pad = (n) => String(n).padStart(2, '0');
  const ctx = {
    Date: FakeDate, JSON, Math, Number, String, Object, Array, Error, encodeURIComponent, decodeURIComponent,
    Logger: { log: () => {} },
    console: { error: (m) => { world.lastError = m; }, log: () => {} },
    MimeType: { PLAIN_TEXT: 'text/plain' },
    Session: { getScriptTimeZone: () => 'UTC', getEffectiveUser: () => ({ getEmail: () => 'owner@example.test' }) },
    Utilities: {
      getUuid: () => 'uuid' + String(++world.seq).padStart(8, '0') + '-xxxx',
      formatDate: (d, tz, fmt) => {
        if (fmt === 'u') return String(d.getUTCDay() === 0 ? 7 : d.getUTCDay());
        if (fmt === "YYYY-'W'ww") return 'W' + Math.floor((Math.floor(d.getTime() / 86400000) + 4) / 7);
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}_${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}`;
      },
    },
    DriveApp: {
      getFolderById: (i) => { tick(); const r = world.items.get(i); if (!r || r.kind !== 'folder') throw new Error('no folder ' + i); return wrapFolder(r); },
      getFileById: (i) => { tick(); const r = world.items.get(i); if (!r || r.kind !== 'file') throw new Error('no file ' + i); return wrapFile(r); },
    },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (k) => (tick(), world.props.has(k) ? world.props.get(k) : null),
      setProperty: (k, v) => { tick(); world.props.set(k, v); },
      deleteProperty: (k) => { tick(); world.props.delete(k); },
    }) },
    LockService: { getScriptLock: () => ({ tryLock: () => !world.lockHeld, releaseLock: () => {} }) },
    ScriptApp: {
      getProjectTriggers: () => world.triggers.map((h) => ({ getHandlerFunction: () => h, _h: h })),
      deleteTrigger: (t) => { world.triggers.splice(world.triggers.indexOf(t._h), 1); },
      newTrigger: (h) => ({ timeBased: () => ({ after: (ms) => ({ create: () => { world.triggers.push(h); world.triggerDelays.push(ms); } }),
        everyMinutes: () => ({ create: () => world.triggers.push(h) }) }) }),
    },
    MailApp: { sendEmail: (to, subject, body) => world.mails.push({ to, subject, body }) },
  };
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n' + NOTIFY + '\nthis.__RB001 = RB001;', ctx);
  world.ctx = ctx;

  // Source tree: DIMS-v3 (fixed ID) with Backups (fixed ID) and content.
  world.items.set(SOURCE_ID, { id: SOURCE_ID, kind: 'folder', parent: null, name: 'DIMS-v3', created: 0, order: 0 });
  world.items.set(BACKUPS_ID, { id: BACKUPS_ID, kind: 'folder', parent: SOURCE_ID, name: 'Backups', created: 0, order: 0 });
  return world;
}

const T0 = Date.UTC(2026, 10, 23, 12, 0, 0); // Monday 2026-11-23

function seedSource(world) {
  const old = T0 - 30 * 86400000;
  const a = world.addFolder(SOURCE_ID, 'Artifacts');
  const b = world.addFolder(SOURCE_ID, 'Documents');
  const b1 = world.addFolder(b.id, 'Teachings');
  const b2 = world.addFolder(b.id, 'Teachings'); // duplicate folder name under one parent
  const n = world.addFolder(a.id, 'a/b slash name');
  const files = [];
  for (let i = 0; i < 12; i++) files.push(world.addFile(SOURCE_ID, 'root-' + i + '.txt', { updated: old }));
  for (let i = 0; i < 10; i++) files.push(world.addFile(a.id, 'art-' + i, { updated: old }));
  for (let i = 0; i < 6; i++) files.push(world.addFile(b1.id, 'teach-' + i, { updated: old }));
  files.push(world.addFile(b2.id, 'teach-dup', { updated: old }));
  files.push(world.addFile(b1.id, 'same-name', { updated: old }));
  files.push(world.addFile(b1.id, 'same-name', { updated: old })); // two source files, same name
  files.push(world.addFile(n.id, 'deep', { updated: old }));
  world.addFile(BACKUPS_ID, 'should-never-be-copied', { updated: T0 });
  world.addFolder(SOURCE_ID, 'EmptyFolder');
  return { a, b, b1, b2, n, files };
}

function drain(world, maxRuns = 200) {
  const c = world.ctx;
  for (let i = 0; i < maxRuns; i++) {
    world.dead = false;
    const job = c.readRB001Job_(c.getRB001BackupsFolder_());
    if (c.isRB001Terminal_(job)) return job;
    if (!world.triggers.includes('resumeRB001BackupJob')) throw new Error('worker chain broken');
    world.now += 60000;
    c.resumeRB001BackupJob();
  }
  throw new Error('did not finish');
}

const sourceFileCount = (world) => [...world.items.values()].filter((x) => x.kind === 'file' && !x.srcOf &&
  isUnder(world, x.parent, SOURCE_ID) && !isUnder(world, x.parent, BACKUPS_ID)).length;
function isUnder(world, id, ancestor) {
  for (let cur = id; cur; cur = world.items.get(cur)?.parent) if (cur === ancestor) return true;
  return false;
}
const filesIn = (world, folderId) => [...world.items.values()].filter((x) => x.kind === 'file' && !x.trashed &&
  isUnder(world, x.parent, folderId) && x.name !== 'backup_manifest.json');

test('full backup survives a mid-run kill, excludes Backups, and verifies', () => {
  const world = makeWorld(T0);
  seedSource(world);
  world.killAfterCopies = 7;
  const c = world.ctx;
  const started = c.startOrResumeRB001BackupJob();
  assert.equal(started.mode, 'FULL');
  assert.match(started.modeReason, /No verified baseline/);

  const job = drain(world);
  assert.equal(job.status, 'COMPLETED', JSON.stringify({e: job.errors, v: job.verification}));
  assert.equal(job.verificationStatus, 'VERIFIED');
  assert.equal(job.filesCopied, sourceFileCount(world));
  assert.ok(job.filesAlreadyPresent >= 1, 'the copy made just before the kill is recognised, not duplicated');
  const dest = filesIn(world, job.destinationFolderId);
  assert.equal(dest.length, sourceFileCount(world), 'no duplicates after resume');
  assert.ok(!dest.some((f) => f.name === 'should-never-be-copied'), 'Backups folder not copied into itself');
  assert.ok(![...world.items.values()].some((x) => x.kind === 'folder' && x.name === 'Backups' &&
    isUnder(world, x.parent, job.destinationFolderId)));
  assert.ok([...world.items.values()].some((x) => x.kind === 'folder' && x.name === 'EmptyFolder' &&
    x.parent === job.destinationFolderId), 'full backup keeps empty folders');
  assert.ok([...world.items.values()].some((x) => x.name === 'a/b slash name' && isUnder(world, x.parent, job.destinationFolderId)));
  assert.equal(job.mergedSourceFolders, 1);
  assert.ok(!world.triggers.includes('resumeRB001BackupJob'), 'worker trigger cleared when done');

  const index = c.readRB001JsonFile_(c.getRB001BackupsFolder_(), 'backup_storage_index.json');
  assert.equal(index.lastVerifiedBackup.jobId, job.jobId);
});

test('next day is incremental: only changed/new files, paths kept', () => {
  const world = makeWorld(T0);
  const { b1, files } = seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  drain(world);

  world.now = T0 + 86400000; // Tuesday
  world.items.get(files[0].id).updated = world.now - 1000;
  world.items.get(files[20].id).updated = world.now - 1000; // inside Documents/Teachings
  const newSub = world.addFolder(b1.id, 'New Study');
  world.addFile(newSub.id, 'fresh', { updated: world.now - 500 });

  const started = c.startOrResumeRB001BackupJob();
  assert.equal(started.mode, 'INCREMENTAL');
  assert.ok(started.destinationFolder.startsWith('INCR_BACKUP_'));
  const job = drain(world);
  assert.equal(job.verificationStatus, 'VERIFIED');
  assert.equal(job.filesCopied, 3);
  assert.equal(job.filesUnchanged, sourceFileCount(world) - 3);
  const dest = filesIn(world, job.destinationFolderId);
  assert.deepEqual(dest.map((f) => f.name).sort(), ['fresh', 'root-0.txt', files[20].name].sort());
  const fresh = dest.find((f) => f.name === 'fresh');
  const path = [];
  for (let cur = fresh.parent; cur !== job.destinationFolderId; cur = world.items.get(cur).parent) path.unshift(world.items.get(cur).name);
  assert.deepEqual(path, ['Documents', 'Teachings', 'New Study']);
  assert.equal(job.baseFullFolderId, c.readRB001JsonFile_(c.getRB001BackupsFolder_(), 'backup_storage_index.json').lastVerifiedBackup.baseFullFolderId);
});

test('Sunday run is FULL even with a recent baseline', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  drain(world);
  world.now = Date.UTC(2026, 10, 29, 12, 0, 0); // Sunday
  assert.equal(c.startOrResumeRB001BackupJob().mode, 'FULL');
});

test('a file that kills every run is skipped after 3 attempts; job not marked VERIFIED', () => {
  const world = makeWorld(T0);
  const { files } = seedSource(world);
  world.poisonIds.add(files[3].id);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  const job = drain(world);
  assert.equal(job.status, 'COMPLETED_WITH_ERRORS');
  assert.equal(job.verificationStatus, 'COUNT_MISMATCH');
  assert.equal(job.filesCopied, sourceFileCount(world) - 1);
  assert.ok(job.errors.some((e) => /Skipped after 3/.test(e.error)));

  // An unverified run is never used as the incremental baseline: next run is FULL again.
  world.now += 86400000;
  world.poisonIds.clear();
  const next = c.startOrResumeRB001BackupJob();
  assert.equal(next.mode, 'FULL');
  assert.match(next.modeReason, /No verified baseline/);
  const index = c.readRB001JsonFile_(c.getRB001BackupsFolder_(), 'backup_storage_index.json');
  assert.equal(index.lastVerifiedBackup, null);
});

test('legacy v2.0 job in progress (like Nov 24) finishes under v3', () => {
  const world = makeWorld(T0);
  const { files } = seedSource(world);
  const c = world.ctx;
  const dest = world.addFolder(BACKUPS_ID, 'FULL_BACKUP_2026-11-24_07-33-59_2d302dc2');
  for (let i = 0; i < 5; i++) world.addFile(dest.id, files[i].name, { srcOf: files[i].id });
  const legacy = {
    schemaVersion: '2.0', baselineId: 'RB-001', jobId: 'RB001-2d302dc2-legacy', status: 'RUNNING',
    verificationStatus: 'NOT_TESTED', createdAt: new Date(T0 - 86400000).toISOString(),
    updatedAt: new Date(T0 - 80000000).toISOString(), sourceFolderId: SOURCE_ID,
    destinationFolderId: dest.id, destinationFolder: dest.name,
    queue: files.slice(5, 12).map((f) => ({ type: 'file', sourceId: f.id, destinationId: dest.id, relativePath: '' })),
    filesCopied: 5, foldersCreated: 0, measuredBytes: 500, unmeasuredGoogleNativeFiles: 0, errors: [],
  };
  world.addFile(BACKUPS_ID, 'backup_job_state.json', { content: JSON.stringify(legacy) });

  const resumed = c.startOrResumeRB001BackupJob();
  assert.equal(resumed.jobId, legacy.jobId, 'resumes, does not start a new job');
  const job = drain(world);
  assert.equal(job.filesCopied, 12);
  assert.equal(job.verificationStatus, 'VERIFIED');
  const index = c.readRB001JsonFile_(c.getRB001BackupsFolder_(), 'backup_storage_index.json');
  assert.equal(index.lastVerifiedBackup.jobId, legacy.jobId);
  world.now += 86400000;
  assert.equal(c.startOrResumeRB001BackupJob().mode, 'INCREMENTAL');
});

test('retention: DRY_RUN lists only; LIVE trashes outside 7 daily + 4 weekly; legacy folders untouched', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  const day = 86400000;
  // 28 daily full backups (Oct 26 .. Nov 22), each with a manifest, plus legacy folders.
  for (let d = 28; d >= 1; d--) {
    const f = world.addFolder(BACKUPS_ID, 'FULL_BACKUP_old_' + d, T0 - d * day);
    world.addFile(f.id, 'backup_manifest.json', { content: '{}' });
  }
  const partial = world.addFolder(BACKUPS_ID, 'FULL_BACKUP_partial_old', T0 - 40 * day); // no manifest
  world.addFolder(BACKUPS_ID, 'BACKUP_2026-06-30', T0 - 150 * day);
  world.addFolder(BACKUPS_ID, 'ENTERPRISE_BACKUP_2026-07-01', T0 - 140 * day);

  const plan = c.previewRB001Retention();
  const live = () => [...world.items.values()].filter((x) => x.kind === 'folder' && x.parent === BACKUPS_ID && !x.trashed);
  assert.equal(live().length, 28 + 1 + 2, 'preview trashes nothing');
  assert.equal(plan.keep.length + plan.trash.length, 29);
  assert.equal(plan.legacyNotManaged.length, 2);
  assert.ok(plan.trash.some((e) => e.id === partial.id));
  const keptNames = plan.keep.map((e) => e.name);
  for (let d = 1; d <= 7; d++) assert.ok(keptNames.includes('FULL_BACKUP_old_' + d));

  // A verified run in DRY_RUN mode still trashes nothing.
  c.startOrResumeRB001BackupJob();
  drain(world);
  assert.equal(live().length, 28 + 1 + 2 + 1);

  // Owner enables LIVE; next verified run applies retention.
  c.enableRB001RetentionLive();
  world.now += day;
  c.startOrResumeRB001BackupJob();
  const job = drain(world);
  assert.equal(job.verificationStatus, 'VERIFIED');
  const remaining = live();
  const managed = remaining.filter((x) => /^(FULL|INCR)_BACKUP_/.test(x.name));
  assert.ok(managed.length <= 7 + 4 + 1, 'kept ' + managed.length);
  assert.ok(remaining.some((x) => x.name === 'BACKUP_2026-06-30'));
  assert.ok(remaining.some((x) => x.name === 'ENTERPRISE_BACKUP_2026-07-01'));
  assert.ok(remaining.some((x) => x.id === job.destinationFolderId));
  const trashed = [...world.items.values()].filter((x) => x.trashed);
  assert.ok(trashed.length > 0 && trashed.every((x) => x.kind === 'folder'));
  assert.ok([...world.items.values()].some((x) => x.id === partial.id), 'trashed, never deleted');
});

test('notification: sends once per terminal state; watchdog restarts a stalled chain', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  world.triggers.length = 0; // chain lost, as on Nov 24
  world.now += 30 * 60000;
  c.checkRB001BackupNotification();
  assert.ok(world.triggers.includes('resumeRB001BackupJob'), 'watchdog rescheduled worker');
  drain(world);
  c.checkRB001BackupNotification();
  c.checkRB001BackupNotification();
  assert.equal(world.mails.length, 1);
  assert.match(world.mails[0].subject, /FULL BACKUP VERIFIED/);
});

test('a worker that finds the lock held keeps the chain alive (fix 2026-11-25)', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  world.triggers.length = 0;          // the only pending worker is the one now firing
  world.lockHeld = true;              // another pass still owns the script lock
  c.resumeRB001BackupJob();
  assert.ok(world.triggers.includes('resumeRB001BackupJob'), 'skipped worker rescheduled itself');
  world.lockHeld = false;
  const job = drain(world);
  assert.equal(job.verificationStatus, 'VERIFIED');
});

test('next worker is scheduled after a full pass can end', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  const R = c.__RB001;
  assert.ok(R.WORKER_DELAY_MS > R.SAFE_RUNTIME_MS + 30000,
    'delay ' + R.WORKER_DELAY_MS + ' must exceed pass budget ' + R.SAFE_RUNTIME_MS + ' plus one slow item');
  assert.ok(world.triggerDelays.every((ms) => ms === R.WORKER_DELAY_MS));
});

test('clean runs skip the per-file duplicate lookup; only a resumed window pays for it', () => {
  const world = makeWorld(T0);
  seedSource(world);
  const c = world.ctx;
  c.startOrResumeRB001BackupJob();
  drain(world);
  assert.equal(world.nameLookups, 0, 'no per-file lookups without a cut-off run');

  const world2 = makeWorld(T0);
  seedSource(world2);
  world2.killAfterCopies = 10;
  world2.ctx.startOrResumeRB001BackupJob();
  const job = drain(world2);
  assert.equal(job.verificationStatus, 'VERIFIED');
  assert.ok(world2.nameLookups > 0 && world2.nameLookups < job.filesCopied,
    'lookups only in the resume window: ' + world2.nameLookups);
});
