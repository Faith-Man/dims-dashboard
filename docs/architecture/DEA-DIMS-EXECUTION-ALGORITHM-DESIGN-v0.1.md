# DEA™ — DIMS Execution Algorithm — Design v0.2

Status: PROTOTYPE / NOT YET CERTIFIED  
Original date: 2026-08-15  
Architecture amendment: 2026-08-21

## Purpose
DEA recommends the order in which executable DIMS projects and tasks should be worked after RAD/RAC assessment and required governance/readiness gates.

DEA is the execution-order mechanism. The former EPI (Execution Priority Index) is retired as a separate active layer because it duplicated DEA and encouraged subjective pre-execution scoring.

## DIMS decision architecture
Normal DIMS path:

RAD → RAC → DEA → Execute → Execution Performance Metrics → Verified Outcome

Actual physical hazard path only:

RAD → RAC → APN (using CEI) → Abatement Priority

### RAD™ — Risk Assessment Dome
RAD is the DIMS cross-system risk-assessment service and workspace. RAD supports governed assessment of physical and non-physical risk using Severity × Probability and produces a RAC.

### RAC — Risk Assessment Code
RAC expresses the assessed risk category. Lower RAC numbers normally receive higher primary risk priority.

### DEA™ — DIMS Execution Algorithm
DEA determines relative execution order among executable DIMS items. When items share the same RAC, DEA must discriminate primarily from objective system-recorded facts rather than human-estimated ratings.

### Execution Performance Metrics
Execution Performance Metrics describe how work was actually executed. They are separate from DEA and are observed during/after execution rather than estimated by the user before work.

Active measures include:
- HEI — Human Exposure Index
- AEL — AI Execution Load
- RWL — Rework Load
- VOY — Verified Outcome Yield
- Autonomy
- Session Window

These measures do not determine RAC and do not replace DEA.

### APN — Abatement Priority Number
APN is reserved for actual physical occupational-safety, fire, or occupational-health hazards requiring abatement prioritization. APN is not used for ordinary software, project, governance, deployment, administrative, or workflow risk.

## Governing rules
1. Conversation recency never changes Execution Order by itself.
2. New work receives no automatic #1 rank.
3. DEA recommends; governed executive overrides are explicit and auditable.
4. Blocked work retains its risk but cannot occupy an executable slot solely because of risk.
5. Dependency and governance gates precede dependent implementation.
6. Every material ranking change must be explainable.
7. DEA should minimize subjective human scoring by using observable, recorded system facts wherever possible.
8. Execution Performance Metrics must not be reused as disguised human estimates for pre-execution priority.

## Reference risk model
RAD uses Severity × Probability as the governing risk-assessment pattern. The RAC matrix is a decision aid and risk classification control; it is not itself the complete DEA execution-order mechanism.

## Objective DEA discrimination
After gates, DEA first respects RAC priority. When two or more executable items share the same RAC, DEA may use objective system-derived facts such as:

- Verified blocking-dependency count / unlocking relationships
- Recorded deadline distance
- Waiting age / time already pending
- Readiness / executability state already recorded by the system
- Continuity state (for example, already-started work that can close a governed loop)
- Verified governance/security gate relationships
- Other future system-derived signals only after validation

No user-entered subjective EPI score is required.

### Current prototype tie-order rule
For the current RAD guide prototype, equal-RAC items are ordered transparently by:

1. More verified blocking dependencies first
2. Nearest recorded deadline
3. Longer waiting age
4. Higher recorded readiness

This is a prototype ordering rule, not yet a certified final DEA algorithm. Additional signals and precedence must be tested against representative live DIMS workload before institutionalization.

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

Save creates a new immutable history entry and updates only authorized current-state snapshot fields.

## Dashboard interaction
The six accountability cards are controls, not decorative statistics. Clicking a card filters the existing Projects/Tasks records to its exact population:
- Ready for DI Execution
- Pastor H. Michael Daniels Actions / My Actions
- Blocked Items
- Follow-Ups Due
- Awaiting Verification
- Started / WIP

Provide a visible active-filter state and Clear Filter.

## Verification before certification
1. Test DEA against representative equal-RAC live tasks.
2. Verify that ordering relies on objective persisted facts rather than subjective user scoring.
3. Test desktop and mobile layouts.
4. Verify card counts exactly equal filtered result counts.
5. Verify append-only follow-up behavior.
6. Verify unauthorized/permanent fields cannot be overwritten.
7. Verify blocked and closed records are handled correctly.
8. Do not institutionalize final DEA precedence/weights until live workload testing is complete.
