import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, Search, AlertCircle, Flame, Lightbulb, CheckCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface SearchStat {
  query: string
  count: number
  prevCount: number
  trend: number  // % change vs previous period
}

export default async function SearchTrendsPage() {
  const supabase = await createServerClient()

  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const prev30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const last7Days  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const prev7Days  = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Get all searches in last 30 days
  const { data: recent30 } = await supabase
    .from('search_logs')
    .select('query, created_at')
    .gte('created_at', last30Days)
    .limit(5000) as { data: { query: string; created_at: string }[] | null }

  // Get all searches in previous 30 days (for comparison)
  const { data: prev30 } = await supabase
    .from('search_logs')
    .select('query')
    .gte('created_at', prev30Days)
    .lt('created_at', last30Days)
    .limit(5000) as { data: { query: string }[] | null }

  // Count current period
  const currentCounts = new Map<string, number>()
  recent30?.forEach(r => {
    const q = r.query.trim().toLowerCase()
    if (q.length < 2) return
    currentCounts.set(q, (currentCounts.get(q) ?? 0) + 1)
  })

  // Count previous period
  const prevCounts = new Map<string, number>()
  prev30?.forEach(r => {
    const q = r.query.trim().toLowerCase()
    if (q.length < 2) return
    prevCounts.set(q, (prevCounts.get(q) ?? 0) + 1)
  })

  // Build the unified stats
  const allQueries = new Set([...currentCounts.keys(), ...prevCounts.keys()])
  const stats: SearchStat[] = []

  allQueries.forEach(q => {
    const count = currentCounts.get(q) ?? 0
    const prevCount = prevCounts.get(q) ?? 0
    const trend = prevCount === 0
      ? (count > 0 ? 100 : 0)
      : Math.round(((count - prevCount) / prevCount) * 100)
    stats.push({ query: q, count, prevCount, trend })
  })

  // Top 20 by current count
  const topSearches = [...stats]
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Trending up (must have ≥3 searches AND ≥50% growth)
  const trendingUp = [...stats]
    .filter(s => s.count >= 3 && s.trend >= 50)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 10)

  // Last 7 days searches
  const last7 = recent30?.filter(r => r.created_at >= last7Days) ?? []
  const prev7 = recent30?.filter(r => r.created_at >= prev7Days && r.created_at < last7Days) ?? []

  // Check zero-result searches — searches that don't match any trainer
  // We approximate by checking topics + trainer names
  const { data: allTopics } = await supabase
    .from('topics')
    .select('name') as { data: { name: string }[] | null }

  const knownTerms = new Set((allTopics ?? []).map(t => t.name.toLowerCase()))

  // For each top search, check if any approved trainer matches
  const zeroResultSearches: { query: string; count: number }[] = []
  for (const s of topSearches.slice(0, 30)) {
    const hasTopicMatch = [...knownTerms].some(t => t.includes(s.query) || s.query.includes(t))
    if (!hasTopicMatch && s.count >= 3) {
      zeroResultSearches.push({ query: s.query, count: s.count })
    }
  }

  const totalLast30 = recent30?.length ?? 0
  const totalPrev30 = prev30?.length ?? 0
  const totalChange = totalPrev30 === 0
    ? (totalLast30 > 0 ? 100 : 0)
    : Math.round(((totalLast30 - totalPrev30) / totalPrev30) * 100)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 500 }}>
        Search Trends
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        What Malaysian HR managers are actually searching for
      </p>

      {/* Summary stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <Search size={20} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: 'var(--space-2)' }}>
            {totalLast30.toLocaleString()}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Searches (last 30 days)
          </div>
        </div>

        <div className="admin-stat-card">
          {totalChange > 0 ? (
            <TrendingUp size={20} strokeWidth={1.75} style={{ color: 'var(--color-cta)', marginBottom: 'var(--space-3)' }} />
          ) : totalChange < 0 ? (
            <TrendingDown size={20} strokeWidth={1.75} style={{ color: 'var(--color-error-text)', marginBottom: 'var(--space-3)' }} />
          ) : (
            <Minus size={20} strokeWidth={1.75} style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }} />
          )}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: 'var(--space-2)', color: totalChange > 0 ? 'var(--color-cta-dark)' : totalChange < 0 ? 'var(--color-error-text)' : 'inherit' }}>
            {totalChange > 0 ? '+' : ''}{totalChange}%
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            vs previous 30 days
          </div>
        </div>

        <div className="admin-stat-card">
          <Search size={20} strokeWidth={1.75} style={{ color: 'var(--color-featured-text)', marginBottom: 'var(--space-3)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: 'var(--space-2)' }}>
            {currentCounts.size}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Unique terms
          </div>
        </div>

        <div className="admin-stat-card">
          <AlertCircle size={20} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, lineHeight: 1, marginBottom: 'var(--space-2)' }}>
            {zeroResultSearches.length}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Searches with no match
          </div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="admin-activity-grid" style={{ marginTop: 'var(--space-6)' }}>

        {/* TOP SEARCHES */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)' }} /> Top searches
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '2px' }}>
              Last 30 days
            </p>
          </div>

          {topSearches.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
              No searches yet. Encourage visitors to search!
            </div>
          ) : (
            topSearches.map((s, i) => (
              <div
                key={s.query}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto auto',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: i < topSearches.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', fontFamily: 'var(--font-mono)' }}>
                  #{i + 1}
                </span>
                <Link
                  href={`/trainers?q=${encodeURIComponent(s.query)}`}
                  target="_blank"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', color: 'var(--color-ink)' }}
                >
                  {s.query.charAt(0).toUpperCase() + s.query.slice(1)}
                </Link>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                  {s.count}×
                </span>
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: s.trend > 0 ? 'var(--color-cta-dark)' : s.trend < 0 ? 'var(--color-error-text)' : 'var(--color-subtle)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  minWidth: '50px',
                  justifyContent: 'flex-end',
                }}>
                  {s.trend > 0 ? '↑' : s.trend < 0 ? '↓' : '—'}
                  {Math.abs(s.trend)}%
                </span>
              </div>
            ))
          )}
        </div>

        {/* OPPORTUNITIES — Trending up + Zero-result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Trending up */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} strokeWidth={1.75} style={{ color: 'var(--color-cta)' }} /> Trending up
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '2px' }}>
                Biggest growth vs previous 30 days
              </p>
            </div>

            {trendingUp.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
                Not enough data yet — need 2 months of searches.
              </div>
            ) : (
              trendingUp.map((s, i) => (
                <div
                  key={s.query}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-5)',
                    borderBottom: i < trendingUp.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {s.query.charAt(0).toUpperCase() + s.query.slice(1)}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-cta-dark)', fontWeight: 500 }}>
                    +{s.trend}% · {s.count}×
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Zero-result opportunities */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-accent-light)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--color-accent-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} strokeWidth={1.75} /> Opportunities
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-dark)', marginTop: '2px' }}>
                Searched but no matching topic — recruit trainers or write blog posts!
              </p>
            </div>

            {zeroResultSearches.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle size={16} strokeWidth={1.75} style={{ color: 'var(--color-cta)' }} />
                All popular searches have matching trainers
              </div>
            ) : (
              zeroResultSearches.map((s, i) => (
                <div
                  key={s.query}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) var(--space-5)',
                    borderBottom: i < zeroResultSearches.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {s.query.charAt(0).toUpperCase() + s.query.slice(1)}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500 }}>
                    {s.count} searches
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Tip */}
      <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', verticalAlign: 'middle' }}><Lightbulb size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} /></span>{' '}
      <strong style={{ color: 'var(--color-ink)' }}>Pro tip:</strong> Top searches with no matching topic are gold. They show what users want but can't find. Use these to plan blog posts (free SEO traffic) and to recruit specialty trainers.
      </div>
    </div>
  )
}