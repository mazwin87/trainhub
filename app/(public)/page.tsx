import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/features/trainers/components'
import type { TrainerCard as TrainerCardType } from '@/features/trainers/types'
import { MALAYSIAN_STATES } from '@/types'
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal'

export const metadata: Metadata = {
  title: 'TrainHub Malaysia — Find Verified HRDF Trainers',
  description:
    "Malaysia's #1 HRDF trainer directory. Discover and connect with 500+ verified, certified trainers. All HRDF SBL-Khas claimable.",
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

const DEFAULT_POPULAR = [
  'Leadership', 'AI & Data', 'Sales & Marketing',
  'Mental Health', 'Audit & Compliance', 'Sustainability & ESG', 'Health & Safety',
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
    const counts = new Map<string, number>()
    data.forEach(row => {
      const q = (row.query ?? '').trim()
      if (q.length < 2) return
      counts.set(q, (counts.get(q) ?? 0) + 1)
    })
    if (counts.size === 0) return DEFAULT_POPULAR
    const popular = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([query]) => query.charAt(0).toUpperCase() + query.slice(1))
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
      {/* ── HERO — hi-tech dark ── */}
      <section className="hero-section home-hero hero-hitech" style={{ textAlign: 'center' }}>

        {/* Animated background layers */}
        <div className="hero-bg">
          <div className="hero-mesh" />
          <div className="hero-dots" />
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        {/* Content */}
        <div className="hero-animate" style={{ maxWidth: 'var(--max-width-narrow)', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <div className="hero-badge-glass">
            🇲🇾 Malaysia&apos;s HRDF Trainer Directory
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 5vw, var(--text-3xl))', fontWeight: 500, lineHeight: 1.18, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em', color: '#fff' }}>
            Find verified{' '}
            <em className="hero-accent-text" style={{ fontStyle: 'normal' }}>HRDF-certified</em>{' '}
            trainers, instantly
          </h1>

          <p style={{ fontSize: 'var(--text-md)', color: 'rgba(255,255,255,0.62)', lineHeight: 'var(--leading-relaxed)', fontWeight: 300, maxWidth: '520px', margin: '0 auto var(--space-8)' }}>
            Discover, compare, and connect with 500+ certified trainers across Malaysia. All HRDF claimable. All verified.
          </p>

          {/* Glassmorphism search bar */}
          <form action="/trainers" method="GET" className="hero-search-dark">
            <input name="q" type="text" placeholder="Search by topic, trainer name…" />
            <div className="search-sep" />
            <select name="state">
              <option value="">All states</option>
              {MALAYSIAN_STATES.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <button type="submit">Search</button>
          </form>

          {/* Popular searches */}
          <div style={{ marginTop: 'var(--space-5)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
              Most searched this month
            </p>
            <div className="hero-tags">
              {popularSearches.map(topic => (
                <Link
                  key={topic}
                  href={`/trainers?q=${encodeURIComponent(topic)}`}
                  className="hero-tag-dark"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <ScrollRevealGroup
        className="stats-grid"
        style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        {[
          { num: '500+', lbl: 'Verified trainers' },
          { num: '40+', lbl: 'Training topics' },
          { num: '16', lbl: 'Malaysian states' },
          { num: '2,400+', lbl: 'Companies served' },
        ].map(s => (
          <div key={s.lbl} className="reveal" style={{ padding: 'var(--space-5) var(--space-4)', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 500, lineHeight: 1, color: 'var(--color-accent)' }}>{s.num}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.35rem' }}>{s.lbl}</div>
          </div>
        ))}
      </ScrollRevealGroup>

      {/* ── FEATURED TRAINERS ── */}
      {featured.length > 0 && (
        <section className="home-section">
          <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Featured trainers</h2>
                <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>View all →</Link>
              </div>
            </ScrollReveal>
            <ScrollReveal style={{ transitionDelay: '80ms' }}>
              <div className="featured-grid">
                {featured.map(t => <TrainerCard key={t.id} trainer={t} />)}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── TOPICS ── */}
      <section
        className="home-section"
        style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', gap: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Browse by topic</h2>
              <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>All topics →</Link>
            </div>
          </ScrollReveal>
          <ScrollRevealGroup className="topics-grid">
            {Object.entries(TOPIC_COUNTS).map(([topic, count]) => (
              <Link
                key={topic}
                href={`/trainers?topic=${encodeURIComponent(topic)}`}
                className="reveal topic-card"
                style={{ padding: 'var(--space-5) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', textAlign: 'center', transition: 'all var(--transition-base)', textDecoration: 'none', display: 'block' }}
              >
                <div className="topic-icon" style={{ fontSize: '1.4rem', marginBottom: 'var(--space-2)', lineHeight: 1 }}>{TOPIC_ICONS[topic] ?? '📚'}</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '0.15rem' }}>{topic}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{count} trainers</div>
              </Link>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-section" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <ScrollReveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>How it works</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>Connect with the right HRDF trainer in 3 simple steps</p>
          </ScrollReveal>
          <ScrollRevealGroup className="steps-grid">
            {[
              { num: '1', title: 'Search & filter', desc: 'Browse by topic, state, language, budget, and more. Every trainer is HRDF-certified.' },
              { num: '2', title: 'Compare profiles', desc: 'Review bios, certifications, courses, ratings, and pricing at a glance.' },
              { num: '3', title: 'Connect directly', desc: 'Send an inquiry or WhatsApp the trainer directly. No middleman, no commission.' },
            ].map(step => (
              <div key={step.num} className="reveal step-item">
                <div className="step-circle" style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-circle)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{step.desc}</p>
              </div>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      {/* ── TRAINER CTA ── */}
      <section className="home-section" style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #8B5CF6 100%)', textAlign: 'center' }}>
        <ScrollReveal style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, var(--text-2xl))', color: '#fff', marginBottom: 'var(--space-3)', fontWeight: 500, lineHeight: 1.2 }}>
            Are you an HRDF-certified trainer?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
            Join Malaysia&apos;s largest HRDF trainer directory. Get discovered by companies actively looking for your expertise.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="cta-btn cta-btn--white">
              Create your profile — it&apos;s free
            </Link>
            <Link href="/about" className="cta-btn cta-btn--ghost">
              Learn more
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}
