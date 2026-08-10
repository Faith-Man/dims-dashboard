# Phase 1C — Backup & Restore Readiness Gate

**Date:** 2026-08-10
**Status:** IN PROGRESS — restore confidence not yet established
**Scope:** Read-only/live verification plus repository preparation. No production mutation authorized.

## Verified live facts

- Supabase project: `DIMS-v3` (`sdquzhsylqpbhrmqjqgk`).
- Project status: `ACTIVE_HEALTHY`.
- Region: `us-east-1`.
- PostgreSQL: 17.6.
- Approximate database size at verification: 13 MB.
- Public tables: 19.
- RLS is enabled on all 19 public tables.
- Supabase Auth users: 0.
- Organization `Dominion` is on the **Free** plan.

## Backup implication

Current Supabase documentation states that automatic daily database backups are provided for Pro, Team, and Enterprise projects. Free projects should maintain external logical backups using the Supabase CLI / PostgreSQL dump tooling. Therefore the Phase 1 security gate cannot treat platform backup/restore as verified for the current project.

## Required Phase 1C deliverables

1. Produce an external logical backup of the live database without changing the live database.
2. Record SHA-256 checksum, byte size, UTC creation time, source project ref, PostgreSQL version, and backup command/tool versions.
3. Produce a schema-only export suitable for authoritative DDL reconstruction and migration review.
4. Preserve grants/policies/functions/triggers/sequence information needed to close the Phase 1A reproducibility gap.
5. Establish a non-destructive restore rehearsal in an isolated local PostgreSQL environment or another explicitly authorized isolated target.
6. Verify restored schema/object counts and representative data counts against the source baseline.
7. Document objects not covered by a database dump, especially Supabase Storage objects and platform configuration.
8. Do not restore over production.
9. Do not create a paid Supabase project/branch without explicit cost disclosure and authorization.

## Current blockers

- No verified external logical backup artifact has yet been produced and preserved.
- No end-to-end restore rehearsal has yet passed.
- The current repository does not contain a complete authoritative `pg_dump --schema-only` baseline.
- Account provisioning remains blocked until backup/restore confidence is established.
- Live RLS/GRANT hardening remains blocked.

## Security findings retained during this gate

- `public.notification_outbox` has RLS enabled with no policy.
- The following functions still have mutable `search_path` warnings:
  - `public.dims_task_progress_from_status(text)`
  - `public.dims_normalize_task_progress()`
  - `public.dims_recalculate_project_progress(uuid)`
  - `public.dims_refresh_parent_project_progress()`

No remediation is authorized as part of backup/restore preparation.

## Exit criteria

Phase 1C may be marked ready only when:

- an external database backup exists outside the live project;
- checksum and metadata are recorded;
- a schema-only export is preserved;
- a non-production restore rehearsal succeeds;
- verification compares the restored result to the source baseline;
- restoration limitations are documented;
- backup artifacts have an approved preservation location;
- no production mutation occurred during the exercise.

**PHASE 1C STATUS: BACKUP/RESTORE READINESS IN PROGRESS — LIVE SECURITY HARDENING REMAINS BLOCKED**
