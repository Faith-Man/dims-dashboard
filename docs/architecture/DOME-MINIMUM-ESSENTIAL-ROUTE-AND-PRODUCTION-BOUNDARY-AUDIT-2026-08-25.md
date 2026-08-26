# DOME Minimum Essential Route & Production Boundary Audit

**Date:** 2026-08-25  
**Updated:** 2026-08-26  
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

**Controlled correction status:** Draft PR #60 (`fix/di-eight-module-manifest`) contains a clean isolated correction replacing only EKPOREUMA™ with NESHAMAH™ and RHEŌ™ with OIKONOMOS™. TETELESTAI remains the only certified-live DI adapter. No route, redirect, Supabase, authentication, SHAMAR ingestion, or TETELESTAI UI behavior is included in that correction.

## DOME Home hotspot audit

### Current certification result

`index.html` is confirmed as the current DOME Home / Living Globe production front door. The current `main:index.html` is stored in a minified/single-line form that does not provide a reliable auditable per-module route map through the current source inspection path. The audit therefore does **not** infer or guess individual Home hotspot destinations.

> A visible orbit/module label is not proof of its click destination. No Home route is changed until the actual click target is certified and compared with the eight-module authority.

### PR #9 correction — not a Home code conflict

A direct changed-file audit of draft PR #9 confirmed that it changes:

- `README.md`
- `docs/deployment/CLOUDFLARE-CLEAN-PREVIEW-RUNBOOK.md`
- `docs/implementation/CODEX-CLOUDFLARE-PREVIEW-HANDOFF-2026-08-13.md`
- `system-health.html`

It does **not** modify `index.html`.

Therefore the prior classification that PR #9 directly blocks `index.html` work was too broad and is superseded by this correction.

PR #9 is an **operator/system-health orbital visualization**, not the DOME Home implementation. Its useful search/filter/drawer/orbit work should be preserved, but `system-health.html` remains beneath the everyday user boundary unless a separate architecture decision deliberately promotes selected visual patterns into Home.

### PR #9 merge gates

PR #9 is not merge-ready in its current state. Required gates:

1. Rebase/reconcile with current `main`; GitHub currently reports `mergeable: false`.
2. Reframe `DOME System Command Center` so the operator diagnostic route does not look like the everyday DOME front door.
3. Keep the 26 orbit items explicitly classified as diagnostics/navigation/recovery items, not as the eight governing operational modules.
4. Preserve `/projects-tasks.html` as canonical TETELESTAI.
5. Keep OrEl/YARATHĒKĒ route choices compatible with PR #7.
6. Replace the external NASA Earth dependency with a reliable local/repository asset before release.
7. Correct responsive clipping: the current CSS expands the outer orbit beyond the viewport at mobile breakpoints (`118%` at <=900px; `140%` at <=520px).
8. Verify the <=520px toolbar/control grid for readable, tappable controls without overflow.
9. Complete desktop/mobile Cloudflare preview verification and preserve the YARATHĒKĒ Reader regression gate.
10. Keep technical system health distinct from SHAMAR™ Peace & Safety Intelligence.

### Home hotspot control matrix

| Module / Layer | Current surface evidence | Authoritative target state | Home hotspot certification | Dependency / blocker | Required action |
|---|---|---|---|---|---|
| GEGRAPTAI™ | `intelligence-briefing.html` provides briefing/history behavior | One authority-aligned GEGRAPTAI user destination preserving current briefing behavior | NOT YET CERTIFIED | Content/domain verification | Verify actual Home click target; then align naming/route without losing briefing behavior |
| NESHAMAH™ | `neshamah.html` exists | `/neshamah.html` unless a later approved route replaces it | NOT YET CERTIFIED | Old EKPOREUMA lineage may still appear in historical UI | Verify click target; do not reintroduce EKPOREUMA™ |
| TETELESTAI™ | Worker and runtime identify `/projects-tasks.html` | `/projects-tasks.html` | CANONICAL DESTINATION CERTIFIED; HOME CLICK NOT YET CERTIFIED | Active TETELESTAI diagnostic/recovery work | Protect canonical route; verify Home hotspot only |
| OrEl™ | Current OrEl surfaces plus reconciliation work | One canonical OrEl authoring experience | NOT YET CERTIFIED | PR #7 | Do not lock Home route until PR #7 route reconciliation is resolved |
| YARATHĒKĒ™ | Current Library/Reader surfaces plus reconciliation work | One canonical Library/Reader experience | NOT YET CERTIFIED | PR #7 Reader regression gate | Verify Home click only after canonical Reader route is settled |
| SHAMAR™ | `peace-safety-intelligence.html` plus Worker ingestion pipeline | `/peace-safety-intelligence.html` unless later authority changes it | NOT YET CERTIFIED | Ingestion behavior must remain isolated | Verify click target without coupling Home work to SHAMAR ingestion |
| OIKONOMOS™ | No dedicated canonical operational page located | Minimum-essential stewardship surface after scope-control approval | NO CURRENT DESTINATION TO CERTIFY | Minimum-surface design not approved | Do not invent a placeholder destination for visual symmetry |
| EKKLĒSIA™ | No dedicated canonical operational page located | Minimum-essential relationship/discipleship surface after scope-control approval | NO CURRENT DESTINATION TO CERTIFY | Minimum-surface design not approved | Do not build or link a generic church-CRM placeholder |
| Dominion1st Intelligence™ | DI companion assets and Worker endpoints | Persistent layer across authorized DOME surfaces | NOT A MODULE HOTSPOT | PR #60 manifest correction | Preserve persistent access; do not make DI a ninth module |

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
- `system-health.html` — operator diagnostics; PR #9 belongs here
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

This is not yet a complete canonical-route redirect matrix. Do not add broad redirects until inbound links and current dependencies are checked.

## Implementation order

1. Review and, after normal verification, merge the isolated PR #60 runtime DI module-manifest correction.
2. Continue independent DOME Home hotspot certification against the eight-module authority; PR #9 is no longer considered a direct `index.html` blocker.
3. Reconcile PR #9 as an operator/system-health implementation: current-main compatibility, diagnostic identity, local Earth asset, responsive geometry, and desktop/mobile verification.
4. Preserve TETELESTAI canonical route and de-route alternate live-looking variants after dependency verification.
5. Reconcile open OrEl/YARATHĒKĒ work through PR #7 rather than starting duplicate pages.
6. Move admin/build/reference surfaces beneath the everyday layer without removing authorized access.
7. Fold executive KPI summaries into DOME Home after preserving data behavior.
8. Define minimum-essential OIKONOMOS and EKKLĒSIA user surfaces only after scope-control review.
9. Build a verified redirect matrix and regression-test desktop/mobile navigation before any legacy route removal.

## Non-negotiable safeguards

- No destructive cleanup before route/reference verification.
- No newest-file-wins decisions.
- Do not disturb canonical TETELESTAI recovery or active TETELESTAI work.
- Do not reintroduce EKPOREUMA™ or RHEŌ™ as active operational modules without a new owner-approved architecture amendment.
- Do not turn internal engines, diagnostic checks, recovery items, registers, or tables into operational modules merely because they exist.
- Do not guess a Home hotspot route from a visible label or historical file name.
- PR #9 diagnostic orbit items must not be confused with the eight-module governing roster.
- The sophistication of DIMS must not become the complexity of DOME.
