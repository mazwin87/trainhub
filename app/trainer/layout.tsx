import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerSidebar } from './TrainerSidebar'

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('approval_status, profile_completeness, slug')
    .eq('user_id', user.id)
    .single() as { data: { approval_status: string; profile_completeness: number; slug: string } | null }

  const { data: userInfo } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single() as { data: { full_name: string; role: string } | null }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <TrainerSidebar
        userName={userInfo?.full_name ?? 'Trainer'}
        completeness={profile?.profile_completeness ?? 0}
        approvalStatus={profile?.approval_status ?? 'pending'}
      />
      <main style={{ background: 'var(--color-bg)', padding: 'var(--space-8)' }}>
        {children}
      </main>
    </div>
  )
}