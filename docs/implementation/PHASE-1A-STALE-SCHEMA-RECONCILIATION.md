# Phase 1A Stale-Schema Reference Reconciliation

**Evidence boundary:** static `.from('table')` calls in source files, compared with the captured 19-table baseline dated 2026-08-09. Dynamic table construction was not observed. ZIP contents and historical/audit evidence were not treated as current runtime code.

| Referenced table | Locations | Baseline | Supported successor | Action | Confidence / evidence |
|---|---|---:|---|---|---|
| `architecture_decisions` | `institutional-queue.html:74,124`; `index.html1:416,438`; `dashboard-v3.html:279,422` | Yes | — | Keep | High: exact baseline name. Some locations are superseded variants. |
| `asset_registry` | `dashboard-v3a.html:233`; `enterprise-forms.html:50,76` | Yes | — | Keep; authenticate writer | High; insert currently uses an anonymous client. |
| `briefings` | `dashboard-v3a.html:258`; `intelligence-briefing.html:53`; `index.html1:463`; `dashboard-v3.html:333` | **No** | `ddbb_briefings` is a plausible lineage candidate only | Investigate / migrate after column and semantic mapping | Medium candidate from DDBB lineage and baseline name; similarity is not proof. |
| `glossary_terms` | `institutional-queue.html:101,142`; `dashboard-v3.html:310,467` | Yes | — | Keep | High. |
| `martureo_reports` | `mission-control.html:92` | Yes | — | Keep | High. |
| `neshamah_records` | `neshamah.html:43,60` | Yes | — | Keep; authenticate writer | High; authenticated policy exists but page supplies no session UI, so insert likely fails unless a session already exists. |
| `peace_safety_briefs` | `peace-safety-intelligence.html:69` | Yes | — | Keep; decide anonymous read | High; caller is read-only. |
| `projects` | `dashboard-v3a.html:275`; `projects-tasks.html:549,739`; `index.html1:414`; `executive-dashboard.html:53`; `dashboard-v3.html:351`; `dims-enterprise-grid/projects-tasks.html:1` | Yes | — | Keep; authenticate writers | High; two project/task implementations write through anonymous clients. |
| `resume_points` | `dashboard-v3a.html:184`; `mission-control.html:58,107,108`; `command-alerts.html:35`; `index.html1:403`; `dashboard-v3.html:243` | **No** | None established | Investigate | High mismatch; archive/snapshot lineage is not a verified table mapping. |
| `session_snapshots` | `institutional-queue.html:87,132`; `dashboard-v3.html:295,444` | **No** | None established | Investigate | High mismatch; do not equate with `archive_records` without evidence. |
| `system_snapshots` | `dashboard-v3a.html:211`; `mission-control.html:69,80`; `system-status.html:35`; `command-alerts.html:49`; `index.html1:453`; `dashboard-v3.html:261` | **No** | None established | Investigate | High mismatch. |
| `tasks` | `dashboard-v3a.html:288`; `projects-tasks.html:643,772`; `index.html1:415,439`; `executive-dashboard.html:54`; `dashboard-v3.html:365`; `dims-enterprise-grid/projects-tasks.html:1` | Yes | — | Keep; authenticate writers | High. |
| `teachings` | `supabase-test.html:24`; `dashboard-v3a.html:310,337`; `orel-studio.html:243,389,421`; `admin.js:105,127`; `dashboard-v3.html:384,411` | Yes | — | Keep; require authenticated editorial workflow; remove test page from builds | High. `admin.js` is the only observed caller that explicitly manages sessions. |

No code references were found for the other captured baseline tables: `accounts`, `archive_records`, `budget_categories`, `content_items`, `ddbb_briefings`, `missions`, `notification_outbox`, `notifications`, or `transactions`. This is an absence-of-static-reference finding, not proof the objects are unused externally.
