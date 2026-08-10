# Phase 1C — Backup & Restore Readiness Report

**Date:** 2026-08-10
**Status:** BLOCKED — SECURE BACKUP ACCESS REQUIRED
**Mode:** Repository-safe documentation + read-only live verification only

## 1. Objective

Establish a verified, recoverable Supabase baseline before account provisioning, live RLS/grant hardening, function hardening, migrations, or deployment.

## 2. Verified live state

Live project: `DIMS-v3` (`sdquzhsylqpbhrmqjqgk`)

Verified from the connected Supabase project:

- Project status: `ACTIVE_HEALTHY`
- Region: `us-east-1`
- PostgreSQL: 17.6
- Approximate database size: 13 MB
- Public tables: 19
- RLS enabled on all 19 public tables
- Auth users: 0
- Organization: Dominion
- Organization plan: Free
- Migration history present with 15 recorded migrations through `20260809082038 automate_project_task_progress`

Current security advisories remain unresolved and untouched:

- `public.notification_outbox` has RLS enabled but no policy.
- `public.dims_task_progress_from_status` has mutable `search_path`.
- `public.dims_normalize_task_progress` has mutable `search_path`.
- `public.dims_recalculate_project_progress` has mutable `search_path`.
- `public.dims_refresh_parent_project_progress` has mutable `search_path`.

## 3. Codex environment assessment

The Phase 1C Codex run correctly stopped at the credential/tooling boundary.

It found no securely supplied database connection, no `supabase`, `pg_dump`, `pg_restore`, `psql`, or local PostgreSQL runtime, and no authorized isolated restore target. It did not attempt a live database connection and did not invent credentials or backup evidence.

Accordingly, these required Phase 1C outcomes are **NOT TESTED**:

- logical backup creation;
- schema-only export;
- external preservation of a real backup artifact;
- SHA-256 backup checksum;
- isolated restore rehearsal;
- source-versus-restored row-count comparison;
- restore verification.

No backup manifest was created because no real backup exists yet.

## 4. Platform backup constraint

The connected Dominion organization is on the Supabase Free plan. Under the current Supabase backup guidance, Free-plan projects must not be assumed to have paid-plan automatic daily-backup protection sufficient to satisfy this project gate. An external logical backup must therefore be created and independently preserved before live security hardening is authorized.

## 5. Minimum prerequisites to unblock Phase 1C

A future authorized backup/restore run requires all of the following:

1. A supported logical-backup toolchain (`supabase db dump` or compatible PostgreSQL `pg_dump`/`pg_restore`).
2. Secure delivery of a database connection credential through a secret manager or equivalent protected environment mechanism; never through source control or chat-visible plaintext.
3. A restricted external preservation location for the raw backup artifact.
4. A schema-only export sufficient to capture tables, columns/types/defaults, sequences, constraints, indexes, functions/signatures/bodies, triggers, policies, grants, extensions, and ownership information where supported.
5. An authorized isolated restore target, such as a local disposable PostgreSQL instance or separately approved non-production Supabase environment.
6. Explicit cost authorization before creating any paid Supabase project or development branch.
7. A controlled regression window and an accountable operator for the restore rehearsal.

## 6. Prohibited actions preserved

No production restore, database reset, DDL, DML, RLS, GRANT/REVOKE, Auth-user creation, password/secret change, migration application, function/trigger/policy change, deployment, paid branch/project creation, or historical deletion occurred.

No raw database dump or sensitive backup payload was committed to GitHub.

## 7. Gate decision

Phase 1C cannot be marked verified until a real external logical backup and schema export are created and a real isolated restore rehearsal succeeds.

Account provisioning and live RLS/grant hardening remain blocked by this gate.

**BLOCKED — SECURE BACKUP ACCESS REQUIRED**
