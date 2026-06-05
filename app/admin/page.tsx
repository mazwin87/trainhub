import Link from 'next/link'
import { Clock, UserCheck, Mailbox, Users } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  const [pending, approved, inquiries, users, recentInquiries, recentTrainers] = await Promise.all([
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries')
      .select('id, contact_name, company_name, training_topic, status, created_at, trainer_profiles(users(full_name))')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('trainer_profiles')
      .select('id, slug, approval_status, created_at, users(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Pending approvals', value: pending.count ?? 0,    href: '/admin/approvals',                Icon: Clock },
    { label: 'Approved trainers', value: approved.count ?? 0,   href: '/admin/trainers?status=approved', Icon: UserCheck },
    { label: 'Total inquiries',   value: inquiries.count ?? 0,  href: '/admin/inquiries',                Icon: Mailbox },
    { label: 'Total users',       value: users.count ?? 0,      href: '/admin/users',                    Icon: Users },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Overview · Updated {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map(s => {
          const Icon = s.Icon
          return (
          <Link key={s.label} href={s.href} className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 600, lineHeight: 1, textAlign: 'center' }}>
              {s.value}
            </div>
          </Link>
          )
        })}
      </div>

      {/* Two-column section */}
      <div className="admin-activity-grid">

        {/* Recent inquiries */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500 }}>
              Recent inquiries
            </h3>
            <Link href="/admin/inquiries" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
              View all →
            </Link>
          </div>

          {!recentInquiries.data || recentInquiries.data.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
              No inquiries yet
            </div>
          ) : (
            recentInquiries.data.map((inq: any, i: number) => (
              <Link
                key={inq.id}
                href="/admin/inquiries"
                style={{
                  display: 'block',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: i < recentInquiries.data!.length - 1 ? '1px solid var(--color-border)' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inq.company_name || inq.contact_name}
                  </span>
                  {inq.status === 'new' && (
                    <span style={{ fontSize: '10px', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>
                      New
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inq.training_topic ?? 'No topic'} · for {inq.trainer_profiles?.users?.full_name ?? '—'}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* Recent trainers */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500 }}>
              Recent registrations
            </h3>
            <Link href="/admin/trainers" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
              View all →
            </Link>
          </div>

          {!recentTrainers.data || recentTrainers.data.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
              No registrations yet
            </div>
          ) : (
            recentTrainers.data.map((t: any, i: number) => {
              const statusColor =
                t.approval_status === 'approved' ? 'var(--color-cta-dark)' :
                t.approval_status === 'rejected' ? 'var(--color-error-text)' :
                'var(--color-accent)'

              return (
                <Link
                  key={t.id}
                  href="/admin/trainers"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-4) var(--space-5)',
                    borderBottom: i < recentTrainers.data!.length - 1 ? '1px solid var(--color-border)' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', overflow: 'hidden' }}>
                    {t.users?.avatar_url ? (
                      <img src={t.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (t.users?.full_name ?? '?').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.users?.full_name ?? 'Unnamed'}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: statusColor, textTransform: 'capitalize' }}>
                      {t.approval_status}
                    </p>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', flexShrink: 0 }}>
                    {new Date(t.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}