# DIMS-PLAN-0001 — Technical Modernization & Implementation Plan

**Version:** 1.0  
**Status:** Ratified implementation plan  
**Date:** 2026-08-09  
**Authority:** Canonical institutional record remains in DIMS-v3 Google Drive.

## Purpose

This plan converts three governing inputs into one technical sequence:

1. DIMS-ART-0002 — Seven-Module Architecture & DI Cross-Module Map.
2. DIMS-AUD-0001 — Live Supabase Security & Schema Audit.
3. Codex read-only audit of `Faith-Man/dims-dashboard`.

## Governing architecture

Seven primary DOME modules:

1. GEGRAPTAI™
2. EKPOREUMA™
3. TETELESTAI™
4. OrEl™
5. YARATHĒKĒ™
6. SHAMAR™
7. OIKONOMOS™

Dominion1st Intelligence™ (DI) is a persistent cross-module intelligence layer, not an eighth module. KUBERNĒSIS™ remains the governing/orchestration experience above DOME.

## Immediate technical conclusion

The repository contains valuable prototypes but is not yet a unified production DOME application. Before major feature expansion, stabilize security, capture the database in source control, consolidate the canonical architecture vocabulary, separate production from archive material, and establish a unified application shell.

## Phase sequence

### Phase 0 — High-risk feature freeze

Allow documentation, audits, backups, architecture reconciliation, migration preparation, and non-destructive cleanup planning. Avoid adding new public write surfaces or standalone production pages.

### Phase 1 — Security stabilization & database capture — CRITICAL

- Export deployed Supabase schema, indexes, constraints, functions, triggers, grants, and RLS policies.
- Back up live data before policy changes.
- Define minimum viable DIMS roles/access matrix.
- Remove anonymous write access from `asset_registry`, `peace_safety_briefs`, `projects`, `sync_log`, `tasks`, and `teachings`.
- Preserve public SELECT only where explicitly required.
- Harden relevant database function search paths.
- Protect/rate-limit the OrEl/OpenAI endpoint and remove misleading current-intelligence fallbacks.
- Regression-test current DIMS screens after policy changes.

### Phase 2 — Canonical architecture consolidation

- Merge DIMS-ART-0002 into the next primary DOME Architecture revision.
- Map legacy terms such as KUBERNĒSIS, NESHAMAH, MARTUREŌ, VAULT, ANCHOR, SHOMER/SHAMARENE, DivineID, and TÛNESIS to current capabilities/workflows/supporting services or historical status.
- Mark conflicting blueprint pages historical/superseded rather than silently deleting them.
- Establish canonical route/domain ownership for all seven modules.

### Phase 3 — Production/archive separation

- Stop publishing the repository root.
- Establish a real source/build/output structure.
- Archive ZIPs, test pages, obsolete HTML variants, duplicated experiments, and superseded technical surfaces outside production output.

### Phase 4 — Unified application foundation

- Add dependency manifest, lockfile, lint/format/test tooling, environment configuration, and CI.
- Build one responsive accessible application shell.
- Implement seven first-class module routes.
- Add persistent DI affordances.
- Separate module navigation from governance/continuity/admin/system navigation.
- Replace image-map engineering with semantic dynamic module cards while preserving visual identity.
- Centralize Supabase client/auth/error/UI infrastructure.

### Phase 5 — Shared domain & provenance model

Establish governed relationships and attribution for modules, records, record links, sources, projects/tasks/milestones/assignments, teachings/versions, prophetic records/reviews, briefings/items, watch items/risks/alerts, stewardship records, decisions, snapshots, and audit events.

### Phase 6 — Consolidate strongest working domains

**TETELESTAI:** preserve current grids, progress automation, permanent numbering, executive aggregation, and notifications; add relationships, assignments, dependencies, milestones, history, server-side filtering/pagination, and DI exceptions.

**OrEl/YARATHĒKĒ:** preserve editor/library workflow and metadata; merge with authenticated administration; establish one operational source of truth; keep YARATHĒKĒ a distinct module even if linked from OrEl.

### Phase 7 — Safe EKPOREUMA core

Build a human-authored prophetic record lifecycle with Scripture anchors, discernment/testing, status, archive, fulfillment/testimony, and MARTUREŌ linkage. AI may assist retrieval, organization, comparison, transcription, summarization, and clearly labeled drafting; it must not present generated wording as new divine revelation.

### Phase 8 — DI foundation + GEGRAPTAI first cross-module workflow

Implement cross-module identities, permission-aware retrieval, source provenance, evidence-linked synthesis, staleness/conflict detection, review/approval, persistent intelligence products, and audit trail. First major DI workflow: evidence-linked GEGRAPTAI/DDBB assembled from current authorized module state.

### Phase 9 — Mature SHAMAR

Build source registry, freshness, watchpoint history, risk taxonomy, alert thresholds, strategic ownership, ministry impact, and linkage to GEGRAPTAI/TETELESTAI. Do not turn SHAMAR into a general personal-safety repository.

### Phase 10 — Initial OIKONOMOS

Begin narrowly with organizations/accounts, budgets, assets/subscriptions, contracts/renewals, secure document references, stewardship dashboard, and DI reminders/anomalies under stricter authorization boundaries.

### Phase 11 — Later maturity

PWA/offline, advanced media, publishing automation, semantic graph/recommendation, forecasting, mobile apps, governed Drive synchronization, long-term archival formats, and advanced OIKONOMOS analytics.

## Preserve / Fix / Build next

### Preserve

- Dominion1st visual identity.
- OrEl/YARATHĒKĒ editor/library workflow.
- TETELESTAI project/task concepts and automation.
- SHAMAR Peace & Safety brief model.
- Resume points, snapshots, architecture decisions, glossary/lexicon, and asset registry.
- Truthful empty/pending states.
- Server-side OpenAI secret handling.

### Fix first

- Supabase anonymous-write exposure.
- AI endpoint abuse/fallback behavior.
- EKPOREUMA AI governance.
- Missing source-controlled database.
- Architecture terminology conflicts.
- Whole-repository deployment.
- Multiple teaching/glossary sources of truth.
- Lack of shared auth/application shell.

### Build next

- Unified shell and routes.
- Shared authorization/data/provenance model.
- Consolidated TETELESTAI and OrEl/YARATHĒKĒ.
- Safe EKPOREUMA lifecycle.
- Initial OIKONOMOS.
- DI foundation and evidence-linked GEGRAPTAI DDBB.

## Change-management rule

Codex and other coding agents may identify technical conflicts and recommend changes, but they do not independently redefine DOME architecture. Implementation must conform to ratified DIMS artifacts unless an explicit governance revision is approved.
