import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/features/trainers/components'
import type { TrainerCard as TrainerCardType } from '@/features/trainers/types'
import { TRAINER_TOPICS, MALAYSIAN_STATES } from '@/types'

export const metadata: Metadata = {
  title: 'TrainHub Malaysia — Find Verified HRDF Trainers',
  description:
    'Malaysia\'s #1 HRDF trainer directory. Discover and connect with 500+ verified, certified trainers. All HRDF SBL-Khas claimable.',
}

export const revalidate = 1800

const TOPIC_ICONS: Record<string, string> = {
  'Leadership': '🎯',
  'AI & Data': '🤖',
  'Communication': '💬',
  'Mental Health': '🧠',
  'Sales & Marketing': '📈',
  'Sustainability & ESG': '🌱',
  'Audit & Compliance': '🔍',
  'Strategy': '♟',
  'Health & Safety': '🦺',
  'Personal Development': '🌟',
  'Procurement': '📦',
  'Finance': '💰',
  'Human Resources': '👥',
  'Operations': '⚙️',
}

const TOPIC_COUNTS: Record<string, number> = {
  'Leadership': 98, 'AI & Data': 42, 'Communication': 76,
  'Mental Health': 55, 'Sales & Marketing': 64, 'Sustainability & ESG': 29,
  'Audit & Compliance': 47, 'Strategy': 38,
}

// Default fallback when no searches have been logged yet
const DEFAULT_POPULAR = [
  'Leadership',
  'AI & Data',
  'Sales & Marketing',
  'Mental Health',
  'Audit & Compliance',
  'Sustainability & ESG',
  'Health & Safety',
]

async function getFeaturedTrainers(): Promise<TrainerCardType[]> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('trainer_profiles')
      .select(`
        id, slug, tagline, avatar_url, location_state, location_city,
        is_online, is_offline, is_verified_hrdf, is_featured,
        pricing_mode, pricing_from, pricing_to, whatsapp_number,
        avg_rating, review_count, years_experience,
        users!inner(full_name),
        trainer_topics(topics(id, name, slug))
      `)
      .eq('is_published', true)
      .eq('approval_status', 'approved')
      .eq('is_featured', true)
      .order('avg_rating', { ascending: false })
      .limit(3)
    return (data ?? []) as unknown as TrainerCardType[]
  } catch {
    return []
  }
}

// Get the top-searched queries from the last 30 days
async function getPopularSearches(): Promise<string[]> {
  try {
    const supabase = await createServerClient()
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data } = await supabase
      .from('search_logs')
      .select('query')
      .gte('created_at', since)
      .limit(500) as { data: { query: string }[] | null }

    if (!data || data.length === 0) return DEFAULT_POPULAR

    // Count frequency
    const counts = new Map<string, number>()
    data.forEach(row => {
      const q = (row.query ?? '').trim()
      if (q.length < 2) return
      counts.set(q, (counts.get(q) ?? 0) + 1)
    })

    if (counts.size === 0) return DEFAULT_POPULAR

    // Sort by frequency, take top 7, capitalize for display
    const popular = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([query]) => query.charAt(0).toUpperCase() + query.slice(1))

    // If we have fewer than 4 real searches, blend with defaults so the row never looks empty
    if (popular.length < 4) {
      const fillers = DEFAULT_POPULAR.filter(d => !popular.some(p => p.toLowerCase() === d.toLowerCase()))
      return [...popular, ...fillers].slice(0, 7)
    }

    return popular
  } catch {
    return DEFAULT_POPULAR
  }
}

export default async function HomePage() {
  const [featured, popularSearches] = await Promise.all([
    getFeaturedTrainers(),
    getPopularSearches(),
  ])

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="hero-section home-hero"
        style={{ background: 'var(--color-bg)', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 'var(--max-width-narrow)', margin: '0 auto' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 500, padding: '0.38rem 1rem', borderRadius: 'var(--radius-pill)', marginBottom: 'var(--space-5)', letterSpacing: '0.03em' }}>
            🇲🇾 Malaysia's HRDF Trainer Directory
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 5vw, var(--text-3xl))', fontWeight: 500, lineHeight: 1.18, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
            Find verified <em style={{ color: 'var(--color-accent)', fontStyle: 'normal' }}>HRDF-certified</em>{' '}
            trainers, instantly
          </h1>

          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-relaxed)', fontWeight: 300, maxWidth: '520px', margin: '0 auto var(--space-8)' }}>
            Discover, compare, and connect with 500+ certified trainers across Malaysia. All HRDF claimable. All verified.
          </p>

          {/* Search bar */}
          <form action="/trainers" method="GET" className="hero-search">
            <input
              name="q"
              type="text"
              placeholder="Search by topic, trainer name…"
              style={{ flex: 1, padding: '0.9rem 1.2rem', border: 'none', outline: 'none', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--color-ink)', minWidth: 0 }}
            />
            <select
              name="state"
              style={{ padding: '0.9rem 1rem', border: 'none', borderLeft: '1px solid var(--color-border)', outline: 'none', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer', flexShrink: 0 }}
            >
              <option value="">All states</option>
              {MALAYSIAN_STATES.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{ padding: '0.9rem 1.6rem', background: 'var(--color-accent)', color: '#fff', border: 'none', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Search
            </button>
          </form>

          {/* Popular searches — real-time from search_logs */}
          <div style={{ marginTop: 'var(--space-5)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
              Most searched this month
            </p>
            <div className="hero-tags">
              {popularSearches.map(topic => (
                <Link
                  key={topic}
                  href={`/trainers?q=${encodeURIComponent(topic)}`}
                  style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', background: 'var(--color-surface)', transition: 'all var(--transition-base)', whiteSpace: 'nowrap' }}
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div
        className="stats-grid"
        style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        {[
          { num: '500+', lbl: 'Verified trainers' },
          { num: '40+', lbl: 'Training topics' },
          { num: '16', lbl: 'Malaysian states' },
          { num: '2,400+', lbl: 'Companies served' },
        ].map(s => (
          <div key={s.lbl} style={{ padding: 'var(--space-5) var(--space-4)', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 500, lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.35rem' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURED TRAINERS ── */}
      {featured.length > 0 && (
        <section className="home-section">
          <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Featured trainers</h2>
              <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>View all →</Link>
            </div>
            <div className="featured-grid">
              {featured.map(t => <TrainerCard key={t.id} trainer={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TOPICS ── */}
      <section
        className="home-section"
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Browse by topic</h2>
            <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>All topics →</Link>
          </div>
          <div className="topics-grid">
            {Object.entries(TOPIC_COUNTS).map(([topic, count]) => (
              <Link
                key={topic}
                href={`/trainers?topic=${encodeURIComponent(topic)}`}
                style={{ padding: 'var(--space-5) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', textAlign: 'center', transition: 'all var(--transition-base)', textDecoration: 'none', display: 'block' }}
              >
                <div style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)', lineHeight: 1 }}>{TOPIC_ICONS[topic] ?? '📚'}</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '0.15rem' }}>{topic}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{count} trainers</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>How it works</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>Connect with the right HRDF trainer in 3 simple steps</p>
          <div className="steps-grid">
            {[
              { num: '1', title: 'Search & filter', desc: 'Browse by topic, state, language, budget, and more. Every trainer is HRDF-certified.' },
              { num: '2', title: 'Compare profiles', desc: 'Review bios, certifications, courses, ratings, and pricing at a glance.' },
              { num: '3', title: 'Connect directly', desc: 'Send an inquiry or WhatsApp the trainer directly. No middleman, no commission.' },
            ].map(step => (
              <div key={step.num}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-circle)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>{step.num}</div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINER CTA ── */}
      <section className="home-section" style={{ background: 'var(--color-ink)', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, var(--text-2xl))', color: '#fff', marginBottom: 'var(--space-3)', fontWeight: 500, lineHeight: 1.2 }}>
            Are you an HRDF-certified trainer?
          </h2>
          <p style={{ color: '#a09890', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
            Join Malaysia's largest HRDF trainer directory. Get discovered by companies actively looking for your expertise.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="cta-btn cta-btn--white">
              Create your profile — it's free
            </Link>
            <Link href="/about" className="cta-btn cta-btn--ghost">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}