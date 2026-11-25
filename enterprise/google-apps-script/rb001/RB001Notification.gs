// RB001Notification — v3.0 (DIMS-RUN-0005 / TASK-0307)
//
// Fixes vs v2:
// - Terminal statuses now match the v3 engine (COMPLETED / COMPLETED_WITH_ERRORS /
//   FAILED, plus legacy VERIFIED).
// - MailApp needs the script.send_mail scope and Session...getEmail() needs
//   userinfo.email; both are now in appsscript.json. The recipient can also be
//   set with the script property RB001_NOTIFY_EMAIL.
// - Errors are logged (console.error) instead of failing the trigger every 5 minutes.
// - Doubles as a watchdog: if a running backup has been idle for 20 minutes,
//   the worker trigger is rescheduled so the job finishes.

function checkRB001BackupNotification() {
  try {
    const backupsRoot = getRB001BackupsFolder_();
    const job = readRB001Job_(backupsRoot);

    if (!job) {
      Logger.log('RB-001 notification check: no job found.');
      return;
    }

    if (!isRB001Terminal_(job)) {
      watchdogRB001_(job);
      Logger.log('RB-001 notification check: job still ' + job.status);
      return;
    }

    const props = PropertiesService.getScriptProperties();
    const notifyKey = job.jobId + '|' + job.status + '|' + job.verificationStatus;

    if (props.getProperty('RB001_LAST_NOTIFIED_KEY') === notifyKey) {
      return;
    }

    // v2 recorded jobId/status separately; honour that so old jobs are not re-sent.
    if (
      props.getProperty('RB001_LAST_NOTIFIED_JOB_ID') === job.jobId &&
      props.getProperty('RB001_LAST_NOTIFIED_STATUS') === job.status
    ) {
      props.setProperty('RB001_LAST_NOTIFIED_KEY', notifyKey);
      return;
    }

    const recipient =
      props.getProperty('RB001_NOTIFY_EMAIL') ||
      Session.getEffectiveUser().getEmail();

    if (!recipient) {
      console.error('RB-001 notification: no recipient (set script property RB001_NOTIFY_EMAIL).');
      return;
    }

    const mode = job.mode || 'FULL';
    const verified = job.verificationStatus === 'VERIFIED';
    let subject;

    if (job.status === 'FAILED') {
      subject = 'RB-001 BACKUP FAILED — ACTION REQUIRED';
    } else if (verified) {
      subject = 'RB-001 ' + mode + ' BACKUP VERIFIED';
    } else {
      subject = 'RB-001 ' + mode + ' BACKUP NEEDS REVIEW (' + job.verificationStatus + ')';
    }

    const errors = job.errors || [];
    const body =
      subject + '\n\n' +
      'Job ID: ' + job.jobId + '\n' +
      'Mode: ' + mode + (job.since ? ' (changes since ' + job.since + ')' : '') + '\n' +
      'Backup: ' + job.destinationFolder + '\n' +
      'Status: ' + job.status + ' / ' + job.verificationStatus + '\n' +
      'Files copied: ' + job.filesCopied + '\n' +
      'Files unchanged (skipped): ' + (job.filesUnchanged || 0) + '\n' +
      'Folders created: ' + job.foldersCreated + '\n' +
      'Size: ' + formatBytes_(job.measuredBytes) + '\n' +
      'Completed: ' + (job.completedAt || '-') + '\n' +
      'Verified: ' + (job.verifiedAt || '-') + '\n' +
      (job.verification ? '\nCount check: ' + JSON.stringify(job.verification, null, 2) + '\n' : '') +
      (errors.length ? '\nErrors (' + errors.length + '):\n' + JSON.stringify(errors.slice(0, 20), null, 2) + '\n' : '');

    MailApp.sendEmail(recipient, subject, body);

    props.setProperty('RB001_LAST_NOTIFIED_KEY', notifyKey);
    props.setProperty('RB001_LAST_NOTIFIED_JOB_ID', job.jobId);
    props.setProperty('RB001_LAST_NOTIFIED_STATUS', job.status);

    Logger.log('RB-001 notification sent: ' + notifyKey);

  } catch (err) {
    console.error('RB-001 notification check error: ' + String(err));
  }
}


function installRB001NotificationTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkRB001BackupNotification') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp
    .newTrigger('checkRB001BackupNotification')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('RB-001 notification trigger installed.');
}
