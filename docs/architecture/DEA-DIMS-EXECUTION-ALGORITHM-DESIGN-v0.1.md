# DEA™ — DIMS Execution Algorithm — Design v0.1

Status: PROTOTYPE / NOT YET CERTIFIED
Date: 2026-08-15

## Purpose
DEA recommends the order in which executable DIMS projects and tasks should be worked. Priority and Execution Order are separate controls: Priority expresses importance; DEA recommends sequence.

## Governing rules
1. Conversation recency never changes Execution Order by itself.
2. New work receives no automatic #1 rank.
3. DEA recommends; governed executive overrides are explicit and auditable.
4. Blocked work retains its risk but cannot occupy an executable slot solely because of risk.
5. Dependency and governance gates precede dependent implementation.
6. Every material ranking change must be explainable.

## Reference risk model
Use the familiar safety-management model: Severity × Probability. The matrix is a decision aid, not the complete DEA ranking algorithm.

Severity:
- I Catastrophic — mission/system failure, irreversible major loss, critical security/governance failure.
- II Critical — serious degradation or major failure requiring urgent correction.
- III Moderate — meaningful operational impact; mission can continue with correction required.
- IV Negligible — limited operational consequence.

Probability:
- A Frequent
- B Likely
- C Occasional
- D Seldom
- E Rarely

Prototype risk-level matrix:
| Severity / Probability | A Frequent | B Likely | C Occasional | D Seldom | E Rarely |
|---|---|---|---|---|---|
| I Catastrophic | Extremely High | Extremely High | High | High | Medium |
| II Critical | Extremely High | High | High | Medium | Low |
| III Moderate | High | Medium | Medium | Low | Low |
| IV Negligible | Medium | Low | Low | Low | Low |

The UI must show labels as well as color so the matrix remains usable without color.

## DEA execution factors
After gates, candidate work is assessed using:
- Urgency / time criticality
- Dependency / unlocking power
- Mission impact
- Consequence of delay
- Readiness / executability
- Leverage / return on effort
- Continuity / finish-what-we-started

Weights and breakpoints remain provisional until tested against the live DIMS workload.

## Closed-loop record model
Lifecycle: ENTER → TRACK & FOLLOW UP → CLOSE.

### Permanent/system-controlled
- Permanent project/task number
- Date entered / created timestamp
- Origin / audit context
- Creator identity when available

### Controlled editable current state
- Priority
- Status
- Action owner
- Readiness
- Risk level/current risk assessment
- Progress
- Next follow-up date
- Follow-up interval
- Next executable action
- Dependencies
- Description/notes, with material changes audited

### Append-only history
- Follow-up/action entries
- Risk assessments
- Completion submissions
- Verification events
- Material change/audit events

A prior follow-up is never overwritten. Corrections are amendments.

## Follow-up entry
Within Project/Task View, provide:
- Follow-up date (default today; editable)
- Action taken / follow-up conducted
- Results / current condition
- Next action
- Next follow-up date
- Progress update (optional)
- Entered by (automatic when identity is available)

Save creates a new immutable history entry and updates only the authorized current-state snapshot fields.

## Dashboard interaction
The six accountability cards are controls, not decorative statistics. Clicking a card filters the existing Projects/Tasks records to its exact population:
- Ready for DI Execution
- Pastor H. Michael Daniels Actions / My Actions
- Blocked Items
- Follow-Ups Due
- Awaiting Verification
- Started / WIP

Provide a visible active-filter state and Clear Filter.

## Visual improvements
- Projects and Tasks section-title bars: dark royal/navy blue with high-contrast text.
- Table header rows: darker high-contrast treatment.
- View button: never wrap on desktop; full-width remains acceptable on mobile.
- Date Entered visible in primary grid.
- Detail drawer opens read-only; Edit Current Record unlocks only controlled-editable fields.
- Permanent fields visibly locked.
- Follow-Up / Action History and Add Follow-Up live inside the detail drawer.

## Verification before certification
1. Test DEA against representative live tasks and compare recommendations with management judgment.
2. Test desktop and mobile layouts.
3. Verify card counts exactly equal filtered result counts.
4. Verify append-only follow-up behavior.
5. Verify unauthorized/permanent fields cannot be overwritten.
6. Verify blocked and closed records are handled correctly.
7. Do not institutionalize weights/risk breakpoints until testing is complete.
