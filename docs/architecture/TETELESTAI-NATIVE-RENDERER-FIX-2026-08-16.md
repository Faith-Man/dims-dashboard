# TETELESTAI Native Renderer Fix — 2026-08-16

## Problem
Production deployments succeeded, but expected RAC/status/filter UI changes were not reliably visible. The implementation depended on a secondary post-render DOM patch (`tetelestai-ui-finish.js`) rather than the authoritative grid renderer.

## Correction
- RAC is now a native grid column between Project/Task and Date Entered.
- RAC notation renders natively as `4 (III, C)` with the risk band below it.
- Completed status normalization is native to the main renderer.
- Sort/filter menus are native and support value filtering.
- Impact and DEA rationale are included in View.
- `tetelestai-ui-finish.js` is presentation-only and no longer mutates table structure/data.

## Operating lesson
Deploy → verify → if the expected UI is absent, diagnose immediately rather than assuming propagation delay.
