-- Keep the legacy task progress normalizer compatible with the closed-loop
-- execution state introduced by TETELESTAI.
create or replace function public.dims_task_progress_from_status(p_status text)
returns integer
language sql
immutable
as $function$
  select case lower(trim(coalesce(p_status,'')))
    when 'complete' then 100
    when 'completed' then 100
    when 'closed' then 100
    when 'done' then 100
    when 'reported_complete' then 100
    when 'reported complete' then 100
    when 'in progress' then 50
    when 'in_progress' then 50
    when 'active' then 50
    when 'planning' then 25
    when 'planned' then 0
    when 'research' then 25
    when 'pending' then 0
    when 'open' then 0
    when 'deferred' then 0
    when 'on hold' then 0
    when 'on_hold' then 0
    else 0
  end;
$function$;
