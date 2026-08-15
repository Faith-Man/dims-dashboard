-- Source-control representation of the queue-support migration already applied in production.
create index if not exists projects_execution_queue_idx
  on public.projects (readiness, priority, queue_position, next_follow_up_date)
  where lower(coalesce(status, '')) <> all (array['complete','completed','done','closed','cancelled']);
create index if not exists tasks_execution_queue_idx
  on public.tasks (readiness, priority, queue_position, next_follow_up_date)
  where lower(replace(coalesce(status, ''), ' ', '_')) <> all (array['complete','completed','done','closed','cancelled']);
create index if not exists tasks_verification_queue_idx
  on public.tasks (verification_status, reported_complete_at)
  where verification_status in ('awaiting_verification','verification_failed','legacy_complete_review_required');
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists task_follow_up_reviews_task_date_idx
  on public.task_follow_up_reviews (task_id, review_date desc);

