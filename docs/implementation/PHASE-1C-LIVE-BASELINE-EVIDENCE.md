# Phase 1C — Live Supabase Baseline Evidence

**Captured:** 2026-08-10
**Mode:** Read-only verification
**Project:** DIMS-v3 (`sdquzhsylqpbhrmqjqgk`)

## Project

- Status: ACTIVE_HEALTHY
- Region: us-east-1
- PostgreSQL: 17.6
- Database size: approximately 13 MB
- Organization: Dominion
- Organization plan: Free

## Public schema

Public table count: 19.

All 19 public tables currently report RLS enabled and FORCE RLS disabled:

- accounts
- architecture_decisions
- archive_records
- asset_registry
- budget_categories
- content_items
- ddbb_briefings
- glossary_terms
- martureo_reports
- missions
- neshamah_records
- notification_outbox
- notifications
- peace_safety_briefs
- projects
- sync_log
- tasks
- teachings
- transactions

## Authentication

- Auth users: 0

## Migration history

15 recorded migrations:

1. 20260713193736 enable_rls_permissive_policies
2. 20260714071915 create_peace_safety_briefs
3. 20260717183715 add_permanent_project_task_numbers
4. 20260720060652 create_minimum_operational_missions
5. 20260727210426 create_meta_schema_and_quarantine_process_tables
6. 20260727210436 drop_duplicate_legacy_briefing_tables
7. 20260727210446 create_treasury_module_tables
8. 20260727210450 create_archive_records_table
9. 20260727210514 add_authenticated_policies_new_tables
10. 20260727211206 revoke_public_execute_on_rls_auto_enable
11. 20260727211408 add_missing_policies_and_pin_search_paths
12. 20260728145830 restore_missions_and_neshamah_to_public
13. 20260728150356 restore_martureo_reports_to_public
14. 20260730203428 create_dims_notification_engine
15. 20260809082038 automate_project_task_progress

## Current security-advisor findings

- INFO: `public.notification_outbox` has RLS enabled with no policy.
- WARN: `public.dims_task_progress_from_status` has mutable search_path.
- WARN: `public.dims_normalize_task_progress` has mutable search_path.
- WARN: `public.dims_recalculate_project_progress` has mutable search_path.
- WARN: `public.dims_refresh_parent_project_progress` has mutable search_path.

This evidence file is descriptive only. It is not a logical backup, schema dump, migration replay, or restore verification artifact.
