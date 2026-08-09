# DIMS Supabase Live Baseline — 2026-08-09

**Project:** `sdquzhsylqpbhrmqjqgk`  
**Purpose:** Source-controlled snapshot of the live DIMS Supabase structure before security hardening and modernization.  
**Status:** Baseline capture / read-only export. This directory is not yet a replayable migration history.

## Captured scope

- 19 public tables
- columns, defaults, nullability, primary keys and foreign keys
- sequences
- indexes
- constraints
- RLS enabled state
- RLS policy definitions
- role grants relevant to anon/authenticated access
- public and `dims_internal` functions
- project/task notification and progress triggers

## Public tables

`accounts`, `architecture_decisions`, `archive_records`, `asset_registry`, `budget_categories`, `content_items`, `ddbb_briefings`, `glossary_terms`, `martureo_reports`, `missions`, `neshamah_records`, `notification_outbox`, `notifications`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, `teachings`, `transactions`.

## Key security finding

RLS is enabled on all 19 public tables. Six tables currently have unconditional `public` / `ALL` policies that effectively permit anonymous CRUD when combined with existing grants:

- `asset_registry`
- `peace_safety_briefs`
- `projects`
- `sync_log`
- `tasks`
- `teachings`

The baseline is intentionally preserved before those policies are changed so later audits can compare pre-hardening and post-hardening states.

## Automation already present

- Permanent project numbering via `project_number_seq` + `assign_project_number()`.
- Permanent task numbering via `task_number_seq` + `assign_task_number()`.
- Automatic task progress normalization from status.
- Automatic parent project progress recalculation.
- Project/task change notifications and notification outbox support.
- Automatic RLS enabling event trigger for new public tables.

## Known follow-on work

1. Define the DIMS role/access matrix.
2. Replace broad anonymous `ALL` policies with least-privilege policies.
3. Harden search paths on project/task progress functions.
4. Regression-test existing DIMS screens after policy changes.
5. Convert this baseline into controlled, replayable Supabase migrations and keep them in GitHub.

## Related governance artifacts

- `docs/security/DIMS-AUD-0001-live-supabase-security-schema-audit.md`
- `docs/architecture/DIMS-PLAN-0001-technical-modernization-implementation-plan.md`
- `docs/architecture/DIMS-ART-0002-dome-seven-module-architecture.md`
