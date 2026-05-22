import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice, getWhatsAppUrl } from '@/lib/utils'
import type { TrainerProfile } from '@/features/trainers/types'
import { InquiryButtonClient } from '@/features/search/components/InquiryButtonClient'
import { createAdminClient } from '@/lib/supabase/client'
import { WriteReviewClient } from '@/features/reviews/WriteReviewClient'
import { MapPin, Clock, Globe, Star, Monitor, ShieldCheck, Check, MessageCircle, Zap, BadgeCheck } from 'lucide-react'

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

interface Review {
  id: string
  rating: number
  title: string | null
  body: string | null
  created_at: string | null
  is_verified_training: boolean | null
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

async function getReviews(trainerId: string): Promise<Review[]> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, title, body, created_at, is_verified_training')
      .eq('trainer_id', trainerId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(20)
    return (data ?? []) as Review[]
  } catch {
    return []
  }
}

/* ── Page ───────────────────────────────────────────────── */
export default async function TrainerProfilePage({ params }: PageProps) {
  const { slug } = await params
  const trainer = await getTrainer(slug)
  if (!trainer) notFound()

  const reviews = await getReviews(trainer.id)

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

      <div className="profile-wrapper">

        {/* Back */}
        <Link href="/trainers" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-5)', textDecoration: 'none' }}>
          ← Back to directory
        </Link>

        {/* Hero card */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
          <div className="profile-hero-inner">
            <div className="avatar avatar-xl" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : initials
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, var(--text-2xl))', marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>{name}</h1>
              <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>{trainer.tagline}</p>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                {trainer.is_verified_hrdf && (
                  <span className="badge badge-hrdf" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={11} strokeWidth={2.5} /> HRDF Verified · {trainer.hrdf_cert_number}
                  </span>
                )}
                {trainer.avg_rating >= 4.8 && (
                  <span className="badge badge-top" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={11} strokeWidth={2} fill="currentColor" /> Top Rated
                  </span>
                )}
                {trainer.is_featured && (
                  <span className="badge badge-featured">Featured Trainer</span>
                )}
                {trainer.is_identity_verified && (
                  <span className="badge badge-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} strokeWidth={1.75} /> Identity Verified
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="profile-meta">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} strokeWidth={1.75} /> {trainer.location_city}, {trainer.location_state}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={13} strokeWidth={1.75} /> {trainer.years_experience} yrs exp</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Globe size={13} strokeWidth={1.75} /> {langs.map((l: any) => l.language).join(' · ')}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Star size={13} strokeWidth={1.75} fill="currentColor" /> {trainer.avg_rating.toFixed(1)} ({trainer.review_count} reviews)</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Monitor size={13} strokeWidth={1.75} /> {trainer.is_online && trainer.is_offline ? 'Online & offline' : trainer.is_online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body: main + sidebar */}
        <div className="profile-body">

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
                    {course.duration_hours && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Clock size={12} strokeWidth={1.75} /> {course.duration_hours}h</span>}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Monitor size={12} strokeWidth={1.75} /> {course.delivery_mode}</span>
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

            {/* Reviews */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div className="section-label" style={{ marginBottom: 0 }}>Reviews</div>
                {trainer.review_count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                    <Star size={14} strokeWidth={1.75} fill="var(--color-accent)" color="var(--color-accent)" />
                    <strong style={{ color: 'var(--color-ink)' }}>{trainer.avg_rating.toFixed(1)}</strong>
                    <span>({trainer.review_count} review{trainer.review_count !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
                  No reviews yet — be the first.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                      {/* Stars */}
                      <div style={{ display: 'flex', gap: '2px', marginBottom: 'var(--space-2)' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            size={13}
                            strokeWidth={1.5}
                            fill={review.rating >= n ? 'var(--color-accent)' : 'none'}
                            color={review.rating >= n ? 'var(--color-accent)' : 'var(--color-border)'}
                          />
                        ))}
                        {review.is_verified_training && (
                          <span style={{ marginLeft: 'var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--color-cta-dark)', background: 'var(--color-cta-light)', padding: '1px 6px', borderRadius: 'var(--radius-pill)' }}>
                            <BadgeCheck size={10} strokeWidth={2} /> Verified
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '0.25rem' }}>{review.title}</p>
                      )}
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{review.body}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-subtle)', marginTop: '0.4rem' }}>
                        {new Date(review.created_at!).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <WriteReviewClient trainerId={trainer.id} trainerName={name} />
            </section>
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
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--space-2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageCircle size={16} strokeWidth={1.75} /> Chat on WhatsApp
                </a>
              )}
              <InquiryButtonClient trainerName={name} trainerId={trainer.id} />
            </div>

            {/* Quick info */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div className="section-label">Quick info</div>
              {([
                { Icon: MapPin,         text: `${trainer.location_city}, ${trainer.location_state}` },
                { Icon: Monitor,        text: trainer.is_online && trainer.is_offline ? 'Online & offline' : trainer.is_online ? 'Online only' : 'Offline only' },
                { Icon: Globe,          text: langs.map((l: any) => l.language).join(', ') || '—' },
                { Icon: Clock,          text: `${trainer.years_experience} years experience` },
                { Icon: Zap,            text: 'Replies within 4 hours' },
              ] as { Icon: typeof MapPin; text: string }[]).map(row => (
                <div key={row.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
                  <row.Icon size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
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