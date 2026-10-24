# TASK-0077 — DI² Repository Retrieval Test Integration

Status: implementation handoff; isolated test branch only. Do not deploy to production.

## Verified existing behavior
- `di-companion.js` posts a bearer-authenticated JSON question to `/api/di/query` and renders `answer` plus `citations`.
- The inspected `src/dome-worker.js` does not contain the matching route.
- Supabase `public.di_repository_search(p_query text,p_limit int)` returns cited governed records; tested question about Google Drive organization ranked PROJ-0033 first.
- The database grants execute to `authenticated`, not `anon`.

## Implementation contract
1. Add a POST-only `/api/di/query` route to the TEST DOME Worker, preserving existing routes.
2. Validate the caller's Supabase access token via `/auth/v1/user` using a publishable key. Reject missing, expired or invalid tokens. Never use a service-role credential to bypass caller RLS.
3. Parse JSON safely, limit question length, enforce reasonable `p_limit` (e.g. 5–10), and ignore client-supplied authority claims.
4. Call `/rest/v1/rpc/di_repository_search` with the authenticated user's bearer token and publishable API key; body `{"p_query": question, "p_limit": 8}`.
5. Return `{answer: string, citations: [{source, ref, title, status, link}]}`. Derive answer only from returned rows; do not fabricate citations or links. When no matches, state that no governed record was found.
6. Return safe error responses; do not log bearer tokens, secrets or sensitive record text.
7. Ensure the existing companion citation renderer supports this shape. Preserve all existing DI and MED functionality.

## Acceptance checks (TEST environment)
- Valid authenticated question 'What project/task is organizing my Google Drive?' returns PROJ-0033 and visible citation.
- Missing/invalid bearer => 401 and no records.
- Malformed body => 400.
- Empty or overlong question => 400.
- No match => truthful empty-result response.
- Authenticated RLS restrictions are respected.
- Existing Worker endpoints remain operational.
- Owner reviews test deployment before any production change.

## Governance
TASK-0077 remains in_progress until end-to-end TEST verification. TASK-0078 automatic writes are blocked pending completion and authorization/audit approval. No production deployment is authorized by this document.
