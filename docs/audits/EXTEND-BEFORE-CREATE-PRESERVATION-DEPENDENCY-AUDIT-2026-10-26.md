# DIMS/DOME preservation dependency audit — 2026-10-26

Status: TEST branch only; no production or database changes.
Principle: EXTEND BEFORE CREATE.

## Verified repository evidence
- `command-alerts.html` referenced retired `resume_points` and `system_snapshots` Supabase tables. A test-branch correction redirects users to the governed Mission Control authority without claiming current counts or backup freshness.
- `institutional-queue.html` references `session_snapshots` for both read and write. The table is absent from the active public schema; no alternate write target is verified.
- `mission-control.html` explicitly retires the legacy resume/snapshot table contracts and identifies VAULT/ANCHOR and Google Drive preservation authorities.
- `vault-architecture.html` describes ANCHOR as the archive for handoffs, checkpoints, resume points, and major decision captures.
- `architecture_decisions`, `glossary_terms`, `martureo_reports`, `projects`, `tasks`, and `notifications` exist in the active public schema (verified in earlier read-only check).

## Required safeguards
1. Preserve existing Architecture Decision and Lexicon functionality.
2. Do not create replacement `session_snapshots`, `resume_points`, or `system_snapshots` tables to accommodate obsolete frontend code.
3. Do not redirect snapshot writes to an unverified destination.
4. Before enabling snapshot saves, identify authoritative Google Drive/VAULT/ANCHOR location, file/record format, owner, access control, retention, write method, and read-back verification.
5. In TEST, make the legacy snapshot form explicitly unavailable pending integration; never show an error as an empty result or a successful save.
6. Test authenticated and unauthorized behavior, read-back, error handling, and responsive rendering before considering merge.
7. Require explicit sign-off before production deployment.

## Current status
- Command Alerts test correction: committed in draft PR #101.
- Institutional Queue snapshot correction: proposed, not committed.
- Preservation connector: architecture documented; live write/read-back not verified.
- Production: unchanged.
