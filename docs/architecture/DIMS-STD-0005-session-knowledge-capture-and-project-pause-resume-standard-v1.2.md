# DIMS-STD-0005 — Session Knowledge Capture & Project Pause/Resume Standard v1.2

**Authority:** ECCOM v1.0; Institutional Knowledge Lifecycle; ADR-0009; ANCHOR™ continuity; EBYC  
**Status:** Institutional Standard  
**Original Date:** 2026-08-11  
**Amended:** 2026-08-28

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

## Institutionalization Completion Gate
This gate is mandatory whenever a governed document or artifact is created or materially updated, regardless of chat, wording, interface, or initiating workflow. The gate is triggered by the action and governance impact, not by a specific phrase.

1. **Naming & Terminology Collision Gate** — before formalizing or institutionalizing a new named term, acronym, branded phrase, framework, module, product identity, formal principle label, or shorthand, search existing governed terminology, asset records, architecture, and relevant historical authorities for prior or conflicting use. Check reasonable aliases and formatting variants. This gate does **not** apply to ordinary writing, teaching prose, brainstorming, or incidental phrase use. A probable collision must be surfaced and resolved or explicitly deferred before the new governed identity is finalized.
2. **Formalize** — confirm artifact type, title, version, authority/status, ownership, relationships, and Enterprise Asset ID.
3. **Persist** — save or update the authoritative governed source location.
4. **Register** — create/update Asset Registry metadata and all applicable project/task relationships.
5. **Synchronize** — publish/update every required repository or platform according to artifact type and policy.
6. **Implementation-Impact Check** — determine whether the artifact creates, changes, closes, supersedes, or affects an existing project/task; update an existing work item where possible under EBYC and create a new item only when required.
7. **Index/Discovery Update** — update applicable canonical registers, indexes, navigation/discovery references, or dashboard pointers so the artifact can be found later.
8. **Read-Back Verification** — independently reopen/fetch each required destination and verify title, version, asset ID, location/link, and substantive content.
9. **User Verification Handoff** — provide clickable verification links to every user-accessible authoritative or synchronized copy before declaring completion.
10. **Completion Prohibition** — do not state or imply “institutionalized,” “complete,” “mission complete,” or equivalent until every applicable gate item has passed or an explicit unresolved exception is disclosed.

**Cross-Chat Rule:** This gate is enterprise governance and applies in every chat/session. It must not depend on conversational memory. A future session that creates or materially updates a governed artifact must recover and apply this gate before closeout.

**Failure-Recovery Rule:** If any gate step is later discovered to have been missed, reopen the institutionalization operation, complete the missing step(s), verify them, and issue the missing verification handoff rather than creating a parallel artifact.

## External Platform Routing
- **Google Drive:** authoritative governed documentation.
- **Supabase / EMT:** structured project/task/artifact/status/provenance memory.
- **GitHub:** technical standards, architecture, implementation, code-adjacent governance, machine-readable documentation.
- **Netlify / Cloudflare:** only for intended web/runtime deployment or presentation.
- **ChatGPT Library:** optional reference copy, never authoritative over the enterprise repository.

**Rule:** Synchronize to every required platform, not every available platform.

## EBYC
Before creating a new protocol, standard, record type, engine, repository structure, or governed identity, search current approved DIMS-v3 artifacts and relevant prior identities. Extend existing authority where possible and preserve lineage.

For new named terms, acronyms, branded phrases, frameworks, modules, product identities, formal principle labels, or shorthand, apply the Naming & Terminology Collision Gate before formalization. Ordinary writing and brainstorming are excluded.

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
- Institutionalization Completion Gate passed for every governed artifact created or materially updated, including the Naming & Terminology Collision Gate when a new governed identity is being formalized
- User verification links delivered for every user-accessible authoritative/synchronized copy

**Closeout test:** Can a future session resume accurately without relying on conversational memory? If not, closeout is incomplete.

## Initial Implementation
- TASK-0075 implemented this standard under PROJ-0020.
- TASK-0084 verifies the automated documentation, implementation-impact routing, completion-gate enforcement, verification-handoff behavior, and Naming & Terminology Collision Gate behavior.
- DIMS-SDR-0001 is the first governed session record under this standard.
