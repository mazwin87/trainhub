-- ============================================================
-- Trainer availability calendar (display-only, busy-dates model)
-- ------------------------------------------------------------
-- Each row = a date (or date range) the trainer is BOOKED/unavailable.
-- Everything not covered by a row is treated as available by the UI.
-- `note` is a PRIVATE reference for the trainer; it is never exposed
-- publicly (the public profile reads only start_date/end_date via the
-- server-side admin client, matching the reviews-fetch pattern).
-- ============================================================

create table if not exists public.trainer_schedule (
  id          uuid primary key default gen_random_uuid(),
  trainer_id  uuid not null references public.trainer_profiles(id) on delete cascade,
  start_date  date not null,
  end_date    date,              -- null = single day
  note        text,             -- private, trainer-only
  created_at  timestamptz default now()
);

create index if not exists trainer_schedule_trainer_date_idx
  on public.trainer_schedule (trainer_id, start_date);

alter table public.trainer_schedule enable row level security;

-- The owning trainer (profile.user_id = auth.uid()) can do everything to their rows.
drop policy if exists "Trainers manage own schedule" on public.trainer_schedule;
create policy "Trainers manage own schedule"
  on public.trainer_schedule
  for all
  to authenticated
  using (
    trainer_id in (select id from public.trainer_profiles where user_id = auth.uid())
  )
  with check (
    trainer_id in (select id from public.trainer_profiles where user_id = auth.uid())
  );

-- Admins can read all schedules.
drop policy if exists "Admins view all schedule" on public.trainer_schedule;
create policy "Admins view all schedule"
  on public.trainer_schedule
  for select
  to authenticated
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- NOTE: no anon/public SELECT policy by design. The public profile page reads
-- busy dates with the service-role admin client, selecting ONLY start_date/end_date,
-- so the private `note` is never sent to visitors.
