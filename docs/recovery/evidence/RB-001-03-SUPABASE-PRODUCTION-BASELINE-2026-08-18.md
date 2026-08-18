# RB-001-03 — Supabase Production Recovery Baseline — 2026-08-18

Purpose: preserve non-secret, read-only production baseline evidence needed to validate a future isolated Supabase restore. This evidence does **not** certify RB-001-03; isolated restore proof is still required.

## Source project

- Project name: `DIMS-v3`
- Project ref: `sdquzhsylqpbhrmqjqgk`
- Region: `us-east-1`
- Observed project status: `ACTIVE_HEALTHY`
- Database engine: PostgreSQL 17

No secret keys, passwords, service-role credentials, or bearer tokens are recorded here.

## Public-schema baseline

Read-only Supabase metadata inspection on 2026-08-18 returned the following public tables, RLS state, and representative row counts:

| Table | RLS | Rows |
|---|---:|---:|
| `projects` | enabled | 34 |
| `tasks` | enabled | 93 |
| `content_items` | enabled | 0 |
| `teachings` | enabled | 20 |
| `glossary_terms` | enabled | 12 |
| `ddbb_briefings` | enabled | 0 |
| `architecture_decisions` | enabled | 10 |
| `martureo_reports` | enabled | 3 |
| `neshamah_records` | enabled | 2 |
| `asset_registry` | enabled | 96 |
| `sync_log` | enabled | 39 |
| `peace_safety_briefs` | enabled | 6 |
| `missions` | enabled | 1 |
| `accounts` | enabled | 0 |
| `budget_categories` | enabled | 0 |
| `transactions` | enabled | 0 |
| `archive_records` | enabled | 1 |
| `notifications` | enabled | 770 |
| `notification_outbox` | enabled | 770 |
| `task_follow_up_reviews` | enabled | 0 |
| `tetelestai_follow_up_history` | enabled | 0 |
| `dea_risk_assessments` | enabled | 0 |
| `tetelestai_change_history` | enabled | 9 |

Observed public-table count: **23**. All observed public tables had RLS enabled.

## Migration baseline

Read-only migration inspection found the governed migration chain through:

- `20260816213309_add_tetelestai_priority_method`
- `20260816213952_add_tetelestai_apn_inputs`

The observed chain also includes the July RLS/security migrations, notification-engine creation, SHAMAR brief/realtime controls, TETELESTAI closed-loop controls, and DEA/RAC follow-up controls.

## Future isolated-restore comparison criteria

When an authorized non-production Supabase restore target is available, compare the restored target against this baseline and the selected recovery-point evidence for at least:

1. expected public table set;
2. RLS enabled state on protected public tables;
3. migration chain through the selected recovery point;
4. representative row counts for `projects`, `tasks`, `teachings`, `asset_registry`, `peace_safety_briefs`, `notifications`, and `notification_outbox`;
5. required functions/triggers and application read paths defined by the RB-001-09 runbook.

## Certification boundary

**RB-001-03 remains IN PROGRESS.** Production metadata is healthy and baseline evidence is now preserved, but certification still requires restoration into an authorized isolated/non-production target and objective validation against the selected backup/recovery point. Production must not be mutated merely to satisfy the test.
