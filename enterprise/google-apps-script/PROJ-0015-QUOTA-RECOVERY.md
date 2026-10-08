# PROJ-0015 — Teaching sync URL Fetch quota recovery

## Root cause

On 2026-10-08, `processAutomaticTeachingTwoWaySync` failed with `Service invoked too many times for one day: urlfetch`.

- The trigger ran **every 5 minutes**, which is 288 runs per day.
- Each run fully re-compared up to 25 of the 80 institutionalized teachings: 3 unenrolled mismatches plus 22 enrolled. Each comparison cost 2 Supabase reads (`teachings` and `asset_registry`) and 1 Docs API `revisionId` read. Nothing in the run checked whether anything had changed.
- That comes to 2 + 25 × 3 = **77 URL fetches per run**, or **≈22,176 per day**. The consumer daily urlfetch quota is 20,000.
- Supabase edge logs agree: about 600 REST calls per hour from 2026-10-07 12:00 UTC. They fell sharply at 04:00 UTC on 2026-10-08, when the quota ran out.
- The 3 unenrolled mismatches were re-read every run, and an unenrolled mismatch is a state that does not change by itself.

## Changes

These changes extend the existing code. No new engine is added.

| File | Change |
|---|---|
| `TeachingTwoWaySyncAutomation.gs` | Loads all candidates' registry rows and Supabase bodies in 2 bulk reads. A full comparison runs only when the Drive modified time, the Supabase body hash, the sync mode or the registry baseline has changed since the last settled check. That check is a `DriveApp` metadata read, not a URL fetch. The `limit` now caps full comparisons per run, and the rest are deferred to the next run. Each run holds a per-handler lease, so runs cannot overlap. A quota error sets a 2-hour pause and stops the run without writing anything. The trigger installer cadence changes from 5 to 15 minutes. |
| `TeachingArtifactSyncExtension.gs` | `teachingSyncRequest_` retries **GET only** on 429, 5xx or a network error, at most 2 times. A daily-quota error is never retried. Adds shared quota-pause and lease helpers. The queue worker now honours the pause and the lease. A job interrupted by quota exhaustion is recorded and returned to `queued` on the next run. |

The comparison logic, conflict gates, pre-write revalidation, post-write verification and audit records are unchanged.

## Request estimates (production shape: 77 enrolled, 3 unenrolled)

| | per run | runs/day | URL fetches/day |
|---|---|---|---|
| Before | 77 | 288 | ~22,176 |
| After, steady state | 2 | 96 | ~192 |
| After, one changed teaching | 2 + ~5–8 | — | — |
| After, first 3 runs post-deploy (gates empty) | ≤ 77 | — | one-off |

## Tests

Run `node --test tests/*.test.mjs`. The tests run the real `.gs` sources against an in-memory Apps Script and Supabase stand-in (`tests/helpers/apps-script-teaching-harness.mjs`) and count every URL fetch.

## Deployment (requires approval)

1. Replace `TeachingArtifactSyncExtension.gs` and `TeachingTwoWaySyncAutomation.gs` in the Apps Script project with these versions.
2. Run `installAutomaticTeachingTwoWaySyncTrigger()` once. It deletes only the existing `processAutomaticTeachingTwoWaySync` trigger and installs a single 15-minute trigger.
3. Run `verifyAutomaticTeachingTwoWaySyncTrigger()` and confirm `trigger_count: 1`.
4. If quota is still exhausted, the first runs return `skipped: quota_exhausted` / `quota_paused`. That is expected; the runs resume by themselves.
5. Do not touch the RB-001 triggers (`checkRB001BackupNotification`).
