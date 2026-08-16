-- TETELESTAI / DEA additive prototype schema. Apply only after review.

create table if not exists public.tetelestai_follow_up_history (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('project','task')),
  project_id uuid references public.projects(id) on delete restrict,
  task_id uuid references public.tasks(id) on delete restrict,
  follow_up_date date not null default current_date,
  action_taken text not null,
  results text not null,
  next_action text,
  next_follow_up_date date,
  progress_percent integer check (progress_percent between 0 and 100),
  entered_by text,
  amendment_of uuid references public.tetelestai_follow_up_history(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint tetelestai_follow_up_record_target check (
    (record_type='project' and project_id is not null and task_id is null) or
    (record_type='task' and task_id is not null and project_id is null)
  )
);
comment on table public.tetelestai_follow_up_history is
  'Append-only operational follow-up/action history. Prior entries are never overwritten; corrections are amendments.';

create table if not exists public.dea_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('project','task')),
  project_id uuid references public.projects(id) on delete restrict,
  task_id uuid references public.tasks(id) on delete restrict,
  severity text not null check (severity in ('I','II','III','IV')),
  probability text not null check (probability in ('A','B','C','D','E')),
  risk_level text not null check (risk_level in ('extremely_high','high','medium','low')),
  rationale text,
  assessed_by text,
  assessed_at timestamptz not null default now(),
  constraint dea_risk_record_target check (
    (record_type='project' and project_id is not null and task_id is null) or
    (record_type='task' and task_id is not null and project_id is null)
  )
);
comment on table public.dea_risk_assessments is
  'Append-only DEA risk assessment history using Severity x Probability.';

create table if not exists public.tetelestai_change_history (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('project','task')),
  project_id uuid references public.projects(id) on delete restrict,
  task_id uuid references public.tasks(id) on delete restrict,
  field_name text not null,
  old_value text,
  new_value text,
  reason text,
  changed_by text,
  changed_at timestamptz not null default now(),
  constraint tetelestai_change_record_target check (
    (record_type='project' and project_id is not null and task_id is null) or
    (record_type='task' and task_id is not null and project_id is null)
  )
);
comment on table public.tetelestai_change_history is
  'Append-only audit trail for material controlled-current-state changes.';

-- History tables are intentionally not granted direct browser write access in this prototype.
alter table public.tetelestai_follow_up_history enable row level security;
alter table public.dea_risk_assessments enable row level security;
alter table public.tetelestai_change_history enable row level security;
revoke all on table public.tetelestai_follow_up_history from anon, authenticated;
revoke all on table public.dea_risk_assessments from anon, authenticated;
revoke all on table public.tetelestai_change_history from anon, authenticated;
grant all on table public.tetelestai_follow_up_history to service_role;
grant all on table public.dea_risk_assessments to service_role;
grant all on table public.tetelestai_change_history to service_role;
