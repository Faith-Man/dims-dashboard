# TASK-0019 — Supabase Evidence Storage Contract (NOT DEPLOYED)

Target: `public.sync_evidence_inbox`, accessible only through a trusted server-side client. This is a **review proposal**, not an applied migration. No production schema or task statuses have been changed.

## Required columns

| Column | Type | Requirement |
| --- | --- | --- |
| provider | text | NOT NULL; `github` or `cloudflare` |
| event_id | text | NOT NULL; provider event identifier |
| reference | text | NOT NULL DEFAULT '' |
| description | text | NOT NULL DEFAULT '' |
| task_numbers | text[] | NOT NULL DEFAULT '{}' |
| disposition | text | NOT NULL; `pending_review` or `needs_manual_matching` |
| review_state | text | NOT NULL DEFAULT 'unreviewed' |
| verified_closed | boolean | NOT NULL DEFAULT false |
| received_at | timestamptz | NOT NULL DEFAULT now() |

Unique constraint: `(provider, event_id)`. Set length and enumerated-value CHECK constraints. Keep evidence immutable after insertion, with a separate authorized review history when implemented.

## Access controls and architecture

- Enable and force row-level security on the exposed `public` table; **no policies** for `anon` or `authenticated`.
- Revoke table privileges from `PUBLIC`, `anon`, and `authenticated`; avoid any public REST exposure. A private schema is preferable if the gateway uses a direct Postgres connection; the current Supabase JS adapter targets the public schema.
- Only a managed, server-side privileged identity may insert/read evidence. Never embed privileged credentials in browser assets, GitHub Actions logs, or repository files.
- Validate signature **before** any persistence attempt. Never permit evidence intake to change TETELESTAI project/task statuses.
- Provider/event uniqueness must be enforced by PostgreSQL, not only application memory.
- Retention, personal-data minimization, security audit, migration review, and an explicit authorized deployment are still required.

## Verification gate

1. Approve table design and authorization model.
2. Apply a reviewed migration in an authorized environment.
3. Confirm table privileges and RLS using database inspection.
4. Test signed intake → insert → read-back → duplicate delivery → unchanged official task status.
5. Confirm production deployment authorization separately.

The isolated HTTP/Supabase test uses an **in-memory fake database**, not live Supabase.
