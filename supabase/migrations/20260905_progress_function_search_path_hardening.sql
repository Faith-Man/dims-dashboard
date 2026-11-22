-- PROJ-0028 / TASK-0062
-- Reproduce the verified explicit search_path hardening for DIMS progress functions.

alter function public.dims_normalize_task_progress()
  set search_path = public, pg_temp;

alter function public.dims_recalculate_project_progress(uuid)
  set search_path = public, pg_temp;

alter function public.dims_refresh_parent_project_progress()
  set search_path = public, pg_temp;

alter function public.dims_task_progress_from_status(text)
  set search_path = public, pg_temp;
