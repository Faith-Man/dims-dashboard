-- Source-control representation of the additive production migration applied 2026-08-15.
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = pg_catalog, public
as $$ begin new.updated_at = now(); return new; end; $$;

do $$
declare target text;
begin
  foreach target in array array['projects', 'tasks'] loop
    execute format('alter table public.%I add column if not exists action_owner text not null default %L', target, 'dominion1st_di');
    execute format('alter table public.%I add column if not exists next_action text', target);
    execute format('alter table public.%I add column if not exists readiness text not null default %L', target, 'ready');
    execute format('alter table public.%I add column if not exists risk_level text not null default %L', target, 'normal');
    execute format('alter table public.%I add column if not exists follow_up_interval_days integer not null default 30', target);
    execute format('alter table public.%I add column if not exists next_follow_up_date date', target);
    execute format('alter table public.%I add column if not exists last_follow_up_date date', target);
    execute format('alter table public.%I add column if not exists verification_status text not null default %L', target, 'not_submitted');
    execute format('alter table public.%I add column if not exists reported_complete_at timestamptz', target);
    execute format('alter table public.%I add column if not exists verified_at timestamptz', target);
    execute format('alter table public.%I add column if not exists verified_by text', target);
    execute format('alter table public.%I add column if not exists verification_evidence text', target);
    execute format('alter table public.%I add column if not exists effectiveness_review_date date', target);
    execute format('alter table public.%I add column if not exists effectiveness_status text', target);
    execute format('alter table public.%I add column if not exists updated_at timestamptz not null default now()', target);
    execute format('drop trigger if exists %I_set_updated_at on public.%I', target, target);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', target, target);
  end loop;
end $$;

create table if not exists public.task_follow_up_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  review_date date not null default current_date,
  review_type text not null default '30_day'
    check (review_type in ('daily','weekly','30_day','60_day','90_day','verification','effectiveness')),
  result text not null
    check (result in ('remains_open','reported_complete','verified_closed','verification_failed','effectiveness_confirmed','effectiveness_failed')),
  findings text, evidence text, reviewed_by text, next_follow_up_date date,
  created_at timestamptz not null default now()
);
comment on table public.task_follow_up_reviews is
  'Controlled assurance history for TETELESTAI task follow-up, verification, reopening and effectiveness reviews.';
alter table public.task_follow_up_reviews enable row level security;
revoke all on table public.task_follow_up_reviews from anon, authenticated;
grant all on table public.task_follow_up_reviews to service_role;

