// BackupBuilder — RB-001 Enterprise Backup Storage Intelligence v1.1
// Extends the existing FULL_BACKUP process without deleting or changing retention automatically.

function createDIMSBackupNow() {
  const root = getDIMSRootFolder_();
  const backupsRoot = getOrCreateSubfolder_(root, "Backups");
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd_HH-mm"
  );

  const backupFolder = getOrCreateSubfolder_(
    backupsRoot,
    "FULL_BACKUP_" + timestamp
  );

  const report = {
    schemaVersion: "1.1",
    baselineId: "RB-001",
    backupType: "Full DIMS-v3 Repository Backup",
    retentionClass: "DAILY",
    retentionEligible: false,
    verificationStatus: "NOT_TESTED",
    status: "RUNNING",
    createdAt: new Date().toISOString(),
    completedAt: null,
    sourceFolder: root.getName(),
    sourceFolderId: root.getId(),
    backupFolder: backupFolder.getName(),
    backupFolderId: backupFolder.getId(),
    filesCopied: 0,
    foldersCreated: 0,
    measuredBytes: 0,
    measuredSize: "0 B",
    unmeasuredGoogleNativeFiles: 0,
    skippedFolders: ["Backups"],
    errors: []
  };

  copyFolderRecursive_(root, backupFolder, report);

  report.completedAt = new Date().toISOString();
  report.status = report.errors.length ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
  report.measuredSize = formatBytes_(report.measuredBytes);

  backupFolder.createFile(
    "backup_manifest.json",
    JSON.stringify(report, null, 2),
    MimeType.PLAIN_TEXT
  );

  updateBackupStorageIndex_(backupsRoot, report);

  Logger.log("✅ Full DIMS-v3 backup created: " + backupFolder.getName());
  Logger.log(JSON.stringify(report, null, 2));

  return report;
}

function copyFolderRecursive_(sourceFolder, destinationFolder, report) {
  const files = sourceFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    try {
      const copiedFile = file.makeCopy(file.getName(), destinationFolder);
      const bytes = Number(copiedFile.getSize()) || 0;

      report.filesCopied++;
      report.measuredBytes += bytes;

      if (bytes === 0 && isGoogleNativeFile_(copiedFile)) {
        report.unmeasuredGoogleNativeFiles++;
      }
    } catch (err) {
      report.errors.push({
        file: file.getName(),
        error: err.toString()
      });
    }
  }

  const folders = sourceFolder.getFolders();

  while (folders.hasNext()) {
    const child = folders.next();

    if (child.getName() === "Backups") {
      continue;
    }

    try {
      const copiedChild = getOrCreateSubfolder_(
        destinationFolder,
        child.getName()
      );

      report.foldersCreated++;
      copyFolderRecursive_(child, copiedChild, report);
    } catch (err) {
      report.errors.push({
        folder: child.getName(),
        error: err.toString()
      });
    }
  }
}

function updateBackupStorageIndex_(backupsRoot, report) {
  const index = readBackupStorageIndex_(backupsRoot);

  index.schemaVersion = "1.1";
  index.baselineId = "RB-001";
  index.updatedAt = new Date().toISOString();
  index.metric = "measured DriveApp file bytes; Google-native files may report 0 bytes";
  index.backupCount = Number(index.backupCount || 0) + 1;
  index.measuredBytes = Number(index.measuredBytes || 0) + Number(report.measuredBytes || 0);
  index.measuredSize = formatBytes_(index.measuredBytes);
  index.filesCopied = Number(index.filesCopied || 0) + Number(report.filesCopied || 0);
  index.foldersCreated = Number(index.foldersCreated || 0) + Number(report.foldersCreated || 0);
  index.unmeasuredGoogleNativeFiles =
    Number(index.unmeasuredGoogleNativeFiles || 0) +
    Number(report.unmeasuredGoogleNativeFiles || 0);

  index.latestBackup = {
    name: report.backupFolder,
    id: report.backupFolderId,
    completedAt: report.completedAt,
    status: report.status,
    measuredBytes: report.measuredBytes,
    measuredSize: report.measuredSize,
    filesCopied: report.filesCopied,
    foldersCreated: report.foldersCreated,
    unmeasuredGoogleNativeFiles: report.unmeasuredGoogleNativeFiles,
    verificationStatus: report.verificationStatus,
    retentionClass: report.retentionClass
  };

  writeJsonFile_(backupsRoot, "backup_storage_index.json", index);
}

function readBackupStorageIndex_(backupsRoot) {
  const files = backupsRoot.getFilesByName("backup_storage_index.json");

  if (!files.hasNext()) {
    return {
      schemaVersion: "1.1",
      baselineId: "RB-001",
      backupCount: 0,
      measuredBytes: 0,
      measuredSize: "0 B",
      filesCopied: 0,
      foldersCreated: 0,
      unmeasuredGoogleNativeFiles: 0,
      latestBackup: null
    };
  }

  try {
    return JSON.parse(files.next().getBlob().getDataAsString());
  } catch (err) {
    return {
      schemaVersion: "1.1",
      baselineId: "RB-001",
      backupCount: 0,
      measuredBytes: 0,
      measuredSize: "0 B",
      filesCopied: 0,
      foldersCreated: 0,
      unmeasuredGoogleNativeFiles: 0,
      latestBackup: null,
      indexReadWarning: err.toString()
    };
  }
}

function writeJsonFile_(folder, fileName, value) {
  const files = folder.getFilesByName(fileName);
  const text = JSON.stringify(value, null, 2);

  if (files.hasNext()) {
    files.next().setContent(text);
    return;
  }

  folder.createFile(fileName, text, MimeType.PLAIN_TEXT);
}

function auditBackupStorageNow() {
  const root = getDIMSRootFolder_();
  const backupsRoot = getOrCreateSubfolder_(root, "Backups");
  const folders = backupsRoot.getFolders();

  const audit = {
    schemaVersion: "1.1",
    baselineId: "RB-001",
    generatedAt: new Date().toISOString(),
    metric: "measured DriveApp file bytes; Google-native files may report 0 bytes",
    backupCount: 0,
    measuredBytes: 0,
    measuredSize: "0 B",
    files: 0,
    folders: 0,
    unmeasuredGoogleNativeFiles: 0,
    backups: [],
    errors: []
  };

  while (folders.hasNext()) {
    const folder = folders.next();
    const name = folder.getName();

    if (!/^(BACKUP_|ENTERPRISE_BACKUP_|FULL_BACKUP_)/.test(name)) {
      continue;
    }

    const entry = {
      name,
      id: folder.getId(),
      measuredBytes: 0,
      measuredSize: "0 B",
      files: 0,
      folders: 0,
      unmeasuredGoogleNativeFiles: 0,
      errors: []
    };

    measureFolderRecursive_(folder, entry);
    entry.measuredSize = formatBytes_(entry.measuredBytes);

    audit.backupCount++;
    audit.measuredBytes += entry.measuredBytes;
    audit.files += entry.files;
    audit.folders += entry.folders;
    audit.unmeasuredGoogleNativeFiles += entry.unmeasuredGoogleNativeFiles;

    audit.errors = audit.errors.concat(
      entry.errors.map(function(error) {
        return { backup: name, detail: error };
      })
    );

    audit.backups.push(entry);
  }

  audit.measuredSize = formatBytes_(audit.measuredBytes);
  audit.completedAt = new Date().toISOString();

  writeJsonFile_(backupsRoot, "backup_storage_audit.json", audit);
  Logger.log(JSON.stringify(audit, null, 2));

  return audit;
}

function measureFolderRecursive_(folder, totals) {
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    try {
      const bytes = Number(file.getSize()) || 0;
      totals.files++;
      totals.measuredBytes += bytes;

      if (bytes === 0 && isGoogleNativeFile_(file)) {
        totals.unmeasuredGoogleNativeFiles++;
      }
    } catch (err) {
      totals.errors.push({
        file: file.getName(),
        error: err.toString()
      });
    }
  }

  const folders = folder.getFolders();

  while (folders.hasNext()) {
    const child = folders.next();
    totals.folders++;

    try {
      measureFolderRecursive_(child, totals);
    } catch (err) {
      totals.errors.push({
        folder: child.getName(),
        error: err.toString()
      });
    }
  }
}

function isGoogleNativeFile_(file) {
  return String(file.getMimeType() || "")
    .indexOf("application/vnd.google-apps.") === 0;
}

function formatBytes_(bytes) {
  const value = Number(bytes) || 0;

  if (value < 1024) {
    return value + " B";
  }

  const units = ["KB", "MB", "GB", "TB", "PB"];
  let size = value;
  let unit = -1;

  do {
    size /= 1024;
    unit++;
  } while (
    size >= 1024 &&
    unit < units.length - 1
  );

  return (
    size.toFixed(
      size >= 100 ? 0 :
      size >= 10 ? 1 : 2
    ) +
    " " +
    units[unit]
  );
}

function getDIMSRootFolder_() {
  return DriveApp.getFolderById(
    DIMS_CONFIG.ROOT_FOLDER_ID
  );
}

function getOrCreateSubfolder_(parentFolder, folderName) {
  const folders =
    parentFolder.getFoldersByName(folderName);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parentFolder.createFolder(folderName);
}


// ============================================================
// RB-001 RESUMABLE BACKUP ENGINE v3.0
// DIMS-RUN-0005 / TASK-0307 (PROJ-0033), 2026-11-25.
//
// - Daily INCREMENTAL: copies only files modified since the last
//   VERIFIED backup started. Folder paths are kept so a restore is
//   Sunday FULL + the incrementals after it, in order.
// - Weekly FULL every Sunday (script time zone), and whenever there
//   is no verified baseline or the base full is a week old.
// - Backups folder is excluded from the scan by ID, at any depth.
// - Resume: the next worker is scheduled at the START of every run,
//   so a run killed by the 6-minute limit is still followed up.
// - Status COMPLETED + verificationStatus VERIFIED only when the
//   destination file/folder counts match what the job copied.
// - Retention: newest 7 completed backups + newest full of each of
//   the newest 4 weeks + every backup a kept incremental depends on.
//   Default mode is DRY_RUN (lists only). Folders go to Drive Trash
//   only after enableRB001RetentionLive() is run by the owner.
//   Nothing is ever permanently deleted.
//
// runDIMSWorkflow() is unchanged; it still calls
// runRB001BackupStage_() -> startOrResumeRB001BackupJob().
// ============================================================

const RB001 = {
  SCHEMA: '3.0',
  SOURCE_FOLDER_ID: '1PMjJLQWLJqTmvQP53UBw3pyGdjhJxTtE',
  BACKUPS_FOLDER_ID: '1sW3qo0AovZ4MW74TpMUGPCEMfBDHlz2I',

  JOB_FILE: 'backup_job_state.json',
  MANIFEST_FILE: 'backup_manifest.json',
  INDEX_FILE: 'backup_storage_index.json',
  RETENTION_PLAN_FILE: 'backup_retention_plan.json',

  WORKER_FUNCTION: 'resumeRB001BackupJob',
  WORKER_DELAY_MS: 60000,
  MAX_BATCH_ITEMS: 200,
  SAFE_RUNTIME_MS: 180000,
  PERSIST_EVERY: 5,
  MAX_ITEM_ATTEMPTS: 3,
  MAX_CONSECUTIVE_WORKER_FAILURES: 5,
  STALE_HOURS: 26,
  WATCHDOG_STALL_MINUTES: 20,

  WEEKLY_FULL_ISO_DAY: '7', // Utilities.formatDate 'u': 1 = Monday ... 7 = Sunday
  FULL_MAX_AGE_DAYS: 6.5,
  RETAIN_DAILY: 7,
  RETAIN_WEEKLY: 4,

  FULL_PREFIX: 'FULL_BACKUP_',
  INCR_PREFIX: 'INCR_BACKUP_',
  SOURCE_TAG: 'RB001-SRC:',

  PROP_INFLIGHT: 'RB001_INFLIGHT_ITEM',
  PROP_RETENTION_MODE: 'RB001_RETENTION_MODE', // DRY_RUN (default) | LIVE

  TERMINAL: ['COMPLETED', 'COMPLETED_WITH_ERRORS', 'VERIFIED', 'FAILED']
};


// ------------------------------------------------------------
// Public entry points
// ------------------------------------------------------------

function startOrResumeRB001BackupJob(options) {
  options = options || {};

  const lock = LockService.getScriptLock();
  // Wait out a worker pass (up to ~3 min) so the daily job is never skipped.
  const locked = lock.tryLock(200000);

  try {
    const backupsRoot = getRB001BackupsFolder_();
    let job = readRB001Job_(backupsRoot);

    if (locked && (!job || isRB001Terminal_(job))) {
      job = createRB001Job_(
        getRB001SourceFolder_(),
        backupsRoot,
        job,
        options.forceMode || null
      );
    }

    scheduleNextRB001Worker_();

    Logger.log(
      'RB-001 backup job started/resumed: ' +
      (job ? job.jobId + ' [' + job.status + ', ' + (job.mode || 'FULL') + ']' : 'none')
    );

    return job;

  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


/** Manual run from the editor: start (or resume) a job and run one worker pass now. */
function runRB001BackupNow() {
  startOrResumeRB001BackupJob();
  resumeRB001BackupJob();
  return getRB001Status();
}

/** Manual run from the editor: force a FULL backup (only if no job is in progress). */
function runRB001FullBackupNow() {
  startOrResumeRB001BackupJob({ forceMode: 'FULL' });
  resumeRB001BackupJob();
  return getRB001Status();
}

/** Logs and returns a short status of the current/last job. */
function getRB001Status() {
  const job = readRB001Job_(getRB001BackupsFolder_());

  if (!job) {
    Logger.log('RB-001: no job state found.');
    return null;
  }

  const status = {
    jobId: job.jobId,
    mode: job.mode || 'FULL',
    phase: job.phase || 'COPY',
    status: job.status,
    verificationStatus: job.verificationStatus,
    destinationFolder: job.destinationFolder,
    since: job.since || null,
    queueRemaining: (job.queue || []).length,
    sourceFilesScanned: job.sourceFilesScanned,
    filesEligible: job.filesEligible,
    filesUnchanged: job.filesUnchanged,
    filesCopied: job.filesCopied,
    foldersCreated: job.foldersCreated,
    measuredBytes: job.measuredBytes,
    measuredSize: formatBytes_(job.measuredBytes),
    errors: (job.errors || []).length,
    verification: job.verification || null,
    updatedAt: job.updatedAt
  };

  Logger.log(JSON.stringify(status, null, 2));
  return status;
}


function resumeRB001BackupJob() {
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(5000)) {
    Logger.log('RB-001 worker skipped: another run owns the lock.');
    return;
  }

  let backupsRoot = null;
  let job = null;

  try {
    backupsRoot = getRB001BackupsFolder_();
    job = readRB001Job_(backupsRoot);

    if (!job) {
      Logger.log('RB-001 worker: no active backup job.');
      clearRB001WorkerTriggers_();
      return;
    }

    if (isRB001Terminal_(job)) {
      Logger.log('RB-001 worker: job already terminal: ' + job.status);
      clearRB001WorkerTriggers_();
      return;
    }

    // Safety net first: if this run is killed by the execution limit,
    // the follow-up worker is already scheduled.
    scheduleNextRB001Worker_();

    normalizeRB001Job_(job);
    recoverRB001InterruptedItem_(job);

    job.status = 'RUNNING';
    job.lastAttemptAt = new Date().toISOString();
    persistRB001Job_(backupsRoot, job);

    const started = Date.now();

    if (job.phase === 'COPY') {
      let processed = 0;

      while (
        job.queue.length &&
        processed < RB001.MAX_BATCH_ITEMS &&
        (Date.now() - started) < RB001.SAFE_RUNTIME_MS
      ) {
        const item = job.queue[0];
        markRB001InFlight_(job, item);

        try {
          processRB001Item_(job, item);
        } catch (err) {
          job.errors.push({
            at: new Date().toISOString(),
            type: item.type,
            sourceId: item.sourceId,
            relativePath: item.relativePath,
            error: String(err)
          });
        }

        job.queue.shift();
        clearRB001InFlight_();
        if (job.resumeAdoptKey === item.type + ':' + item.sourceId) {
          job.resumeAdoptKey = null;
        }
        processed++;

        if (processed % RB001.PERSIST_EVERY === 0) {
          persistRB001Job_(backupsRoot, job);
        }
      }

      if (job.queue.length) {
        job.status = 'INTERRUPTED';
        job.consecutiveWorkerFailures = 0;
        persistRB001Job_(backupsRoot, job);
        Logger.log('RB-001 batch complete. Remaining queue: ' + job.queue.length);
        return;
      }

      job.phase = 'VERIFY';
      job.copyCompletedAt = new Date().toISOString();
      job.verify = {
        queue: [job.destinationFolderId],
        files: 0,
        folders: 0
      };
      persistRB001Job_(backupsRoot, job);
    }

    if (!runRB001VerifyStep_(job, started)) {
      job.status = 'INTERRUPTED';
      job.consecutiveWorkerFailures = 0;
      persistRB001Job_(backupsRoot, job);
      Logger.log('RB-001 verification count still running. Folders left: ' + job.verify.queue.length);
      return;
    }

    finalizeRB001Job_(backupsRoot, job);
    clearRB001WorkerTriggers_();
    applyRB001RetentionSafely_(backupsRoot, job);

  } catch (err) {
    handleRB001WorkerFailure_(backupsRoot, job, err);

  } finally {
    lock.releaseLock();
  }
}


// ------------------------------------------------------------
// Job creation
// ------------------------------------------------------------

function createRB001Job_(root, backupsRoot, previousJob, forceMode) {
  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const index = readRB001JsonFile_(backupsRoot, RB001.INDEX_FILE) || {};
  const baseline = index.lastVerifiedBackup || legacyRB001Baseline_(previousJob);

  let mode = forceMode;
  let modeReason = forceMode ? 'Forced ' + forceMode + ' by manual run' : null;

  if (!mode) {
    if (Utilities.formatDate(now, tz, 'u') === RB001.WEEKLY_FULL_ISO_DAY) {
      mode = 'FULL';
      modeReason = 'Weekly Sunday full backup';
    } else if (!baseline || !baseline.scanStartedAt || !baseline.baseFullCreatedAt) {
      mode = 'FULL';
      modeReason = 'No verified baseline backup found';
    } else if (
      (now.getTime() - new Date(baseline.baseFullCreatedAt).getTime()) / 86400000 >=
      RB001.FULL_MAX_AGE_DAYS
    ) {
      mode = 'FULL';
      modeReason = 'Base full backup is about a week old (Sunday full missing or unverified)';
    } else {
      mode = 'INCREMENTAL';
      modeReason = 'Daily incremental since last verified backup';
    }
  }

  const stamp = Utilities.formatDate(now, tz, 'yyyy-MM-dd_HH-mm-ss');
  const jobId = 'RB001-' + Utilities.getUuid();
  const prefix = mode === 'FULL' ? RB001.FULL_PREFIX : RB001.INCR_PREFIX;

  const destination = backupsRoot.createFolder(
    prefix + stamp + '_' + jobId.substring(6, 14)
  );

  const isIncremental = mode === 'INCREMENTAL';

  const job = {
    schemaVersion: RB001.SCHEMA,
    baselineId: 'RB-001',
    jobId: jobId,

    mode: mode,
    modeReason: modeReason,
    phase: 'COPY',
    since: isIncremental ? baseline.scanStartedAt : null,
    previousVerifiedJobId: baseline ? baseline.jobId : null,
    baseFullJobId: isIncremental ? baseline.baseFullJobId : jobId,
    baseFullFolderId: isIncremental ? baseline.baseFullFolderId : destination.getId(),
    baseFullCreatedAt: isIncremental ? baseline.baseFullCreatedAt : now.toISOString(),

    status: 'RUNNING',
    verificationStatus: 'NOT_TESTED',

    createdAt: now.toISOString(),
    scanStartedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastAttemptAt: null,
    copyCompletedAt: null,
    completedAt: null,
    verifiedAt: null,

    sourceFolderId: root.getId(),
    excludedFolderIds: [RB001.BACKUPS_FOLDER_ID],

    destinationFolderId: destination.getId(),
    destinationFolder: destination.getName(),
    destFolderCache: { '': destination.getId() },

    queue: [
      {
        type: 'folder',
        sourceId: root.getId(),
        destinationId: destination.getId(),
        relativePath: '',
        pathKey: ''
      }
    ],

    sourceFilesScanned: 0,
    filesEligible: 0,
    filesUnchanged: 0,
    filesCopied: 0,
    filesAlreadyPresent: 0,
    foldersCreated: 0,
    mergedSourceFolders: 0,
    measuredBytes: 0,
    unmeasuredGoogleNativeFiles: 0,
    itemAttempts: {},
    skipKeys: [],
    consecutiveWorkerFailures: 0,

    verify: null,
    verification: null,
    errors: []
  };

  persistRB001Job_(backupsRoot, job);
  return job;
}


/** Baseline from a pre-v3 job file (schema 2.0) that ended VERIFIED. */
function legacyRB001Baseline_(job) {
  if (!job || job.verificationStatus !== 'VERIFIED') {
    return null;
  }

  const isIncremental = job.mode === 'INCREMENTAL';

  return {
    jobId: job.jobId,
    mode: job.mode || 'FULL',
    scanStartedAt: job.scanStartedAt || job.createdAt,
    verifiedAt: job.verifiedAt,
    folderId: job.destinationFolderId,
    folderName: job.destinationFolder,
    baseFullJobId: isIncremental ? job.baseFullJobId : job.jobId,
    baseFullFolderId: isIncremental ? job.baseFullFolderId : job.destinationFolderId,
    baseFullCreatedAt: isIncremental ? job.baseFullCreatedAt : job.createdAt
  };
}


/** Lets a job written by the v2.0 engine (e.g. the Nov 24 job) finish under v3. */
function normalizeRB001Job_(job) {
  if (job.schemaVersion !== RB001.SCHEMA) {
    job.legacyCounts = true;
  }

  job.mode = job.mode || 'FULL';
  job.phase = job.phase || 'COPY';
  job.queue = job.queue || [];
  job.errors = job.errors || [];
  job.itemAttempts = job.itemAttempts || {};
  job.skipKeys = job.skipKeys || [];
  job.destFolderCache = job.destFolderCache || { '': job.destinationFolderId };
  job.excludedFolderIds = job.excludedFolderIds || [RB001.BACKUPS_FOLDER_ID];

  [
    'sourceFilesScanned', 'filesEligible', 'filesUnchanged', 'filesCopied',
    'filesAlreadyPresent', 'foldersCreated', 'mergedSourceFolders',
    'measuredBytes', 'unmeasuredGoogleNativeFiles', 'consecutiveWorkerFailures'
  ].forEach(function(key) {
    job[key] = Number(job[key] || 0);
  });
}


// ------------------------------------------------------------
// Copy phase
// ------------------------------------------------------------

function processRB001Item_(job, item) {
  const key = item.type + ':' + item.sourceId;

  if (job.skipKeys.indexOf(key) >= 0) {
    job.errors.push({
      at: new Date().toISOString(),
      type: item.type,
      sourceId: item.sourceId,
      relativePath: item.relativePath,
      error: 'Skipped after ' + job.itemAttempts[key] + ' runs were cut off while processing this item.'
    });
    return;
  }

  if (item.type === 'folder') {
    processRB001FolderItem_(job, item);
    return;
  }

  if (item.type === 'file') {
    processRB001FileItem_(job, item);
  }
}


function processRB001FolderItem_(job, item) {
  const source = DriveApp.getFolderById(item.sourceId);
  const isIncremental = job.mode === 'INCREMENTAL';
  const sinceMs = job.since ? new Date(job.since).getTime() : 0;

  // Full: destination folder already exists (created when enumerated).
  // Incremental: destination folders are created only when a changed file needs one.
  const destinationId = item.destinationId || null;

  const files = source.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    job.sourceFilesScanned++;

    if (isIncremental && file.getLastUpdated().getTime() <= sinceMs) {
      job.filesUnchanged++;
      continue;
    }

    job.filesEligible++;

    job.queue.push({
      type: 'file',
      sourceId: file.getId(),
      destinationId: destinationId,
      relativePath: item.relativePath,
      pathKey: item.pathKey
    });
  }

  const folders = source.getFolders();

  while (folders.hasNext()) {
    const child = folders.next();

    if (isRB001ExcludedFolder_(job, child, item)) {
      continue;
    }

    const childItem = {
      type: 'folder',
      sourceId: child.getId(),
      destinationId: null,
      relativePath: item.relativePath + '/' + child.getName(),
      pathKey: null
    };

    if (job.legacyCounts) {
      // Job started by the v2.0 engine: finish it the way it began.
      childItem.destinationId = getOrCreateSubfolder_(
        DriveApp.getFolderById(item.destinationId),
        child.getName()
      ).getId();
      job.foldersCreated++;
      job.queue.push(childItem);
      continue;
    }

    childItem.pathKey = (item.pathKey || '') + '/' + encodeURIComponent(child.getName());

    if (job.destFolderCache[childItem.pathKey]) {
      // Two source folders with the same name under one parent share one backup folder.
      job.mergedSourceFolders++;
    }

    if (!isIncremental) {
      childItem.destinationId = ensureRB001DestPath_(job, childItem.pathKey);
    }

    job.queue.push(childItem);
  }
}


function processRB001FileItem_(job, item) {
  const sourceFile = DriveApp.getFileById(item.sourceId);
  const destinationId = item.destinationId || ensureRB001DestPath_(job, item.pathKey || '');
  const destination = DriveApp.getFolderById(destinationId);
  const name = sourceFile.getName();

  if (job.legacyCounts) {
    // v2.0 behaviour for the job started before this upgrade.
    if (destination.getFilesByName(name).hasNext()) {
      return;
    }
  } else {
    let existing = findRB001TaggedCopy_(destination, name, sourceFile.getId());

    if (!existing && job.resumeAdoptKey === 'file:' + item.sourceId) {
      // This file was being copied when the last run was cut off. If an untagged
      // copy with its name is there, that run made it: tag it instead of copying again.
      existing = adoptRB001UntaggedCopy_(destination, name, sourceFile.getId());
    }

    if (existing) {
      // Copied by a run that was cut off before it saved its counters.
      job.filesAlreadyPresent++;
      countRB001Copy_(job, existing);
      return;
    }
  }

  const copy = sourceFile.makeCopy(name, destination);

  try {
    const description = copy.getDescription();
    copy.setDescription(
      (description ? description + '\n' : '') + RB001.SOURCE_TAG + sourceFile.getId()
    );
  } catch (ignored) {
    // Some file types do not accept a description; resume falls back to recount.
  }

  countRB001Copy_(job, copy);
}


function countRB001Copy_(job, copy) {
  const bytes = Number(copy.getSize()) || 0;

  job.filesCopied++;
  job.measuredBytes += bytes;

  if (bytes === 0 && isGoogleNativeFile_(copy)) {
    job.unmeasuredGoogleNativeFiles++;
  }
}


function findRB001TaggedCopy_(destination, name, sourceId) {
  const tag = RB001.SOURCE_TAG + sourceId;
  const matches = destination.getFilesByName(name);

  while (matches.hasNext()) {
    const candidate = matches.next();

    if (String(candidate.getDescription() || '').indexOf(tag) >= 0) {
      return candidate;
    }
  }

  return null;
}


function adoptRB001UntaggedCopy_(destination, name, sourceId) {
  const matches = destination.getFilesByName(name);

  while (matches.hasNext()) {
    const candidate = matches.next();
    const description = String(candidate.getDescription() || '');

    if (description.indexOf(RB001.SOURCE_TAG) < 0) {
      try {
        candidate.setDescription(
          (description ? description + '\n' : '') + RB001.SOURCE_TAG + sourceId
        );
      } catch (ignored) {}
      return candidate;
    }
  }

  return null;
}


/**
 * Returns the destination folder ID for a source path key, creating
 * folders as needed. pathKey is '/'-joined encodeURIComponent(name) parts.
 */
function ensureRB001DestPath_(job, pathKey) {
  const cache = job.destFolderCache;

  if (cache[pathKey]) {
    return cache[pathKey];
  }

  const parts = pathKey.split('/').filter(function(part) { return part !== ''; });
  let key = '';
  let folderId = cache[''] || job.destinationFolderId;

  for (let i = 0; i < parts.length; i++) {
    const parentKey = key;
    key = key + '/' + parts[i];

    if (cache[key]) {
      folderId = cache[key];
      continue;
    }

    const parent = DriveApp.getFolderById(cache[parentKey] || folderId);
    const name = decodeURIComponent(parts[i]);
    const found = parent.getFoldersByName(name);
    const folder = found.hasNext() ? found.next() : parent.createFolder(name);

    // The destination is a fresh folder per job, so every distinct path
    // resolved here is one backup folder of this job.
    job.foldersCreated++;
    cache[key] = folder.getId();
    folderId = folder.getId();
  }

  return folderId;
}


function isRB001ExcludedFolder_(job, child, parentItem) {
  if (job.excludedFolderIds.indexOf(child.getId()) >= 0) {
    return true;
  }

  // Belt and braces: the top-level folder named Backups is never copied.
  return parentItem.relativePath === '' && child.getName() === 'Backups';
}


// ------------------------------------------------------------
// Interrupted-run recovery
// ------------------------------------------------------------

function markRB001InFlight_(job, item) {
  PropertiesService.getScriptProperties().setProperty(
    RB001.PROP_INFLIGHT,
    JSON.stringify({ jobId: job.jobId, type: item.type, sourceId: item.sourceId })
  );
}

function clearRB001InFlight_() {
  PropertiesService.getScriptProperties().deleteProperty(RB001.PROP_INFLIGHT);
}

/**
 * If the previous run was killed while working on an item, count the attempt.
 * After MAX_ITEM_ATTEMPTS the item is skipped and recorded as an error, so one
 * bad file can never stall the whole backup.
 */
function recoverRB001InterruptedItem_(job) {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty(RB001.PROP_INFLIGHT);

  if (!raw) {
    return;
  }

  props.deleteProperty(RB001.PROP_INFLIGHT);

  let inflight;
  try {
    inflight = JSON.parse(raw);
  } catch (ignored) {
    return;
  }

  if (!inflight || inflight.jobId !== job.jobId) {
    return;
  }

  const key = inflight.type + ':' + inflight.sourceId;
  job.itemAttempts[key] = Number(job.itemAttempts[key] || 0) + 1;
  job.resumeAdoptKey = key;

  if (job.itemAttempts[key] >= RB001.MAX_ITEM_ATTEMPTS && job.skipKeys.indexOf(key) < 0) {
    // The item may not be back in the queue yet (its folder is re-listed first),
    // so it is skipped by key whenever it comes up.
    job.skipKeys.push(key);
  }
}


function handleRB001WorkerFailure_(backupsRoot, job, err) {
  console.error('RB-001 worker error: ' + String(err));

  if (!backupsRoot || !job) {
    return; // Follow-up worker (if scheduled) will retry.
  }

  try {
    job.consecutiveWorkerFailures = Number(job.consecutiveWorkerFailures || 0) + 1;
    job.errors = job.errors || [];
    job.errors.push({ at: new Date().toISOString(), error: 'Worker: ' + String(err) });

    if (job.consecutiveWorkerFailures >= RB001.MAX_CONSECUTIVE_WORKER_FAILURES) {
      job.status = 'FAILED';
      job.verificationStatus = 'FAILED';
      clearRB001WorkerTriggers_();
    } else {
      job.status = 'INTERRUPTED';
    }

    persistRB001Job_(backupsRoot, job);

  } catch (persistErr) {
    console.error('RB-001 failure-state persistence also failed: ' + String(persistErr));
  }
}


// ------------------------------------------------------------
// Verification and completion
// ------------------------------------------------------------

/** Counts files and folders in the backup folder. Returns true when done. */
function runRB001VerifyStep_(job, started) {
  const verify = job.verify;

  while (verify.queue.length && (Date.now() - started) < RB001.SAFE_RUNTIME_MS) {
    const folderId = verify.queue[0];
    const folder = DriveApp.getFolderById(folderId);
    const isRoot = folderId === job.destinationFolderId;

    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (isRoot && file.getName() === RB001.MANIFEST_FILE) {
        continue;
      }
      verify.files++;
    }

    const folders = folder.getFolders();
    while (folders.hasNext()) {
      verify.folders++;
      verify.queue.push(folders.next().getId());
    }

    verify.queue.shift();
  }

  return verify.queue.length === 0;
}


function finalizeRB001Job_(backupsRoot, job) {
  const counted = job.verify;

  const checks = {
    destinationFilesCounted: counted.files,
    filesCopied: job.filesCopied,
    filesEligible: job.filesEligible,
    destinationFoldersCounted: counted.folders,
    foldersCreated: job.foldersCreated,
    errors: job.errors.length,
    copiedMatchesDestination: counted.files === job.filesCopied,
    copiedMatchesEligible: job.legacyCounts ? null : job.filesCopied === job.filesEligible,
    foldersMatch: job.legacyCounts ? null : counted.folders === job.foldersCreated,
    countRule: job.legacyCounts
      ? 'legacy v2.0 job: destination files must equal files copied'
      : 'destination files = files copied = files eligible; destination folders = folders created; no errors'
  };

  const verified =
    checks.copiedMatchesDestination &&
    checks.copiedMatchesEligible !== false &&
    checks.foldersMatch !== false &&
    job.errors.length === 0;

  const now = new Date().toISOString();

  job.phase = 'DONE';
  job.completedAt = now;
  job.verification = checks;
  job.verify.queue = [];
  job.status = verified ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS';
  job.verificationStatus = verified ? 'VERIFIED' : 'COUNT_MISMATCH';
  job.verifiedAt = verified ? now : null;
  job.measuredSize = formatBytes_(job.measuredBytes);
  job.consecutiveWorkerFailures = 0;

  const destination = DriveApp.getFolderById(job.destinationFolderId);
  const manifest = Object.assign({}, job);
  delete manifest.queue;
  delete manifest.verify;
  delete manifest.destFolderCache;
  delete manifest.itemAttempts;
  delete manifest.resumeAdoptKey;

  writeJsonFile_(destination, RB001.MANIFEST_FILE, manifest);

  const readback = readRB001JsonFile_(destination, RB001.MANIFEST_FILE);
  if (
    !readback ||
    readback.jobId !== job.jobId ||
    Number(readback.filesCopied) !== Number(job.filesCopied)
  ) {
    job.status = 'COMPLETED_WITH_ERRORS';
    job.verificationStatus = 'MANIFEST_READBACK_FAILED';
    job.verifiedAt = null;
  }

  persistRB001Job_(backupsRoot, job);
  updateRB001Index_(backupsRoot, job);

  Logger.log(
    'RB-001 ' + job.mode + ' backup ' + job.status + ' / ' + job.verificationStatus +
    ': ' + job.destinationFolder + ' (' + job.filesCopied + ' files, ' +
    formatBytes_(job.measuredBytes) + ')'
  );
}


function updateRB001Index_(backupsRoot, job) {
  const previous = readRB001JsonFile_(backupsRoot, RB001.INDEX_FILE) || {};
  const verified = job.verificationStatus === 'VERIFIED';

  const latest = {
    jobId: job.jobId,
    mode: job.mode,
    name: job.destinationFolder,
    id: job.destinationFolderId,
    status: job.status,
    verificationStatus: job.verificationStatus,
    since: job.since || null,
    filesCopied: job.filesCopied,
    filesUnchanged: job.filesUnchanged,
    foldersCreated: job.foldersCreated,
    measuredBytes: job.measuredBytes,
    measuredSize: formatBytes_(job.measuredBytes),
    completedAt: job.completedAt,
    verifiedAt: job.verifiedAt
  };

  const index = {
    schemaVersion: RB001.SCHEMA,
    baselineId: 'RB-001',
    updatedAt: new Date().toISOString(),
    policy: 'Daily incremental, Sunday full; keep newest ' + RB001.RETAIN_DAILY +
      ' daily and ' + RB001.RETAIN_WEEKLY + ' weekly; old backups go to Drive Trash only',
    liveBackupEngineStatus: job.status,
    lastVerifiedBackupAt: verified ? job.verifiedAt : (previous.lastVerifiedBackupAt || null),
    latestBackup: latest,
    lastVerifiedBackup: verified ? {
      jobId: job.jobId,
      mode: job.mode,
      scanStartedAt: job.scanStartedAt || job.createdAt,
      verifiedAt: job.verifiedAt,
      folderId: job.destinationFolderId,
      folderName: job.destinationFolder,
      baseFullJobId: job.mode === 'INCREMENTAL' ? job.baseFullJobId : job.jobId,
      baseFullFolderId: job.mode === 'INCREMENTAL' ? job.baseFullFolderId : job.destinationFolderId,
      baseFullCreatedAt: job.mode === 'INCREMENTAL' ? job.baseFullCreatedAt : job.createdAt
    } : (previous.lastVerifiedBackup || null),
    lastRetention: previous.lastRetention || null
  };

  writeJsonFile_(backupsRoot, RB001.INDEX_FILE, index);
}


// ------------------------------------------------------------
// Retention (7 daily + 4 weekly). DRY_RUN until the owner enables LIVE.
// ------------------------------------------------------------

/** Owner review: writes backup_retention_plan.json and logs what would go to Trash. */
function previewRB001Retention() {
  const backupsRoot = getRB001BackupsFolder_();
  const plan = buildRB001RetentionPlan_(backupsRoot, readRB001Job_(backupsRoot));
  writeJsonFile_(backupsRoot, RB001.RETENTION_PLAN_FILE, plan);
  Logger.log(JSON.stringify(plan, null, 2));
  return plan;
}

/** Owner only, after reviewing previewRB001Retention(): allow moving old backups to Trash. */
function enableRB001RetentionLive() {
  PropertiesService.getScriptProperties().setProperty(RB001.PROP_RETENTION_MODE, 'LIVE');
  Logger.log('RB-001 retention is now LIVE. Old backup folders will go to Drive Trash after each verified backup.');
}

function disableRB001RetentionLive() {
  PropertiesService.getScriptProperties().setProperty(RB001.PROP_RETENTION_MODE, 'DRY_RUN');
  Logger.log('RB-001 retention is DRY_RUN. Nothing will be trashed.');
}

/** Owner only: apply the current plan now (LIVE mode required). */
function applyRB001RetentionNow() {
  const backupsRoot = getRB001BackupsFolder_();
  return applyRB001RetentionSafely_(backupsRoot, readRB001Job_(backupsRoot));
}


function applyRB001RetentionSafely_(backupsRoot, job) {
  try {
    const mode = PropertiesService.getScriptProperties().getProperty(RB001.PROP_RETENTION_MODE) || 'DRY_RUN';
    const plan = buildRB001RetentionPlan_(backupsRoot, job);
    plan.mode = mode;
    plan.trashed = [];

    if (mode === 'LIVE') {
      const keepsVerifiedFull = plan.keep.some(function(entry) {
        return entry.type === 'FULL' && entry.complete;
      });

      if (!keepsVerifiedFull) {
        plan.blocked = 'No completed FULL backup would remain; nothing trashed.';
      } else if (!job || job.verificationStatus !== 'VERIFIED') {
        plan.blocked = 'Latest backup is not VERIFIED; nothing trashed.';
      } else {
        plan.trash.forEach(function(entry) {
          try {
            DriveApp.getFolderById(entry.id).setTrashed(true); // Trash only (30-day recovery).
            plan.trashed.push(entry.name);
          } catch (err) {
            entry.error = String(err);
          }
        });
      }
    }

    writeJsonFile_(backupsRoot, RB001.RETENTION_PLAN_FILE, plan);

    const index = readRB001JsonFile_(backupsRoot, RB001.INDEX_FILE) || {};
    index.lastRetention = {
      at: plan.generatedAt,
      mode: mode,
      kept: plan.keep.length,
      trashCandidates: plan.trash.length,
      trashed: plan.trashed.length,
      blocked: plan.blocked || null
    };
    writeJsonFile_(backupsRoot, RB001.INDEX_FILE, index);

    Logger.log(
      'RB-001 retention [' + mode + ']: keep ' + plan.keep.length +
      ', trash candidates ' + plan.trash.length + ', trashed ' + plan.trashed.length +
      (plan.blocked ? ' (' + plan.blocked + ')' : '')
    );

    return plan;

  } catch (err) {
    console.error('RB-001 retention error (backup itself is unaffected): ' + String(err));
    return null;
  }
}


function buildRB001RetentionPlan_(backupsRoot, activeJob) {
  const tz = Session.getScriptTimeZone();
  const entries = [];
  const legacy = [];
  const folders = backupsRoot.getFolders();

  while (folders.hasNext()) {
    const folder = folders.next();
    const name = folder.getName();
    const created = folder.getDateCreated();

    if (name.indexOf(RB001.FULL_PREFIX) === 0 || name.indexOf(RB001.INCR_PREFIX) === 0) {
      entries.push({
        id: folder.getId(),
        name: name,
        type: name.indexOf(RB001.FULL_PREFIX) === 0 ? 'FULL' : 'INCREMENTAL',
        createdAt: created.toISOString(),
        createdMs: created.getTime(),
        week: Utilities.formatDate(created, tz, "YYYY-'W'ww"),
        complete: folder.getFilesByName(RB001.MANIFEST_FILE).hasNext(),
        reasons: []
      });
    } else if (/^(BACKUP_|ENTERPRISE_BACKUP_)/.test(name)) {
      legacy.push({ id: folder.getId(), name: name, createdAt: created.toISOString() });
    }
  }

  entries.sort(function(a, b) { return b.createdMs - a.createdMs; }); // newest first

  function keep(entry, reason) {
    if (entry.reasons.indexOf(reason) < 0) {
      entry.reasons.push(reason);
    }
  }

  // 1. Never touch the folder of a job that is still running.
  if (activeJob && !isRB001Terminal_(activeJob)) {
    entries.forEach(function(entry) {
      if (entry.id === activeJob.destinationFolderId) {
        keep(entry, 'active backup job');
      }
    });
  }

  // 2. Newest 7 completed backups (daily).
  const complete = entries.filter(function(entry) { return entry.complete; });
  complete.slice(0, RB001.RETAIN_DAILY).forEach(function(entry) {
    keep(entry, 'daily (newest ' + RB001.RETAIN_DAILY + ')');
  });

  // 3. Newest completed FULL of each of the newest 4 weeks (weekly).
  const weeksSeen = [];
  complete.forEach(function(entry) {
    if (entry.type !== 'FULL' || weeksSeen.indexOf(entry.week) >= 0) {
      return;
    }
    if (weeksSeen.length < RB001.RETAIN_WEEKLY) {
      weeksSeen.push(entry.week);
      keep(entry, 'weekly ' + entry.week);
    }
  });

  // 4. Restore chains: a kept incremental needs every backup back to its full.
  entries.forEach(function(entry, i) {
    if (entry.type !== 'INCREMENTAL' || !entry.reasons.length) {
      return;
    }
    for (let j = i + 1; j < entries.length; j++) {
      const older = entries[j];
      if (!older.complete) {
        continue;
      }
      keep(older, 'restore chain for ' + entry.name);
      if (older.type === 'FULL') {
        break;
      }
    }
  });

  // 5. Unfinished folders newer than the oldest kept backup stay (could be partial/in progress).
  const keptTimes = entries.filter(function(e) { return e.reasons.length; })
    .map(function(e) { return e.createdMs; });
  const oldestKeptMs = keptTimes.length ? Math.min.apply(null, keptTimes) : 0;
  entries.forEach(function(entry) {
    if (!entry.complete && entry.createdMs >= oldestKeptMs) {
      keep(entry, 'unfinished, inside retention window');
    }
  });

  function view(entry) {
    return {
      id: entry.id,
      name: entry.name,
      type: entry.type,
      createdAt: entry.createdAt,
      complete: entry.complete,
      reasons: entry.reasons
    };
  }

  return {
    schemaVersion: RB001.SCHEMA,
    baselineId: 'RB-001',
    generatedAt: new Date().toISOString(),
    rule: 'keep newest ' + RB001.RETAIN_DAILY + ' completed backups + newest full of each of the newest ' +
      RB001.RETAIN_WEEKLY + ' weeks + restore chains; others go to Drive Trash (never permanent delete)',
    keep: entries.filter(function(e) { return e.reasons.length; }).map(view),
    trash: entries.filter(function(e) { return !e.reasons.length; }).map(view),
    legacyNotManaged: legacy
  };
}


// ------------------------------------------------------------
// Storage helpers
// ------------------------------------------------------------

function getRB001SourceFolder_() {
  return DriveApp.getFolderById(RB001.SOURCE_FOLDER_ID);
}

function getRB001BackupsFolder_() {
  return DriveApp.getFolderById(RB001.BACKUPS_FOLDER_ID);
}

function isRB001Terminal_(job) {
  return !!job && RB001.TERMINAL.indexOf(job.status) >= 0;
}

function readRB001JsonFile_(folder, fileName) {
  const files = folder.getFilesByName(fileName);

  if (!files.hasNext()) {
    return null;
  }

  try {
    return JSON.parse(files.next().getBlob().getDataAsString());
  } catch (err) {
    Logger.log('RB-001 read error for ' + fileName + ': ' + err);
    return null;
  }
}

function readRB001Job_(backupsRoot) {
  return readRB001JsonFile_(backupsRoot, RB001.JOB_FILE);
}

function persistRB001Job_(backupsRoot, job) {
  job.updatedAt = new Date().toISOString();
  writeJsonFile_(backupsRoot, RB001.JOB_FILE, job);
}


// ------------------------------------------------------------
// Worker triggers
// ------------------------------------------------------------

function clearRB001WorkerTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === RB001.WORKER_FUNCTION) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function scheduleNextRB001Worker_() {
  clearRB001WorkerTriggers_();

  ScriptApp
    .newTrigger(RB001.WORKER_FUNCTION)
    .timeBased()
    .after(RB001.WORKER_DELAY_MS)
    .create();
}

/** Restarts the worker chain if a running job has made no progress for a while. */
function watchdogRB001_(job) {
  if (!job || isRB001Terminal_(job)) {
    return false;
  }

  const idleMinutes = (Date.now() - new Date(job.updatedAt).getTime()) / 60000;

  if (idleMinutes < RB001.WATCHDOG_STALL_MINUTES) {
    return false;
  }

  scheduleNextRB001Worker_();
  Logger.log(
    'RB-001 watchdog: job ' + job.jobId + ' idle ' + Math.round(idleMinutes) +
    ' min; worker rescheduled.'
  );
  return true;
}


function checkRB001BackupStaleness() {
  const job = readRB001Job_(getRB001BackupsFolder_());

  if (!job) {
    return { status: 'UNKNOWN', stale: true };
  }

  const ageHours = (Date.now() - new Date(job.updatedAt).getTime()) / 3600000;

  return {
    status: job.status,
    verificationStatus: job.verificationStatus,
    stale: ageHours > RB001.STALE_HOURS,
    ageHours: ageHours
  };
}
