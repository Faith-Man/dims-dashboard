# TASK-0123 — TETELESTAI Live Projects/Tasks Load Repair

Date: 2026-09-10

## Finding
The working `task-0071-di2-neural-orb` branch retained `tetelestai-auth-gate.js`, which verifies the Supabase user before loading TETELESTAI modules. Current `main` had lost that gate and loaded the Projects/Tasks modules immediately, while RLS now restricts `projects` and `tasks` to authenticated users.

## Repair
On branch `task-0123-tetelestai-live-load-repair`:
- Restored a current-compatible `tetelestai-auth-gate.js` based on the proven TASK-0071 implementation.
- Preserved current main module versions: `tetelestai-closed-loop.js?v=21`, `tetelestai-risk-ui-v2.js?v=21`, and `tetelestai-deep-links.js?v=21`.
- Changed `projects-tasks.html` so the app modules load only after authenticated Supabase user verification.
- Preserved the existing RAC priority prototype script.
- No RLS policy was weakened.
- Production/main was not modified.

## Verification Gate
Before production promotion, verify on the branch preview:
1. Signed-out user sees DOME sign-in requirement rather than a broken loading state.
2. Signed-in user loads Projects and Tasks.
3. TASK-0123 is visible.
4. `?task=TASK-0123` deep link opens the task.
5. Project deep links continue to work.
6. Add/Edit protected operations still require authentication and succeed for authorized user.
7. Desktop/mobile layouts remain usable.
8. No routing regression in `/tetelestai/` or `/projects-tasks.html`.
