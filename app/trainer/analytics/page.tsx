import { redirect } from 'next/navigation'
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

  const { count: courseCount } = await supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', profile?.id) as any

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Analytics
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Track how your profile is performing
      </p>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Profile views', value: profile?.views_count ?? 0, icon: '👁' },
          { label: 'Inquiries', value: profile?.inquiry_count ?? 0, icon: '📬' },
          { label: 'Avg rating', value: profile?.avg_rating?.toFixed(1) ?? '—', icon: '⭐' },
          { label: 'Courses', value: courseCount ?? 0, icon: '📚' },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)' }}>{m.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 500 }}>{m.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📊</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          Detailed analytics coming soon
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', maxWidth: '400px', margin: '0 auto' }}>
          We're building charts to show profile views over time, top traffic sources, inquiry conversion rates, and more.
        </p>
      </div>
    </div>
  )
}