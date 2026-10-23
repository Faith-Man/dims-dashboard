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

## DOME Home hotspot audit — CERTIFIED

### Structural finding

`main:index.html` is the current DOME Home / Living Globe front door. The visible Home interface is not ordinary semantic HTML navigation: it is a base64-embedded JPEG with absolutely positioned invisible anchor overlays. The visible labels are baked into the image while the actual destinations live in hidden hotspot rectangles.

Therefore:

> **Do not change a Home `href` independently of the visible Home artwork/layout.** Doing so can make a visible label open a different destination than the user sees.

A safe authority-aligned Home correction requires coordinated replacement of the visible image/layout and its hotspot map, or conversion to a semantic HTML/CSS interface.

### Current hotspot map

The current Home contains **19 clickable hotspots**.

| # | Visible/hidden hotspot label | Current destination | Classification | Disposition |
|---:|---|---|---|---|
| 1 | Mission Control | `mission-control.html` | Administrative / continuity | MOVE UNDERNEATH |
| 2 | KUBERNĒSIS™ | `dims-blueprint.html` | Governance / architecture | MOVE UNDERNEATH |
| 3 | Enterprise Forms | `enterprise-forms.html` | Administrative / asset registry | MOVE UNDERNEATH |
| 4 | Institutional Queue | `institutional-queue.html` | Administrative / back-office | MOVE UNDERNEATH |
| 5 | TETELESTAI™ | `projects-tasks.html` | Current operational module | KEEP — canonical route certified |
| 6 | Intelligence Center | `peace-safety-intelligence.html` | SHAMAR™ operational module under generic label | KEEP FUNCTION; RELABEL AS SHAMAR™ in future Home |
| 7 | OrEl™ Studio | `orel-studio.html` | Current operational module | KEEP pending PR #7 route reconciliation |
| 8 | Thesaurus Vault | `glossary/` | Governance knowledge / terminology | MOVE UNDERNEATH / contextualize |
| 9 | Executive Dashboard | `executive-dashboard.html` | User summary / duplicate executive front door | FOLD INTO HOME |
| 10 | Settings | `system-status.html` | Administrative / system status | MOVE UNDERNEATH |
| 11 | Mission Control | `mission-control.html` | Administrative / continuity | MOVE UNDERNEATH |
| 12 | KUBERNĒSIS™ | `dims-blueprint.html` | Governance / architecture | MOVE UNDERNEATH |
| 13 | Enterprise Forms | `enterprise-forms.html` | Administrative / asset registry | MOVE UNDERNEATH |
| 14 | Institutional Queue | `institutional-queue.html` | Administrative / back-office | MOVE UNDERNEATH |
| 15 | TETELESTAI™ | `projects-tasks.html` | Current operational module | KEEP — duplicate Home entry should be simplified |
| 16 | Executive Dashboard | `executive-dashboard.html` | User summary / duplicate executive front door | FOLD INTO HOME |
| 17 | Command Alerts | `command-alerts.html` | Background output / alert detail | CONTEXTUALIZE; do not keep as first-class Home peer |
| 18 | Intelligence Briefing | `peace-safety-intelligence.html` | SHAMAR™ route under misleading briefing label | RELABEL / separate from GEGRAPTAI™ briefing identity |
| 19 | Latest Snapshot | `executive-dashboard.html` | Summary/snapshot output | FOLD INTO HOME; label does not map to a dedicated snapshot route |

### Authority coverage result

Current Home first-class coverage of the eight operational modules is incomplete:

- **TETELESTAI™** — represented and route-certified.
- **OrEl™** — represented; final canonical route still depends on PR #7 reconciliation.
- **SHAMAR™** — function is represented, but under generic/misaligned labels (`Intelligence Center`, `Intelligence Briefing`).
- **GEGRAPTAI™** — not represented as an authority-aligned first-class Home module.
- **NESHAMAH™** — not represented.
- **YARATHĒKĒ™** — not represented as a first-class Home hotspot in `main:index.html`.
- **OIKONOMOS™** — not represented and does not yet have an approved minimum-essential user surface.
- **EKKLĒSIA™** — not represented and does not yet have an approved minimum-essential user surface.

DI is correctly treated as a cross-module layer and should not be added as a ninth module merely to fill the Home.

### Duplicate / stale exposure

The current Home duplicates several non-module destinations:

- Mission Control appears twice.
- KUBERNĒSIS™ appears twice.
- Enterprise Forms appears twice.
- Institutional Queue appears twice.
- TETELESTAI™ appears twice.
- Executive Dashboard effectively appears three times (`Executive Dashboard` twice plus `Latest Snapshot` to the same route).
- SHAMAR™ route appears twice under two generic labels.

This confirms that the current Home is a construction-era command/navigation image rather than a minimum-essential everyday-user Home.

### PR #9 correction

PR #9 does **not** modify `index.html`. Its orbital implementation is in `system-health.html`. It should therefore be treated as an operator/system-health visualization and not as a direct blocker to auditing or replacing the current Home.

The visual/orbital interaction patterns in PR #9 may be reused later if intentionally selected for the everyday Home, but its 26 tracked diagnostic/recovery/navigation items are not the governing eight-module architecture.

### Smallest safe Home correction set

Do **not** perform piecemeal `href` replacements on the current JPEG-overlay Home.

The smallest safe correction package is:

1. preserve `main:index.html` unchanged as the current production front door until replacement preview is verified;
2. build one authority-aligned replacement Home in a controlled branch/preview using the eight-module model;
3. include only current operational destinations as first-class module controls;
4. place administrative/governance/system destinations in one secondary Administration/System area rather than as peers;
5. preserve useful executive KPIs, alerts, and latest-status summaries on Home as information, not duplicate destination tiles;
6. keep TETELESTAI™ wired to `/projects-tasks.html`;
7. use the PR #7 reconciled routes for OrEl™ and YARATHĒKĒ™;
8. preserve SHAMAR™ as SHAMAR™, not generic “Intelligence Briefing”; reserve GEGRAPTAI™ identity for the briefing function after its route/content reconciliation;
9. do not fabricate broad OIKONOMOS™ or EKKLĒSIA™ applications merely to complete the visual grid; define their minimum surfaces first;
10. verify desktop/mobile labels, click/tap targets, back navigation, DI persistence, and current-session behavior in Cloudflare preview before production promotion.

## Production boundary classifications

### Keep in the production user boundary

- `index.html` — current DOME Home / Living Globe front door until controlled replacement passes preview
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
- `dims-blueprint.html` — architecture reference; target THEMELIOS™ / governance reference
- `system-health.html` — operator diagnostics; PR #9 may enhance this surface without making it Home
- `system-status.html` — system/settings administration
- `enterprise-forms.html` — asset registry administration
- `institutional-queue.html` — back-office DIMS Operations
- `vault-architecture.html` — preservation architecture reference
- `glossary/` — terminology/governance knowledge management; surface definitions contextually to users
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

This is not yet a complete canonical-route redirect matrix. Do not add broad redirects until inbound links and current dependencies are checked.

## Implementation order

1. Review and, after normal verification, merge the isolated PR #60 runtime DI module-manifest correction.
2. Treat this certified 19-hotspot map as the current Home baseline.
3. Reconcile PR #7 to lock the canonical OrEl™ and YARATHĒKĒ™ destinations.
4. Define minimum-essential OIKONOMOS™ and EKKLĒSIA™ surfaces before attempting a complete eight-module Home replacement.
5. Build a controlled replacement DOME Home rather than modifying the current JPEG hotspot map piecemeal.
6. Preserve TETELESTAI canonical route and de-route alternate live-looking variants after dependency verification.
7. Move admin/build/reference surfaces beneath the everyday layer without removing authorized access.
8. Fold executive KPI/alert/latest-status summaries into the replacement Home as contextual information.
9. Build a verified redirect matrix and regression-test desktop/mobile navigation before any legacy route removal.

## Non-negotiable safeguards

- No destructive cleanup before route/reference verification.
- No newest-file-wins decisions.
- Do not disturb the canonical TETELESTAI recovery or active TETELESTAI PR work.
- Do not reintroduce EKPOREUMA™ or RHEŌ™ as active operational modules without a new owner-approved architecture amendment.
- Do not turn internal engines, registers, or tables into primary navigation simply because they exist.
- Do not change a hidden Home hotspot destination independently of the visible image label/layout.
- Do not present PR #9's diagnostic orbit as the eight-module architecture.
- The sophistication of DIMS must not become the complexity of DOME.
