# RB-001-03 — Supabase Isolation Check — 2026-08-28

Purpose: preserve current non-secret, read-only evidence for the Supabase backup-and-restore certification boundary without mutating production or incurring provider charges.

## Source project

- Project name: `DIMS-v3`
- Project ref: `sdquzhsylqpbhrmqjqgk`
- Region: `us-east-1`
- Project status observed: `ACTIVE_HEALTHY`
- PostgreSQL engine: 17
- Database version observed: `17.6.1.127`
- Organization: `Dominion`
- Organization plan observed: `free`

No secret keys, passwords, service-role credentials, bearer tokens, or database passwords are recorded here.

## Current public-schema observation

Read-only metadata inspection returned **25 public tables**, all observed with RLS enabled. Current representative row counts include:

- `projects`: 36
- `tasks`: 100
- `teachings`: 21
- `glossary_terms`: 13
- `asset_registry`: 106
- `sync_log`: 42
- `peace_safety_briefs`: 16
- `notifications`: 1063
- `notification_outbox`: 1063
- `tsi_evidence_records`: 18
- `tsi_domain_assessments`: 6

This observation demonstrates that the production project remains readable and healthy; it is not a substitute for isolated restore proof.

## Isolated-target check

Supabase branch inventory was checked on 2026-08-28. **No development branches are currently present.**

The provider-reported cost to create a Supabase branch for this organization was checked read-only and returned **$0.01344 per hour**. Because RB-001 automation is explicitly prohibited from incurring charges without authorization, no branch was created and no cost confirmation was requested or accepted.

## Certification boundary

RB-001-03 remains **IN PROGRESS / BLOCKED ON ISOLATED TARGET**.

Certification still requires restoration into an authorized isolated/non-production target and objective comparison against the selected recovery point and the preserved production baseline. Production must not be modified merely to satisfy the test.

The exact authorization needed to unblock the Supabase-hosted branch path is approval to incur the provider branch charge for the duration of the isolated recovery test. A no-cost isolated Postgres target plus an authorized database export mechanism would also satisfy the non-production-target boundary if made available.
