# Phase 1B Remaining Write-Path Inventory

**Method:** Static inventory of browser Supabase mutation calls after the Phase 1B UI bootstrap. “Guarded” means the UI disables mutation controls without a session **and** the mutation function calls `requireSession()` before reaching Supabase. This is defense-in-depth preparation, not backend authorization.

## Current production-allowlisted surfaces

| Surface | Table / operations | Phase 1B state | Required follow-up |
|---|---|---|---|
| `projects-tasks.html` | `projects` insert; `tasks` insert | Guarded; anonymous reads preserved | Provision account, regression test, then review live policy/grants separately. |
| `orel-studio.html` | `teachings` upsert/delete | Guarded; anonymous library reads preserved | Final editor/publisher/delete permissions unresolved. |
| `admin.js` | `teachings` upsert | Existing OTP UI preserved, shared client reused, mutation defensively guarded | Do not equate authenticated with administrator; final authorization unresolved. |
| `enterprise-forms.html` | `asset_registry` insert | Guarded; anonymous reads preserved | Asset registrar authority unresolved. |
| `neshamah.html` | `neshamah_records` insert | Guarded; anonymous reads preserved | Authenticated live policy already exists, but authorship/approval model remains unresolved. |

## Remaining source paths not migrated in this package

| Surface | Table / operations | Build status / reason | Action |
|---|---|---|---|
| `dashboard-v3.html` | `teachings` upsert; `architecture_decisions` insert; `session_snapshots` insert; `glossary_terms` upsert | Superseded variant excluded from `dist/`; two referenced tables are absent from baseline | Investigate and migrate only after schema/authority decisions. |
| `dashboard-v3a.html` | `teachings` upsert | Superseded variant excluded from `dist/` | Keep excluded; consolidate into authenticated canonical editor later. |
| `dims-enterprise-grid/projects-tasks.html` | `projects` and `tasks` insert | Alternate implementation excluded from `dist/` | Keep excluded; do not maintain a second auth integration. |
| `institutional-queue.html` | `architecture_decisions` insert; `session_snapshots` insert; `glossary_terms` upsert | Currently allowlisted; not one of the authorized Phase 1B migration surfaces, and `session_snapshots` is absent from baseline | **Known remaining UI-layer anonymous mutation risk.** Disable/remove from production or authenticate only after schema and governance review. |
| `mission-control.html` | `resume_points` update/insert | Currently allowlisted; table absent from baseline | **Known remaining UI-layer anonymous mutation attempt.** Reconcile schema before any auth migration. |
| `supabase-test.html` | `teachings` insert | Test page excluded from `dist/` | Keep excluded; never use as an operational writer. |

No repository caller was found writing `peace_safety_briefs` or `sync_log`. `notification_outbox` was not altered or given a client access path.
