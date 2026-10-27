# DIMS/DOME preservation dependency audit — 2026-10-26

Status: TEST branch only; no production or database changes.
Principle: EXTEND BEFORE CREATE.

## Verified repository evidence
- `command-alerts.html` referenced retired `resume_points` and `system_snapshots` Supabase tables. A test-branch correction redirects users to the governed Mission Control authority without claiming current counts or backup freshness.
- `institutional-queue.html` references `session_snapshots` for both read and write. The table is absent from the active public schema; no alternate write target is verified.
- `mission-control.html` explicitly retires the legacy resume/snapshot table contracts and identifies VAULT/ANCHOR and Google Drive preservation authorities.
- `vault-architecture.html` describes ANCHOR as the archive for handoffs, checkpoints, resume points, and major decision captures.
- `architecture_decisions`, `glossary_terms`, `martureo_reports`, `projects`, `tasks`, and `notifications` exist in the active public schema (verified in earlier read-only check).

## Required safeguards
1. Preserve existing Architecture Decision and Lexicon functionality.
2. Do not create replacement `session_snapshots`, `resume_points`, or `system_snapshots` tables to accommodate obsolete frontend code.
3. Do not redirect snapshot writes to an unverified destination.
4. Before enabling snapshot saves, identify authoritative Google Drive/VAULT/ANCHOR location, file/record format, owner, access control, retention, write method, and read-back verification.
5. In TEST, make the legacy snapshot form explicitly unavailable pending integration; never show an error as an empty result or a successful save.
6. Test authenticated and unauthorized behavior, read-back, error handling, and responsive rendering before considering merge.
7. Require explicit sign-off before production deployment.

## Current status
- Command Alerts test correction: committed in draft PR #101.
- Institutional Queue snapshot correction: proposed, not committed.
- Preservation connector: architecture documented; live write/read-back not verified.
- Production: unchanged.

## Navigation and governance overlap — source audit
- `index.html` is an approximately 749 KB image-hotspot DOME Home with direct routes to Mission Control, Blueprint (labeled KUBERNĒSIS), Institutional Queue, Projects & Tasks, Executive Dashboard, and Command Alerts. Mission Control and KUBERNĒSIS have repeated hotspots on the same page.
- `dashboard-v3.html` is separately titled KUBERNĒSIS Mission Control, repeats a Mission Control section, and contains phase/status prose and quick links to Blueprint and VAULT. Historical phase text must not be treated as live status.
- `dims-blueprint.html` is architecture reference documentation, but also describes KUBERNĒSIS as Mission Control and links back to `dashboard-v3.html`. It should remain a reference view, not a competing command center.
- No `kubernesis.html` exists in the checked repository branch. The screenshots show a deployed Workers navigation gateway, whose deployed source/version has not been matched to this repository; do not assume equivalence.
- `DIMS-STD-0006` v1.1 is already the institutional shared interface standard. Reuse its shell and navigation standards.

### Proposed ownership (not yet implemented)
1. DOME Home: one primary eight-module orbital navigation entry.
2. KUBERNĒSIS: governance/steering shell and grouped links, not a duplicate module directory.
3. Mission Control: live execution oversight; distinguish historical prose from live data.
4. DSCC: dedicated system health/diagnostics.
5. Blueprint: read-only institutional architecture reference, reachable under governance.
6. TETELESTAI: authoritative task/project execution; Institutional Queue retains ADR/lexicon and verified preservation workflow.

### Validation gates
- Identify deployed Workers route and commit behind the screenshots before modifying its navigation.
- Inventory every repeated route/hotspot and its actual destination; confirm no user workflow is lost.
- Test mobile, keyboard navigation, link targets, and circular layout in TEST.
- Do not merge or deploy without explicit sign-off.

## Source-branch reconciliation — 2026-10-27
- `task-0102-final-dome-home` contains `prototypes/dome-eight-module-home/index.html` (eight-module preview). `feature/dome-eight-module-home-preview` also contains an earlier version of that route.
- `task-0102-final-dome-home/dims-blueprint.html` is titled `DIMS/DOME Current Architecture`, whereas default-branch `dims-blueprint.html` is titled `DIMS-v3 Blueprint`. This is source evidence of competing generations, not proof of deployed Workers commit.
- Neither checked branch's `dashboard-v3.html` contains the screenshot phrase `Current DOME Module Access` or the shared `Navigate` control; deployed Workers source remains unverified.
- `DIMS-REF-0001` v1.3 establishes DIMS as the sophisticated back-end and DOME as user experience, with explicit convergence-without-erasure requirements.
- Do not modify Workers routes or merge a historical dashboard into the current shell until the deployment's commit/asset mapping is established.

## Screenshot source match — 2026-10-27
**Correction to previous uncertainty:** The first mobile screenshot is matched by `task-0102-final-dome-home/dashboard-v3-current.html`, which contains the exact heading `Current DOME Module Access`, the governance/steering subtitle, and OrEl/YARATHĒKĒ cards. This page loads `dome-global-nav.js` and links to the eight-module preview home. It is a duplicate module-navigation gateway and should be refactored to governance-only links in TEST after route compatibility is checked.

The matched branch contains `prototypes/dome-eight-module-home/index.html` with eight module links and additional links to Mission Control, `dashboard-v3-current.html`, DSCC, Blueprint, Institutional Queue, and glossary. `dashboard-v3.html` is explicitly retained as the legacy administrative dashboard from `dashboard-v3-current.html`.

The screenshot's exact deployed Workers commit is still not verified by deployment metadata; source-text match does not prove deployment SHA. Do not edit the production Worker or merge this branch on that basis alone.

**Next test change proposal:** In `dashboard-v3-current.html`, replace the redundant OrEl/YARATHĒKĒ/TETELESTAI/GRĒGOREŌ module directory with grouped governance links (Mission Control, DSCC, Blueprint, Institutional Queue); keep one DOME Home link and retain the legacy dashboard access under Administration. Preserve `dome-global-nav.js`, DI² orb, and all eight canonical module routes on DOME Home.

## Interim 3D DOME Home selection — 2026-10-27
User authorized selection of an existing 3D DOME dashboard for an interim operational home via a separate preview link, with production unchanged pending approval.

**Verified design inventory evidence:** `docs/audits/historical-lineage/design-lineage-evidence.md` identifies five recovered circular Earth/orbital images (v01-v05), three regular-grid images, two approximately 510 KB HTML prototypes in Drive's `Design/Dashboard Prototypes/`, and two `kubernesis-dashboard.html` copies. These are candidate design sources, **not yet verified interactive working dashboards**.

**Repository preview checks:** `task-0102-final-dome-home/prototypes/dome-eight-module-home/index.html` exposes eight module routes, but is a conventional HTML/CSS module page (no detected WebGL/canvas/3D transform in inspected HTML); do not label it the selected 3D design. `feature/dome-eight-module-home-preview` has an earlier HTML version. `index.html` is a large image-hotspot navigation page, not verified live 3D. The old modernization plan describes seven modules and is historical, not current module authority.

**Selection gate:** Inspect actual Drive HTML prototypes and the five circular/orbital visuals, validate navigation and mobile interaction, check DI² and security, choose an existing working candidate, and publish only to isolated preview. No automatic production switch. No selection can be justified from filenames alone.
