# TETELESTAI™ Closed-Loop Execution Control v1.0

## Governing decision

TETELESTAI™ is the single authoritative operational system for projects, tasks, follow-up, verification, and effectiveness review. Queue and assurance screens are views over the same records, not separate trackers.

- Priority expresses importance; execution rank expresses sequence.
- A non-null `queue_position` is an executive override and always precedes suggested ranking.
- Reported complete is not verified closed.
- Nothing is complete until saved in DIMS-v3 and verified.
- Responsibility Without Accountability Is Dead!

## Dual-loop model

Execution: Candidate → Ready → In Progress → Reported Complete.

Assurance: Follow Up → Inspect → Verify → Effectiveness Review → Verified Closed or Reopened.

Legacy completions remain `legacy_complete_review_required` unless evidence supports verification.

## Compact overview and ranking

Projects and tasks use nine columns: Rank, Number, Project/Task, Status, Priority, Owner, Next/Due, Progress, and View. Full notes remain stored and available in an accessible details drawer. Desktop avoids horizontal scrolling; mobile rows become cards.

Explicit `queue_position` values sort first and are never overwritten. Other active records receive an explainable suggested rank from priority, WIP state, deadline and follow-up urgency, risk, readiness, age, and actionability. Verified-closed, cancelled, and deferred records are excluded.

## Ownership, readiness, and assurance

Owners: `dominion1st_di`, `pastor_michael`, `shared`, and `external`. “Faithman” is the platform identity for Pastor H. Michael Daniels, not a separate owner. All 32 projects and 90 tasks currently carry the provisional system default `dominion1st_di`; a semantic ownership audit remains required.

Thirty days is the normal follow-up interval, adjusted by risk. The UI surfaces due follow-ups, items awaiting verification, and WIP. `task_follow_up_reviews` remains service-role-only; the public page reads assurance fields from the task record and does not weaken that boundary.

## Verification and deployment gates

Before merge: parse embedded JavaScript, check whitespace/diff, preserve 32/90 record counts, prove override ranking and full-note access, check desktop/mobile and keyboard/Escape behavior, rerun Supabase advisors, and compare migrations to live schema. After merge, verify production and report any unrelated advisor findings separately.
