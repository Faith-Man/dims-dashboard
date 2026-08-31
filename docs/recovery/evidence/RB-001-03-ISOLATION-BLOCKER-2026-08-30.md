# RB-001-03 Supabase Isolation Blocker Evidence — 2026-08-30

Control: RB-001-03 Supabase Backup & Restore Certification  
Outcome: BLOCKED — certification not complete

## Verified source state

- Supabase project: `DIMS-v3`
- Project ref: `sdquzhsylqpbhrmqjqgk`
- Observed project status: `ACTIVE_HEALTHY`
- Region: `us-east-1`
- PostgreSQL engine: 17
- Public-schema table inventory remains available through the connected management interface, with RLS enabled on all observed public tables.

## Isolation check

The Supabase development-branch inventory was checked again on 2026-08-30. No development branches currently exist for the DIMS-v3 project.

The provider cost query for a development branch currently reports `$0.01344/hour`. No branch was created and no cost was incurred.

## Certification boundary

RB-001-03 cannot be marked COMPLETE without an authorized isolated/non-production target on which a database restore can be performed and objectively compared against the governed production baseline. Production must not be mutated or overwritten merely to satisfy the test.

Creating a Supabase development branch/project may incur provider cost and requires the provider's cost-confirmation workflow. This automation is not authorized to incur charges or fabricate interactive approval. Therefore no branch/project was created.

Exact remaining authorization need: a user-approved, non-production Supabase restore target with the currently quoted branch cost of `$0.01344/hour` (or the then-current provider price) explicitly approved through the supported confirmation flow. Once such a target exists, the restore and baseline-comparison steps can proceed non-destructively.

No secret values or credentials are recorded in this evidence file.
