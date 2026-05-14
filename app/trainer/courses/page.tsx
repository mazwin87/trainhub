import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { CoursesManager } from './CoursesManager'

export default async function CoursesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get trainer profile id
  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }

  if (!profile) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>
          Please complete your profile first.
        </p>
      </div>
    )
  }

  // Get existing courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*, topics(id, name)')
    .eq('trainer_id', profile.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  // Get all topics for the dropdown
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name')
    .order('name') as { data: { id: string; name: string }[] | null }

  return (
    <CoursesManager
      trainerId={profile.id}
      initialCourses={courses ?? []}
      topics={topics ?? []}
    />
  )
}