import { createServerClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  // Get counts
  const [pending, approved, inquiries, users] = await Promise.all([
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Pending Approvals', value: pending.count ?? 0, color: 'var(--color-accent)' },
    { label: 'Approved Trainers', value: approved.count ?? 0, color: 'var(--color-cta)' },
    { label: 'Total Inquiries', value: inquiries.count ?? 0, color: 'var(--color-featured-text)' },
    { label: 'Total Users', value: users.count ?? 0, color: 'var(--color-top-text)' },
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Overview of TrainHub Malaysia
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}