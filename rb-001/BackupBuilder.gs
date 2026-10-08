// RB-001 BackupBuilder — resumable verified backup engine v2.0
// Designed for Google Apps Script. Extend the canonical BackupBuilder with this worker model.

const RB001 = {
  JOB_FILE: 'backup_job_state.json',
  MANIFEST_FILE: 'backup_manifest.json',
  INDEX_FILE: 'backup_storage_index.json',
  WORKER_FUNCTION: 'resumeRB001BackupJob',
  MAX_BATCH_ITEMS: 75,
  SAFE_RUNTIME_MS: 240000,
  STALE_HOURS: 26
};

function startOrResumeRB001BackupJob() {
  const root = getDIMSRootFolder_();
  const backupsRoot = getOrCreateSubfolder_(root, 'Backups');
  let job = readRB001Job_(backupsRoot);

  if (!job || ['VERIFIED', 'FAILED'].indexOf(job.status) >= 0) {
    job = createRB001Job_(root, backupsRoot);
  }

  scheduleRB001Worker_();
  return job;
}

function resumeRB001BackupJob() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;

  try {
    const root = getDIMSRootFolder_();
    const backupsRoot = getOrCreateSubfolder_(root, 'Backups');
    const job = readRB001Job_(backupsRoot);
    if (!job || ['VERIFIED', 'FAILED'].indexOf(job.status) >= 0) return;

    job.status = 'RUNNING';
    job.lastAttemptAt = new Date().toISOString();
    persistRB001Job_(backupsRoot, job);

    const started = Date.now();
    let processed = 0;

    while (job.queue.length && processed < RB001.MAX_BATCH_ITEMS && (Date.now() - started) < RB001.SAFE_RUNTIME_MS) {
      const item = job.queue.shift();
      processRB001Item_(job, item);
      processed++;
      if (processed % 10 === 0) persistRB001Job_(backupsRoot, job);
    }

    job.updatedAt = new Date().toISOString();
    persistRB001Job_(backupsRoot, job);

    if (job.queue.length) {
      job.status = 'INTERRUPTED';
      persistRB001Job_(backupsRoot, job);
      scheduleRB001Worker_();
      return;
    }

    finalizeRB001Job_(backupsRoot, job);
  } catch (err) {
    markRB001Failure_(err);
    throw err;
  } finally {
    lock.releaseLock();
  }
}

function createRB001Job_(root, backupsRoot) {
  const now = new Date();
  const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
  const jobId = 'RB001-' + Utilities.getUuid();
  const destination = backupsRoot.createFolder('FULL_BACKUP_' + stamp + '_' + jobId.substring(6, 14));
  const job = {
    schemaVersion: '2.0', baselineId: 'RB-001', jobId,
    status: 'RUNNING', verificationStatus: 'NOT_TESTED',
    createdAt: now.toISOString(), updatedAt: now.toISOString(), completedAt: null, verifiedAt: null,
    sourceFolderId: root.getId(), destinationFolderId: destination.getId(), destinationFolder: destination.getName(),
    queue: [{type:'folder', sourceId:root.getId(), destinationId:destination.getId(), relativePath:''}],
    filesCopied: 0, foldersCreated: 0, measuredBytes: 0, unmeasuredGoogleNativeFiles: 0,
    errors: []
  };
  persistRB001Job_(backupsRoot, job);
  return job;
}

function processRB001Item_(job, item) {
  if (item.type === 'folder') {
    const source = DriveApp.getFolderById(item.sourceId);
    const destination = DriveApp.getFolderById(item.destinationId);
    const files = source.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      job.queue.push({type:'file', sourceId:file.getId(), destinationId:destination.getId(), relativePath:item.relativePath});
    }
    const folders = source.getFolders();
    while (folders.hasNext()) {
      const child = folders.next();
      if (!item.relativePath && child.getName() === 'Backups') continue;
      const copiedChild = getOrCreateSubfolder_(destination, child.getName());
      job.foldersCreated++;
      job.queue.push({type:'folder', sourceId:child.getId(), destinationId:copiedChild.getId(), relativePath:item.relativePath + '/' + child.getName()});
    }
    return;
  }

  const sourceFile = DriveApp.getFileById(item.sourceId);
  const destination = DriveApp.getFolderById(item.destinationId);
  if (destination.getFilesByName(sourceFile.getName()).hasNext()) return; // idempotent resume
  const copy = sourceFile.makeCopy(sourceFile.getName(), destination);
  const bytes = Number(copy.getSize()) || 0;
  job.filesCopied++;
  job.measuredBytes += bytes;
  if (bytes === 0 && String(copy.getMimeType()).indexOf('application/vnd.google-apps.') === 0) job.unmeasuredGoogleNativeFiles++;
}

function finalizeRB001Job_(backupsRoot, job) {
  job.status = 'COMPLETED_UNVERIFIED';
  job.completedAt = new Date().toISOString();
  persistRB001Job_(backupsRoot, job);

  const destination = DriveApp.getFolderById(job.destinationFolderId);
  const manifest = Object.assign({}, job);
  delete manifest.queue;
  writeJsonFile_(destination, RB001.MANIFEST_FILE, manifest);

  verifyRB001Backup_(backupsRoot, job, destination);
}

function verifyRB001Backup_(backupsRoot, job, destination) {
  const manifests = destination.getFilesByName(RB001.MANIFEST_FILE);
  if (!manifests.hasNext()) throw new Error('RB-001 verification failed: manifest missing');
  const readback = JSON.parse(manifests.next().getBlob().getDataAsString());
  if (readback.jobId !== job.jobId || Number(readback.filesCopied) !== Number(job.filesCopied)) {
    throw new Error('RB-001 verification failed: manifest read-back mismatch');
  }
  job.status = 'VERIFIED';
  job.verificationStatus = 'VERIFIED';
  job.verifiedAt = new Date().toISOString();
  persistRB001Job_(backupsRoot, job);
  updateRB001Index_(backupsRoot, job);
}

function updateRB001Index_(backupsRoot, job) {
  const index = {
    schemaVersion:'2.0', baselineId:'RB-001', updatedAt:new Date().toISOString(),
    liveBackupEngineStatus:job.status, lastVerifiedBackupAt:job.verifiedAt,
    latestBackup:{jobId:job.jobId,name:job.destinationFolder,id:job.destinationFolderId,status:job.status,verificationStatus:job.verificationStatus,filesCopied:job.filesCopied,foldersCreated:job.foldersCreated,measuredBytes:job.measuredBytes,completedAt:job.completedAt,verifiedAt:job.verifiedAt}
  };
  writeJsonFile_(backupsRoot, RB001.INDEX_FILE, index);
}

function readRB001Job_(backupsRoot) {
  const files = backupsRoot.getFilesByName(RB001.JOB_FILE);
  if (!files.hasNext()) return null;
  try { return JSON.parse(files.next().getBlob().getDataAsString()); } catch (e) { return null; }
}

function persistRB001Job_(backupsRoot, job) {
  job.updatedAt = new Date().toISOString();
  writeJsonFile_(backupsRoot, RB001.JOB_FILE, job);
}

function scheduleRB001Worker_() {
  const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === RB001.WORKER_FUNCTION);
  if (!exists) ScriptApp.newTrigger(RB001.WORKER_FUNCTION).timeBased().after(60000).create();
}

function markRB001Failure_(err) {
  try {
    const root = getDIMSRootFolder_();
    const backupsRoot = getOrCreateSubfolder_(root, 'Backups');
    const job = readRB001Job_(backupsRoot);
    if (!job) return;
    job.status = 'FAILED';
    job.verificationStatus = 'FAILED';
    job.errors.push({at:new Date().toISOString(), error:String(err)});
    persistRB001Job_(backupsRoot, job);
    Logger.log('RB-001 BACKUP FAILURE: ' + String(err));
  } catch (ignored) {}
}

function checkRB001BackupStaleness() {
  const root = getDIMSRootFolder_();
  const backupsRoot = getOrCreateSubfolder_(root, 'Backups');
  const job = readRB001Job_(backupsRoot);
  if (!job) return {status:'UNKNOWN', stale:true};
  const ageHours = (Date.now() - new Date(job.updatedAt).getTime()) / 3600000;
  return {status:job.status, verificationStatus:job.verificationStatus, stale:ageHours > RB001.STALE_HOURS, ageHours:ageHours};
}
