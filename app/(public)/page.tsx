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

// Revalidate homepage every 30 minutes
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

export default async function HomePage() {
  const featured = await getFeaturedTrainers()

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ background: 'var(--color-bg)', padding: 'var(--space-16) var(--space-10) var(--space-12)', textAlign: 'center' }}>
        <div style={{ maxWidth: 'var(--max-width-narrow)', margin: '0 auto' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 500, padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', marginBottom: 'var(--space-6)', letterSpacing: '0.03em' }}>
            🇲🇾 Malaysia's HRDF Trainer Directory
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, var(--text-3xl))', fontWeight: 500, lineHeight: 1.15, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
            Find verified{' '}
            <em style={{ color: 'var(--color-accent)', fontStyle: 'normal' }}>HRDF-certified</em>
            <br />trainers, instantly
          </h1>

          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)', lineHeight: 'var(--leading-relaxed)', fontWeight: 300 }}>
            Discover, compare, and connect with 500+ certified trainers across Malaysia.
            <br />All HRDF claimable. All verified.
          </p>

          {/* Search bar */}
          <form action="/trainers" method="GET" style={{ display: 'flex', maxWidth: '580px', margin: '0 auto var(--space-6)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)' }}>
            <input
              name="q"
              type="text"
              placeholder="Search by topic, trainer name, or course…"
              style={{ flex: 1, padding: '0.85rem 1.2rem', border: 'none', outline: 'none', fontSize: 'var(--text-base)', fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--color-ink)' }}
            />
            <select
              name="state"
              style={{ padding: '0.85rem 1rem', border: 'none', borderLeft: '1px solid var(--color-border)', outline: 'none', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)', background: 'transparent', color: 'var(--color-muted)', cursor: 'pointer' }}
            >
              <option value="">All states</option>
              {MALAYSIAN_STATES.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <button
              type="submit"
              style={{ padding: '0.85rem 1.6rem', background: 'var(--color-accent)', color: '#fff', border: 'none', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Search
            </button>
          </form>

          {/* Quick topic tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
            {['Leadership', 'AI & Data', 'Sales & Marketing', 'Mental Health', 'Audit & Compliance', 'Sustainability & ESG', 'Health & Safety'].map(topic => (
              <Link
                key={topic}
                href={`/trainers?topic=${encodeURIComponent(topic)}`}
                style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', background: 'var(--color-surface)', transition: 'all var(--transition-base)' }}
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        {[
          { num: '500+', lbl: 'Verified trainers' },
          { num: '40+', lbl: 'Training topics' },
          { num: '16', lbl: 'Malaysian states' },
          { num: '2,400+', lbl: 'Companies served' },
        ].map(s => (
          <div key={s.lbl} style={{ padding: 'var(--space-6)', textAlign: 'center', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 500 }}>{s.num}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.25rem' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURED TRAINERS ── */}
      {featured.length > 0 && (
        <section style={{ padding: 'var(--space-12) var(--space-10)' }}>
          <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Featured trainers</h2>
              <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)' }}>View all trainers →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)' }}>
              {featured.map(t => <TrainerCard key={t.id} trainer={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TOPICS ── */}
      <section style={{ padding: 'var(--space-12) var(--space-10)', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Browse by topic</h2>
            <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)' }}>All topics →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
            {Object.entries(TOPIC_COUNTS).map(([topic, count]) => (
              <Link
                key={topic}
                href={`/trainers?topic=${encodeURIComponent(topic)}`}
                style={{ padding: 'var(--space-5)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-bg)', textAlign: 'center', transition: 'all var(--transition-base)', textDecoration: 'none' }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>{TOPIC_ICONS[topic] ?? '📚'}</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{topic}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{count} trainers</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: 'var(--space-12) var(--space-10)', textAlign: 'center' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>How it works</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-10)' }}>Connect with the right HRDF trainer in 3 simple steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-10)' }}>
            {[
              { num: '1', title: 'Search & filter', desc: 'Browse by topic, state, language, budget, and more. Every trainer is HRDF-certified.' },
              { num: '2', title: 'Compare profiles', desc: 'Review bios, certifications, courses, ratings, and pricing at a glance.' },
              { num: '3', title: 'Connect directly', desc: 'Send an inquiry or WhatsApp the trainer directly. No middleman, no commission.' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-circle)', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>{step.num}</div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAINER CTA ── */}
      <section style={{ padding: 'var(--space-12) var(--space-10)', background: 'var(--color-ink)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: '#fff', marginBottom: 'var(--space-3)', fontWeight: 500 }}>
          Are you an HRDF-certified trainer?
        </h2>
        <p style={{ color: '#a09890', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)' }}>
          Join Malaysia's largest HRDF trainer directory. Get discovered by companies actively looking for your expertise.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ padding: '0.75rem 2rem', background: '#fff', color: 'var(--color-ink)', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', transition: 'all var(--transition-base)' }}>
            Create your profile — it's free
          </Link>
          <Link href="/about" style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
            Learn more
          </Link>
        </div>
      </section>
    </>
  )
}
