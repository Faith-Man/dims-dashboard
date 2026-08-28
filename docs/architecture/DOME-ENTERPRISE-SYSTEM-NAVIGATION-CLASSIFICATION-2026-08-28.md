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
| Intelligence Center | `/intelligence-briefing.html` | Intelligence briefing / operational intelligence surface | CONSOLIDATE CANDIDATE | Preserve pending comparison with GEGRAPTAI™ and SHAMAR™. Do not remove until content ownership is reconciled. |
| Teaching Center | `/teachings/` | Teaching/library access and management | CONSOLIDATE CANDIDATE | Preserve pending comparison with YARATHĒKĒ™ canonical library/reader. |
| Thesaurus Vault | `/glossary/` | Enterprise terminology / glossary | KEEP / CONSOLIDATE CANDIDATE | Preserve terminology authority. May become a YARATHĒKĒ™-accessible governed resource rather than a separate front door. |
| Executive Dashboard | `/executive-dashboard.html` | Executive operational summary | CONSOLIDATE CANDIDATE | Preserve until DOME Home proves full replacement of unique executive information. |
| Settings / Admin | `/admin.html` | Authentication, account security, teaching editor, administration | ADMIN-ONLY | Preserve, but should not be treated as an everyday-user destination. |
| DIMS-v3 Blueprint | `/dims-blueprint.html` | Operating architecture/reference | KEEP — REFERENCE | Preserve as architecture/reference under Enterprise/System. |

## Important findings

- `mission-control.html` is an active governed operator surface, not merely a legacy link page.
- `system-health.html` is DSCC, a technical 26-system orbital health view. It is architecturally distinct from SHAMAR™.
- `system-status.html` separately performs infrastructure/checkpoint status work and should not be silently assumed redundant with DSCC.
- The older `dashboard-v3.html` remains a broad DIMS operational surface. It is a consolidation candidate, not an authorized deletion target.
- Several older destinations overlap newer primary modules by subject matter (Intelligence Center → GEGRAPTAI/SHAMAR; Teaching Center → YARATHĒKĒ; Executive Dashboard → DOME Home). Overlap alone is not sufficient evidence for retirement.

## Required decision sequence

1. Preserve all currently reachable destinations.
2. Compare each consolidation candidate against its proposed canonical replacement.
3. Identify unique functions, data, permissions, and workflows.
4. Decide: keep, merge, relocate, admin-only, or retire.
5. Update canonical route registry and global navigation only after explicit approval.
6. Run DOME Link Integrity and user verification before any production promotion.

## Current recommendation

For the test baseline, retain the full Enterprise/System section. The next simplification work should review the consolidation candidates one at a time, beginning with the most obvious duplication: **Executive Dashboard vs DOME Home**, followed by **Teaching Center vs YARATHĒKĒ™**, then **Intelligence Center vs GEGRAPTAI™ / SHAMAR™**. System/KUBERNĒSIS/DSCC should be reviewed later because they carry operator and governance responsibilities that are easier to damage through premature consolidation.
