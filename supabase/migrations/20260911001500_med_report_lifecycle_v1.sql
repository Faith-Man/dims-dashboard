create table if not exists public.med_counselor_reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.med_cases(id) on delete cascade,
  instrument_version text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft','approved')),
  report_body text not null default '',
  counselor_notes text not null default '',
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  unique(case_id, version)
);

create table if not exists public.med_released_reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.med_cases(id) on delete cascade,
  counselor_report_id uuid not null references public.med_counselor_reports(id) on delete restrict,
  instrument_version text not null,
  version integer not null,
  report_body text not null,
  released_by uuid not null default auth.uid(),
  released_at timestamptz not null default now(),
  unique(case_id, version)
);

alter table public.med_counselor_reports enable row level security;
alter table public.med_released_reports enable row level security;

revoke all on public.med_counselor_reports from anon;
revoke all on public.med_released_reports from anon;
grant select, insert, update on public.med_counselor_reports to authenticated;
grant select, insert on public.med_released_reports to authenticated;

create policy med_counselor_reports_select on public.med_counselor_reports for select to authenticated using (med_private.has_role(case_id, array['counselor'::text]) or med_is_admin());
create policy med_counselor_reports_insert on public.med_counselor_reports for insert to authenticated with check ((med_private.has_role(case_id, array['counselor'::text]) or med_is_admin()) and created_by = auth.uid());
create policy med_counselor_reports_update on public.med_counselor_reports for update to authenticated using (med_private.has_role(case_id, array['counselor'::text]) or med_is_admin()) with check (med_private.has_role(case_id, array['counselor'::text]) or med_is_admin());

create policy med_released_reports_select on public.med_released_reports for select to authenticated using (med_private.has_role(case_id, array['husband'::text,'wife'::text,'counselor'::text]) or med_is_admin());
create policy med_released_reports_insert on public.med_released_reports for insert to authenticated with check ((med_private.has_role(case_id, array['counselor'::text]) or med_is_admin()) and released_by = auth.uid());
