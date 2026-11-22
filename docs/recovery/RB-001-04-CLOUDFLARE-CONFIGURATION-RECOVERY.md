# RB-001-04 Cloudflare Configuration Recovery

Status: IN PROGRESS  
Program: RB-001 Backup & Recovery  
Control: RB-001-04 Cloudflare Configuration Recovery  
Established: 2026-08-15  
Reconciled: 2026-08-30

## Objective

Preserve the source-controlled Cloudflare Workers configuration required to reconstruct the DIMS/DOME deployment without copying secret values, and define the isolated verification boundary required for certification.

## Preserved source configuration

Authoritative sources on `Faith-Man/dims-dashboard` `main`:

- repository-root `wrangler.jsonc`
- `src/dome-worker.js`
- delegated runtime `src/shamar-worker.js`

Current canonical configuration declares:

- Worker name: `dome-dashboard`
- Worker entrypoint: `src/dome-worker.js`
- Compatibility date: `2026-08-14`
- Compatibility flag: `nodejs_compat`
- Preview URLs enabled
- Observability enabled with full head sampling
- Static assets directory: repository root (`.`)
- Static assets binding: `ASSETS`
- Worker-first static/runtime behavior enabled
- Workers AI binding: `AI`
- Non-secret Supabase URL variable: `SUPABASE_URL=https://sdquzhsylqpbhrmqjqgk.supabase.co`
- Supabase publishable client key is source-visible by design; it is not a service-role/secret credential and remains governed by RLS
- Cron trigger: `0 */6 * * *`
- `/api/dome/deploy` recovery/read-back endpoint provided by `src/dome-worker.js`
- `src/dome-worker.js` delegates normal fetch/scheduled handling to `src/shamar-worker.js`

These values are recoverable from version control and must not be duplicated into a second configuration authority.

## Reconciliation note

The earlier recovery record described the historical `dims-dashboard` / `src/shamar-worker.js` direct configuration. Current `main` has converged on canonical DOME routing through `dome-dashboard` / `src/dome-worker.js`, which delegates to SHAMAR. Under EBYC, this document follows the current governed source rather than preserving stale deployment identity as current authority. Historical preview evidence remains valid only for what it objectively proves about the earlier governed Git integration.

## Secrets and credentials

Secret values are intentionally excluded from this document and from source control. Recovery follows `RB-001-06-CONFIGURATION-SECRETS-RECOVERY.md`: restore configuration from governed source, then reissue or re-bind required provider credentials/secrets through the provider's secure runtime configuration path. Evidence may record secret names and verification outcomes only, never values.

## Reconstruction procedure

1. Start from a verified clone or bundle restoration of `Faith-Man/dims-dashboard`.
2. Confirm `wrangler.jsonc`, `src/dome-worker.js`, and delegated runtime source are present and readable.
3. Install the repository's declared dependencies in an isolated recovery workspace.
4. Validate the Wrangler configuration against the installed Wrangler schema/tooling.
5. Re-establish required secret bindings through Cloudflare's secure secret-management path; do not place secret values in committed files.
6. Deploy to an isolated/non-production Worker target or otherwise non-destructive recovery target.
7. Verify representative static assets load.
8. Verify `/api/dome/deploy` returns the expected DOME worker identity/deploy metadata on the isolated target.
9. Verify representative `/api/*` execution through the delegated Worker path.
10. Verify the Workers AI binding resolves successfully where exercised without creating unnecessary billable work.
11. Verify the six-hour cron schedule is present on the isolated target without relying on production as the test bed.
12. Record target identifier, deployment result, configuration validation result, functional checks, and any exceptions in `RB-001-10-RECOVERY-EVIDENCE-AUDIT-RECORD.md`.

## Current verification

Source preservation is VERIFIED: current `main` contains the canonical `wrangler.jsonc`, `src/dome-worker.js`, and delegated Worker runtime. The current configuration is therefore reconstructable from governed source without using the stale historical deployment identity.

Historical non-production deployment evidence is also VERIFIED: Cloudflare's Git integration successfully deployed PR #9 commit `ac805cc402a5d54a0f3ca27c6384edbbb1ac7805` to a commit preview and branch preview on 2026-08-13. PR evidence also records a successful `dome-dashboard` deployment for that commit. This proves that the governed repository/Git integration can produce non-production Cloudflare deployments without branch promotion, but it predates the current canonical DOME recovery configuration.

Certification remains IN PROGRESS because RB-001 requires current isolated/non-destructive runtime proof: representative static asset read-back, `/api/dome/deploy` read-back, representative delegated `/api/*` execution, Workers AI binding verification where exercised, and confirmation of the six-hour cron schedule on the isolated target. Historical preview-deploy evidence must not be over-interpreted as current reconstruction certification.

## Certification rule

Mark RB-001-04 COMPLETE only after both conditions are true:

1. required recoverable Cloudflare configuration is preserved in governed source; and
2. the current canonical DOME configuration has been reconstructed on an isolated/non-production target and functionally verified with objective evidence.
