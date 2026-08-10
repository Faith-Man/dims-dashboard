# CODEX WORK PACKAGE — PHASE 1B AUTHENTICATION BOOTSTRAP

## Objective

Prepare the DOME application for authenticated operation **without applying live Supabase RLS/grant changes yet**.

## Governing references

Read first if present locally:

- `docs/implementation/DOME-MODERNIZATION-IMPLEMENTATION-PLAN-v1.0.md`
- `docs/implementation/PHASE-1A-SECURITY-REPRODUCIBILITY-REPORT.md`
- `docs/implementation/PHASE-1A-STALE-SCHEMA-RECONCILIATION.md`
- `supabase/proposals/README.md`

Apply EBYC. Preserve provenance. Do not invent business roles beyond evidence.

## Verified live constraints

- The live Supabase Auth schema currently has zero users.
- Several current operational pages write using anonymous clients.
- Six tables retain public unconditional ALL policies and broad anon table grants:
  - `asset_registry`
  - `peace_safety_briefs`
  - `projects`
  - `sync_log`
  - `tasks`
  - `teachings`
- Therefore **do not remove anonymous write access in this work package**.
- Four live public functions have mutable `search_path` warnings:
  - `public.dims_task_progress_from_status(text)`
  - `public.dims_normalize_task_progress()`
  - `public.dims_recalculate_project_progress(uuid)`
  - `public.dims_refresh_parent_project_progress()`
- `public.notification_outbox` has RLS enabled with no policy; do not alter it until its intended access path is documented.

## Authorized repository work

1. Audit existing `admin.html` / `admin.js` authentication behavior and reuse it where practical.
2. Create a shared browser authentication/session module suitable for the current static-page architecture as an interim foundation.
3. Add a minimal, accessible sign-in/sign-out/session-status experience that can be reused by operational pages.
4. Migrate write controls for these current operational surfaces to require an authenticated session in the UI before mutation attempts:
   - Projects / Tasks
   - Teachings / OrEl
   - Asset Registry
   - NESHAMAH if it performs writes
   Do not change live RLS yet; this is application preparation only.
5. Preserve read-only behavior where anonymous/public reading may still be needed; do not make unsupported public-read decisions.
6. Centralize Supabase client creation enough to avoid introducing additional duplicated credentials/configuration.
7. Add tests or static verification for auth guards and session-dependent write controls where practical in the existing buildless architecture.
8. Produce a remaining-write-path inventory.
9. Document exact manual account-provisioning steps that will be required before live RLS hardening.
10. Update Phase 1B documentation with exact files changed, remaining risks, and unresolved authorization decisions.

## Prohibited

- No live Supabase DDL.
- No live RLS changes.
- No live GRANT/REVOKE changes.
- No Auth-user creation.
- No password changes.
- No secret changes.
- No migrations applied.
- No deployment.
- No deletion or archival of historical/provenance files.
- No conversion of `supabase/proposals/` SQL into executable migrations.
- No assumption that every authenticated user is an administrator/editor in the final model.
- No autonomous prophetic generation.
- Do not alter `notification_outbox`.
- Do not apply the function `search_path` proposal live in this work package.

## Acceptance criteria

- Shared session/auth behavior exists in repository code.
- Current primary write UIs cannot initiate writes while unauthenticated at the UI layer.
- Existing authenticated admin behavior is preserved or cleanly consolidated.
- No live backend security behavior is changed.
- Remaining unauthenticated write paths are inventoried.
- Manual account-provisioning steps are documented.
- Tests/checks pass.
- Historical/provenance artifacts remain unchanged.

Finish with exactly:

**PHASE 1B AUTH BOOTSTRAP PREPARATION COMPLETE — LIVE RLS/GRANT CHANGES STILL PENDING BACKUP/RESTORE + ACCOUNT PROVISIONING + REGRESSION AUTHORIZATION**
