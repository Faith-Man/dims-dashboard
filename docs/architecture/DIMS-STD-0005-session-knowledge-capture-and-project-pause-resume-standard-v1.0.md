# DIMS-STD-0005 — Session Knowledge Capture & Project Pause/Resume Standard v1.0

**Authority:** ECCOM v1.0; Institutional Knowledge Lifecycle; ADR-0009; ANCHOR™ continuity; EBYC  
**Status:** Institutional Standard  
**Date:** 2026-08-11

## Purpose
Formalize how substantive ChatGPT/DIMS conversations become durable enterprise knowledge and how projects/tasks are paused without losing continuity.

## Governing Model
**Chat / Working Notebook → Session / Discussion Record → Decisions & Discoveries → Canonical Artifact → Repository Persistence → Asset Registration → Synchronization → Verification**

Conversation is discovery. Documentation is authority. Institutionalization is permanence.

## Session Capture Is Required When
- A substantive project/task is intentionally paused.
- A discussion produces or materially changes a framework, doctrine, teaching, architecture decision, governance rule, or terminology.
- Important source material is recovered.
- Multiple artifacts are created/revised.
- Rationale or development history would be lost in the polished artifact.
- A future session needs an exact resume point.

## Required Session Record Fields
- Session Record ID/title and date/time
- Mission/project and Project/Task IDs
- Purpose/original mission
- Major discussion threads
- Source material/provenance
- Decisions ratified/revised/rejected/deferred
- Artifacts created/updated and versions
- Repository locations and asset IDs
- Open questions
- Exact pause/resume point
- Next action
- Institutionalization/synchronization/verification status

## Pause/Resume Protocol
1. Update project/task before session close.
2. Record status and exact last completed/first next step.
3. Record latest authoritative artifact/version.
4. Record unresolved questions/dependencies.
5. Link the Session/Discussion Record.
6. Preserve source references.
7. Do not mark complete because the chat ended.
8. Resume from the checkpoint before restarting discovery.

## Institutionalization Lifecycle
**Formalize → Institutionalize → Persist → Register → Synchronize → Verify → Mission Complete**

## External Platform Routing
- **Google Drive:** authoritative governed documentation.
- **Supabase / EMT:** structured project/task/artifact/status/provenance memory.
- **GitHub:** technical standards, architecture, implementation, code-adjacent governance, machine-readable documentation.
- **Netlify / Cloudflare:** only for intended web/runtime deployment or presentation.
- **ChatGPT Library:** optional reference copy, never authoritative over the enterprise repository.

**Rule:** Synchronize to every required platform, not every available platform.

## EBYC
Search current approved DIMS-v3 artifacts before creating new governance. Extend existing authority where possible and preserve lineage.

## Default Session Closeout
- Project/task updated
- Pause/resume point recorded
- Artifacts/versions listed
- Session record created when required
- Canonical artifacts updated where approved
- Repository persistence completed
- Asset Registry updated
- Applicable synchronization completed
- Verification recorded
- Next action identified

**Closeout test:** Can a future session resume accurately without relying on conversational memory?

## Initial Implementation
- TASK-0075 implements this standard under PROJ-0020.
- TASK-0074 remains the deferred DNA² resume point under PROJ-0030.
- DIMS-SDR-0001 is the first governed session record under this standard.
