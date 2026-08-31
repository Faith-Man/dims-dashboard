# DOME v2.0 Architecture Reconciliation — 2026-08-10

**Branch:** `yaratheke-reader-reconciliation`
**Authority:** DIMS-ART-0002 v2.0
**Mode:** Controlled GitHub source reconciliation only; no deployment or external-system mutation.

## Findings

Repository search identifies current or recent source assumptions that predate the eight-module architecture:

- the former `docs/architecture/DIMS-ART-0002-dome-seven-module-architecture.md` remains a historical authority record and must not govern new implementation;
- implementation plans still contain seven-module language and references to EKPOREUMA as active;
- `orel-studio.html` and related older navigation present OrEl and YARATHĒKĒ as a combined experience;
- `teaching-library-v3.html` previously redirected to that combined surface;
- MARTUREŌ remains visible in legacy/operational source such as Mission Control and historical dashboards;
- current repository search shows no EKKLĒSIA operational implementation, confirming the eighth module is not yet represented in current UI/source topology;
- OIKONOMOS references exist, but current implementation does not yet represent its ratified stewardship scope;
- RUARĒ is not found as a current repository implementation, so no standalone-module removal is required at this stage.

## Controlled dispositions

### Reconciled in this branch

- Added the current DIMS-ART-0002 v2.0 eight-module source authority while preserving the older seven-module document as lineage.
- Established `yaratheke/` as an independent first-class Library/Reader route.
- Established `orel/` as an independent first-class Writer/Creator module landing route.
- Changed the legacy `teaching-library-v3.html` redirect to YARATHĒKĒ rather than the combined OrEl studio.
- Reused the proven complete Reader teaching bodies and controls under EBYC.
- Preserved the dark Dominion-blue/light-text header and publication-oriented Reader typography.

### Preserve as historical evidence; do not rewrite merely for terminology

- `docs/audits/historical-lineage/**`
- dated Supabase baseline evidence
- historical DMS/DIMS/DIMS-v3 lineage material
- prior architecture decisions whose value is evidentiary rather than current operational authority

### Requires later controlled reconciliation

- active implementation plans that still prescribe seven module routes or active EKPOREUMA;
- DOME home/orbital navigation so all eight modules are first-class and EKKLĒSIA is represented;
- NESHAMAH/RUARĒ operational relationship;
- MARTUREŌ references on current operational surfaces: deorbit from active navigation/function while retaining lineage records;
- OIKONOMOS UI and domain scope;
- cross-module DI and KUBERNĒSIS presentation under the v2.0 model;
- build/deployment allowlist once new module routes are approved for preview/production.

## Reader verification position

Source-level verification confirms the YARATHĒKĒ route contains the complete proven KEEP THE GARDEN Lesson One and SHAMAR bodies and retains Copy Full Teaching, Download, Share and Print behavior. The stylesheet contains the approved dark primary header treatment and proportional publication typography. Actual browser rendering on mobile and desktop is still **NOT TESTED** in this GitHub-only operation and must not be represented as visually verified.

## Boundary

No Supabase, Cloudflare, Netlify, production data, secrets, credentials or live configuration were changed. No deployment was initiated.
