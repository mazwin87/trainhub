import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, UserCheck, Clock, Mailbox, TrendingUp, Search } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    totalTrainers,
    approvedTrainers,
    pendingTrainers,
    newTrainers,
    totalUsers,
    newUsers,
    totalInquiries,
    newInquiries,
    monthlyInquiries,
  ] = await Promise.all([
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('trainer_profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('inquiries').select('created_at').gte('created_at', thirtyDaysAgo).order('created_at'),
  ])

  const { data: searchLogsData } = await supabase
    .from('search_logs' as any)
    .select('query')
    .gte('created_at', thirtyDaysAgo)
    .limit(500) as { data: { query: string }[] | null }

  // Tally top search queries
  const queryCounts = new Map<string, number>()
  for (const row of (searchLogsData ?? [])) {
    const q = (row.query ?? '').trim().toLowerCase()
    if (q.length < 2) continue
    queryCounts.set(q, (queryCounts.get(q) ?? 0) + 1)
  }
  const topSearches = [...queryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
  const maxSearchCount = topSearches[0]?.[1] ?? 1

  // Inquiries by day (last 30 days)
  const dayBuckets: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    dayBuckets[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of (monthlyInquiries.data ?? [])) {
    const day = (row.created_at ?? '').slice(0, 10)
    if (day in dayBuckets) dayBuckets[day]++
  }
  const sparklineData = Object.values(dayBuckets)
  const sparklineMax = Math.max(...sparklineData, 1)

  const stats = [
    { label: 'Total trainers', value: totalTrainers.count ?? 0, sub: `+${newTrainers.count ?? 0} this month`, Icon: Users, accent: '#7C3AED', href: '/admin/trainers' },
    { label: 'Approved trainers', value: approvedTrainers.count ?? 0, sub: `${pendingTrainers.count ?? 0} pending`, Icon: UserCheck, accent: '#059669', href: '/admin/trainers?status=approved' },
    { label: 'Pending approvals', value: pendingTrainers.count ?? 0, sub: 'Needs review', Icon: Clock, accent: '#D97706', href: '/admin/approvals' },
    { label: 'Total users', value: totalUsers.count ?? 0, sub: `+${newUsers.count ?? 0} this month`, Icon: Users, accent: '#7C3AED', href: '/admin/users' },
    { label: 'Total inquiries', value: totalInquiries.count ?? 0, sub: `+${newInquiries.count ?? 0} this month`, Icon: Mailbox, accent: '#059669', href: '/admin/inquiries' },
    { label: 'Searches this month', value: (searchLogsData ?? []).length, sub: `${topSearches.length} unique queries`, Icon: Search, accent: '#D97706', href: null },
  ]

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Platform overview · Last 30 days · Updated {new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-6)' }}>
        {stats.map(s => {
          const Icon = s.Icon
          const Wrapper: any = s.href ? Link : 'div'
          const wrapperProps = s.href ? { href: s.href } : {}
          return (
            <Wrapper key={s.label} {...wrapperProps} className="admin-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: '4px', height: '32px', background: s.accent, borderRadius: '2px' }} />
                <Icon size={20} strokeWidth={1.75} style={{ color: s.accent, opacity: 0.6 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                {s.sub}
              </div>
            </Wrapper>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>

        {/* Inquiry sparkline */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <TrendingUp size={18} strokeWidth={1.75} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500 }}>
              Inquiries — last 30 days
            </h2>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', marginBottom: 'var(--space-3)' }}>
            {sparklineData.map((v, i) => (
              <div
                key={i}
                title={`${v} inquiries`}
                style={{
                  flex: 1,
                  background: v > 0 ? 'var(--color-accent)' : 'var(--color-border)',
                  borderRadius: '2px 2px 0 0',
                  height: `${Math.max((v / sparklineMax) * 100, v > 0 ? 10 : 4)}%`,
                  opacity: i >= sparklineData.length - 7 ? 1 : 0.45,
                  transition: 'height 0.3s ease',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-subtle)' }}>
            <span>30 days ago</span>
            <span>Today</span>
          </div>
          <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            <strong style={{ color: 'var(--color-ink)' }}>{newInquiries.count ?? 0}</strong> total inquiries in last 30 days
          </div>
        </div>

        {/* Top searches */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Search size={18} strokeWidth={1.75} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500 }}>
              Top searches this month
            </h2>
          </div>

          {topSearches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
              No search data yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topSearches.map(([query, count]) => (
                <div key={query}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', textTransform: 'capitalize' }}>
                      {query}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', flexShrink: 0, marginLeft: 'var(--space-2)' }}>
                      {count}×
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(count / maxSearchCount) * 100}%`,
                      background: 'linear-gradient(90deg, #7C3AED, #A855F7)',
                      borderRadius: '2px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trainer funnel */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Trainer pipeline
          </h2>
          {[
            { label: 'Total registered', value: totalTrainers.count ?? 0, color: 'var(--color-accent)', width: 100 },
            { label: 'Approved & live', value: approvedTrainers.count ?? 0, color: '#059669', width: Math.round(((approvedTrainers.count ?? 0) / Math.max(totalTrainers.count ?? 1, 1)) * 100) },
            { label: 'Pending review', value: pendingTrainers.count ?? 0, color: '#D97706', width: Math.round(((pendingTrainers.count ?? 0) / Math.max(totalTrainers.count ?? 1, 1)) * 100) },
          ].map(row => (
            <div key={row.label} style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{row.label}</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink)' }}>{row.value}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.width}%`, background: row.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
            <Link href="/admin/approvals" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: 'var(--space-3)' }}>
              Review pending ({pendingTrainers.count ?? 0}) →
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-4)' }}>
            Quick actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[
              { label: 'Review pending approvals', sub: `${pendingTrainers.count ?? 0} waiting`, href: '/admin/approvals', accent: '#D97706' },
              { label: 'Browse all trainers', sub: `${totalTrainers.count ?? 0} registered`, href: '/admin/trainers', accent: '#7C3AED' },
              { label: 'View all inquiries', sub: `${totalInquiries.count ?? 0} total`, href: '/admin/inquiries', accent: '#059669' },
              { label: 'Manage users', sub: `${totalUsers.count ?? 0} accounts`, href: '/admin/users', accent: '#7C3AED' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all var(--transition-base)',
                }}
              >
                <div style={{ width: '4px', height: '28px', background: item.accent, borderRadius: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{item.sub}</div>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
