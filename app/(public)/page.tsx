import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/features/trainers/components'
import type { TrainerCard as TrainerCardType } from '@/features/trainers/types'
import { MALAYSIAN_STATES } from '@/types'
import { ScrollReveal, ScrollRevealGroup } from '@/components/ScrollReveal'
import { HowItWorks } from '@/components/HowItWorks'
import { HeroDashboardMockup } from '@/components/HeroDashboardMockup'
import {
  Target, Bot, MessageCircle, Brain, TrendingUp, Leaf, Search,
  Compass, ShieldAlert, Sparkles, Package, DollarSign, Users,
  Settings2, BookOpen, MapPin, ShieldCheck, BadgeCheck, Award,
  type LucideIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'TrainHub — HRDC Trainer Directory Malaysia',
  description:
    'A curated directory of HRDC-certified trainers in Malaysia. Search by expertise, industry, location and training category.',
}

export const revalidate = 1800

const TOPIC_ICONS: Record<string, LucideIcon> = {
  'Leadership':          Target,
  'AI & Data':           Bot,
  'Communication':       MessageCircle,
  'Mental Health':       Brain,
  'Sales & Marketing':   TrendingUp,
  'Sustainability & ESG': Leaf,
  'Audit & Compliance':  Search,
  'Strategy':            Compass,
  'Health & Safety':     ShieldAlert,
  'Personal Development': Sparkles,
  'Procurement':         Package,
  'Finance':             DollarSign,
  'Human Resources':     Users,
  'Operations':          Settings2,
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
      {/* ── HERO — light, search-first, two-column ── */}
      <section className="hero-section home-hero hero-light">
        <div className="hero-grid">

        {/* Content */}
        <div className="hero-animate hero-copy" style={{ position: 'relative', zIndex: 1 }}>

          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} strokeWidth={1.75} /> Curated HRDC Trainer Directory · Malaysia
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5.2vw, var(--text-3xl))', fontWeight: 600, lineHeight: 1.12, marginBottom: 'var(--space-4)', letterSpacing: '-0.025em', color: 'var(--color-ink)' }}>
            Find the Right{' '}
            <em className="hero-accent-text" style={{ fontStyle: 'normal' }}>HRDC Trainer</em>{' '}
            for Your Training Needs
          </h1>

          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', maxWidth: '540px', margin: '0 auto var(--space-7)' }}>
            Search HRDC-certified trainers by expertise, industry, location and training category.
          </p>

          {/* Search bar */}
          <form action="/trainers" method="GET" className="hero-search-light">
            <div className="hsl-field">
              <Search size={18} strokeWidth={2} />
              <input name="q" type="text" placeholder="Search by topic or trainer name…" />
            </div>
            <div className="search-sep" />
            <select name="topic" aria-label="Category">
              <option value="">All categories</option>
              {Object.keys(TOPIC_ICONS).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div className="search-sep" />
            <select name="state" aria-label="Location">
              <option value="">All states</option>
              {MALAYSIAN_STATES.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <button type="submit">
              <Search size={16} strokeWidth={2.4} /> Search
            </button>
          </form>

          {/* Popular searches */}
          <div style={{ marginTop: 'var(--space-5)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
              Most searched this month
            </p>
            <div className="hero-tags">
              {popularSearches.map(topic => (
                <Link
                  key={topic}
                  href={`/trainers?q=${encodeURIComponent(topic)}`}
                  className="hero-tag-light"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Dashboard mockup */}
        <div className="hero-art">
          <HeroDashboardMockup />
        </div>
        </div>
      </section>

      {/* ── BENEFIT BAR — floats over the hero seam ── */}
      <div className="benefit-bar-wrap">
        <ScrollRevealGroup className="benefit-bar">
          {[
            { Icon: ShieldCheck,   color: 'var(--color-accent)',    bg: 'var(--color-accent-light)', title: 'HRDC-certified',      desc: 'All trainers are HRDC registered and verified.' },
            { Icon: BadgeCheck,    color: 'var(--color-sage-dark)', bg: 'var(--color-sage-light)',   title: 'Verified profiles',   desc: 'View qualifications, experience and training specialities.' },
            { Icon: MessageCircle, color: 'var(--color-gold-dark)', bg: 'var(--color-gold-light)',   title: 'Connect directly',    desc: 'Contact trainers directly and discuss your training needs.' },
            { Icon: Award,         color: 'var(--color-sage-dark)', bg: 'var(--color-sage-light)',   title: 'Curated for quality', desc: 'A focused directory to help you find the right trainer faster.' },
          ].map(item => (
            <div key={item.title} className="reveal benefit-item">
              <span className="benefit-icon" style={{ background: item.bg, color: item.color }}>
                <item.Icon size={20} strokeWidth={1.9} />
              </span>
              <div>
                <div className="benefit-title">{item.title}</div>
                <div className="benefit-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </ScrollRevealGroup>
      </div>

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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)' }}>Browse by expertise</h2>
              <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', whiteSpace: 'nowrap', flexShrink: 0 }}>View all categories →</Link>
            </div>
          </ScrollReveal>
          <ScrollRevealGroup className="topics-grid">
            {Object.keys(TOPIC_COUNTS).map((topic) => {
              const TopicIcon = TOPIC_ICONS[topic] ?? BookOpen
              return (
                <Link
                  key={topic}
                  href={`/trainers?topic=${encodeURIComponent(topic)}`}
                  className="reveal topic-card"
                  style={{ padding: 'var(--space-6) var(--space-3)', border: '1px solid transparent', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', boxShadow: '0 1px 2px rgba(47,42,38,0.04), 0 10px 28px -18px rgba(47,42,38,0.16)', textAlign: 'center', transition: 'box-shadow 0.2s ease, transform 0.2s ease', textDecoration: 'none', display: 'block' }}
                >
                  <span className="topic-icon" style={{ width: 54, height: 54, margin: '0 auto var(--space-3)', borderRadius: '50%', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TopicIcon size={23} strokeWidth={1.75} />
                  </span>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>{topic}</div>
                </Link>
              )
            })}
          </ScrollRevealGroup>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── TRAINER CTA ── */}
      <section className="home-section" style={{ background: 'linear-gradient(135deg, var(--color-accent-dark) 0%, var(--color-secondary) 100%)', textAlign: 'center' }}>
        <ScrollReveal style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, var(--text-2xl))', color: '#fff', marginBottom: 'var(--space-3)', fontWeight: 500, lineHeight: 1.2 }}>
            Are you an HRDC-certified trainer?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-relaxed)' }}>
            Create your profile, showcase your expertise, and connect with organisations looking for trainers.
          </p>
          <div className="cta-buttons">
            <Link href="/register" className="cta-btn cta-btn--white">
              List your profile
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
