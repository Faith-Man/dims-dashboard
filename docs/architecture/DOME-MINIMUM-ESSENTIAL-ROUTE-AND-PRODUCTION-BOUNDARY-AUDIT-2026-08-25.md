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

`src/shamar-worker.js` currently carries a stale `DI_MODULES` manifest containing:

- GEGRAPTAI™
- EKPOREUMA™
- TETELESTAI™
- OrEl™
- YARATHĒKĒ™
- SHAMAR™
- RHEŌ™
- EKKLĒSIA™

This conflicts with the governing eight-module authority because it retains EKPOREUMA™ and RHEŌ™ while omitting NESHAMAH™ and OIKONOMOS™.

**Required controlled correction:** update only the runtime module manifest to the governing eight-module roster, then regression-test DI and SHAMAR behavior. Do not combine that correction with broad route cleanup or TETELESTAI changes.

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

1. Correct the stale runtime DI module manifest in an isolated change.
2. Audit DOME Home hotspots against the eight-module roster.
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
- The sophistication of DIMS must not become the complexity of DOME.
