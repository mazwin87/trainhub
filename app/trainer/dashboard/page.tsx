import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  Mailbox,
  Star,
  BookOpen,
  User,
  TrendingUp,
} from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { calculateCompleteness } from '@/lib/utils/completeness'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userInfo } = await supabase
    .from('users')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single() as { data: any }

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: any }

  // Count related items for completeness
  const trainerId = profile?.id
  const [topics, courses, certs, inquiries] = trainerId ? await Promise.all([
    supabase.from('trainer_topics').select('topic_id', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('certifications').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('inquiries').select('id, status', { count: 'exact' }).eq('trainer_id', trainerId),
  ]) : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0, data: [] as any[] }]

  const { score, checks } = calculateCompleteness(
    profile,
    userInfo,
    topics.count ?? 0,
    courses.count ?? 0,
    certs.count ?? 0
  )

  const newInquiries = ((inquiries as any).data ?? []).filter((i: any) => i.status === 'new').length

  const stats = [
    { label: 'Profile views', value: profile?.views_count ?? 0,                 Icon: Eye,        accent: 'var(--color-accent)' },
    { label: 'Inquiries',     value: inquiries.count ?? 0,                      Icon: Mailbox,    accent: 'var(--color-cta)',         href: '/trainer/inquiries', badge: newInquiries },
    { label: 'Rating',        value: profile?.avg_rating?.toFixed(1) ?? '—',    Icon: Star,       accent: 'var(--color-featured-text)' },
    { label: 'Courses',       value: courses.count ?? 0,                        Icon: BookOpen,   accent: 'var(--color-top-text)' },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
          Welcome back, {userInfo?.full_name?.split(' ')[0] ?? 'Trainer'}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          {profile?.approval_status === 'approved'
            ? 'Your profile is live and discoverable'
            : 'Complete your profile to get approved faster'}
        </p>
      </div>

      {/* Welcome empty state for new users without a profile */}
      {!profile && (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-surface) 100%)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          marginBottom: 'var(--space-6)',
        }}>
          <User size={48} strokeWidth={1.5} style={{ marginBottom: 'var(--space-3)', color: 'var(--color-accent)' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
            Let's set up your trainer profile
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', maxWidth: '480px', margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
            You're 5 minutes away from being discoverable by Malaysian companies looking for HRDC-certified trainers.
          </p>
          <Link href="/trainer/profile" className="btn btn-primary">
            Start with your profile →
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="admin-stats-grid">
        {stats.map(s => {
          const Icon = s.Icon
          const Wrapper: any = s.href ? Link : 'div'
          const wrapperProps = s.href ? { href: s.href } : {}
          return (
            <Wrapper
              key={s.label}
              {...wrapperProps}
              className="admin-stat-card"
              style={{ position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 500 }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 600, lineHeight: 1 }}>
                {s.value}
                {s.badge ? (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', marginLeft: '8px', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    · {s.badge} new
                  </span>
                ) : null}
              </div>
            </Wrapper>
          )
        })}
      </div>

      {/* Profile completeness */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 500 }}>
            Profile completeness
          </h2>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: score >= 80 ? 'var(--color-cta)' : 'var(--color-accent)' }}>
            {score}%
          </span>
        </div>

        <div style={{ height: '8px', background: 'var(--color-surface-alt)', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
          <div style={{ height: '100%', width: `${score}%`, background: score >= 80 ? 'var(--color-cta)' : 'var(--color-accent)', borderRadius: '4px', transition: 'width var(--transition-slow)' }} />
        </div>

        <div className="checklist-grid">
          {checks.map(check => (
            <div key={check.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: check.completed ? 'var(--color-cta)' : 'transparent',
                border: check.completed ? 'none' : '1.5px solid var(--color-border)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                flexShrink: 0,
              }}>
                {check.completed ? '✓' : ''}
              </span>
              <span style={{ color: check.completed ? 'var(--color-muted)' : 'var(--color-ink)', textDecoration: check.completed ? 'line-through' : 'none', flex: 1 }}>
                {check.label}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                +{check.points}
              </span>
            </div>
          ))}
        </div>

        {score < 100 && (
          <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <TrendingUp size={16} strokeWidth={1.75} style={{ color: 'var(--color-cta)' }} />
              Profiles at 80%+ get <strong>3× more inquiries</strong>
            </p>
            <Link href="/trainer/profile" className="btn btn-primary">
              Complete profile →
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="action-cards-grid">
        <Link href="/trainer/profile" className="admin-stat-card" style={{ padding: 'var(--space-5)' }}>
          <User size={22} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }} />
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>Edit profile</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Update your bio, topics, pricing</div>
        </Link>
        <Link href="/trainer/courses" className="admin-stat-card" style={{ padding: 'var(--space-5)' }}>
          <BookOpen size={22} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }} />
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>Manage courses</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{courses.count ?? 0} courses listed</div>
        </Link>
        <Link href="/trainer/inquiries" className="admin-stat-card" style={{ padding: 'var(--space-5)' }}>
          <Mailbox size={22} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }} />
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>View inquiries</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {newInquiries > 0 ? `${newInquiries} new messages` : 'No new messages'}
          </div>
        </Link>
      </div>
    </div>
  )
}