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
  searchParams: Promise<Record<string, string | undefined>>
}

const REVIEWS_PER_PAGE = 5

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

async function getReviews(trainerId: string, page: number): Promise<{ reviews: Review[]; total: number }> {
  try {
    const supabase = createAdminClient()
    const from = (page - 1) * REVIEWS_PER_PAGE
    const to = from + REVIEWS_PER_PAGE - 1
    const { data, count } = await supabase
      .from('reviews')
      .select('id, rating, title, body, created_at, is_verified_training', { count: 'exact' })
      .eq('trainer_id', trainerId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(from, to)
    return { reviews: (data ?? []) as Review[], total: count ?? 0 }
  } catch {
    return { reviews: [], total: 0 }
  }
}

/* ── Page ───────────────────────────────────────────────── */
export default async function TrainerProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const reviewPage = Math.max(1, Number(sp.rp ?? 1))

  const trainer = await getTrainer(slug)
  if (!trainer) notFound()

  const { reviews, total: reviewTotal } = await getReviews(trainer.id, reviewPage)
  const totalReviewPages = Math.ceil(reviewTotal / REVIEWS_PER_PAGE)

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

  const deliveryLabel = trainer.is_online && trainer.is_offline
    ? 'Online & offline' : trainer.is_online ? 'Online' : 'Offline'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="profile-wrapper">

        {/* ── HERO BANNER ─────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-secondary) 100%)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          height: '140px',
          position: 'relative',
        }}>
          {/* Back link inside banner */}
          <Link href="/trainers" style={{
            position: 'absolute', top: 'var(--space-4)', left: 'var(--space-5)',
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none', fontWeight: 500,
          }}>
            ← Directory
          </Link>
        </div>

        {/* ── HERO CARD (overlaps banner) ──────────────────── */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderTop: 'none',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-6)',
        }}>
          <div className="profile-hero-inner">

            {/* Avatar — overlaps banner */}
            <div style={{ marginTop: '-72px', flexShrink: 0 }}>
              <div className="avatar avatar-xl" style={{
                background: 'var(--color-accent-light)',
                color: 'var(--color-accent)',
                border: '4px solid #fff',
                boxShadow: '0 4px 16px rgba(124,58,237,0.22)',
              }}>
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : initials
                }
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Badges row */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                {trainer.is_verified_hrdf && (
                  <span className="badge badge-hrdf" style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.8rem' }}>
                    <Check size={11} strokeWidth={2.5} /> HRDF Verified · {trainer.hrdf_cert_number}
                  </span>
                )}
                {trainer.avg_rating >= 4.8 && (
                  <span className="badge badge-top" style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.8rem' }}>
                    <Star size={11} strokeWidth={2} fill="currentColor" /> Top Rated
                  </span>
                )}
                {trainer.is_featured && (
                  <span className="badge badge-featured" style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.8rem' }}>Featured</span>
                )}
                {trainer.is_identity_verified && (
                  <span className="badge badge-tag" style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.8rem' }}>
                    <ShieldCheck size={12} strokeWidth={1.75} /> Verified
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 600,
                lineHeight: 1.15,
                marginBottom: 'var(--space-2)',
                color: 'var(--color-ink)',
              }}>{name}</h1>

              {/* Tagline */}
              <p style={{
                fontSize: 'var(--text-md)',
                color: 'var(--color-muted)',
                lineHeight: 1.55,
                marginBottom: 'var(--space-4)',
                maxWidth: '640px',
              }}>{trainer.tagline}</p>

              {/* Meta row */}
              <div className="profile-meta">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={15} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  {trainer.location_city}, {trainer.location_state}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={15} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  {trainer.years_experience} years experience
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Globe size={15} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  {langs.map((l: any) => l.language).join(' · ') || 'English'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Monitor size={15} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                  {deliveryLabel}
                </span>
              </div>

              {/* Stat pills */}
              <div className="profile-stat-grid">
                <div className="profile-stat-card">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
                    {trainer.years_experience}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>yrs experience</div>
                </div>
                <div className="profile-stat-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
                    <Star size={18} strokeWidth={1.75} fill="var(--color-accent)" color="var(--color-accent)" />
                    {trainer.avg_rating > 0 ? trainer.avg_rating.toFixed(1) : '—'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
                    {trainer.review_count} review{trainer.review_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="profile-stat-card">
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
                    {trainer.location_state.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>location</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────── */}
        <div className="profile-body">

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* About */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <h2 className="profile-section-heading">About</h2>
              <p style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-ink)' }}>{trainer.bio}</p>
            </section>

            {/* Topics */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <h2 className="profile-section-heading">Expertise areas</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {topics.map((t: any) => (
                  <Link
                    key={t.id}
                    href={`/trainers?topic=${encodeURIComponent(t.name)}`}
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      padding: '0.45rem 1rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-surface-alt)',
                      color: 'var(--color-accent-text)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* Courses */}
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <h2 className="profile-section-heading">Courses offered</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {courses.map((course: any) => (
                  <div key={course.id} style={{
                    padding: 'var(--space-4) var(--space-5)',
                    border: '1px solid var(--color-border)',
                    borderLeft: '3px solid var(--color-accent)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                  }}>
                    <div style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>{course.title}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                      {course.duration_hours && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                          <Clock size={13} strokeWidth={1.75} /> {course.duration_hours}h
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                        <Monitor size={13} strokeWidth={1.75} /> {course.delivery_mode}
                      </span>
                      {course.is_hrdf_claimable && (
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-cta-dark)', background: 'var(--color-cta-light)', padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-pill)' }}>
                          HRDF claimable
                        </span>
                      )}
                    </div>
                    {course.description && (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)' }}>{course.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {certs.length > 0 && (
              <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                <h2 className="profile-section-heading">Certifications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {certs.map((cert: any) => (
                    <div key={cert.id} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-3) 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                      <ShieldCheck size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{cert.name}</span>
                        {cert.issuing_body && (
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}> · {cert.issuing_body}</span>
                        )}
                      </div>
                      {cert.is_verified && (
                        <span className="badge badge-hrdf" style={{ fontSize: '11px', flexShrink: 0 }}>Verified</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section id="reviews" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <h2 className="profile-section-heading" style={{ marginBottom: 0 }}>Reviews</h2>
                {trainer.review_count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-accent-light)', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-pill)' }}>
                    <Star size={15} strokeWidth={1.75} fill="var(--color-accent)" color="var(--color-accent)" />
                    <strong style={{ fontSize: 'var(--text-md)', color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>{trainer.avg_rating.toFixed(1)}</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>({trainer.review_count})</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', marginBottom: 'var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
                  No reviews yet — be the first to share your experience.
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                    {reviews.map(review => (
                      <div key={review.id} style={{
                        paddingBottom: 'var(--space-5)',
                        borderBottom: '1px solid var(--color-border)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap', rowGap: 'var(--space-1)' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                size={15}
                                strokeWidth={1.5}
                                fill={review.rating >= n ? 'var(--color-accent)' : 'none'}
                                color={review.rating >= n ? 'var(--color-accent)' : 'var(--color-border)'}
                              />
                            ))}
                          </div>
                          {review.is_verified_training && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--color-cta-dark)', background: 'var(--color-cta-light)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: 500 }}>
                              <BadgeCheck size={11} strokeWidth={2} /> Verified training
                            </span>
                          )}
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', marginLeft: 'auto' }}>
                            {new Date(review.created_at!).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {review.title && (
                          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>{review.title}</p>
                        )}
                        <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{review.body}</p>
                      </div>
                    ))}
                  </div>

                  {totalReviewPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                      <Link
                        href={reviewPage > 1 ? `?rp=${reviewPage - 1}#reviews` : '#'}
                        style={{
                          fontSize: 'var(--text-sm)', fontWeight: 500,
                          color: reviewPage > 1 ? 'var(--color-accent)' : 'var(--color-border)',
                          pointerEvents: reviewPage > 1 ? 'auto' : 'none',
                          textDecoration: 'none',
                        }}
                      >
                        ← Previous
                      </Link>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                        {reviewPage} of {totalReviewPages}
                      </span>
                      <Link
                        href={reviewPage < totalReviewPages ? `?rp=${reviewPage + 1}#reviews` : '#'}
                        style={{
                          fontSize: 'var(--text-sm)', fontWeight: 500,
                          color: reviewPage < totalReviewPages ? 'var(--color-accent)' : 'var(--color-border)',
                          pointerEvents: reviewPage < totalReviewPages ? 'auto' : 'none',
                          textDecoration: 'none',
                        }}
                      >
                        Next →
                      </Link>
                    </div>
                  )}
                </>
              )}

              <WriteReviewClient trainerId={trainer.id} trainerName={name} />
            </section>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <div className="profile-sidebar">

            {/* Price + CTA */}
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              position: 'sticky',
              top: 'calc(var(--nav-height) + var(--space-4))',
            }}>
              <div style={{ marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {formatPrice(trainer.pricing_mode, trainer.pricing_from, trainer.pricing_to)}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>per day · varies by program</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {trainer.whatsapp_number && (
                  <a
                    href={getWhatsAppUrl(trainer.whatsapp_number, `Hi ${name}, I found your profile on TrainHub Malaysia and I'm interested in your training services.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-cta"
                    style={{
                      width: '100%', justifyContent: 'center',
                      padding: 'var(--space-4)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <MessageCircle size={18} strokeWidth={1.75} /> Chat on WhatsApp
                  </a>
                )}
                <InquiryButtonClient trainerName={name} trainerId={trainer.id} />
              </div>

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 'var(--space-3)', textAlign: 'center', lineHeight: 1.5 }}>
                Free to contact · No commitment
              </p>
            </div>

            {/* Quick info */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-4)' }}>
                Quick info
              </h3>
              {([
                { Icon: MapPin,  text: `${trainer.location_city}, ${trainer.location_state}` },
                { Icon: Monitor, text: deliveryLabel },
                { Icon: Globe,   text: langs.map((l: any) => l.language).join(', ') || '—' },
                { Icon: Clock,   text: `${trainer.years_experience} years experience` },
                { Icon: Zap,     text: 'Replies within 4 hours' },
              ] as { Icon: typeof MapPin; text: string }[]).map(row => (
                <div key={row.text} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-ink)',
                  marginBottom: 'var(--space-3)', lineHeight: 1.5,
                }}>
                  <row.Icon size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{row.text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            {(trainer.linkedin_url || trainer.website_url) && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {trainer.linkedin_url && (
                  <a href={trainer.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-sm)', padding: 'var(--space-3)' }}>
                    LinkedIn
                  </a>
                )}
                {trainer.website_url && (
                  <a href={trainer.website_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-sm)', padding: 'var(--space-3)' }}>
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}