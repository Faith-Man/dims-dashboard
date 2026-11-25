# RB-001 Backup v3.0: Daily Incremental + 7/4 Retention

DIMS-RUN-0005 · TASK-0307 (PROJ-0033) · 2026-11-25

These files are the updated copies of three files in the Apps Script project **DIMS-v3 Automation Engine**. They were taken from the live project on 2026-11-25:

| File here | Replaces in Apps Script | What changed |
|---|---|---|
| `BackupBuilder.gs` | `BackupBuilder` | Lines 1–346 are unchanged (legacy `createDIMSBackupNow`, audit, and the shared helpers). The "RESUMABLE BACKUP ENGINE v2.0" section is replaced by v3.0. |
| `RB001Notification.gs` | `RB001Notification` | Fixed status checks, error handling, and the watchdog. |
| `appsscript.json` | `appsscript.json` | Adds the `script.send_mail` and `userinfo.email` scopes. |

`runDIMSWorkflow` (WorkflowBuilder) is **not changed**. It still runs checkpoint → snapshot → `runRB001BackupStage_()` → `startOrResumeRB001BackupJob()`.

## Why the Nov 24 backup stopped

- The v2 worker scheduled its next run only at the end of a run. On Nov 24 one run was cut off (6-minute limit, or a Drive error while it was saving state). No follow-up was scheduled, so the job sat at RUNNING with 24 files left. Its one-time trigger shows as DISABLED with a 100% error rate.
- `checkRB001BackupNotification` calls `MailApp.sendEmail`, but the manifest's explicit `oauthScopes` did not include `script.send_mail`. That call throws every time a job is finished, which is the 67% error rate.

## What v3 does

- **Daily incremental.** Copies only files whose modified time is after the start of the last VERIFIED backup, into `INCR_BACKUP_<date>_<id>`. Folder paths are kept, and only the folders needed for changed files are created.
- **Weekly full.** Every Sunday, plus any day with no verified baseline or when the base full is about a week old. The full goes into `FULL_BACKUP_<date>_<id>`, including empty folders.
- **To restore day X:** take the most recent FULL on or before X, then lay each INCR after it, in order, up to X.
- **Backups excluded** by folder ID `1sW3qo0AovZ4MW74TpMUGPCEMfBDHlz2I` at any depth, and by the name `Backups` at the top level.
- **Resume.** The next worker is scheduled at the *start* of every run, 4 minutes out (longer than one 3-minute pass), so a run that gets cut off is always followed up. A worker that finds another pass still holding the lock reschedules itself instead of ending the chain (both fixed live 2026-11-25). Job state is saved every 45 s instead of every 5 items. The per-file "is it already copied?" lookup runs only for the few items between the last save and a cut-off. Each copy is tagged `RB001-SRC:<id>` in its description, so a resumed run never copies a file twice. An item that cuts off a run 3 times is skipped and logged. The 5-minute notification check also restarts a job that has been idle for 20 minutes.
- **Verification.** At the end, the engine counts the files and folders in the backup folder. The result is `status: COMPLETED` + `verificationStatus: VERIFIED` only when destination files = files copied = files eligible, destination folders = folders created, and there are no errors. Otherwise it is `COMPLETED_WITH_ERRORS` / `COUNT_MISMATCH`. Only VERIFIED backups are used as the next incremental baseline.
- **The Nov 24 job** (schema 2.0) is resumed and finished under v3 with its original copy rules. It does not start over.
- **Retention.** Keep the newest 7 completed backups, plus the newest full of each of the newest 4 weeks, plus every backup that a kept incremental needs to restore. The rest go to **Drive Trash** (30-day recovery); nothing is ever permanently deleted. The legacy `BACKUP_*` and `ENTERPRISE_BACKUP_*` folders from June and July are **never touched** and are only listed. **Default is DRY_RUN:** the plan is written to `Backups/backup_retention_plan.json` and nothing is trashed until the owner runs `enableRB001RetentionLive()`.

## Deploy (owner, in the Apps Script editor)

1. In the project, open `BackupBuilder`, select all, and paste in `BackupBuilder.gs` from here. Do the same for `RB001Notification`. Open Project Settings, tick "Show appsscript.json", and paste `appsscript.json`. Save.
2. Run `getRB001Status` once. Google will ask you to re-authorize because of the new mail scope. Approve it.
3. Run `runRB001BackupNow`. This resumes the Nov 24 job and finishes it. Workers then continue every minute until the job ends.
4. Run `getRB001Status` again until it shows `COMPLETED` / `VERIFIED`, then record the files copied, size, and status in TASK-0307.
5. Run `runRB001BackupNow` once more. It should create an `INCR_BACKUP_…` folder holding only the files changed since step 3, and finish COMPLETED / VERIFIED.
6. Run `installRB001NotificationTrigger` to replace the old 5-minute trigger with a clean one.
7. **Hard stop.** Run `previewRB001Retention`, read the list, and run `enableRB001RetentionLive()` only if you approve it. Until then, nothing goes to Trash.
8. After a day, check https://script.google.com/home/triggers. `runDIMSWorkflow` and `checkRB001BackupNotification` should be at 0% errors.

## Tests

`node --test tests/rb001-backup.test.mjs` runs the engine against an in-memory Drive. The tests cover:

- a full backup cut off mid-run that resumes with no duplicates and verifies
- Backups is never copied into itself
- the next day is incremental, with paths kept
- Sunday runs are full
- a file that keeps cutting off runs is skipped
- the legacy Nov 24 job finishes
- retention in DRY_RUN and LIVE modes, with legacy folders untouched
- notification de-duplication and the watchdog
- a worker that finds the lock held keeps the chain going
- the worker delay is longer than a pass
- clean runs skip the per-file duplicate lookup

## Known limits

- A file *moved* into DIMS-v3 keeps its old modified time. An incremental will miss it, and the next Sunday full picks it up.
- Incrementals do not record deletions. Restoring FULL + INCRs can bring back a file that was deleted during the week.
