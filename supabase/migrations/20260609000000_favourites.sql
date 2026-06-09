-- ============================================================
-- FAVOURITES — buyers/HR can shortlist trainers to compare later.
-- One row per (user, trainer). Each user manages only their own.
-- ============================================================

create table if not exists public.favourites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  trainer_id  uuid not null references public.trainer_profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, trainer_id)
);

create index if not exists favourites_user_idx on public.favourites (user_id);

alter table public.favourites enable row level security;

-- Each authenticated user can read/insert/delete ONLY their own favourites.
drop policy if exists "Users manage own favourites" on public.favourites;
create policy "Users manage own favourites"
  on public.favourites
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
