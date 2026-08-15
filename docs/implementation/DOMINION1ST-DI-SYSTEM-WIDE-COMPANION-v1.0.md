# Dominion1st Intelligence™ System-Wide Companion v1.0

**Status:** Read-only foundation implemented; TETELESTAI adapter certified; remaining adapters pending certification
**Date:** 2026-08-15

## Governing classification

Dominion1st Intelligence™ (DI) is the persistent intelligence and assistance layer for DOME™, DIMS-v3, and the eight operational modules. It is not a ninth module and is not owned by TETELESTAI. One shared interface and one server-side orchestration endpoint preserve that relationship across navigation.

The initial release is conversational and read-only. It never reports execution, saving, publishing, completion, distribution, or verification unless an authoritative record and post-action evidence establish it.

## Eight-module relationship

| Module | Role | Initial adapter status |
| --- | --- | --- |
| GEGRAPTAI™ | Daily Kingdom Briefing | Interface available; adapter not certified |
| EKPOREUMA™ | Prophetic Insight and Revelation | Interface available; adapter not certified |
| TETELESTAI™ | Projects, Tasks, and Mission Execution | Certified live read-only adapter |
| OrEl™ | Content Creation Studio | Interface available; adapter not certified |
| YARATHĒKĒ™ | Wells of Knowledge | Interface available; adapter not certified |
| SHAMAR™ | Watch, Guard, and Peace & Safety Intelligence | Interface available; adapter not certified |
| RHEŌ™ | Kingdom Flow and Distribution | Interface available; adapter not certified |
| EKKLĒSIA™ | The People of God | Interface available; adapter not certified |

The shared Worker injects the same responsive DI control into DOME and HTML module pages. The interface reports integration status and never equates interface presence with data certification.

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
- DI is read-only and exposes no write tool.
- Input length and request shape are bounded; operational logs record user ID, module, and result count, not secret values.
- Responses must cite supplied permanent record numbers and must disclose unavailable or uncertified adapters.
- Cross-user continuity is prevented by browser-tab-scoped storage and server-side token validation on every query.

## Accessibility and responsive behavior

The floating control and panel support keyboard focus, Escape-to-close, outside-click close, live response announcements, visible focus, reduced motion, mobile full-width layout, loading/error states, starter questions, and an explicit New conversation control.

## Validation gates

1. Verify DOME and all current module pages receive the shared control.
2. Confirm unauthenticated and invalid-token queries fail closed.
3. Confirm TETELESTAI counts, citations, ordering, filters, and record links match authorized live data.
4. Confirm executive overrides precede calculated suggestions.
5. Test prompt-injection strings in record data and user questions; retrieved text must never become instructions.
6. Scan browser assets and responses for service keys, model secrets, or private instructions.
7. Test cross-user isolation, permission failures, unavailable-module honesty, offline/error states, keyboard use, Escape, screen-reader announcements, and mobile layout.
8. Run Cloudflare Worker checks and Supabase security/performance advisors before deployment.

## Controlled path to verified actions

Future writes require a capability-specific adapter, separate authorization, preview of the exact proposed mutation, required human confirmation, durable audit record, idempotency protection, execution result, and authoritative post-action read-back. DI may report success only after that verification succeeds.
