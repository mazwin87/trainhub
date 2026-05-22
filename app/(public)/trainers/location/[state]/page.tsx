import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/client'
import { TrainerCard } from '@/features/trainers/components'
import type { TrainerCard as TrainerCardType } from '@/features/trainers/types'
import { MALAYSIAN_STATES } from '@/types'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ state: string }>
}

export function generateStaticParams() {
  return MALAYSIAN_STATES.map(s => ({ state: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params
  const stateObj = MALAYSIAN_STATES.find(s => s.slug === state)
  if (!stateObj) return { title: 'Trainers' }

  const n = stateObj.name
  return {
    title: `HRDF Trainers in ${n} — Verified & Rated | TrainHub`,
    description: `Find top-rated HRDF trainers in ${n}, Malaysia. Browse verified training providers, compare profiles and reviews, and book directly.`,
    openGraph: {
      title: `HRDF Trainers in ${n}, Malaysia`,
      description: `Verified HRDF-certified trainers in ${n}. Read reviews, compare rates, contact directly.`,
    },
    alternates: {
      canonical: `/trainers/location/${state}`,
    },
  }
}

async function getData(stateSlug: string) {
  const stateObj = MALAYSIAN_STATES.find(s => s.slug === stateSlug)
  if (!stateObj) return { stateObj: null, trainers: [], total: 0 }

  const supabase = createAdminClient()
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
    .eq('location_state', stateObj.name)
    .order('is_featured', { ascending: false })
    .order('avg_rating', { ascending: false })

  return {
    stateObj,
    trainers: (data ?? []) as unknown as TrainerCardType[],
    total: count ?? 0,
  }
}

export default async function LocationLandingPage({ params }: PageProps) {
  const { state } = await params
  const { stateObj, trainers, total } = await getData(state)
  if (!stateObj) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `HRDF Trainers in ${stateObj.name}`,
    description: `Verified corporate trainers based in ${stateObj.name}, Malaysia`,
    numberOfItems: total,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/trainers/location/${state}`,
  }

  const otherStates = MALAYSIAN_STATES.filter(s => s.slug !== state)

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
          <span style={{ color: 'var(--color-ink)' }}>{stateObj.name}</span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <span style={{
              background: 'var(--color-accent-light)', color: 'var(--color-accent)',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-pill)',
            }}>
              {total} trainer{total !== 1 ? 's' : ''}
            </span>
            <span style={{
              background: 'var(--color-surface-alt)', color: 'var(--color-muted)',
              fontSize: 'var(--text-sm)', fontWeight: 500,
              padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-pill)',
            }}>
              Malaysia
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
            HRDF Trainers in<br />
            <span style={{ color: 'var(--color-accent)' }}>{stateObj.name}</span>
          </h1>

          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', maxWidth: '640px' }}>
            Browse {total} corporate trainers based in {stateObj.name}. All profiles are verified.
            Many are HRDF-certified, meaning their programmes can be claimed under Malaysia's
            Human Resources Development Fund — reducing training costs for your organisation.
          </p>
        </div>

        {/* Trainer grid */}
        {trainers.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-muted)' }}>
            <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)' }}>
              No trainers found in {stateObj.name} yet.
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

        {/* Other states */}
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-3)' }}>
              Trainers in other states
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {otherStates.map(s => (
                <Link
                  key={s.slug}
                  href={`/trainers/location/${s.slug}`}
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
                  {s.name}
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
