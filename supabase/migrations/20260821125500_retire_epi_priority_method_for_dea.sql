begin;

alter table public.projects alter column priority_method drop default;
alter table public.tasks alter column priority_method drop default;

alter table public.projects drop constraint if exists projects_priority_method_check;
alter table public.tasks drop constraint if exists tasks_priority_method_check;

update public.projects set priority_method = 'dea' where priority_method = 'epi';
update public.tasks set priority_method = 'dea' where priority_method = 'epi';

alter table public.projects add constraint projects_priority_method_check check (priority_method in ('dea','apn'));
alter table public.tasks add constraint tasks_priority_method_check check (priority_method in ('dea','apn'));

alter table public.projects alter column priority_method set default 'dea';
alter table public.tasks alter column priority_method set default 'dea';

commit;
