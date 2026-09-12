# TASK-0076 — Teaching Artifact Sync Deployment Runbook

**Status:** Deployment boundary identified; queue side operational; ERBI located; GS-0005 compatibility correction required before live Apps Script deployment.

## Purpose
Complete the final runtime step for automatic teaching persistence and synchronization without bypassing the existing DIMS WebAppBridge / ERBI security boundary.

## Existing verified architecture
- Supabase teaching changes enqueue governed jobs in `sync_log` via SQL-0013 — Teaching Artifact Sync Queue Trigger.
- GS-0005 — `TeachingArtifactSyncExtension.gs` is source-controlled in this repository.
- Existing live WebAppBridge deployment is documented and extendable under EBYC.
- RepositoryService already supports artifact create/update/read-back verification.
- ERBI implementation `ERBI-2026-07-15-001` has now been located in Drive evidence. It defines `erbiHandlePost_`, HMAC envelope validation, replay protection, allowlisted actions, idempotency, audit logging, and governed `institutionalizeArtifact` routing.

## Verified ERBI boundary
The current `doPost(e)` handoff to `erbiHandlePost_(e)` is consistent with the newer governed write boundary. GS-0005 must not replace, bypass, or duplicate ERBI. The teaching queue worker is an internal scheduled worker and should consume already-governed Supabase queue rows directly; external POST-based artifact writes remain subject to ERBI.

## Compatibility finding requiring correction before deployment
The live Apps Script evidence contains an existing global function named:

`supabaseRequest_(table, method, payload, query)`

GS-0005 currently defines a different global function with the same name:

`supabaseRequest_(method, path, payload, extraHeaders)`

Google Apps Script uses one project-wide global namespace. Deploying GS-0005 unchanged risks overriding/colliding with the existing helper and breaking unrelated DIMS automation. This is a genuine incompatibility, not a reason to replace the existing engine.

**Required correction under EBYC:** namespace only the GS-0005 private Supabase helpers (for example `teachingSyncSupabaseRequest_`, `teachingSyncSupabaseSelect_`, `teachingSyncSupabaseInsert_`, and `teachingSyncSupabasePatch_`) and update GS-0005 internal callers. Do not alter the existing live `supabaseRequest_` implementation.

The trigger installer must also inspect existing project triggers before adding a worker trigger. It must not delete/recreate an already-valid trigger merely to reinstall it.

## Required deployment steps
1. Open the authoritative **DIMS-v3 Automation Engine** Apps Script project—not a `Copy of DIMS-v3 Automation Engine` unless evidence proves the primary project is not authoritative.
2. Confirm the project contains or otherwise preserves `SynchronizationEngine.gs`, `RepositoryService.gs`, `WebAppBridge.gs`, `ERBI-2026-07-15-001` (or its authoritative equivalent), and DIMS configuration/security modules.
3. Apply the minimal GS-0005 namespace compatibility correction described above in source control and use that corrected source for deployment.
4. Add corrected `TeachingArtifactSyncExtension.gs` as a new source file; do not replace the existing project or services.
5. Verify required Script Properties through the governed configuration mechanism: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `YARATHEKE_FOLDER_ID`; preserve existing ERBI properties including `ERBI_BRIDGE_HMAC_SECRET` and `ERBI_ALLOWED_FOLDER_IDS`. Do not expose values in source control or screenshots.
6. Save and perform syntax/reference checks. Resolve only genuine incompatibilities.
7. Inspect existing Apps Script triggers. If `processTeachingArtifactSyncQueue` already has the approved trigger, leave it in place. Otherwise add the approved worker trigger once.
8. Confirm the worker updates sync status transitions without duplicating jobs.
9. Run one controlled teaching artifact test through the full chain:
   - insert/update one non-public visible test teaching;
   - verify SQL-0013 creates the `sync_log` queue row;
   - verify GS-0005 consumes the row;
   - verify a Google Drive/YARATHĒKĒ artifact is created or updated;
   - verify `asset_registry` is reconciled;
   - verify `teachings` remains authoritative and linked;
   - perform actual Drive read-back and verify expected location/content;
   - verify final sync status is `verified` or the currently approved equivalent;
   - remove/retire the temporary test artifact after evidence is captured.
10. Record the test evidence in TASK-0076 and the DIMS verification/audit record.
11. Only then mark TASK-0076 complete and mission-certified.

## Current connector boundary
The connected tools can inspect GitHub and Google Drive evidence, but they do not expose an editable Google Apps Script project/trigger surface or `clasp` deployment session for the live Automation Engine. Therefore live GS-0005 insertion, Script Property inspection, trigger installation, and end-to-end execution still require the authorized Apps Script project UI (or a future approved Apps Script/clasp connector). This limitation must not be bypassed through an alternate Automation Engine or unsecured web write path.

## Current verified state
- SQL-0013 queue creation: VERIFIED.
- GS-0005 source: PRESENT.
- `erbiHandlePost_`: LOCATED and architecture confirmed.
- RepositoryService create/update/read/verify capability: CONFIRMED.
- GS-0005 global helper-name compatibility: **BLOCKED UNTIL MINIMAL NAMESPACE FIX IS APPLIED.**
- Live Apps Script deployment: PENDING.
- Worker trigger verification/installation: PENDING.
- End-to-end automatic Drive persistence/read-back certification: NOT YET TESTED.

## Resume command
**Resume TASK-0076: apply the minimal GS-0005 namespace compatibility fix, deploy the corrected extension into the authoritative DIMS-v3 Automation Engine, inspect/install the worker trigger exactly once, and execute the controlled end-to-end teaching synchronization test.**
