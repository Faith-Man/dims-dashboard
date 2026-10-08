# TASK-0019 — Isolated webhook receiver operations

**Status:** experimental local-only adapter, not approved for public deployment.

## Start locally

Provide a strong secret (24+ characters) as `TASK0019_GITHUB_WEBHOOK_SECRET`, an absolute private directory in `TASK0019_PRIVATE_EVIDENCE_DIR`, and optionally `TASK0019_PORT` (default 8789). Then run:

```sh
node scripts/task-0019-local-runner.mjs
```

The runner binds to **127.0.0.1 only**. Do not expose or tunnel it to the Internet. The secret must match a GitHub webhook secret; do not commit it or place it in frontend environment variables.

## Current behavior

- Accepts POST /webhooks/github, verifies the HMAC SHA-256 signature over raw bytes, requires expected repository and supported event types.
- Persists review-only evidence in a private local directory using exclusive file creation and hashed event keys.
- Returns 202 for a new event, 200 for an already recorded event, 401 for rejected authentication/provider events.
- Never updates a task, project, or status.

## Production gates (not met)

1. Authorize PROJ-0015/TASK-0019 reactivation in TETELESTAI governance.
2. Use HTTPS, a managed secret, and a private authenticated server-side endpoint.
3. Replace local disk storage with transactional, idempotent Supabase persistence in a private schema, with a documented retention and access policy.
4. Verify source provenance, replay protection, GitHub event types, payload limits, and task identity against authoritative TETELESTAI records.
5. Implement a separate authorized human review workflow before any status transition.
6. Independently design and verify Cloudflare deployment evidence authentication; do not treat GitHub signatures as Cloudflare verification.
7. Run end-to-end tests, read-back verification, security review, and explicitly approve production deployment.

No production endpoint or webhook configuration is created by this document.
