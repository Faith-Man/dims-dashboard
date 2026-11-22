-- PROJ-0028 regression correction
-- Prevent parent projects from closing merely because task progress reached 100%.
-- A project closes only when every child task is formally verified_closed.

create or replace function public.dims_recalculate_project_progress(p_project_id uuid)
returns void
language plpgsql
set search_path = public, pg_temp
as $function$
declare
  v_task_count integer;
  v_percent integer;
  v_verified_count integer;
begin
  if p_project_id is null then return; end if;

  select count(*),
         coalesce(round(avg(public.dims_task_progress_from_status(status)))::integer,0),
         count(*) filter (where verification_status = 'verified_closed')
  into v_task_count, v_percent, v_verified_count
  from public.tasks
  where project_id = p_project_id;

  if v_task_count = 0 then return; end if;

  update public.projects
  set percent_complete = v_percent,
      status = case
        when v_verified_count = v_task_count then 'closed'
        when lower(trim(coalesce(status,''))) = 'closed' then 'in_progress'
        when v_percent > 0 and lower(trim(coalesce(status,''))) in ('planned','deferred','research','open','pending') then 'in_progress'
        else status
      end,
      completed_date = case
        when v_verified_count = v_task_count then coalesce(completed_date,current_date)
        else null
      end
  where id = p_project_id;
end;
$function$;
