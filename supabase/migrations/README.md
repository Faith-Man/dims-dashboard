# Replayable Migration Foundation

This directory is the forward migration path. The immutable evidence snapshot remains in `supabase/baseline/2026-08-09/`; it is not a migration and must not be edited to make it appear replayable.

## Dependency order

1. extensions and schemas;
2. sequences and tables;
3. constraints and indexes;
4. functions (called functions before callers);
5. triggers and event triggers;
6. grants;
7. RLS enablement and policies;
8. non-destructive verification.

The captured baseline names the 19 tables and selected objects but does **not** contain complete column/type/default definitions, function bodies, trigger SQL, event-trigger DDL, full grants, owners, extension inventory, or sequence ownership/value state. Creating executable baseline DDL from it would invent evidence. `00000000000000_baseline_gap.sql` records this blocker in dependency position; a reviewed `pg_dump --schema-only` (plus independently captured grants/policies) is required before a clean database can be reproduced.

`proposals/` contains reviewable SQL and is deliberately outside this executable migration directory. It must not be copied into `migrations/` or applied live until backup/restore is verified, the role model is authorized, browser write paths are migrated to authenticated sessions, and regression tests are approved.
