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
    { label: 'Pending Approvals', value: pending.count ?? 0, icon: '⏳', bgColor: '#FEF3E2', color: '#D97706' },
    { label: 'Approved Trainers', value: approved.count ?? 0, icon: '✓', bgColor: '#ECFDF5', color: '#059669' },
    { label: 'Total Inquiries', value: inquiries.count ?? 0, icon: '💬', bgColor: '#EFF6FF', color: '#0284C7' },
    { label: 'Total Users', value: users.count ?? 0, icon: '👥', bgColor: '#F5F3FF', color: '#7C3AED' },
  ]

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-12)' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--text-3xl)', 
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
          color: 'var(--color-ink)'
        }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', marginBottom: 'var(--space-1)' }}>
          Overview of TrainHub Malaysia
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
          Last updated {new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-12)'
      }}>
        {stats.map(stat => (
          <div 
            key={stat.label} 
            className="admin-stat-card"
            style={{ 
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Icon Background */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '100px',
              height: '100px',
              background: stat.bgColor,
              borderRadius: '50%',
              opacity: 0.5,
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{
                  fontSize: '2rem',
                  background: stat.bgColor,
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)',
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-muted)',
                fontWeight: 500
              }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
      }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-6)',
          color: 'var(--color-ink)'
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)'
        }}>
          <a href="/admin/approvals" className="admin-action-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, #FEF3E2 0%, #FDE8B6 100%)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: '#D97706',
            fontWeight: 500,
          }}>
            ⏳ Review Approvals
          </a>
          <a href="/admin/trainers" className="admin-action-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: '#059669',
            fontWeight: 500,
          }}>
            👥 View Trainers
          </a>
          <a href="/admin/inquiries" className="admin-action-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            color: '#0284C7',
            fontWeight: 500,
          }}>
            💬 Check Inquiries
          </a>
        </div>
      </div>
    </div>
  )
}
