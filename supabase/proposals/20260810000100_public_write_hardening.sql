-- PROPOSAL ONLY — DO NOT APPLY WITHOUT HUMAN AUTHORIZATION.
-- Precondition: verified backup/restore, authenticated application write paths,
-- role/access decision, staging regression test, and rollback review.
begin;

-- These policy names and exposures are verified in the 2026-08-09 baseline.
drop policy if exists "allow_all_asset_registry" on public.asset_registry;
drop policy if exists "allow_all_peace_safety_briefs" on public.peace_safety_briefs;
drop policy if exists "allow_all_projects" on public.projects;
drop policy if exists "Allow authenticated access to sync_log" on public.sync_log;
drop policy if exists "allow_all_tasks" on public.tasks;
drop policy if exists "allow_all_teachings" on public.teachings;

-- Minimum evidence-supported replacement: existing browser writers must have an
-- authenticated session. This does not claim contributor/editor/reviewer/etc.
-- authorization is resolved; all authenticated users remain broad pending that
-- decision. Anonymous SELECT is intentionally unresolved and therefore omitted.
create policy "authenticated_all_asset_registry_proposed" on public.asset_registry for all to authenticated using (true) with check (true);
create policy "authenticated_all_peace_safety_briefs_proposed" on public.peace_safety_briefs for all to authenticated using (true) with check (true);
create policy "authenticated_all_projects_proposed" on public.projects for all to authenticated using (true) with check (true);
create policy "authenticated_all_sync_log_proposed" on public.sync_log for all to authenticated using (true) with check (true);
create policy "authenticated_all_tasks_proposed" on public.tasks for all to authenticated using (true) with check (true);
create policy "authenticated_all_teachings_proposed" on public.teachings for all to authenticated using (true) with check (true);

-- Grants must be reconstructed and reviewed before use. RLS alone does not
-- revoke any public/anon table privilege recorded outside the policy snapshot.
rollback;
