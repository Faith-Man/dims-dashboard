# TASK-0088 — Integrated DOME User-Test Baseline Reconciliation

**Status:** Controlled reconciliation gate — non-production
**Date:** 2026-08-27
**Parent:** PROJ-0035 — DOME System-Wide User Function Audit & Simplification
**Task:** TASK-0088 — Complete DOME Everyday-User Function Classification Audit
**Method:** EBYC — Extend Before You Create

## Purpose

Create one authoritative integration target from the strongest recent non-production user-facing previews before any final DOME user sign-off. This prevents the user from evaluating stale or mismatched branch copies as though they represent the latest approved experience.

## Governing UX principles

- “The sophistication stays in DIMS. The everyday user experiences DOME.” — Dominion1st™
- “Simplification does not mean flattening the DOME experience. We’re not Flat Earth — we’re DOME Men. Dominion1st™ doesn’t build flat experiences. We build DOME.” — Dominion1st™
- Functional simplification and visual flattening are not the same thing. The final DOME remains an immersive circular/orbital experience; a flat semantic preview may validate information architecture without becoming the final visual design.

## Carry-forward user baselines

### PR #61 — Eight-module DOME architecture
**Role:** Functional / semantic front-door baseline.
**Carry forward:** Exactly eight operational modules; DI and KUBERNĒSIS remain layers; OIKONOMOS and EKKLĒSIA minimum-essential scope; everyday navigation separated from administration/system surfaces.
**Do not treat as final:** Flat visual treatment; its branch copy of `/projects-tasks.html`; temporary OrEl/YARATHĒKĒ destination wiring.

### PR #58 — TETELESTAI user-experience baseline
**Role:** Authoritative current Projects & Tasks interaction baseline.
**Carry forward:**
- Date | Number | Project/Task | RAC | Priority | Status | Owner | Follow-Up | Progress | View
- RAC hover = stable generic explanatory bubble
- RAC click = RAC-only Mini Brief
- Mini Brief includes OPEN FULL RAD GUIDE
- View = project/task details only
- five-band Priority hazard bar
- no Progress/View overlap
- preserve real Supabase-backed behavior and approved desktop/mobile verification gate

Associated governed review artifacts to preserve/reconcile:
- DIMS_RAD_RAC_DEA_Full_Guide_Review_Draft_v3.pdf
- DIMS_RAD_User_Mini_Brief_Review_Draft_v3.pdf
- DIMS_RAD_Full_User_Guide_Review_Draft_v1.docx

### PR #7 — OrEl™ + YARATHĒKĒ™ user-experience baseline
**Role:** Authoritative preferred Writer/Creator and Library/Reader direction pending final integrated verification.
**Carry forward:**
- OrEl as independent Writer/Creator module
- YARATHĒKĒ as independent Library/Reader module
- dark Dominion-blue/light-text principal identity treatment
- publication-quality Reader typography
- Copy Full Teaching, download, share, print behavior
- proven KEEP THE GARDEN / SHAMAR Reader bodies used as regression fixtures
- OrEl creates; TETELESTAI tracks completion where appropriate; YARATHĒKĒ preserves/presents established knowledge

## Preserve but do not promote into primary everyday navigation

### PR #9 — DSCC orbital intelligence command center
**Disposition:** System/Engineering/operator surface by default.
**Preserve:** orbital visualization, diagnostics, 26 tracked nodes, search/filter, pause/resume/next-alert, detail interactions.
**Surface upward only:** selected verified health, alerts, or executive summaries on DOME Home when useful.
**Do not:** use 26 diagnostic nodes as the eight-module primary DOME navigation.

## Review candidate — not silently approved

### PR #63 — SHAMAR TSI review layout / Intelligence Dome
**Disposition:** Preserve as the current SHAMAR review candidate. Do not silently promote it into the integrated approved baseline until its user-facing design and methodology receive explicit sign-off under the SHAMAR workstream.
**Reason:** It contains substantial new user-facing work, including TSI domain presentation and a circular SHAMAR Intelligence Dome, but TASK-0088 must not convert a review branch into an approved module baseline without review.

## Excluded from integrated everyday-user baseline

- PR #62 First Awakening review site — separate preserved animation/review environment, not an everyday DOME module baseline.
- Diagnostic TETELESTAI PRs #54–#56 — recovery/root-cause evidence only.
- Historical/recovery routes and archive copies — preserve for lineage; do not expose in ordinary navigation.
- Administration, Mission Control, architecture/governance, system-health, system-status, enterprise forms, institutional queue, VAULT architecture, glossary governance and similar builder/operator surfaces — relocate underneath DOME rather than delete.

## Integration rule

The final controlled user-test environment must not inherit user-facing routes merely because they exist on `main` or happen to be present on one preview branch. For every major surface, explicitly bring forward the approved/candidate source identified in this reconciliation.

## Integrated test target

One non-production site should allow the user to test:

1. A DOME front door using the eight-module authority from PR #61, while clearly treating its current flat layout as an architecture prototype rather than final visual design.
2. TETELESTAI using PR #58 behavior, not PR #61's older branch copy.
3. OrEl and YARATHĒKĒ using PR #7 experience and route separation.
4. OIKONOMOS and EKKLĒSIA at their minimum-essential PR #61 scope, pending user corrections.
5. SHAMAR only at the explicitly approved baseline; PR #63 remains a review candidate until signed off.
6. DSCC beneath everyday navigation as an operator/system-health destination, with selected summaries eligible to surface contextually on Home.
7. Administration/system/governance destinations beneath the everyday DOME experience.

## User-test gate

Before TASK-0088 closes:

- user can test one integrated non-production environment rather than unrelated branch previews;
- all eight primary module choices are understandable from an everyday-user perspective;
- TETELESTAI matches the PR #58 approved columns and RAC/Mini Brief/View separation;
- OrEl/YARATHĒKĒ match the preferred PR #7 direction;
- no builder-only or system-engineering surfaces have accidentally returned to primary navigation;
- the test explicitly distinguishes semantic architecture approval from final immersive DOME visual approval;
- desktop and mobile are verified;
- route and regression checks pass for each carried-forward module surface;
- user corrections are captured before production implementation authorization.

## Release discipline after user sign-off

Implementation is released one controlled workstream at a time. A new DIMS/DOME execution branch may not displace the active workstream unless the current task is completed, explicitly paused with a resume checkpoint, genuinely blocked by the interruption, or the user explicitly overrules the lock.
