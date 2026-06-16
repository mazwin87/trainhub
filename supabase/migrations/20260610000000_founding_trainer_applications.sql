-- Founding-trainer applications captured from the public landing page.
-- The form is unauthenticated, so the anon role may INSERT, but nobody
-- public may read the list back (emails are PII). Admins read via the
-- service-role client, which bypasses RLS.

create table if not exists public.founding_trainer_applications (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  created_at timestamptz default now()
);

-- One row per email (idempotent re-submits don't pile up).
create unique index if not exists founding_trainer_applications_email_key
  on public.founding_trainer_applications (lower(email));

alter table public.founding_trainer_applications enable row level security;

-- Public sign-up form: allow inserts from anon + authenticated, no read-back.
drop policy if exists "Anyone may apply" on public.founding_trainer_applications;
create policy "Anyone may apply"
  on public.founding_trainer_applications
  for insert
  to anon, authenticated
  with check (true);
