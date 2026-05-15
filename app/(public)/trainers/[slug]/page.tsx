import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice, getWhatsAppUrl } from '@/lib/utils'
import type { TrainerProfile } from '@/features/trainers/types'
import { InquiryButtonClient } from '@/features/search/components/InquiryButtonClient'

// ISR: revalidate each profile page every hour
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/* ── Generate static params for top trainers at build time ── */
export async function generateStaticParams() {
  // Skip static generation for now — use ISR instead
  return []
}

/* ── Dynamic SEO metadata per trainer ───────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data: trainer } = (await supabase
    .from('trainer_profiles')
    .select('users!inner(full_name), tagline, bio, location_state, trainer_topics(topics(name))')
    .eq('slug', slug)
    .single()) as { data: any }

  if (!trainer) return { title: 'Trainer not found' }

  const name = (trainer.users as any)?.full_name ?? ''
  const topics = (trainer.trainer_topics as any[])?.map((t: any) => t.topics?.name).filter(Boolean).join(', ')

  return {
    title: `${name} — HRDF Trainer in ${trainer.location_state}`,
    description: `${trainer.tagline}. Specialises in ${topics}. ${trainer.bio?.slice(0, 120)}…`,
    openGraph: {
      title: `${name} | TrainHub Malaysia`,
      description: trainer.tagline,
      type: 'profile',
    },
  }
}

/* ── Fetch full trainer profile ─────────────────────────── */
async function getTrainer(slug: string): Promise<TrainerProfile | null> {
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('trainer_profiles')
      .select(`
        *,
        users!inner(full_name, avatar_url),
        trainer_topics(topics(id, name, slug)),
        trainer_languages(language, proficiency),
        certifications(*),
        courses(*, topics(name))
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .eq('approval_status', 'approved')
      .single()
    return data as unknown as TrainerProfile
  } catch {
    return null
  }
}

/* ── Page ───────────────────────────────────────────────── */
export default async function TrainerProfilePage({ params }: PageProps) {
  const { slug } = await params
  const trainer = await getTrainer(slug)
  if (!trainer) notFound()

  const user = trainer.user as any
  const name = user?.full_name ?? ''
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const topics = trainer.topics ?? []
  const courses = trainer.courses ?? []
  const certs = trainer.certifications ?? []
  const langs = trainer.languages ?? []

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: trainer.tagline,
    description: trainer.bio,
    address: { '@type': 'PostalAddress', addressRegion: trainer.location_state, addressCountry: 'MY' },
    url: `${process.env.NEXT_PUBLIC_APP_URL}/trainers/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-6) var(--space-10) var(--space-12)' }}>

        {/* Back */}
        <Link href="/trainers" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)', textDecoration: 'none' }}>
          ← Back to directory
        </Link>

        {/* Hero card */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
            <div className="avatar avatar-xl" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', flexShrink: 0 }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials
              }
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{name}</h1>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>{trainer.tagline}</p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                {trainer.is_verified_hrdf && (
                  <span className="badge badge-hrdf">✓ HRDF Verified · {trainer.hrdf_cert_number}</span>
                )}
                {trainer.avg_rating >= 4.8 && (
                  <span className="badge badge-top">★ Top Rated</span>
                )}
                {trainer.is_featured && (
                  <span className="badge badge-featured">Featured Trainer</span>
                )}
                {trainer.is_identity_verified && (
                  <span className="badge badge-tag">🛡 Identity Verified</span>
                )}
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                <span>📍 {trainer.location_city}, {trainer.location_state}</span>
                <span>⏱ {trainer.years_experience} years experience</span>
                <span>🌐 {langs.map((l: any) => l.language).join(' · ')}</span>
                <span>★ {trainer.avg_rating.toFixed(1)} · {trainer.review_count} reviews</span>
                <span>{trainer.is_online && trainer.is_offline ? 'Online & offline' : trainer.is_online ? 'Online only' : 'Offline only'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body: main + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 'var(--space-5)' }}>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* About */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div className="section-label">About</div>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-ink)' }}>{trainer.bio}</p>
            </section>

            {/* Topics */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div className="section-label">Expertise areas</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {topics.map((t: any) => (
                  <Link key={t.id} href={`/trainers?topic=${encodeURIComponent(t.name)}`} style={{ fontSize: 'var(--text-sm)', padding: '0.32rem 0.8rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', color: 'var(--color-muted)', textDecoration: 'none' }}>
                    {t.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* Courses */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div className="section-label">Courses offered</div>
              {courses.map((course: any) => (
                <div key={course.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{course.title}</div>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
                    {course.duration_hours && <span>⏱ {course.duration_hours}h</span>}
                    <span>🖥 {course.delivery_mode}</span>
                    {course.is_hrdf_claimable && (
                      <span style={{ color: 'var(--color-cta-dark)', background: 'var(--color-cta-light)', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                        HRDF claimable
                      </span>
                    )}
                  </div>
                  {course.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-2)', lineHeight: 'var(--leading-body)' }}>{course.description}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Certifications */}
            {certs.length > 0 && (
              <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                <div className="section-label">Certifications</div>
                {certs.map((cert: any) => (
                  <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
                    <span style={{ width: '7px', height: '7px', background: 'var(--color-accent)', borderRadius: '50%', flexShrink: 0 }} />
                    <span>{cert.name}</span>
                    {cert.issuing_body && <span style={{ color: 'var(--color-muted)' }}>· {cert.issuing_body}</span>}
                    {cert.is_verified && <span className="badge badge-hrdf" style={{ marginLeft: 'auto', fontSize: '10px' }}>Verified</span>}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

            {/* Price + CTA */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: '0.2rem' }}>
                {formatPrice(trainer.pricing_mode, trainer.pricing_from, trainer.pricing_to)}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>per day · pricing varies by program</div>

              {trainer.whatsapp_number && (
                <a
                  href={getWhatsAppUrl(trainer.whatsapp_number, `Hi ${name}, I found your profile on TrainHub Malaysia and I'm interested in your training services.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cta"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}
                >
                  💬 Chat on WhatsApp
                </a>
              )}
              <InquiryButtonClient trainerName={name} trainerId={trainer.id} />
            </div>

            {/* Quick info */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div className="section-label">Quick info</div>
              {[
                { icon: '📍', text: `${trainer.location_city}, ${trainer.location_state}` },
                { icon: '🖥', text: trainer.is_online && trainer.is_offline ? 'Online & offline' : trainer.is_online ? 'Online only' : 'Offline only' },
                { icon: '🌐', text: langs.map((l: any) => l.language).join(', ') || '—' },
                { icon: '⏱', text: `${trainer.years_experience} years experience` },
                { icon: '⚡', text: 'Replies within 4 hours' },
              ].map(row => (
                <div key={row.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
                  <span>{row.icon}</span>
                  <span>{row.text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {trainer.linkedin_url && (
                <a href={trainer.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-xs)' }}>
                  LinkedIn
                </a>
              )}
              {trainer.website_url && (
                <a href={trainer.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-xs)' }}>
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}