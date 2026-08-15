# RB-001-04 Cloudflare Configuration Recovery

Status: IN PROGRESS  
Program: RB-001 Backup & Recovery  
Control: RB-001-04 Cloudflare Configuration Recovery  
Established: 2026-08-15

## Objective

Preserve the source-controlled Cloudflare Workers configuration required to reconstruct the DIMS/DOME deployment without copying secret values, and define the isolated verification boundary required for certification.

## Preserved source configuration

Authoritative source: repository-root `wrangler.jsonc` on `Faith-Man/dims-dashboard` `main`.

Verified configuration currently declares:

- Worker name: `dims-dashboard`
- Worker entrypoint: `src/shamar-worker.js`
- Compatibility date: `2026-08-14`
- Compatibility flag: `nodejs_compat`
- Observability enabled with full head sampling
- Static assets directory: repository root (`.`)
- Static assets binding: `ASSETS`
- Worker-first route pattern: `/api/*`
- Workers AI binding: `AI`
- Non-secret runtime variable: `SUPABASE_URL=https://sdquzhsylqpbhrmqjqgk.supabase.co`
- Cron trigger: `0 */6 * * *`

These values are recoverable from version control and must not be duplicated into a second configuration authority.

## Secrets and credentials

Secret values are intentionally excluded from this document and from source control. Recovery follows `RB-001-06-CONFIGURATION-SECRETS-RECOVERY.md`: restore configuration from governed source, then reissue or re-bind required provider credentials/secrets through the provider's secure runtime configuration path. Evidence may record secret names and verification outcomes only, never values.

## Reconstruction procedure

1. Start from a verified clone or bundle restoration of `Faith-Man/dims-dashboard`.
2. Confirm `wrangler.jsonc` and `src/shamar-worker.js` are present and readable.
3. Install the repository's declared dependencies in an isolated recovery workspace.
4. Validate the Wrangler configuration against the installed Wrangler schema/tooling.
5. Re-establish required secret bindings through Cloudflare's secure secret-management path; do not place secret values in files committed to Git.
6. Deploy to an isolated/non-production Worker target or otherwise non-destructive recovery target.
7. Verify static assets load and `/api/*` requests execute through the Worker.
8. Verify the Workers AI binding resolves successfully where exercised.
9. Verify the six-hour cron schedule is present on the isolated target without relying on production as the test bed.
10. Record target identifier, deployment result, configuration validation result, functional checks, and any exceptions in `RB-001-10-RECOVERY-EVIDENCE-AUDIT-RECORD.md`.

## Current verification

Source preservation is VERIFIED: the authoritative `wrangler.jsonc` is present on `main` and contains the recoverable Worker identity, entrypoint, compatibility settings, observability configuration, assets binding/routing behavior, Workers AI binding, non-secret Supabase URL, and six-hour cron trigger.

Isolated reconstruction is NOT YET CERTIFIED. This control remains open until a non-production Cloudflare target is available and the reconstruction procedure above is executed successfully with objective evidence.

## Certification rule

Mark RB-001-04 COMPLETE only after both conditions are true:

1. required recoverable Cloudflare configuration is preserved in governed source; and
2. an isolated/non-destructive reconstruction has been successfully deployed and functionally verified.
