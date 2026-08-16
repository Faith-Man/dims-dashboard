# DEA™ Dual Priority Method — EPI / APN v1.0

Status: Controlled design baseline for implementation and validation.

## Purpose
DEA™ (DIMS Execution Algorithm) uses RAC as the primary risk classification and supports two governed relative-priority methods depending on record type.

## Common foundation: RAC
RAC is derived from Severity × Probability. The compact display format is `4 (III, C)`. RAC establishes the primary risk class. Records must be sortable and filterable by RAC.

## Priority Method 1 — EPI™
**EPI — Execution Priority Index** is the DIMS enterprise method for projects, tasks, governance items, system deficiencies, deployments, blockers, and other non-safety work.

EPI exists primarily to explain and resolve execution priority when records have the same RAC, including the same Severity and Probability combination.

### EPI inputs
- **Impact (I):** breadth and magnitude of the consequence of leaving the condition unresolved. Impact may include effects on operations, projects, tasks, systems, users, dependencies, governance, and mission objectives.
- **ERE — Estimated Resolution Effort:** the estimated active effort required to move the condition from its current state to verified resolution.
- **AIT — AI Time:** estimated/actual active AI execution effort.
- **HIT — Human Interaction Time:** estimated/actual active human effort such as review, approvals, clicking, testing, uploads, configuration, or other manual action.
- **ERE = estimated AIT + estimated HIT.**

Initial AIT/HIT values may be estimates. DEA should attach an estimation confidence level and, when sufficient history exists, use comparable completed DIMS records to improve the estimate.

### Learning loop
Estimate → Execute → Measure → Verify → Compare estimate with actual → Preserve history → Improve future estimates.

Actual AIT and HIT are preserved after completion. **ERT — Elapsed Resolution Time** is also preserved as a performance metric but is not the same as active execution effort; waiting, overnight gaps, external responses, and deployment delays must not automatically be counted as AIT or HIT.

### EPI formula status
The exact numerical EPI formula/weighting is **not yet certified**. Current design direction is a simple relationship using ERE and Impact rather than a many-factor 100-point score. The formula must be validated against real DIMS history before institutional certification. Until certified, the UI must not imply mathematical precision beyond the approved inputs and confidence level.

## Priority Method 2 — APN
**APN — Abatement Priority Number** is reserved for genuine safety-hazard / hazard-abatement records when DIMS is applying the adopted safety methodology.

Safety Hazard records may use the APN method with the appropriate safety-specific inputs such as personnel exposure and abatement cost, together with the applicable RAC/multiplier methodology. DIMS must not relabel an EPI calculation as APN.

## Priority Method selection
Every governed record has a `Priority Method`:
- `EPI — DIMS Execution` for normal DIMS enterprise work.
- `APN — Safety Hazard` for genuine safety-hazard abatement work.

Record type may set the default. Selecting `Safety Hazard` should expose APN-specific fields; ordinary projects/tasks should expose EPI fields.

## UI governance
- Remove the normal visible **Rank** column. RAC is the visible primary ordering mechanism.
- Keep any DEA tie-breaking/execution sequence internal and explainable rather than presenting an unexplained rank number.
- RAC must support ascending/descending sort and filtering by RAC value.
- RAC cells use compact notation such as `3 (III, C)`.
- Desktop RAC cells support hover/click; mobile supports tap. The disclosure explains Severity, Probability, RAC, selected Priority Method, and why equal-RAC records are ordered differently.
- Do not write the complete RAC lesson repeatedly in each View panel; provide a compact disclosure and access to the full RAC matrix.
- `In Progress` must remain on one line.
- Replace unexplained `WIP` in user-facing text with `In Progress`.
- Avoid unexplained `Executive Override` wording. Any authorized manual intervention must be explicitly labeled and audit-trailed.
- View should use horizontal full-width field rows on desktop and responsive stacked rows on mobile rather than forcing mobile horizontal scrolling.
- Test Sapphire Blue `#0F52BA` for the horizontal column-heading rows beneath Projects and Tasks, replacing the current Blue-Violet presentation for visual review.

## Governance principle
RAC answers: **How serious and probable is this condition?**

EPI answers: **For DIMS enterprise work with equal RACs, which item should receive execution priority, and why?**

APN answers: **For genuine safety-hazard abatement work, what is the relative abatement priority under the adopted safety methodology?**

The method used must always be visible and auditable.