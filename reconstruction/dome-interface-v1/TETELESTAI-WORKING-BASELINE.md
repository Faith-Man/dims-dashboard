# TETELESTAI™ Working Baseline — Reconstruction Authority

Status: WORKING / PRESERVE

## Authority

- Repository: `Faith-Man/dims-dashboard`
- Working branch: `task-0071-di2-neural-orb`
- Working route: `https://task-0071-di2-neural-orb-dome-dashboard.dominion1st-integrated-management-system-dims.workers.dev/tetelestai/`
- Module file: `tetelestai/index.html`
- Projects/Tasks surface: `projects-tasks.html`
- Teaching identity commit: `324ba9d5e3c3b171e3cc846cfc83ec77ac732a05`

## Verified Working Condition

The TASK-0071 TETELESTAI page is the current reconstruction authority because it successfully renders the Projects and Tasks data when the Supabase `projects` and `tasks` tables permit anonymous `SELECT` during the design/reconstruction phase.

Temporary design-phase RLS policies:

- `reconstruction_preview_read_projects` — role `anon`, command `SELECT`
- `reconstruction_preview_read_tasks` — role `anon`, command `SELECT`

Do not grant anonymous INSERT, UPDATE, DELETE, or ALL permissions.

Before production promotion, restore governed authenticated access and remove the temporary anonymous SELECT policies after the secure sign-in path is verified.

## EBYC Rule

Do not recreate, duplicate, iframe-copy, or redesign the TETELESTAI data/auth engine during interface reconstruction. Extend this known-good implementation and preserve its loader, Projects/Tasks rendering, RAC/priority behavior, deep-link behavior, and data connection unless a verified defect requires a specific change.

## Visible Module Teaching

The working module now visibly teaches:

- Greek: `τετέλεσται` · *tetelestai* · “It is finished / completed”
- Why This Name: entrusted work is not merely started; it is governed toward faithful completion. The name joins execution, accountability, verification, and completion under the declaration, “It is finished.”
- John 17:4 (KJV): “I have glorified thee on the earth: I have finished the work which thou gavest me to do.”
- Function: owns projects, tasks, assignments, accountability, milestones, priorities, progress, and faithful completion of entrusted work.

Governing interface principle: **EVERY SCREEN TEACHES.**
