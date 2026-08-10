# Phase 1B — Live Security Readiness Gate

**Date:** 2026-08-10  
**Status:** NOT AUTHORIZED FOR LIVE RLS PROMOTION  
**Evidence method:** read-only live Supabase inspection plus Phase 1A repository review

## Verified live facts

1. The Supabase project is ACTIVE_HEALTHY.
2. Six public tables still have unconditional `ALL` RLS policies granted to the `public` role: `asset_registry`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, and `teachings`.
3. `anon` currently has table-level privileges including `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER` on those six tables. `authenticated` has the same broad table privileges.
4. The live Auth schema currently contains **zero users**. Therefore removing anonymous write access now would break current browser write paths unless authentication is implemented and at least one authorized account is provisioned and tested first.
5. Supabase security advisors currently report four mutable-search-path warnings for:
   - `public.dims_task_progress_from_status(text)`
   - `public.dims_normalize_task_progress()`
   - `public.dims_recalculate_project_progress(uuid)`
   - `public.dims_refresh_parent_project_progress()`
6. Exact signatures and function bodies were verified read-only. The proposal file now contains the exact `ALTER FUNCTION ... SET search_path` statements, but remains proposal-only.
7. `public.notification_outbox` has RLS enabled with no policy. This may be intentional for service-only use, but its intended access path must be explicitly documented before it is changed.

## Phase 1B blockers

Live RLS hardening is blocked until all of the following are satisfied:

- [ ] Backup/restore capability is verified or a documented restore rehearsal is completed.
- [ ] Authentication strategy is approved for the DOME application.
- [ ] At least one authorized administrator/editor account can sign in successfully.
- [ ] Current anonymous write paths for Projects, Tasks, Teachings, and Asset Registry are migrated to authenticated sessions.
- [ ] Anonymous read requirements are decided separately for each public-facing dataset.
- [ ] Grants and RLS policies are changed together; dropping policies alone is not sufficient.
- [ ] Regression tests prove intended authenticated workflows still work after RLS changes.
- [ ] Rollback SQL and lockout recovery are prepared and reviewed.

## Recommended implementation order

1. Build/verify shared authentication and session bootstrap without changing current RLS.
2. Test authenticated reads/writes against the current live policies.
3. Prepare exact grant revocations and replacement policies for the six exposed tables.
4. Perform backup/restore verification.
5. Apply search-path hardening first if backup/rollback controls are satisfied; it is lower behavioral risk than the RLS transition.
6. Apply six-table RLS/grant hardening in a controlled window with immediate regression checks.
7. Run Supabase security advisors again and preserve the results.

## Authorization boundary

No live DDL, policy, grant, deployment, secret, or Auth-user mutation was performed during this readiness check.

**PHASE 1B STATUS: BLOCKED — AUTHENTICATION + BACKUP/RESTORE GATES MUST BE SATISFIED BEFORE LIVE RLS HARDENING.**
