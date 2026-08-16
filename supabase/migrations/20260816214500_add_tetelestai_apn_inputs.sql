alter table public.projects add column if not exists apn_cost numeric;
alter table public.projects add column if not exists apn_exposure numeric;
alter table public.tasks add column if not exists apn_cost numeric;
alter table public.tasks add column if not exists apn_exposure numeric;

alter table public.projects drop constraint if exists projects_apn_cost_nonnegative;
alter table public.projects add constraint projects_apn_cost_nonnegative check (apn_cost is null or apn_cost >= 0);
alter table public.projects drop constraint if exists projects_apn_exposure_positive;
alter table public.projects add constraint projects_apn_exposure_positive check (apn_exposure is null or apn_exposure > 0);
alter table public.tasks drop constraint if exists tasks_apn_cost_nonnegative;
alter table public.tasks add constraint tasks_apn_cost_nonnegative check (apn_cost is null or apn_cost >= 0);
alter table public.tasks drop constraint if exists tasks_apn_exposure_positive;
alter table public.tasks add constraint tasks_apn_exposure_positive check (apn_exposure is null or apn_exposure > 0);