-- PROPOSAL ONLY — DO NOT APPLY WITHOUT HUMAN AUTHORIZATION AND REGRESSION REVIEW.
-- Exact function identity arguments were verified read-only against the live
-- Supabase project on 2026-08-10 using pg_get_function_identity_arguments().
-- No live DDL was changed during verification.

alter function public.dims_task_progress_from_status(text) set search_path = public, pg_temp;
alter function public.dims_normalize_task_progress() set search_path = public, pg_temp;
alter function public.dims_recalculate_project_progress(uuid) set search_path = public, pg_temp;
alter function public.dims_refresh_parent_project_progress() set search_path = public, pg_temp;

-- Promotion remains blocked until backup/restore confidence and regression
-- testing are established. This file remains in proposals/, not migrations/.
