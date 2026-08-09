# DIMS-AUD-0001 — Live Supabase Security & Schema Audit

**Date:** 2026-08-09  
**Status:** Verified findings / remediation required  
**Scope:** Live Supabase project `sdquzhsylqpbhrmqjqgk`  
**Authority:** Canonical institutional record remains in DIMS-v3 Google Drive.

## Executive finding

All 19 inspected `public` tables have Row Level Security enabled. This is a positive finding and rules out the worst-case assumption that RLS is absent.

However, six operational tables currently have unconditional `public` `ALL` policies that allow anonymous CRUD when combined with the current table grants:

- `asset_registry`
- `peace_safety_briefs`
- `projects`
- `sync_log`
- `tasks`
- `teachings`

These policies are the primary critical security finding.

## RLS status

RLS is enabled on:

`accounts`, `architecture_decisions`, `archive_records`, `asset_registry`, `budget_categories`, `content_items`, `ddbb_briefings`, `glossary_terms`, `martureo_reports`, `missions`, `neshamah_records`, `notification_outbox`, `notifications`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, `teachings`, `transactions`.

None of the inspected public tables has `FORCE ROW LEVEL SECURITY` enabled.

## Public ALL policies requiring remediation

The following policies are scoped to the `public` role, use `cmd=ALL`, and have unconditional `true` expressions:

- `allow_all_asset_registry`
- `allow_all_peace_safety_briefs`
- `allow_all_projects`
- `Allow authenticated access to sync_log` — despite the name, the live policy role is `public`
- `allow_all_tasks`
- `allow_all_teachings`

## Authenticated-but-broad policies

The following tables are restricted to authenticated users at the RLS policy level but still use broad unconditional `ALL` policies and therefore do not yet enforce least privilege or row ownership:

- `accounts`
- `architecture_decisions`
- `archive_records`
- `budget_categories`
- `content_items`
- `ddbb_briefings`
- `glossary_terms`
- `martureo_reports`
- `neshamah_records`
- `transactions`

`missions` uses separate authenticated CRUD policies. `notifications` exposes authenticated SELECT and restricted UPDATE.

## Verified operational triggers

### Projects
- `trg_assign_project_number`
- `trg_dims_project_notifications`

### Tasks
- `trg_assign_task_number`
- `trg_dims_task_progress`
- `trg_dims_refresh_project_progress`
- `trg_dims_task_notifications`

### Missions
- `missions_set_updated_at`

This confirms that permanent numbering, task-progress normalization, parent-project progress refresh, and project/task notification behavior are present in the live database.

## Function hardening note

The `dims_internal` notification functions are `SECURITY DEFINER` and have an explicit search path. The project/task numbering functions also have an explicit search path.

The following progress functions did not show an explicit function-level `search_path` configuration and should be hardened during remediation:

- `dims_normalize_task_progress`
- `dims_recalculate_project_progress`
- `dims_refresh_parent_project_progress`
- `dims_task_progress_from_status`

## Remediation sequence

### Critical
1. Remove anonymous write capability from the six public-ALL tables.
2. Preserve anonymous SELECT only where explicitly required.
3. Require authenticated sessions for operational writes.
4. Verify current DIMS pages after tightening RLS.
5. Protect and rate-limit the OpenAI endpoint separately.

### High
1. Define DIMS application roles and least-privilege policies.
2. Add audit attribution and write-history where appropriate.
3. Harden function search paths.
4. Export schema, constraints, indexes, functions, triggers, grants, and RLS into source-controlled migrations.
5. Add CI checks for schema/RLS drift.

## Change-control decision

No RLS policy was changed during this audit. No destructive security migration was applied. This is deliberate because the current application relies on browser-to-Supabase access and a blanket lockdown could break working DIMS functionality.

Security remediation must be performed as a controlled migration with before/after functional verification.

## Governing conclusion

The next technical priority is **security stabilization and source-controlled database capture before major feature expansion**.

Recommended order:

1. Back up/export the current live schema and policy state.
2. Design the minimum viable role/access matrix.
3. Apply controlled RLS hardening.
4. Verify operational screens.
5. Commit migrations and schema evidence to GitHub.
6. Continue the unified seven-module modernization after the backend baseline is verified.
