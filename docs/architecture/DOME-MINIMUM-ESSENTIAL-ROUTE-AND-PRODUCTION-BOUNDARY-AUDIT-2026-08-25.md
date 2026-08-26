# DOME Minimum Essential Route & Production Boundary Audit

**Date:** 2026-08-25  
**Status:** Controlled audit / implementation gate  
**Governing authority:** `DIMS-ART-0002 v2.0 — Eight-Module Authority Note`

## Governing operational modules

1. GEGRAPTAI™
2. NESHAMAH™
3. TETELESTAI™
4. OrEl™
5. YARATHĒKĒ™
6. SHAMAR™
7. OIKONOMOS™
8. EKKLĒSIA™

Dominion1st Intelligence™ is the persistent cross-module intelligence layer and is not a ninth module. KUBERNĒSIS™ remains governance/orchestration and is not an operational module. EKPOREUMA™ is superseded historical architecture only.

## Route audit

| Module | Current runtime evidence | Audit disposition |
|---|---|---|
| GEGRAPTAI™ | `intelligence-briefing.html` contains the current daily briefing/history implementation, but uses generic Intelligence naming and legacy back-office navigation | Verify content/domain fit, then normalize to one canonical GEGRAPTAI route without losing briefing history/query behavior |
| NESHAMAH™ | `neshamah.html` | Keep; align cross-system terminology to the governing architecture |
| TETELESTAI™ | `projects-tasks.html` | Keep as canonical. Preserve and de-route/archive `projects-tasks-live-20260822.html` and `dims-enterprise-grid/projects-tasks.html` only after dependency/lineage verification |
| OrEl™ | `orel-studio.html`, `orel-teaching-studio.html` and related branch work | Consolidate to one canonical user route after feature-parity verification; do not newest-file-wins |
| YARATHĒKĒ™ | `yaratheke.html`, `teaching-library-v3.html` plus open reconciliation work | Consolidate to one canonical Library/Reader experience after Reader regression verification |
| SHAMAR™ | `peace-safety-intelligence.html` | Keep; preserve ingestion and source-grounded intelligence behavior |
| OIKONOMOS™ | No dedicated operational page located in the current `main` route audit | Define minimum user surface under scope-control rules; do not turn `enterprise-forms.html` into OIKONOMOS or recreate accounting/finance platforms |
| EKKLĒSIA™ | No dedicated operational page located in the current `main` route audit | Define minimum people/relationship/discipleship surface under scope-control rules; do not build a generic church-CRM clone |

## Confirmed runtime architecture drift

The original audit found that `src/shamar-worker.js` carried a stale `DI_MODULES` manifest containing EKPOREUMA™ and RHEŌ™ while omitting NESHAMAH™ and OIKONOMOS™.

**Controlled correction status:** Draft PR #60 (`fix/di-eight-module-manifest`) now contains a clean isolated diff that replaces only EKPOREUMA™ with NESHAMAH™ and RHEŌ™ with OIKONOMOS™. TETELESTAI remains the only certified-live DI adapter. No route, redirect, Supabase, authentication, SHAMAR ingestion, or TETELESTAI UI behavior is included in that correction.

## DOME Home hotspot audit

### Current certification result

`index.html` is confirmed as the current DOME Home / Living Globe production front door. However, the current `main:index.html` is stored in a minified/single-line form that does not provide a reliable auditable per-module route map through the current source inspection path. The audit therefore does **not** infer or guess individual Home hotspot destinations.

The governing rule for this phase is:

> A visible orbit/module label is not proof of its click destination. No Home route is changed until the actual click target is certified and compared with the eight-module authority.

### Hotspot control matrix

| Module / Layer | Current surface evidence | Authoritative target state | Home hotspot certification | Dependency / blocker | Required action |
|---|---|---|---|---|---|
| GEGRAPTAI™ | `intelligence-briefing.html` provides briefing/history behavior | One authority-aligned GEGRAPTAI user destination preserving current briefing behavior | NOT YET CERTIFIED | PR #9 owns active orbital Home work | Verify actual Home click target; then align naming/route without losing briefing data behavior |
| NESHAMAH™ | `neshamah.html` exists | `/neshamah.html` unless a later approved route replaces it | NOT YET CERTIFIED | PR #9; old EKPOREUMA lineage may still appear in historical UI | Verify click target; do not reintroduce EKPOREUMA™ |
| TETELESTAI™ | Worker and current runtime identify `/projects-tasks.html` | `/projects-tasks.html` | CANONICAL DESTINATION CERTIFIED; HOME CLICK NOT YET CERTIFIED | PR #58 and diagnostic TETELESTAI work remain active | Protect canonical route; verify Home hotspot only; no TETELESTAI implementation changes in this package |
| OrEl™ | Current `orel-studio.html` plus multiple implementations | One canonical OrEl authoring experience | NOT YET CERTIFIED | PR #7 owns OrEl/YARATHĒKĒ separation | Do not lock Home route until PR #7 feature-parity/reconciliation is resolved |
| YARATHĒKĒ™ | Current library/Reader surfaces plus reconciliation work | One canonical Library/Reader experience | NOT YET CERTIFIED | PR #7 Reader regression gate | Verify Home click only after canonical Reader route is settled |
| SHAMAR™ | `peace-safety-intelligence.html` plus Worker ingestion pipeline | `/peace-safety-intelligence.html` unless later authority changes it | NOT YET CERTIFIED | Home route work must not be coupled to ingestion | Verify click target while leaving SHAMAR data/ingestion unchanged |
| OIKONOMOS™ | No dedicated canonical operational page located | Minimum-essential stewardship surface only after scope-control approval | NO CURRENT DESTINATION TO CERTIFY | Minimum-surface design not yet approved | Do not invent a placeholder destination merely to complete the orbit |
| EKKLĒSIA™ | No dedicated canonical operational page located | Minimum-essential people/relationship/discipleship surface only after scope-control approval | NO CURRENT DESTINATION TO CERTIFY | Minimum-surface design not yet approved | Do not build or link a generic church-CRM placeholder |
| Dominion1st Intelligence™ | DI companion assets and Worker endpoints | Persistent layer across authorized DOME surfaces | NOT A MODULE HOTSPOT | PR #60 runtime manifest correction | Preserve persistent access; do not make DI a ninth module |

### Active Home conflict zone — PR #9

Draft PR #9 is active work on the DOME orbital intelligence command center and changes the Home/orbit design space. Therefore this audit intentionally makes **no parallel `index.html` edit**. The hotspot matrix above should be treated as architecture input to PR #9 or to an explicitly approved successor/superseding Home branch.

No Home implementation should be merged until:

1. all visible first-class module controls match the ratified eight-module roster;
2. each clickable module control resolves to an approved current destination;
3. no EKPOREUMA™, RHEŌ™, MARTUREŌ™, DI, KUBERNĒSIS™, or other non-module capability is presented as a first-class operational module contrary to current authority;
4. OrEl and YARATHĒKĒ targets are reconciled with PR #7;
5. TETELESTAI continues to resolve to the protected canonical `/projects-tasks.html` route;
6. OIKONOMOS and EKKLĒSIA are not given fabricated broad placeholder products merely to satisfy visual symmetry;
7. desktop and mobile click/tap navigation is verified after route wiring.

## Production boundary classifications

### Keep in the production user boundary

- `index.html` — DOME Home / Living Globe front door
- `projects-tasks.html` — canonical TETELESTAI
- `neshamah.html` — NESHAMAH
- `peace-safety-intelligence.html` — SHAMAR
- the chosen canonical OrEl route after consolidation verification
- the chosen canonical YARATHĒKĒ route after Reader verification
- the verified GEGRAPTAI route after naming/domain reconciliation
- future minimum-essential OIKONOMOS and EKKLĒSIA surfaces only after scope-control approval
- persistent DI companion assets/endpoints

### Keep available but move beneath everyday navigation

- `admin.html` — role-gated authentication/account security/administration
- `mission-control.html` — continuity functions; target ANCHOR™
- `dims-blueprint.html` — architecture reference; target THEMELIOS™
- `system-health.html` — operator diagnostics
- `enterprise-forms.html` — asset registry administration
- `institutional-queue.html` — back-office DIMS Operations
- `vault-architecture.html` — preservation architecture reference
- `rac-epi-apn-guide.html` — contextual DEA/RAC help, not a primary destination
- `command-alerts.html` — retain detail/history but surface actionable alerts contextually

### Consolidate or fold into another user surface

- `executive-dashboard.html` — preserve useful KPI logic and fold summary into DOME Home; avoid two executive front doors
- duplicate OrEl implementations — one canonical authoring experience
- duplicate YARATHĒKĒ/library implementations — one canonical Library/Reader experience

### Preserve for lineage/recovery but exclude from normal production navigation

- `projects-tasks-live-20260822.html`
- `dims-enterprise-grid/projects-tasks.html`
- `rad-guide-live-20260822.html`
- `dashboard-v3a.html`
- `index.html1`
- root ZIP bundles such as `dims-dashboard-fixed.zip`, `dims-deploy.zip`, enterprise-grid ZIPs, and `dims-v3-update.zip`
- recovery markers/notes such as `CANONICAL_RESTORE_READY_20260823.txt`, `RESTORE_EXECUTION_READY.txt`, and `TETELESTAI_RECOVERY_NOTE_20260823.txt`
- temporary/recovery files such as `IGNORE_ME.tmp` and `src/dome-worker-recovery.tmp`

No file in this preservation group should be deleted merely to make the repository look cleaner. Relocation or deletion requires reference checks plus preservation/lineage confirmation.

## Redirect audit

Current `_redirects` contains only:

```text
/old-dims /index-old-dims.html 200
/dashboard-v3 /index.html 200
```

This is not yet a complete canonical-route redirect matrix. Do not add broad redirects until inbound links and current dependencies are checked. The first safe redirect candidates are dated/alternate routes that have no current internal references and have verified canonical replacements, but they still require preservation confirmation before implementation.

## Implementation order

1. Review and, after normal verification, merge the isolated PR #60 runtime DI module-manifest correction.
2. Certify DOME Home click/tap hotspots against the eight-module roster; coordinate `index.html` work with PR #9 rather than creating a parallel Home edit.
3. Preserve TETELESTAI canonical route and de-route alternate live-looking variants after dependency verification.
4. Reconcile open OrEl/YARATHĒKĒ work rather than starting new duplicate pages.
5. Move admin/build/reference surfaces beneath the everyday layer without removing authorized access.
6. Fold executive KPI summaries into DOME Home after preserving data behavior.
7. Define minimum-essential OIKONOMOS and EKKLĒSIA user surfaces only after scope-control review.
8. Build a verified redirect matrix and regression-test desktop/mobile navigation before any legacy route removal.

## Non-negotiable safeguards

- No destructive cleanup before route/reference verification.
- No newest-file-wins decisions.
- Do not disturb the canonical TETELESTAI recovery or active TETELESTAI PR work.
- Do not reintroduce EKPOREUMA™ or RHEŌ™ as active operational modules without a new owner-approved architecture amendment.
- Do not turn internal engines, registers, or tables into primary navigation simply because they exist.
- Do not guess a Home hotspot route from a visible label or historical file name.
- Do not create a competing `index.html` implementation while PR #9 remains the active orbital Home change set without explicit reconciliation.
- The sophistication of DIMS must not become the complexity of DOME.
