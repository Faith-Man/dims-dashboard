# Supabase Object Inventory — 2026-08-09

## Sequences

- `public.project_number_seq` — bigint, increment 1
- `public.task_number_seq` — bigint, increment 1

## Foreign-key relationships

- `tasks.project_id` → `projects.id`
- `notifications.project_id` → `projects.id` (`ON DELETE SET NULL`)
- `notifications.task_id` → `tasks.id` (`ON DELETE SET NULL`)
- `notification_outbox.notification_id` → `notifications.id` (`ON DELETE CASCADE`)
- `transactions.account_id` → `accounts.id`
- `transactions.category_id` → `budget_categories.id`

## Notable unique constraints / indexes

- `asset_registry.asset_code`
- `budget_categories.category_name`
- `missions.mission_code`
- `notification_outbox.dedupe_key`
- `notifications.dedupe_key`
- `projects.project_number`
- `tasks.task_number`
- `teachings.slug`

Additional operational indexes:

- `missions_status_idx`
- `missions_updated_at_idx`
- `notification_outbox_pending_idx`
- `notifications_project_idx`
- `notifications_status_created_idx`
- `notifications_task_idx`
- `idx_sync_log_asset_code`
- `idx_sync_log_created_at`

## Check constraints

- `missions.percent_complete` between 0 and 100.
- `notification_outbox.attempt_count >= 0`.
- `notification_outbox.channel` in `in_app`, `email`, `webhook`.
- `notification_outbox.status` in `pending`, `processing`, `sent`, `failed`, `cancelled`.
- `notifications.entity_type` in `system`, `project`, `task`.
- `notifications.severity` in `info`, `success`, `warning`, `critical`.
- `notifications.status` in `unread`, `read`, `dismissed`.
- `transactions.direction` in `income`, `spending`, `transfer`.

## Functions

### `dims_internal`

- `enqueue_notification(...)` — `SECURITY DEFINER`; fixed search path `public, dims_internal, pg_temp`.
- `generate_due_notifications(date)` — `SECURITY DEFINER`; produces review/due/overdue notifications.
- `notify_project_change()` — trigger function for project creation/status changes.
- `notify_task_change()` — trigger function for task creation/status/priority changes.

### `public`

- `assign_project_number()` — assigns `PROJ-####` using `project_number_seq`.
- `assign_task_number()` — assigns `TASK-####` using `task_number_seq`.
- `dims_task_progress_from_status(text)` — maps task status to 0/25/50/100.
- `dims_normalize_task_progress()` — sets task percent and completion date.
- `dims_recalculate_project_progress(uuid)` — averages child-task progress and auto-closes projects when all tasks complete.
- `dims_refresh_parent_project_progress()` — task trigger wrapper for project recalculation.
- `set_updated_at()` — updated timestamp trigger helper.
- `rls_auto_enable()` — event-trigger function that enables RLS on newly created public tables.

## Triggers observed

- `missions_set_updated_at` — BEFORE UPDATE on `missions`.
- `trg_assign_project_number` — BEFORE INSERT on `projects`.
- `trg_dims_project_notifications` — AFTER INSERT/UPDATE on `projects`.
- `trg_assign_task_number` — BEFORE INSERT on `tasks`.
- `trg_dims_task_progress` — BEFORE INSERT/UPDATE on `tasks`.
- `trg_dims_refresh_project_progress` — AFTER INSERT/UPDATE/DELETE on `tasks`.
- `trg_dims_task_notifications` — AFTER INSERT/UPDATE on `tasks`.

## Search-path hardening observation

The `dims_internal` notification functions and the numbering functions already use explicit search paths. The task/project progress functions (`dims_task_progress_from_status`, `dims_normalize_task_progress`, `dims_recalculate_project_progress`, `dims_refresh_parent_project_progress`) currently do not declare an explicit `search_path`; this remains a controlled hardening task.
