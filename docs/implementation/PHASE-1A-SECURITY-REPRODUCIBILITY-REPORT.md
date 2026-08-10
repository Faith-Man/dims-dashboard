# Phase 1A — Security & Reproducibility Preparation Report

**Date:** 2026-08-10
**Status:** Repository preparation only; live changes pending review/authorization
**External changes:** None performed

## 1. Scope and governance

This package follows EBYC and convergence without erasure. The dated Supabase baseline and all historical/audit artifacts remain unchanged. Work is limited to repository-side security foundations, review material, reconciliation, and a controlled build boundary. It does not deploy, alter Supabase, change secrets/platform settings, or implement autonomous prophetic generation.

The design keeps DI as a governed cross-module layer, not an eighth module. OrAI is limited to clearly labelled assistance; EKPOREUMA authorship and discernment stay human-governed. The production boundary separates DOME runtime surfaces from VAULT/repository preservation evidence rather than erasing it.

## 2. Verified Supabase baseline assessment

All 19 captured public tables have RLS enabled; none has FORCE RLS recorded. The policy inventory is:

- authenticated unconditional `ALL`: `accounts`, `architecture_decisions`, `archive_records`, `budget_categories`, `content_items`, `ddbb_briefings`, `glossary_terms`, `martureo_reports`, `neshamah_records`, `transactions`;
- authenticated separate CRUD: `missions` (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, each unconditional for authenticated);
- authenticated notification access: `notifications_authenticated_select`; `notifications_authenticated_update`, whose check restricts status to `unread`, `read`, or `dismissed`;
- public unconditional `ALL`: `asset_registry`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, `teachings`.

The snapshot reports role grants relevant to anon/authenticated access and confirms the six public policies combine with current grants to permit anonymous CRUD, but does not enumerate exact GRANT statements. Exact grants therefore remain a reconstruction blocker and must not be invented.

Captured sequences are `project_number_seq` and `task_number_seq`. Captured public functions are `assign_project_number`, `assign_task_number`, `dims_task_progress_from_status`, `dims_normalize_task_progress`, `dims_recalculate_project_progress`, `dims_refresh_parent_project_progress`, `set_updated_at`, and `rls_auto_enable`. Captured `dims_internal` functions are `enqueue_notification`, `generate_due_notifications`, `notify_project_change`, and `notify_task_change`. The internal notification functions are SECURITY DEFINER; internal and numbering functions have fixed search paths. The four progress functions lack a recorded fixed search path.

Captured triggers are `missions_set_updated_at`, `trg_assign_project_number`, `trg_dims_project_notifications`, `trg_assign_task_number`, `trg_dims_task_progress`, `trg_dims_refresh_project_progress`, and `trg_dims_task_notifications`. The baseline also records an RLS-enabling event-trigger function but not sufficient event-trigger DDL for reconstruction. Foreign keys, key unique/index objects, operational indexes, and check constraints remain enumerated in the preserved baseline.

## 3. Six-table write-path assessment

| Table | Current source writes | Session evidence | Assessment |
|---|---|---|---|
| `asset_registry` | `enterprise-forms.html:76` insert | Page creates an anon client; no auth flow | Appears to rely on public/anonymous write. |
| `peace_safety_briefs` | None found | `peace-safety-intelligence.html:69` reads through anon client | No repository write path found; anonymous read requirement unresolved. |
| `projects` | `projects-tasks.html:739` insert; minified `dims-enterprise-grid/projects-tasks.html:1` insert | Both use anon clients; no auth flow | Appears to rely on public/anonymous write. |
| `sync_log` | None found | No caller found | Public CRUD exposure has no current repository justification; external writers remain possible and unknown. |
| `tasks` | `projects-tasks.html:772` insert; minified grid page insert | Both use anon clients; no auth flow | Appears to rely on public/anonymous write. |
| `teachings` | `dashboard-v3.html:411` upsert; `dashboard-v3a.html:337` upsert; `orel-studio.html:389,421` upsert/delete; `supabase-test.html:24` insert; `admin.js:105` upsert | Only `admin.js` explicitly calls `getSession`, auth-state handling, OTP sign-in, and sign-out. Other callers initialize anon clients and may inherit a browser session, but do not enforce one in their own UI. | `admin.js` is authenticated-aware. Remaining paths appear designed around public access or unverified ambient sessions. Test writer is excluded from `dist/`. |

Additional writes outside the critical six exist to `architecture_decisions`, `glossary_terms`, stale `session_snapshots`/`resume_points`, and authenticated-policy `neshamah_records`; these are captured in the reconciliation report and require later authentication/schema truthfulness work.

## 4. Least-privilege proposal and unresolved decisions

Repository evidence supports only these present facts: unauthenticated browser reads occur, multiple anonymous browser writes occur, one teaching admin UI knows about authenticated sessions, and a server/service identity will be necessary for privileged automation. It does **not** establish a canonical role store, tenant/organization model, row ownership, assignment model, approval authority, or anonymous publication rules.

| Identity | Evidence-supported minimum | Unresolved human authorization |
|---|---|---|
| Reader | Read only from explicitly published/public records, if anonymous publication is approved; authenticated read otherwise | Which tables/rows and lifecycle statuses are public. |
| Contributor | Create records in authorized module; read own/assigned work | Role storage, ownership columns, six-table scope. |
| Editor | Update authorized content/work records, but no publication or security administration | Module boundaries, delete rights, record ownership. |
| Reviewer | Read review candidates and record review outcomes | Review schema and whether reviewer may edit source content. |
| Publisher | Change approved publication state only | Publication states, required approvals, public SELECT policy. |
| Administrator | Manage authorized operational/configuration data | Whether database-level changes or all-row access are allowed; separation from platform admins. |
| Service identity | Narrow server-side rights for named jobs, preferably distinct identities per job | Jobs, RPCs/tables, secret custody, bypass-RLS prohibition/exception, quotas. |

No proposed policy encodes these roles because doing so would invent permissions. The review SQL instead demonstrates the minimum transitional removal of `public ALL` and broad authenticated replacement, explicitly marked as insufficient least privilege. It cannot be promoted until the role matrix and affected browser flows are authorized.

## 5. Replayability foundation

`supabase/migrations/` documents dependency-safe order and truthfully records missing baseline DDL. `supabase/proposals/` separates review-only policy/search-path material from executable migrations. Exact schema replay needs a reviewed schema-only export containing columns, types/defaults, extensions/schemas/owners, sequences and ownership, constraints/indexes, function bodies/signatures/configuration, triggers/event trigger, grants, and policies. A non-destructive restore rehearsal and drift comparison are required before claiming reproducibility.

## 6. OrAI hardening

The Netlify function now accepts POST JSON only, caps raw bodies at 16 KiB, validates a closed payload shape and bounded fields, rejects prophetic mode, uses non-prophetic prompts, eliminates offline fabricated/current-intelligence content, returns safe errors without upstream bodies or exception messages, applies an upstream timeout, and includes request IDs plus prompt/model version metadata in structured logs/responses. Model and prompt versions are configuration hooks.

`ORAI_SHARED_TOKEN` provides an optional repository-side hook only when configured. It is deliberately not described as production authentication. Before public deployment, the platform must supply enforced user/service identity and authorization, edge/WAF rate limiting, per-identity quotas, durable/redacted telemetry with retention/alerting, secret rotation, and abuse/cost monitoring. Client delivery of a shared token is not an acceptable long-term browser security design.

The caller no longer invokes `prophesy_flow`; the control displays a human-governance notice. AI planning output is labelled an assisted draft. No replacement prophetic wording was introduced.

## 7. Schema truthfulness and production boundary

The separate reconciliation identifies four absent table names (`briefings`, `resume_points`, `session_snapshots`, `system_snapshots`) and refuses similarity-only renames. `ddbb_briefings` is only a candidate for a reviewed `briefings` migration. The build script produces `dist/` from an explicit runtime allowlist; Netlify and Cloudflare asset configuration now target that boundary. The repository root, evidence, ZIPs, tests, exports, backups, and superseded variants are excluded by default. No deploy was run.

## 8. Files changed and why

- `netlify/functions/orai.js`: request, governance, error, timeout, observability, and versioning hardening.
- `ai-buttons-injector.js`: disable AI prophetic generation and truthfully label planning assistance.
- `scripts/build-production.mjs`, `netlify.toml`, `wrangler.jsonc`, `.gitignore`: controlled `dist/` artifact.
- `docs/implementation/PRODUCTION-ARCHIVE-BOUNDARY.md`: boundary rationale and authority limits.
- `docs/implementation/PHASE-1A-STALE-SCHEMA-RECONCILIATION.md`: source-to-baseline reconciliation.
- `supabase/migrations/*`: dependency order and truthful replay gap marker.
- `supabase/proposals/*`: isolated, non-live security review material.
- this report: assessment, decisions, checks, risks, and change record.

## 9. Risks and Phase 1B authorization blockers

1. Backup integrity and end-to-end restore remain unverified; no live security migration should proceed.
2. Full authoritative DDL/grants are absent; clean replay and rollback are not yet proven.
3. Removing public writes will break several pages until authenticated UX and authorization are implemented and tested.
4. Anonymous read/publication requirements and the seven application role semantics are undecided.
5. Stale tables may represent removed schema or an external database generation; mappings need provenance and column-level evidence.
6. Optional shared-token checking is not production identity, rate limiting, or quota enforcement; platform configuration is required.
7. Netlify versus Cloudflare production authority is unresolved; config preparation must not be mistaken for deployment approval.
8. The allowlist preserves the present runtime but is not a declaration that every included standalone page is canonical in the future unified shell.
9. Broad authenticated policies on ten other tables remain a later least-privilege risk.
10. Exact function signatures/bodies must be exported before search-path hardening can be made executable and regression tested.

## 10. Verification conclusion

Repository-side Phase 1A deliverables are prepared without external mutation or destruction of provenance. This is not completion of Phase 1 security and not authorization for live changes.

**PHASE 1A PREPARATION COMPLETE — LIVE SECURITY CHANGES PENDING REVIEW/AUTHORIZATION**
