# TASK-0076 — Teaching Artifact Sync Deployment Runbook

**Status:** Deployment boundary identified; queue side operational; Apps Script runtime deployment pending.

## Purpose
Complete the final runtime step for automatic teaching persistence and synchronization without bypassing the existing DIMS WebAppBridge security boundary.

## Existing verified architecture
- Supabase teaching changes enqueue governed jobs in `sync_log` via SQL-0013 — Teaching Artifact Sync Queue Trigger.
- GS-0005 — `TeachingArtifactSyncExtension.gs` is source-controlled in this repository.
- Existing live WebAppBridge deployment is documented and extendable under EBYC.
- RepositoryService already supports artifact create/update/read-back verification.

## Security boundary
The current WebAppBridge readiness audit explicitly states that external conversational write integration is not ready until authentication, JSON POST parsing, validation, idempotency, and audit controls are implemented and tested. Do not bypass that boundary by invoking exposed write actions as a deployment mechanism.

## Required deployment steps
1. Open the authorized DIMS-v3 Apps Script project that contains `SynchronizationEngine.gs`, `WebAppBridge.gs`, `RepositoryService`, and the existing DIMS configuration.
2. Add `TeachingArtifactSyncExtension.gs` from `enterprise/google-apps-script/TeachingArtifactSyncExtension.gs` as a new source file; do not replace the existing project.
3. Verify that the extension references only existing DIMS configuration keys and repository helpers, or add the required Script Properties/configuration values through the governed configuration mechanism.
4. Install or enable the worker trigger specified by GS-0005 so queued `TeachingArtifactSyncTrigger` rows in `sync_log` are consumed automatically.
5. Confirm the worker updates sync status transitions (`queued` → processing → verified/failed) without duplicating jobs.
6. Run one controlled teaching artifact test through the full chain:
   - insert/update a non-public visible test teaching;
   - verify SQL-0013 creates the `sync_log` queue row;
   - verify GS-0005 consumes the row;
   - verify a Google Drive/YARATHĒKĒ artifact is created or updated;
   - verify `asset_registry` is reconciled;
   - verify `teachings` remains authoritative and linked;
   - verify read-back succeeds;
   - verify final sync status is `verified`;
   - remove the temporary test artifact after evidence is captured.
7. Record the test evidence in TASK-0076 and the DIMS verification/audit record.
8. Only then mark TASK-0076 complete and mission-certified.

## Current blocker
No Apps Script project connector, `clasp` deployment configuration, or repository script ID/authentication material is available through the connected tools. The Drive results expose code/reference Google Docs rather than an editable `application/vnd.google-apps.script` project. Therefore runtime deployment cannot be completed from the current connector surface without violating the approved security boundary.

## Resume command
**Resume TASK-0076: deploy GS-0005 into the authorized DIMS Apps Script project and run the controlled end-to-end teaching synchronization test.**
