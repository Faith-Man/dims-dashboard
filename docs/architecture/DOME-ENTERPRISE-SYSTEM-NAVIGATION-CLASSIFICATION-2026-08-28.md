# DOME Enterprise / System Navigation Classification

Date: 2026-08-28
Status: Preservation-first classification baseline
Scope: Current DOME test baseline / PR #64

## Governing rule

No Enterprise/System destination is removed, hidden, redirected, or retired solely because the eight-module DOME architecture exists. The eight primary modules and the Enterprise/System layer are different navigation classes. Simplification decisions require explicit classification and user verification first.

## Primary DOME modules — unchanged

1. GEGRAPTAI™
2. NESHAMAH™
3. TETELESTAI™
4. OrEl™
5. YARATHĒKĒ™
6. SHAMAR™
7. OIKONOMOS™
8. EKKLĒSIA™

## Enterprise / System destinations

| Destination | Current route | Current function | Classification | Recommendation |
|---|---|---|---|---|
| Mission Control | `/mission-control.html` | Mission execution, continuity/resume authority, snapshots, MARTUREŌ history | KEEP — ENTERPRISE/SYSTEM | Preserve as an operator/mission-control destination. Not a ninth primary module. |
| KUBERNĒSIS™ Gateway | `/dashboard-v3-current.html` | Governed gateway to current navigation and preserved DIMS/KUBERNĒSIS functions | KEEP — ENTERPRISE/SYSTEM | Preserve as governance/orchestration gateway. |
| System | `/dashboard-v3.html` | Construction-era/full DIMS operational system view | KEEP FOR REVIEW — ADMIN/OPERATOR | Preserve access. Candidate to consolidate beneath KUBERNĒSIS after function-by-function review. Do not retire yet. |
| System Health / DSCC | `/system-health.html` | 26-system orbital technical health and recovery intelligence | KEEP — OPERATOR | Preserve under Enterprise/System. Distinct from SHAMAR™ Peace & Safety Intelligence. |
| System Status | `/system-status.html` | Infrastructure checks and checkpoint history | KEEP FOR REVIEW — OPERATOR | Preserve. Candidate to consolidate with DSCC/System Health after validating unique functions and data contracts. |
| Enterprise Forms | `/enterprise-forms.html` | Enterprise asset/form creation and management | KEEP FOR REVIEW — ENTERPRISE | Preserve pending active-use review. |
| Institutional Queue | `/institutional-queue.html` | Review, institutionalization, preservation queue | KEEP — ENTERPRISE | Preserve as governed institutional workflow. |
| Intelligence Center | `/intelligence-briefing.html` | Briefing latest/history from canonical `briefings` data | SAFE CONSOLIDATION CANDIDATE | Functionally duplicated by GEGRAPTAI™ on the current baseline. Preserve until explicit approval of route consolidation/removal. |
| Teaching Center | `/teachings/` | Teaching search, editing, New/Save/Preview/Print, public/private, status/priority/tags | KEEP UNTIL AUTHORING RECONCILIATION | Not functionally replaced by YARATHĒKĒ™. Its authoring functions overlap OrEl™/admin more than the canonical reader. Preserve until write-path ownership is reconciled. |
| Thesaurus Vault | `/glossary/` | Enterprise terminology / glossary | KEEP / CONSOLIDATE CANDIDATE | Preserve terminology authority. May become a YARATHĒKĒ™-accessible governed resource rather than a separate front door. |
| Executive Dashboard | `/executive-dashboard.html` | Live executive project/task KPI and progress summary | KEEP UNTIL FUNCTIONAL PARITY | DOME Home does not yet reproduce its live KPI/status/progress functions. Preserve until those functions are deliberately incorporated or otherwise replaced and user-verified. |
| Settings / Admin | `/admin.html` | Authentication, account security, teaching editor, administration | ADMIN-ONLY | Preserve, but should not be treated as an everyday-user destination. |
| DIMS-v3 Blueprint | `/dims-blueprint.html` | Operating architecture/reference | KEEP — REFERENCE | Preserve as architecture/reference under Enterprise/System. |

## Important findings

- `mission-control.html` is an active governed operator surface, not merely a legacy link page.
- `system-health.html` is DSCC, a technical 26-system orbital health view. It is architecturally distinct from SHAMAR™.
- `system-status.html` separately performs infrastructure/checkpoint status work and should not be silently assumed redundant with DSCC.
- The older `dashboard-v3.html` remains a broad DIMS operational surface. It is a consolidation candidate, not an authorized deletion target.
- Several older destinations overlap newer primary modules by subject matter. Overlap alone is not sufficient evidence for retirement.

## Comparison 1 — Executive Dashboard vs DOME Home

**Result: Executive Dashboard must remain accessible.**

The current Executive Dashboard provides live project/task information that the current DOME Home does not yet reproduce:

- Projects Active
- Tasks Open
- Average percent complete
- Projects by status
- Tasks by priority
- Active-project progress list

The current DOME Home only reserves an executive-orientation area and states that future production can surface verified priorities, alerts, follow-ups, and status summaries. That statement is architectural intent, not functional parity.

**Decision:** Keep Executive Dashboard in Enterprise/System navigation until DOME Home or another approved surface provides the required executive functions and the replacement is user-verified. No retirement is authorized.

## Comparison 2 — Teaching Center vs YARATHĒKĒ™

**Result: Teaching Center must remain accessible.**

Teaching Center is not merely a second library/reader. It currently provides:

- Teaching search/list
- New teaching creation
- Local Save workflow
- Preview
- Print
- Public/private control
- Status
- Priority
- Tags
- Markdown editing

YARATHĒKĒ™ is the canonical reader/library surface and does not reproduce these authoring/editor functions.

The functional overlap therefore spans **OrEl™ authoring + YARATHĒKĒ™ preservation/presentation + administrative publishing**, not YARATHĒKĒ™ alone.

**Decision:** Keep Teaching Center accessible until the canonical write/publish path is deliberately reconciled. No retirement is authorized.

## Comparison 3 — Intelligence Center vs GEGRAPTAI™ / SHAMAR™

**Result: Strong consolidation candidate into GEGRAPTAI™.**

The current Intelligence Center and GEGRAPTAI™ both read the same canonical `briefings` table and expose the same briefing structure:

- Logos Word
- Rhema Word
- World Intel
- Bridge Intel
- Personal Intel
- Directives
- Confession
- Latest briefing
- Briefing history

No unique operational function was identified in Intelligence Center that is absent from GEGRAPTAI™ on the current baseline. SHAMAR™ remains separate because it handles Peace & Safety / TSI intelligence rather than this daily Kingdom briefing record.

**Decision:** Intelligence Center may be consolidated into GEGRAPTAI™ after explicit approval. Until then, keep the existing navigation entry and route intact.

## Required decision sequence

1. Preserve all currently reachable destinations.
2. Compare each consolidation candidate against its proposed canonical replacement.
3. Identify unique functions, data, permissions, and workflows.
4. Decide: keep, merge, relocate, admin-only, or retire.
5. Update canonical route registry and global navigation only after explicit approval.
6. Run DOME Link Integrity and user verification before any production promotion.

## Current recommendation

For the test baseline, retain the full Enterprise/System section. The first three comparisons are complete:

- **Executive Dashboard:** keep until DOME Home has functional parity.
- **Teaching Center:** keep until authoring/write-path ownership is reconciled.
- **Intelligence Center:** safe consolidation candidate into GEGRAPTAI™, pending explicit approval.

Next review target: **Thesaurus Vault / Glossary vs YARATHĒKĒ™ terminology access**, followed by **System Status vs DSCC/System Health**. System/KUBERNĒSIS itself should remain later in the sequence because it carries operator and governance responsibilities that are easier to damage through premature consolidation.
