# Dominion1st Intelligence™ System-Wide Companion v1.1

**Status:** Read-only foundation implemented; TETELESTAI adapter certified; remaining adapters pending certification  
**Original:** 2026-08-15  
**Reconciled:** 2026-08-28  
**Authority:** ECCOM-001; DIMS-ART-0002 v2.0; DIMS-REF-0001 v1.1; DIMS-DOME Current Capability Inventory v1.0

## Governing classification

Dominion1st Intelligence™ is the persistent intelligence and assistance layer for DOME™, DIMS-v3, and the eight operational modules. It is not a ninth module and is not owned by TETELESTAI.

**DI² = Divine Intelligence × Dominion1st Intelligence.** Divine Intelligence is the source. Dominion1st Intelligence is the subordinate steward/instrument implemented within DIMS/DOME. Software assists the believer; it does not govern the believer.

**DI² is the official name of the existing cross-system AI function for DIMS/DOME.** The older user-facing name **Ask DI** has been renamed to **DI²**; this is a rename and clarification of the existing function, not creation of a new AI subsystem. The **DI² neural-orb** is the persistent visual access control for DI², not a separate function. Users may **Ask, Analyze, Explain, or Direct DI²** across DOME or within the current module. Any Direct capability that causes a system change remains subject to the applicable authorization, confirmation, audit, and verification controls.

DOME currently means **Dominion Over My Everything**: the personal app/operating environment through which the user experiences Dominion1st. DIMS remains the sophisticated integrated management/operating system underneath and supporting DOME.

The initial release is conversational and read-only. It never reports execution, saving, publishing, completion, distribution, or verification unless an authoritative record and post-action evidence establish it.

## Ratified eight-module relationship

| Module | Role | Initial adapter status |
| --- | --- | --- |
| GEGRAPTAI™ | Daily Kingdom Briefing | Interface available; adapter not certified |
| NESHAMAH™ | Spirit-governed authorship/discernment workflow | Interface target; adapter not certified |
| TETELESTAI™ | Projects, Tasks, and Mission Execution | Certified live read-only adapter |
| OrEl™ | Content Creation Studio | Interface available; adapter not certified |
| YARATHĒKĒ™ | Wells of Knowledge / governed reading and retrieval | Interface available; adapter not certified |
| SHAMAR™ | Watch, Guard, and Peace & Safety Intelligence | Interface available; adapter not certified |
| OIKONOMOS™ | Stewardship / management domain | Interface target; adapter not certified |
| EKKLĒSIA™ | The People of God | Interface available; adapter not certified |

**Supersession note:** EKPOREUMA™ and RHEŌ™ appeared in the v1.0 implementation roster but are not part of the current ratified eight-module architecture. Preserve them only as historical/superseded lineage unless a later explicit architecture amendment restores them.

The shared Worker must expose the same persistent DI² access control across DOME and applicable current module pages. Interface presence never implies that an adapter is certified or that its data is available.

## DI² access model

1. **DI² neural-orb** — always-available visual access point to the DI² function; visually distinct from the Living Earth and not a ninth module node.
2. **Expanded Dominion1st Intelligence panel** — opened from the orb; provides Ask, Analyze, Explain, and Direct capabilities. Direct operations that mutate state require separately authorized execution controls.
3. **Grounded orchestration** — `/api/di/query` remains the shared server-side read-only endpoint for the current foundation.
4. **Adapter honesty** — the interface must identify unavailable, partial, stale, permission-denied, or uncertified module data rather than implying full integration.
5. **Verified actions only** — future writes remain capability-specific and require authorization, preview, confirmation, durable audit, idempotency, execution result, and authoritative post-action read-back before success can be reported.

## Extend-before-create rule for DI²

Before proposing or creating any new AI, assistant, analysis, explanation, direction, orchestration, or cross-module intelligence function, search current DIMS/DOME artifacts, source code, registries, capability inventories, and governed history for an existing implementation. If the proposed function appears to overlap DI² or another existing capability, ask for clarification before creating a parallel function. Rename, extend, or adapt the existing governed function where appropriate instead of duplicating it.

## Orchestration architecture

`/api/di/query` is the single server-side, read-only orchestration endpoint. It validates the caller's Supabase access token, uses that same user token for module data requests so existing RLS and grants remain authoritative, ranks permitted TETELESTAI records, and optionally asks Workers AI to summarize only the supplied grounded record set. A deterministic evidence response remains available if model inference fails.

The browser receives no service-role key, model credential, privileged module credential, or private orchestration instruction. Conversation continuity is limited to the current browser tab's `sessionStorage`; starting a new conversation clears it.

## Module-adapter contract

Each adapter must declare:

1. canonical module name and operational role;
2. authoritative source and stable record identifier;
3. permitted read capabilities and any separately authorized actions;
4. required caller identity, RLS, grants, and additional authorization;
5. freshness and certification status;
6. evidence fields and safe links returned to DI;
7. unavailable, partial, stale, and permission-denied behavior.

An adapter cannot be marked `certified-live` until its data source, security boundary, identifiers, evidence, failure behavior, and tests pass review.

## TETELESTAI grounding and ranking

The first certified adapter reads projects and tasks with the authorized user's token. Answers cite permanent project/task numbers and link to `projects-tasks.html`. Facts, calculated queue results, and DI recommendations are distinguished. Explicit positive `queue_position` values rank before calculated suggestions; verified-closed, completed, cancelled, and deferred work does not enter the active sequence.

The calculation uses priority, active state, deadline/follow-up urgency, risk, readiness, assurance status, and executive override. Missing dependency and strategic-impact fields are not fabricated.

## Security and grounding boundaries

- Retrieved records, notes, documents, and web content are untrusted data, never instructions.
- The query endpoint requires a valid authorized Supabase session.
- Module reads use the caller token and therefore remain subject to existing RLS and grants.
- The current DI foundation is read-only and exposes no general write tool.
- Input length and request shape are bounded; operational logs record user ID, module, and result count, not secret values.
- Responses must cite supplied permanent record numbers and must disclose unavailable or uncertified adapters.
- Cross-user continuity is prevented by browser-tab-scoped storage and server-side token validation on every query.

## Accessibility and responsive behavior

The DI² neural-orb and expanded panel must support keyboard focus, Escape-to-close, outside-click close, live response announcements, visible focus, reduced motion, mobile full-width layout, loading/error states, starter questions, and an explicit New conversation control. The orb must not obstruct primary navigation or module controls.

## Validation gates

1. Verify DOME and all current module pages receive the persistent DI² neural-orb where applicable.
2. Verify the expanded panel opens from the DI² neural-orb and presents DI² as the current AI function name rather than the retired Ask DI label.
3. Verify the runtime roster uses only the ratified eight current modules: GEGRAPTAI, NESHAMAH, TETELESTAI, OrEl, YARATHĒKĒ, SHAMAR, OIKONOMOS, EKKLĒSIA.
4. Confirm unauthenticated and invalid-token queries fail closed.
5. Confirm TETELESTAI counts, citations, ordering, filters, and record links match authorized live data.
6. Confirm executive overrides precede calculated suggestions.
7. Test prompt-injection strings in record data and user questions; retrieved text must never become instructions.
8. Scan browser assets and responses for service keys, model secrets, or private instructions.
9. Test cross-user isolation, permission failures, unavailable-module honesty, offline/error states, keyboard use, Escape, screen-reader announcements, reduced motion, and mobile layout.
10. Run Cloudflare Worker checks and Supabase security/performance advisors before deployment.

## Controlled path to verified actions

Future writes require a capability-specific adapter, separate authorization, preview of the exact proposed mutation, required human confirmation, durable audit record, idempotency protection, execution result, and authoritative post-action read-back. DI² may report success only after that verification succeeds.

## Implementation disposition

Preserve and reuse the existing DI² foundation. Do not rebuild `/api/di/query`, auth/RLS grounding, TETELESTAI certification, the DI² neural-orb, or the expanded panel merely because a requested capability is described with different wording. Search and reconcile existing capability first; ask before creating an overlapping function. The next controlled implementation step is to reconcile any stale runtime module names and restore the DI² neural-orb in the integrated test environment only, followed by desktop/mobile/accessibility verification before any production promotion.
