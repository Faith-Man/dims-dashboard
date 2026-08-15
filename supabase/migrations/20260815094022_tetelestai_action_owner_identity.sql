-- Controlled, idempotent identity normalization.
update public.projects set action_owner = 'pastor_michael' where action_owner = 'herman';
update public.tasks set action_owner = 'pastor_michael' where action_owner = 'herman';
alter table public.projects drop constraint if exists projects_action_owner_check;
alter table public.projects add constraint projects_action_owner_check
  check (action_owner in ('dominion1st_di','pastor_michael','shared','external'));
alter table public.tasks drop constraint if exists tasks_action_owner_check;
alter table public.tasks add constraint tasks_action_owner_check
  check (action_owner in ('dominion1st_di','pastor_michael','shared','external'));
