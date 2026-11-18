// RB-001 WorkflowBuilder integration patch
// Replace the synchronous createDIMSBackupNow() call in runDIMSWorkflow()
// with this non-blocking mission start/resume call.

function runRB001BackupStage_() {
  const job = startOrResumeRB001BackupJob();
  Logger.log('RB-001 backup mission queued/resumed: ' + job.jobId + ' [' + job.status + ']');
  return {jobId: job.jobId, status: job.status, destinationFolderId: job.destinationFolderId};
}

// Target orchestration:
// create checkpoint
// create snapshot
// runRB001BackupStage_();
// return/exit safely
//
// Do NOT synchronously call createDIMSBackupNow() from the workflow after this migration.
