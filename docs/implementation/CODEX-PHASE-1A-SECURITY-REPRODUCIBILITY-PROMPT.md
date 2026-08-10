# Codex Work Package — Phase 1A: Security & Reproducibility Preparation

## Governing references

Before doing anything, read:

1. `docs/implementation/DOME-MODERNIZATION-IMPLEMENTATION-PLAN-v1.0.md`
2. `docs/audits/historical-lineage/CODEX-HISTORICAL-LINEAGE-AUDIT-INSTRUCTIONS.md`
3. `docs/audits/historical-lineage/DRIVE-EVIDENCE-GAP-CLOSURE-2026-08-09.md`
4. `docs/architecture/DIMS-ART-0002-dome-seven-module-architecture.md`
5. `supabase/baseline/2026-08-09/` and every file under that baseline.

Apply EBYC — Extend Before You Create. Preserve historical/provenance artifacts. Do not delete or rewrite historical audit material.

## Mode

**Controlled implementation preparation.**

You MAY create or modify source-controlled technical files in this repository that are necessary for this work package.

You MUST NOT:
- modify the live Supabase project;
- deploy to Netlify, Cloudflare, or any other runtime;
- delete or archive historical files;
- change production secrets or external platform settings;
- perform destructive migration operations;
- implement autonomous AI-generated prophetic “Now Word” behavior.

## Objectives

### A. Supabase policy and write-path assessment

1. Inspect the captured Supabase baseline and enumerate all current RLS policies, grants, functions, triggers, and relevant security findings.
2. Find every frontend/backend write path to these tables:
   - `asset_registry`
   - `peace_safety_briefs`
   - `projects`
   - `sync_log`
   - `tasks`
   - `teachings`
3. Identify which writes currently appear to rely on anonymous/public access and which already use authenticated sessions.
4. Propose least-privilege role/policy behavior for reader, contributor, editor, reviewer, publisher, administrator, and service identities only where the current application evidence supports those roles.
5. Do not silently invent business permissions. Mark unresolved authorization decisions explicitly.

### B. Prepare replayable migration structure

Create a source-controlled Supabase migration foundation that can eventually reproduce the current verified baseline and security policy changes.

Requirements:
- preserve the captured baseline as historical evidence;
- create a clean migration directory/structure without overwriting the baseline;
- represent schema objects in dependency-safe order;
- include RLS/policy changes only as **proposed/reviewable** migration material unless the existing evidence establishes the intended policy unambiguously;
- avoid destructive data operations;
- add notes for objects that cannot be safely reconstructed from the captured baseline alone.

### C. OrAI hardening preparation

Inspect `netlify/functions/orai.js` and its callers.

Prepare source changes or a clearly scoped patch that:
- removes misleading offline “current intelligence” fallback content;
- prevents AI output from being represented as a new divine “Now Word”;
- validates request method and payload shape;
- limits request size;
- reduces upstream error leakage;
- establishes hooks/structure for authentication, rate limiting, quotas, observability, and prompt/model versioning.

If full authentication/rate limiting requires platform configuration that is unavailable inside this repository, implement only the safe repository-side foundation and clearly document the external dependency. Do not invent working security controls that are not actually enforced.

### D. Stale schema reference inventory

Search all frontend/backend files for Supabase table references and compare them to the captured 19-table baseline.

Produce a machine-readable or Markdown reconciliation report containing:
- referenced table name;
- files/locations referencing it;
- whether it exists in the baseline;
- likely successor only when supported by evidence;
- required action: keep / migrate / investigate / remove / replace;
- confidence/evidence note.

Pay special attention to historical references such as `briefings`, `resume_points`, and `system_snapshots` versus current baseline tables such as `ddbb_briefings`.

Do not automatically rename references based on name similarity alone.

### E. Production/archive boundary design

Design a dedicated production build/output boundary so the repository root is no longer the deployable artifact.

Prepare the minimum source-controlled configuration/structure needed to support a future build output such as `dist/` or an equivalent controlled directory.

The future production artifact must exclude by default:
- ZIP archives;
- audits and historical evidence;
- test pages;
- obsolete/superseded HTML variants;
- enterprise metadata exports not required at runtime;
- backup payloads;
- internal documentation.

Do not deploy.

## Required deliverables

1. A Phase 1A implementation report under `docs/implementation/`.
2. A stale-schema reference reconciliation report.
3. Proposed/source-controlled Supabase migration foundation.
4. OrAI hardening changes or patch, with external dependencies explicitly documented.
5. Production/archive boundary proposal/configuration.
6. A list of files changed and why.
7. Tests/checks run and results.
8. Risks/blockers requiring human authorization before Phase 1B/live changes.

## Acceptance checks

Before finishing:
- repository remains buildable/servable to the same extent it was before, unless a documented repository-only security change intentionally alters behavior;
- no external system was modified;
- no historical evidence was destroyed;
- no unverified policy decision is disguised as authoritative;
- no AI-generated prophetic wording is introduced;
- changes align with seven-module architecture and DI governance;
- `git diff` is reviewed and summarized;
- `git status` is reported.

## Completion language

Do **not** report “Mission Complete” for Phase 1 security. This work package is preparation and source-control hardening only. Report:

**PHASE 1A PREPARATION COMPLETE — LIVE SECURITY CHANGES PENDING REVIEW/AUTHORIZATION**

only if every repository-side deliverable above is complete and verified.
