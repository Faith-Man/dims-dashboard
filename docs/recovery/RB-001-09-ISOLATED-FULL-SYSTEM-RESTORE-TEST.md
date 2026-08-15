# RB-001-09 — Isolated Full-System Restore Test

## Purpose

Prove that DIMS/DOME can be reconstructed in an isolated, non-production environment from preserved source, backup data, configuration, and approved secret-recovery procedures without modifying production systems.

## Certification boundary

RB-001-09 is not complete until the restored environment is independently reachable, key application paths function, restored data is validated against source evidence, and results are recorded in the RB-001 recovery evidence ledger.

This runbook does not authorize destructive production changes, secret disclosure, paid resource creation, or reuse of production write targets for testing.

## Preconditions

1. RB-001-01 Google Drive backup/restore verification is complete.
2. RB-001-02 GitHub repository recovery rehearsal is complete.
3. RB-001-03 Supabase backup/restore certification is complete or an explicitly approved isolated database restore target exists.
4. RB-001-04 Cloudflare recovery is complete or an approved non-production Worker target exists.
5. RB-001-05 Netlify recovery is complete or an approved non-production site target exists.
6. RB-001-06 configuration/secrets recovery procedure is available and followed.
7. RB-001-08 backup-health check reports a current healthy backup set.
8. RB-001-10 recovery evidence ledger is available for evidence capture.

## Isolation requirements

- Use unique non-production project/site/Worker names.
- Do not point restored components at production write-capable endpoints unless the test is strictly read-only and explicitly authorized.
- Use isolated database/storage targets wherever practical.
- Never commit secret values to GitHub, Drive evidence, screenshots, logs, or audit records.
- Record only secret names, provider locations, rotation/reissue status, and verification outcomes.
- Avoid any action that incurs a charge without explicit authorization.

## Restore sequence

### Phase 1 — Recover source

1. Recover `Faith-Man/dims-dashboard` from the verified GitHub recovery artifact or canonical `main` source.
2. Verify repository integrity with Git object verification and compare restored HEAD to the selected recovery point.
3. Record commit SHA and recovery artifact identifier.

### Phase 2 — Recover data

1. Select the newest RB-001-08 healthy Google Drive backup set.
2. Verify full backup, daily checkpoint, and daily snapshot companion evidence.
3. Restore the Supabase database into an isolated authorized target using the RB-001-03 certified method.
4. Validate required tables, representative row counts, RLS state, functions/triggers required by DIMS, and critical application records.
5. Record the source backup timestamp, target identifier, schema validation results, and representative data checks without exposing sensitive values.

### Phase 3 — Recover configuration and credentials

1. Apply source-controlled non-secret configuration from the repository.
2. Recreate required environment variables/bindings by name according to RB-001-06.
3. Reissue or securely retrieve secret values through the approved provider path; never copy them into the evidence ledger.
4. Confirm `.env*`, `.dev.vars*`, and equivalent secret-bearing local files remain excluded from source control.

### Phase 4 — Recover delivery/runtime layers

1. Reconstruct Cloudflare in a non-production target according to RB-001-04.
2. Reconstruct Netlify in a non-production target according to RB-001-05 where the function path remains required.
3. Confirm routing, static assets, Worker/function execution, runtime bindings, and scheduled-task configuration without enabling a schedule that could write to production.

### Phase 5 — Functional validation

At minimum verify:

- DOME home page loads from the isolated environment.
- TETELESTAI projects/tasks view can read restored authoritative data.
- SHAMAR status/read paths respond without production writes.
- YARATHĒKĒ/OrEl navigation and static assets resolve.
- Required API routes return expected success/error semantics.
- No restored component unintentionally targets a production write endpoint.
- Browser console/network checks show no critical missing assets or configuration failures.

## Data validation evidence

Capture and compare:

- selected backup timestamp;
- restored repository commit SHA;
- key table names and representative row counts;
- project/task totals where applicable;
- required migration/schema presence;
- RLS state for protected tables;
- Worker/site deployment identifiers;
- functional-check results;
- exceptions and corrective actions.

Do not capture tokens, keys, passwords, service-role credentials, or other secret values.

## Pass criteria

RB-001-09 passes only when all of the following are true:

- source restore verified;
- database restore verified in isolation;
- required configuration/bindings reconstructed;
- isolated runtime/deployment reachable;
- critical DIMS/DOME read paths validated;
- no unintended production mutation occurred;
- evidence entered into RB-001-10;
- all material exceptions resolved or explicitly accepted by the authorized owner.

## Fail / blocked criteria

Mark the test blocked rather than bypassing controls if any required isolated target, authorized backup access, secret-recovery path, or no-cost execution path is unavailable. Record the exact missing prerequisite and continue other safe RB-001 work.

## Closeout

After a passing test, update RB-001-09 to complete with objective evidence references. RB-001-11 may proceed only after the complete environment has been successfully restored and all remaining certification conditions are satisfied.
