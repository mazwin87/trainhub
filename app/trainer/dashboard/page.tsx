import { redirect } from 'next/navigation'
import Link from 'next/link'
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
  ]) : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0, data: [] }]

  const { score, checks } = calculateCompleteness(
    profile,
    userInfo,
    topics.count ?? 0,
    courses.count ?? 0,
    certs.count ?? 0
  )

  const newInquiries = (inquiries.data ?? []).filter((i: any) => i.status === 'new').length

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Welcome back, {userInfo?.full_name?.split(' ')[0] ?? 'Trainer'} 👋
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        {profile?.approval_status === 'approved'
          ? 'Your profile is live and discoverable'
          : 'Complete your profile to get approved faster'}
      </p>

      {!profile && (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-surface) 100%)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
          marginBottom: 'var(--space-6)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>👋</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
            Let's set up your trainer profile
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', maxWidth: '480px', margin: '0 auto var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
            You're 5 minutes away from being discoverable by Malaysian companies looking for HRDF-certified trainers.
          </p>
          <Link href="/trainer/profile" className="btn btn-primary">
            Start with your profile →
          </Link>
        </div>
      )}
      
      {/* Stats row */}
      <div className="stat-cards-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>{profile?.views_count ?? 0}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Profile views</div>
        </div>
        <Link href="/trainer/inquiries" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>
            {inquiries.count ?? 0}
            {newInquiries > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', marginLeft: '6px' }}>· {newInquiries} new</span>}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Inquiries</div>
        </Link>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>{courses.count ?? 0}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Courses</div>
        </div>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>{profile?.avg_rating?.toFixed(1) ?? '—'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Rating</div>
        </div>
      </div>

      {/* Profile completeness */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
            Profile completeness
          </h2>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: score >= 80 ? 'var(--color-cta)' : 'var(--color-accent)' }}>
            {score}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: '8px', background: 'var(--color-surface-alt)', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
          <div style={{ height: '100%', width: `${score}%`, background: score >= 80 ? 'var(--color-cta)' : 'var(--color-accent)', borderRadius: '4px', transition: 'width var(--transition-slow)' }} />
        </div>

        {/* Checklist */}
        <div className="checklist-grid">
          {checks.map(check => (
            <div key={check.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)' }}>
              <span style={{ fontSize: '1rem' }}>
                {check.completed ? '✅' : '⬜'}
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
          <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
              💡 Profiles at 80%+ get <strong>3x more inquiries</strong>
            </p>
            <Link href="/trainer/profile" className="btn btn-primary">
              Complete profile →
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="action-cards-grid">
        <Link href="/trainer/profile" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>👤</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>Edit profile</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Update your bio, topics, pricing</div>
        </Link>
        <Link href="/trainer/courses" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>📚</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>Manage courses</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{courses.count ?? 0} courses listed</div>
        </Link>
        <Link href="/trainer/inquiries" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>📬</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>View inquiries</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {newInquiries > 0 ? `${newInquiries} new messages` : 'No new messages'}
          </div>
        </Link>
      </div>
    </div>
  )
}