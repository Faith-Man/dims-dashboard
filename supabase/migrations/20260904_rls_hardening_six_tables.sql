-- PROJ-0028 / TASK-0059
-- Reproduce the verified 2026-09-04 RLS hardening state.

begin;

-- asset_registry
alter table public.asset_registry enable row level security;
drop policy if exists "allow_all" on public.asset_registry;
drop policy if exists "authenticated_all_asset_registry" on public.asset_registry;
create policy "authenticated_all_asset_registry"
  on public.asset_registry
  for all
  to authenticated
  using (true)
  with check (true);

-- projects
alter table public.projects enable row level security;
drop policy if exists "allow_all" on public.projects;
drop policy if exists "authenticated_all_projects" on public.projects;
create policy "authenticated_all_projects"
  on public.projects
  for all
  to authenticated
  using (true)
  with check (true);

-- tasks
alter table public.tasks enable row level security;
drop policy if exists "allow_all" on public.tasks;
drop policy if exists "authenticated_all_tasks" on public.tasks;
create policy "authenticated_all_tasks"
  on public.tasks
  for all
  to authenticated
  using (true)
  with check (true);

-- sync_log
alter table public.sync_log enable row level security;
drop policy if exists "allow_all" on public.sync_log;
drop policy if exists "authenticated_all_sync_log" on public.sync_log;
create policy "authenticated_all_sync_log"
  on public.sync_log
  for all
  to authenticated
  using (true)
  with check (true);

-- teachings: preserve public reads; require authentication for mutation.
alter table public.teachings enable row level security;
drop policy if exists "allow_all" on public.teachings;
drop policy if exists "public_read_teachings" on public.teachings;
drop policy if exists "authenticated_write_teachings" on public.teachings;
drop policy if exists "authenticated_update_teachings" on public.teachings;
drop policy if exists "authenticated_delete_teachings" on public.teachings;
create policy "public_read_teachings"
  on public.teachings for select to public using (true);
create policy "authenticated_write_teachings"
  on public.teachings for insert to authenticated with check (true);
create policy "authenticated_update_teachings"
  on public.teachings for update to authenticated using (true) with check (true);
create policy "authenticated_delete_teachings"
  on public.teachings for delete to authenticated using (true);

-- peace_safety_briefs was already read-only at remediation time; preserve that state.
alter table public.peace_safety_briefs enable row level security;
drop policy if exists "shamar_briefs_public_read" on public.peace_safety_briefs;
drop policy if exists "shamar_briefs_authenticated_read" on public.peace_safety_briefs;
create policy "shamar_briefs_public_read"
  on public.peace_safety_briefs for select to anon using (true);
create policy "shamar_briefs_authenticated_read"
  on public.peace_safety_briefs for select to authenticated using (true);

commit;
