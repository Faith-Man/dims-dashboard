-- TASK-0019 REVIEW-ONLY DDL. NOT APPLIED TO ANY DATABASE.
-- Execute only after formal governance approval, security review, and backup.
begin;

create table public.sync_evidence_inbox (
  id bigint generated always as identity primary key,
  provider text not null check (provider in ('github', 'cloudflare')),
  event_id text not null check (length(event_id) between 1 and 180),
  reference text not null default '' check (length(reference) <= 2048),
  description text not null default '' check (length(description) <= 4000),
  task_numbers text[] not null default '{}',
  disposition text not null check (disposition in ('pending_review', 'needs_manual_matching')),
  review_state text not null default 'unreviewed' check (review_state = 'unreviewed'),
  verified_closed boolean not null default false check (verified_closed = false),
  received_at timestamptz not null default now(),
  constraint sync_evidence_inbox_provider_event_unique unique (provider, event_id),
  constraint sync_evidence_inbox_task_numbers_limit check (cardinality(task_numbers) <= 100)
);

alter table public.sync_evidence_inbox enable row level security;
alter table public.sync_evidence_inbox force row level security;

-- No RLS policies for untrusted client roles.
revoke all on public.sync_evidence_inbox from public, anon, authenticated;
revoke all on sequence public.sync_evidence_inbox_id_seq from public, anon, authenticated;

-- Grant to service_role only for an authorized trusted server-side gateway.
-- service_role bypasses RLS and MUST NEVER be used in a browser.
grant select, insert on public.sync_evidence_inbox to service_role;
grant usage on sequence public.sync_evidence_inbox_id_seq to service_role;

commit;

-- No task/project status writes, triggers, or automatic closure are included.
