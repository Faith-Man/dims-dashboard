# DOME Preview ↔ Live Cutover Reconciliation — 2026-09-08

## Purpose

Prevent loss of approved preview functionality or newer live code/content during the planned DOME cutover.

Production promotion is explicitly blocked until this reconciliation is verified.

## Authoritative states

- Current live/main baseline at reconciliation start: `97be512ec4fe833efefd57ca4ebb44e72d332033`
- Current preview branch: `task-0071-di2-neural-orb`
- Current preview head at reconciliation start: `96afaa56fff1852b1edb0c4e5aaf11a9a7e76ef1`
- Common merge base: `731c5189729c973c1d9199c41589901ef9889c32`
- Preview is diverged from live: preview has 66 unique commits and live has 78 unique commits from the common base.

## Content-source rule

`public.teachings` in DIMS-v3 Supabase is the authoritative source for YARATHĒKĒ teaching content.

The canonical `yaratheke.html` on both current main and the preview head initializes the same DIMS-v3 Supabase project and reads teaching records from that source. Therefore current teaching revisions such as KEEP THE GARDEN™ must be preserved as data, not copied into a static preview page.

Any route that renders a static prototype copy of teaching text is non-canonical and must not be used as the production Reader route.

## Reconciliation rule

Do not replace live with preview wholesale and do not replace preview with live wholesale.

Build the cutover candidate from the current live/main baseline, then preserve approved preview-only UI/features while retaining all newer live-only runtime, MED, security, recovery, deployment, and data-source changes.

## Known overlapping files requiring deliberate merge

Both sides changed these files after the common merge base and they must not be resolved by blind overwrite:

- `di-companion.css`
- `di-companion.js`
- `dims-shared.css`
- `projects-tasks.html`

## Preview-only feature set to preserve

The preview branch contains approved/tested work including the integrated DOME user-test baseline, eight-module navigation/runtime additions, DI² neural-orb behavior, module routes, YARATHĒKĒ portable route assets, TETELESTAI auth/closed-loop work, and related navigation/link-integrity tooling.

## Live-only changes to preserve

The current main branch contains newer live work including MED secure runtime and counselor dashboard, MED password recovery, canonical MED orb assets, administrator access work, deployment verification, UI preferences, security/RLS hardening migrations, recovery evidence, enterprise forms updates, quotes library, and newer DOME runtime changes.

## Cutover gates

1. Preserve current main as the starting baseline.
2. Reconcile preview-only files and features into the cutover branch.
3. Manually resolve the four overlapping files listed above.
4. Verify YARATHĒKĒ canonical route reads current `public.teachings` data.
5. Verify KEEP THE GARDEN™ current revision appears on the cutover preview without embedding/copying its text.
6. Verify representative teachings beyond KEEP THE GARDEN™.
7. Verify MED secure path, administrator access, password recovery, counselor view, and DI² orb.
8. Verify desktop/mobile DOME navigation and route integrity.
9. Run authenticated DI² `/api/di/query` regression and TETELESTAI evidence-link verification.
10. Promote only after explicit user review/sign-off.

## Promotion status

**BLOCKED — reconciliation in progress. Production remains untouched until all gates pass.**
