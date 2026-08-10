# CODEX WORK PACKAGE — PHASE 1C BACKUP & RESTORE READINESS

## Objective

Establish a verifiable external logical backup and non-production restore rehearsal for the live DIMS-v3 Supabase database **without changing production data, policies, users, secrets, or deployment state**.

## Governing references

Read first if present locally:

- `docs/implementation/DOME-MODERNIZATION-IMPLEMENTATION-PLAN-v1.0.md`
- `docs/implementation/PHASE-1A-SECURITY-REPRODUCIBILITY-REPORT.md`
- `docs/implementation/PHASE-1B-AUTH-BOOTSTRAP-REPORT.md`
- `docs/implementation/PHASE-1C-BACKUP-RESTORE-READINESS.md`
- `supabase/migrations/README.md`
- `supabase/proposals/README.md`

Apply EBYC, convergence without erasure, and verification-before-completion.

## Verified live constraints

- Live Supabase project: `DIMS-v3` / `sdquzhsylqpbhrmqjqgk`.
- Organization plan: Free.
- Project is active/healthy.
- PostgreSQL 17.6.
- Approximate database size: 13 MB.
- 19 public tables.
- Auth users: 0.
- Do not assume automatic daily backup availability on this Free project.

## Authorized work

1. Inspect the local environment for Supabase CLI, `pg_dump`, `pg_restore`, `psql`, Docker/Podman, and a PostgreSQL client version compatible with the source database.
2. Determine the safest read-only way to produce:
   - a complete logical backup suitable for restore;
   - a schema-only export for reproducibility review;
   - optional data-only export if useful for verification.
3. Do not print, commit, or persist database passwords, service-role keys, access tokens, or other secrets.
4. If required database credentials are unavailable, STOP at that credential boundary and produce exact minimal manual retrieval instructions instead of inventing credentials.
5. If credentials are available securely in the environment, perform the dump read-only and save artifacts outside the deployable `dist/` tree.
6. Compute SHA-256 and byte size for every backup artifact.
7. Record UTC creation time, project ref, source PostgreSQL version, dump tool version, and exact command flags with secrets redacted.
8. Create a backup manifest in `docs/implementation/` or `backup-manifests/` containing metadata only; do not commit sensitive database payloads unless an explicit repository policy authorizes that.
9. Establish an isolated non-production restore rehearsal using local PostgreSQL/Docker if available. Never restore over the live Supabase project.
10. Verify restored schema/object counts and representative table row counts against read-only source counts.
11. Preserve a source schema-only export in an appropriate non-production artifact location if repository policy permits; otherwise document where it must be preserved.
12. Inventory backup limitations, including Supabase Storage objects and non-database platform configuration.
13. Produce `PHASE-1C-BACKUP-RESTORE-REPORT.md` with checks, evidence, failures, blockers, and exact next action.

## Prohibited

- No live DDL.
- No live DML except read-only verification queries.
- No RLS changes.
- No GRANT/REVOKE changes.
- No Auth-user creation.
- No password reset or rotation.
- No secret creation/change.
- No migration application.
- No deployment.
- No restore into the production project.
- No paid project or Supabase branch creation without explicit cost disclosure and authorization.
- No deletion/archival of historical artifacts.
- No committing database passwords, access tokens, service-role keys, raw connection strings with secrets, or sensitive dump payloads to GitHub.

## Acceptance criteria

- External logical backup artifact produced OR credential boundary explicitly and truthfully documented.
- Schema-only export produced OR credential boundary documented.
- SHA-256, size, time, source/tool metadata recorded for produced artifacts.
- Non-production restore rehearsal passes, or the exact environmental blocker is documented without pretending success.
- Source-versus-restored verification evidence exists when restore is performed.
- Storage/platform backup limitations documented.
- No production mutation occurs.

If all backup and restore criteria actually pass, finish with exactly:

**PHASE 1C BACKUP/RESTORE VERIFICATION COMPLETE — ACCOUNT PROVISIONING GATE READY FOR REVIEW**

If any required backup/restore criterion remains unresolved, finish with exactly:

**PHASE 1C BACKUP/RESTORE READINESS IN PROGRESS — LIVE SECURITY HARDENING REMAINS BLOCKED**
