alter table public.projects add column if not exists priority_method text not null default 'epi';
alter table public.tasks add column if not exists priority_method text not null default 'epi';

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'projects_priority_method_check') then
    alter table public.projects add constraint projects_priority_method_check check (priority_method in ('epi','apn'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'tasks_priority_method_check') then
    alter table public.tasks add constraint tasks_priority_method_check check (priority_method in ('epi','apn'));
  end if;
end $$;
