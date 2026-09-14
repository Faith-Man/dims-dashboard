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

## Addendum — DIMS-STD-0005 v1.2 User Verification Handoff Gate

**Implemented:** 2026-09-14  
**Governed workstream:** TASK-0084 — Verify Automated Documentation & Implementation-Impact Routing  
**Authority:** DIMS-STD-0005 v1.2, §6A Institutionalization Completion Gate

A live cross-chat failure on 2026-09-14 demonstrated that documentation-only enforcement was insufficient: after Principle #5 (`DIMS-TEACH-0064`) was persisted and registered, the required user-clickable verification handoff was not applied automatically until the Executive Authority reminded the assistant. TASK-0084 therefore remains open until the cross-chat behavior is proven effective.

### Machine-enforced closure rule

The live Supabase `public.tasks` table now has a `BEFORE INSERT OR UPDATE` verification gate named `trg_tasks_verification_handoff_gate`, backed by `public.enforce_task_verification_handoff()`.

A task may not transition to `verification_status = 'verified_closed'` unless all of the following are present:

1. non-empty `verification_evidence`;
2. non-empty `verified_by`;
3. non-null `verified_at`; and
4. either:
   - at least one direct `http://` or `https://` verification URL in `verification_evidence`; or
   - an explicit `NO_USER_ACCESSIBLE_LINK: <reason>` exception.

This is the machine-control counterpart to the DIMS-STD-0005 v1.2 User Verification Handoff and Cross-Chat Rule. It is intentionally additive and extends the existing TETELESTAI assurance model under EBYC.

### Controlled verification performed

- Negative test: a controlled attempt to mark TASK-0084 `verified_closed` with technical evidence but no URL was rejected by the gate.
- Positive test: a controlled attempt including a direct Google Drive verification URL was accepted by the gate and then deliberately rolled back so TASK-0084 remained open.
- Post-test state: TASK-0084 remained `in_progress`; the controlled test did not falsely close or modify the workstream.

### Remaining acceptance test

TASK-0084 must remain open until a fresh-session/cross-chat institutionalization operation proves that the full DIMS-STD-0005 v1.2 sequence is applied without prompting, including read-back verification and the mandatory user-clickable verification-link handoff. Only then may TASK-0084 advance to `verified_closed`.
