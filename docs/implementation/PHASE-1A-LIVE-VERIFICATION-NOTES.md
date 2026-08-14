# Phase 1A — Live Verification Notes

**Date:** 2026-08-10
**Mode:** Read-only verification against live Supabase

The Phase 1A repository findings were checked against the live DIMS-v3 Supabase project.

Verified:
- Project status is ACTIVE_HEALTHY.
- The six public-write tables and policy names reported by Codex are present live.
- Broad `anon` and `authenticated` table grants are present on all six exposed tables.
- The four function-search-path advisor warnings are present live.
- Exact function identity arguments were recovered and added to the proposal file.
- The live Auth schema currently has zero users, confirming that immediate removal of anonymous writes would cause lockout/breakage for current browser write paths.
- `notification_outbox` has RLS enabled with no policy; intended service-only access remains to be documented.

No live mutation was performed.
