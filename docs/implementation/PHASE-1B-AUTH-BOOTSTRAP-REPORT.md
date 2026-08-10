# Phase 1B — Authentication Bootstrap Preparation Report

**Date:** 2026-08-10
**Mode:** Repository-only application preparation; no live changes

## Delivered foundation

The existing `admin.js` OTP magic-link flow, session lookup, auth-state listener, and sign-out behavior were extended under EBYC rather than replaced. `dims-auth.js` now owns the interim static-page Supabase client and exposes session lookup, a defensive mutation guard, and a reusable accessible sign-in/sign-out/status component.

Projects/Tasks, OrEl teachings, Asset Registry, and NESHAMAH retain anonymous read attempts but disable their write controls until a browser session exists. Each mutation function independently calls `requireSession()` before Supabase, preventing console/direct handler invocation from bypassing only the disabled button. The admin editor keeps its existing UX, reuses the shared client, and adds the same defensive guard.

This is not authorization. It establishes only “session present” at the UI layer and deliberately does not assign administrator, contributor, editor, reviewer, or publisher rights. Current public database policies/grants remain authoritative until separately reviewed and changed live.

## Manual account provisioning required before hardening

These are future human/platform steps; none was performed:

1. Verify backup/restore and obtain regression authorization before any policy/grant work.
2. In the live Supabase Dashboard, an authorized project administrator opens **Authentication → Users** and selects **Add user**.
3. Enter the approved operator email. Choose an invitation flow where available rather than setting or communicating a shared password. Do not auto-confirm an identity unless the authorized identity-verification procedure explicitly permits it.
4. Have the intended person complete the invitation/magic-link flow and verify the expected email identity. The application’s “Send sign-in link” cannot bootstrap a nonexistent account when sign-ups are disabled.
5. Confirm a session on each guarded page and test read behavior plus only the intended mutations in a controlled regression window. Record user UUID, approved identity owner, test evidence, and rollback contact outside client code.
6. Before provisioning more users or hardening RLS, authorize where application roles live and map named people to least-privilege roles. Authentication alone must not confer administrator/editor/publisher authority.
7. Separately review redirect URL allowlists for each authorized production origin. Do not change Auth settings, secrets, RLS, or grants as part of this repository package.

## Files changed

- `docs/implementation/CODEX-PHASE-1B-AUTH-BOOTSTRAP-PROMPT.md`: source-controlled copy of the user-supplied governing work package.
- `dims-auth.js`: shared client, session API, guard, and reusable auth UI.
- `admin.js`: reuse shared client and guard teaching upserts.
- `projects-tasks.html`, `orel-studio.html`, `enterprise-forms.html`, `neshamah.html`: reusable status/sign-in UI, disabled unauthenticated mutation controls, and handler guards.
- `dims-shared.css`: accessible shared auth presentation and disabled state.
- `scripts/build-production.mjs`: includes the shared runtime module.
- `tests/auth-bootstrap.test.mjs`: static buildless checks for guards and consolidation.
- `docs/implementation/PHASE-1B-REMAINING-WRITE-PATH-INVENTORY.md`: guarded and remaining paths.
- this report: provisioning, risks, decisions, and verification record.

## Unresolved risks and authorization decisions

- Live Auth has zero users; guarded writes cannot be operational until an account is authorized and provisioned.
- Public `ALL` policies and broad anon grants remain unchanged, so these UI guards do not stop direct API clients or modified browser code.
- Authenticated does not mean authorized. Role storage, ownership, module scope, review/publish transitions, deletes, and service identities remain human decisions.
- `institutional-queue.html` and `mission-control.html` remain allowlisted with stale/unreviewed write paths; see the inventory. They were outside the authorized migration surfaces and must be resolved before claiming all production writes are guarded.
- Anonymous/public read requirements remain unresolved and were not changed.
- Mutable function search paths, `notification_outbox`, proposals, migrations, RLS, grants, users, secrets, and platform configuration were not altered.
- Error messages from Supabase Auth remain visible in the interim client UI; production UX should map sensitive provider detail to safer user-facing messages once requirements are established.

## Verification position

Repository checks completed successfully in the originating Codex workspace: `node --test tests/auth-bootstrap.test.mjs tests/orai-handler.test.mjs` (11 tests), `node --check` for shared/admin modules, syntax checks for each changed inline module, the production build plus `dist/dims-auth.js` presence check, forbidden-artifact inspection, and `git diff --check`.

No live Supabase DDL, RLS, grant, Auth-user, password, migration, function, secret, deployment, or external-system change was made. Historical/provenance artifacts and `supabase/proposals/` remain unchanged.

**PHASE 1B AUTH BOOTSTRAP PREPARATION COMPLETE — LIVE RLS/GRANT CHANGES STILL PENDING BACKUP/RESTORE + ACCOUNT PROVISIONING + REGRESSION AUTHORIZATION**
