import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AdminSidebar } from './AdminSidebar'

interface UserProfile {
  role: string
  full_name: string
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile, error } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single() as { data: UserProfile | null; error: any }

  if (error || !profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="admin-dashboard-grid">
      <AdminSidebar userName={profile.full_name} />
      <main style={{ background: 'var(--color-bg)', padding: 'var(--space-8)', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}