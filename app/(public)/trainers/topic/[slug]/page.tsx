import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/client'
import { TrainerCard } from '@/features/trainers/components'
import type { TrainerCard as TrainerCardType } from '@/features/trainers/types'
import { MALAYSIAN_STATES } from '@/types'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const supabase = createAdminClient()
  const { data } = await supabase.from('topics').select('slug').not('slug', 'is', null)
  return (data ?? []).filter(t => t.slug).map(t => ({ slug: t.slug as string }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: topic } = await supabase.from('topics').select('name').eq('slug', slug).single()
  if (!topic) return { title: 'Trainers' }

  const n = topic.name
  return {
    title: `${n} Trainers in Malaysia — HRDF Certified | TrainHub`,
    description: `Find the best ${n} trainers in Malaysia. Compare HRDF-certified ${n} training providers, read verified reviews, and contact trainers directly.`,
    openGraph: {
      title: `Top ${n} Trainers in Malaysia`,
      description: `Browse HRDF-certified ${n} trainers. Verified reviews, direct contact, competitive rates.`,
    },
    alternates: {
      canonical: `/trainers/topic/${slug}`,
    },
  }
}

async function getData(topicSlug: string) {
  const supabase = createAdminClient()

  const { data: topic } = await supabase
    .from('topics')
    .select('id, name, slug')
    .eq('slug', topicSlug)
    .single()

  if (!topic) return { topic: null, trainers: [], total: 0 }

  const { data: topicRows } = await supabase
    .from('trainer_topics')
    .select('trainer_id')
    .eq('topic_id', topic.id)

  const trainerIds = [...new Set((topicRows ?? []).map(r => r.trainer_id))]
  if (trainerIds.length === 0) return { topic, trainers: [], total: 0 }

  const { data, count } = await supabase
    .from('trainer_profiles')
    .select(`
      id, slug, tagline, location_state, location_city,
      is_online, is_offline, is_verified_hrdf, is_featured,
      pricing_mode, pricing_from, pricing_to, whatsapp_number,
      avg_rating, review_count, years_experience, user_id,
      users(full_name),
      trainer_topics(topics(id, name, slug))
    `, { count: 'exact' })
    .eq('is_published', true)
    .eq('approval_status', 'approved')
    .in('id', trainerIds)
    .order('is_featured', { ascending: false })
    .order('avg_rating', { ascending: false })

  return {
    topic,
    trainers: (data ?? []) as unknown as TrainerCardType[],
    total: count ?? 0,
  }
}

export default async function TopicLandingPage({ params }: PageProps) {
  const { slug } = await params
  const { topic, trainers, total } = await getData(slug)
  if (!topic) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${topic.name} Trainers in Malaysia`,
    description: `HRDF-certified ${topic.name} trainers in Malaysia`,
    numberOfItems: total,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/trainers/topic/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          <Link href="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/trainers" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Trainers</Link>
          <span>›</span>
          <span style={{ color: 'var(--color-ink)' }}>{topic.name}</span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <span style={{
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              padding: '0.3rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
            }}>
              {total} trainer{total !== 1 ? 's' : ''}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            marginBottom: 'var(--space-4)',
          }}>
            {topic.name} Trainers<br />
            <span style={{ color: 'var(--color-accent)' }}>in Malaysia</span>
          </h1>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', maxWidth: '640px' }}>
            Browse {total} verified {topic.name} trainers in Malaysia. All trainers are reviewed and many are HRDF-certified,
            making their programmes claimable under the Human Resources Development Fund.
          </p>
        </div>

        {/* Trainer grid */}
        {trainers.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-muted)' }}>
            <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)' }}>
              No trainers found for this topic yet.
            </p>
            <Link href="/trainers" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Browse all trainers
            </Link>
          </div>
        ) : (
          <div className="dir-grid" style={{ marginBottom: 'var(--space-10)' }}>
            {trainers.map(trainer => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}

        {/* Back + related states */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
              Find {topic.name} trainers by location
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {MALAYSIAN_STATES.map(state => (
                <Link
                  key={state.slug}
                  href={`/trainers/location/${state.slug}`}
                  style={{
                    fontSize: 'var(--text-sm)', fontWeight: 500,
                    padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-muted)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {state.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: 500, textDecoration: 'none' }}>
            ← Browse all trainers
          </Link>
        </div>
      </div>
    </>
  )
}
