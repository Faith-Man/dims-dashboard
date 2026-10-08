# TASK-0019 — Governed synchronization integration gate

Project: PROJ-0015. Task: TASK-0019.

## Verified inventory (read-only)
- The isolated GitHub branch write and read-back test succeeded.
- Supabase public.sync_log exists with asset_code, asset_name, sync_status, message, source, created_at.
- Supabase public.tetelestai_change_history tracks record_type, project_id, task_id, field_name, old_value, new_value, reason, changed_by, changed_at.
- Supabase public.tetelestai_automation_runs tracks task-linked execution outcomes.
- The inspected sync_log contains TeachingArtifactSyncExtension.gs entries (98 verified, 4 failed); no GitHub/Cloudflare source was observed in that aggregation.

## Safe next integration gates
1. Identify existing authenticated backend controls and authoritative project/task verification rules; do not write via a browser publishable key.
2. Capture GitHub commit/PR and Cloudflare deployment evidence using an authenticated server-side receiver. Verify webhook signatures or provider identity.
3. Map evidence to existing task_number; ambiguous or missing matches enter review, never create invented IDs.
4. Persist immutable evidence with unique provider event identifiers and idempotent processing; preserve provider-specific logs.
5. Record proposed status transitions for review. A commit or successful deployment is not proof of task completion; verified_closed requires explicit governed verification.
6. Test with a non-production fixture, inspect logs and read-back, then authorize controlled rollout.

## Isolation
No DMI/Gmail adapter changes. No production, Main Test, or visual architecture changes. No Supabase schema, project, task, or status mutations performed by this document.
