import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Mailbox, Star, BookOpen, TrendingUp, PartyPopper } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id, views_count, inquiry_count, avg_rating, review_count')
    .eq('user_id', user.id)
    .single() as { data: any }

  const trainerId = profile?.id

  const [courseResult, recentInquiries] = trainerId ? await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('inquiries')
      .select('id, contact_name, company_name, training_topic, status, created_at')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .limit(8),
  ]) : [{ count: 0 }, { data: [] }]

  const courseCount = courseResult.count ?? 0
  const inquiries = (recentInquiries.data ?? []) as any[]

  const stats = [
    { label: 'Profile views', value: profile?.views_count ?? 0, Icon: Eye, accent: '#C2410C' },
    { label: 'Inquiries received', value: profile?.inquiry_count ?? 0, Icon: Mailbox, accent: '#059669' },
    { label: 'Average rating', value: profile?.avg_rating?.toFixed(1) ?? '—', Icon: Star, accent: '#D97706' },
    { label: 'Courses listed', value: courseCount, Icon: BookOpen, accent: '#C2410C' },
  ]

  const conversionRate = profile?.views_count > 0
    ? ((profile.inquiry_count / profile.views_count) * 100).toFixed(1)
    : '0.0'

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Track how your profile is performing
        </p>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {stats.map(s => {
          const Icon = s.Icon
          return (
            <div key={s.label} className="admin-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: '4px', height: '32px', background: s.accent, borderRadius: '2px' }} />
                <Icon size={20} strokeWidth={1.75} style={{ color: s.accent, opacity: 0.6 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: 'var(--space-2)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Conversion insight */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-accent-light) 0%, var(--color-surface) 100%)',
        border: '1px solid var(--color-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
      }}>
        <TrendingUp size={28} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>
            Inquiry conversion rate: <span style={{ color: 'var(--color-accent)' }}>{conversionRate}%</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {profile?.views_count ?? 0} profile views → {profile?.inquiry_count ?? 0} inquiries. Industry average is around 2–3%.
          </div>
        </div>
      </div>

      {/* Recent inquiries */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500 }}>Recent inquiries</h2>
          <Link href="/trainer/inquiries" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>View all →</Link>
        </div>

        {inquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
            <PartyPopper size={36} strokeWidth={1.5} style={{ color: 'var(--color-muted)', margin: '0 auto var(--space-3)' }} />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: '4px' }}>No inquiries yet</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>They&apos;ll show up here once companies reach out</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
            {inquiries.map((inq: any) => (
              <div key={inq.id} style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: '6px' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>
                    {inq.contact_name}
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    background: inq.status === 'new' ? 'var(--color-accent-light)' : 'var(--color-surface)',
                    color: inq.status === 'new' ? 'var(--color-accent)' : 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {inq.status ?? 'new'}
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: '4px' }}>
                  {inq.company_name ?? 'Individual'} · {inq.training_topic ?? 'General'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                  {new Date(inq.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
