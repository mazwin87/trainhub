-- ============================================================
-- Certifications table — admin RLS policies
-- ------------------------------------------------------------
-- The `certificates` STORAGE bucket policies (trainer folder-per-user,
-- admin SELECT-all) are already in place. These policies are for the
-- `public.certifications` TABLE so admins can review + verify certs.
--
-- RLS policies are OR-combined, so these ADD admin access on top of any
-- existing trainer "own rows" policies — trainers keep seeing only their
-- own certs; admins can see + verify all.
--
-- The admin check reads the caller's OWN row in public.users (allowed by
-- the existing self-select on users), so there's no RLS recursion issue.
-- ============================================================

-- Safety: ensure RLS is on (no-op if already enabled)
alter table public.certifications enable row level security;

-- Admins can SELECT all certifications (needed for the approvals join)
drop policy if exists "Admins can view all certifications" on public.certifications;
create policy "Admins can view all certifications"
  on public.certifications
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Admins can UPDATE certifications (needed for the verify action: is_verified = true)
drop policy if exists "Admins can update certifications" on public.certifications;
create policy "Admins can update certifications"
  on public.certifications
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
