import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ScheduleManager, type ScheduleEntry } from './ScheduleManager'

export default async function AvailabilityPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }

  if (!profile) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Please complete your profile first.</p>
      </div>
    )
  }

  const { data: entries } = await supabase
    .from('trainer_schedule' as any)
    .select('id, trainer_id, start_date, end_date, note, created_at')
    .eq('trainer_id', profile.id)
    .order('start_date', { ascending: true }) as { data: ScheduleEntry[] | null }

  return <ScheduleManager trainerId={profile.id} initialEntries={entries ?? []} />
}
