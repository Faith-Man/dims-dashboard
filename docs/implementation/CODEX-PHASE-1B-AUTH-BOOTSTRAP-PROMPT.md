# CODEX WORK PACKAGE — PHASE 1B AUTHENTICATION BOOTSTRAP

## Objective
Prepare the DOME application for authenticated operation **without applying live Supabase RLS/grant changes yet**.

## Governing references
Read first:
- `docs/implementation/DOME-MODERNIZATION-IMPLEMENTATION-PLAN-v1.0.md`
- `docs/implementation/PHASE-1A-SECURITY-REPRODUCIBILITY-REPORT.md`
- `docs/implementation/PHASE-1B-READINESS-GATE.md`
- `docs/implementation/PHASE-1A-STALE-SCHEMA-RECONCILIATION.md`
- `supabase/proposals/README.md`

Apply EBYC. Preserve provenance. Do not invent business roles beyond evidence.

## Verified live constraints
- The live Supabase Auth schema currently has zero users.
- Several current operational pages write using anonymous clients.
- Six tables retain public unconditional ALL policies and broad anon table grants.
- Therefore **do not remove anonymous write access in this work package**.

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
8. Update Phase 1B documentation with exact files changed, remaining unauthenticated write paths, and manual account-provisioning steps that will be required.

## Prohibited
- No live Supabase DDL, RLS, grants, Auth-user creation, password changes, secrets, or migrations.
- No deployment.
- No deletion/archival of historical files.
- No conversion of `supabase/proposals/` SQL into executable migrations.
- No assumption that every authenticated user is an administrator/editor in the final model.
- No autonomous prophetic generation.

## Acceptance criteria
- Shared session/auth behavior exists in repository code.
- Current primary write UIs cannot initiate writes while unauthenticated at the UI layer.
- Existing authenticated admin behavior is preserved or cleanly consolidated.
- No live backend security behavior is changed.
- A remaining-write-path inventory is produced.
- Tests/checks pass.

Finish with exactly:

**PHASE 1B AUTH BOOTSTRAP PREPARATION COMPLETE — LIVE RLS/GRANT CHANGES STILL PENDING BACKUP/RESTORE + ACCOUNT PROVISIONING + REGRESSION AUTHORIZATION**
