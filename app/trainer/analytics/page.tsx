import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Mailbox, Star, BookOpen, TrendingUp, Lightbulb } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id, views_count, inquiry_count, avg_rating, review_count, is_published, approval_status, tagline, avatar_url, pricing_mode')
    .eq('user_id', user.id)
    .single() as { data: any }

  const trainerId = profile?.id

  const [courseResult, recentInquiries] = trainerId ? await Promise.all([
    supabase.from('courses').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId),
    supabase.from('inquiries')
      .select('id, contact_name, company_name, training_topic, status, created_at, message')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]) : [{ count: 0 }, { data: [] }]

  const courseCount = courseResult.count ?? 0
  const inquiries = (recentInquiries.data ?? []) as any[]

  const stats = [
    { label: 'Profile views', value: profile?.views_count ?? 0, Icon: Eye, accent: '#7C3AED' },
    { label: 'Inquiries received', value: profile?.inquiry_count ?? 0, Icon: Mailbox, accent: '#059669' },
    { label: 'Average rating', value: profile?.avg_rating?.toFixed(1) ?? '—', Icon: Star, accent: '#D97706' },
    { label: 'Courses listed', value: courseCount, Icon: BookOpen, accent: '#7C3AED' },
  ]

  const conversionRate = profile?.views_count > 0
    ? ((profile.inquiry_count / profile.views_count) * 100).toFixed(1)
    : '0.0'

  const tips = [
    !profile?.tagline && { text: 'Add a compelling tagline to increase clicks from search results', href: '/trainer/profile' },
    !profile?.avatar_url && { text: 'Upload a professional photo — profiles with photos get 5× more views', href: '/trainer/profile' },
    courseCount === 0 && { text: 'List at least one course to show companies what you offer', href: '/trainer/courses' },
    profile?.pricing_mode === null && { text: 'Set your pricing so companies can quickly assess fit', href: '/trainer/profile' },
    (profile?.review_count ?? 0) === 0 && { text: 'Ask past clients for a review to build social proof', href: null },
  ].filter(Boolean) as { text: string; href: string | null }[]

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>

        {/* Recent inquiries */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500 }}>Recent inquiries</h2>
            <Link href="/trainer/inquiries" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>View all →</Link>
          </div>

          {inquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <Mailbox size={32} strokeWidth={1.5} style={{ color: 'var(--color-muted)', margin: '0 auto var(--space-3)' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>No inquiries yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {inquiries.map((inq: any) => (
                <div key={inq.id} style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: '4px' }}>
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
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {inq.company_name ?? 'Individual'} · {inq.training_topic ?? 'General'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', marginTop: '4px' }}>
                    {new Date(inq.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile tips */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Lightbulb size={18} strokeWidth={1.75} style={{ color: '#D97706' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500 }}>Ways to improve</h2>
          </div>

          {tips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 'var(--space-3)' }}>🎉</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>Your profile looks great!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tips.map((tip, i) => (
                <div key={i} style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', lineHeight: 'var(--leading-relaxed)', marginBottom: tip.href ? '6px' : 0 }}>
                      {tip.text}
                    </p>
                    {tip.href && (
                      <Link href={tip.href} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500 }}>
                        Fix this →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
