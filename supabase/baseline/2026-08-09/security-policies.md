# Live RLS Policy Snapshot — 2026-08-09

RLS is enabled on all 19 inspected `public` tables.

## Policies

| Table | Policy | Roles | Command | USING | WITH CHECK |
|---|---|---|---|---|---|
| accounts | allow_all_accounts | authenticated | ALL | true | true |
| architecture_decisions | allow_all_architecture_decisions | authenticated | ALL | true | true |
| archive_records | allow_all_archive_records | authenticated | ALL | true | true |
| asset_registry | allow_all_asset_registry | public | ALL | true | true |
| budget_categories | allow_all_budget_categories | authenticated | ALL | true | true |
| content_items | allow_all_content_items | authenticated | ALL | true | true |
| ddbb_briefings | allow_all_ddbb_briefings | authenticated | ALL | true | true |
| glossary_terms | allow_all_glossary_terms | authenticated | ALL | true | true |
| martureo_reports | allow_all_martureo_reports | authenticated | ALL | true | true |
| missions | authenticated_read_missions | authenticated | SELECT | true | — |
| missions | authenticated_insert_missions | authenticated | INSERT | — | true |
| missions | authenticated_update_missions | authenticated | UPDATE | true | true |
| missions | authenticated_delete_missions | authenticated | DELETE | true | — |
| neshamah_records | allow_all_neshamah_records | authenticated | ALL | true | true |
| notifications | notifications_authenticated_select | authenticated | SELECT | true | — |
| notifications | notifications_authenticated_update | authenticated | UPDATE | true | status in (`unread`,`read`,`dismissed`) |
| peace_safety_briefs | allow_all_peace_safety_briefs | public | ALL | true | true |
| projects | allow_all_projects | public | ALL | true | true |
| sync_log | Allow authenticated access to sync_log | public | ALL | true | true |
| tasks | allow_all_tasks | public | ALL | true | true |
| teachings | allow_all_teachings | public | ALL | true | true |
| transactions | allow_all_transactions | authenticated | ALL | true | true |

## Immediate remediation set

The six unconditional public-write tables requiring controlled hardening are:

`asset_registry`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, `teachings`.

No policy changes were made during this baseline capture.
