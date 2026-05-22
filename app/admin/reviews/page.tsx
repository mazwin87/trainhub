import { Star, CheckCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/client'
import { ReviewActions } from './ReviewActions'

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  const supabase = createAdminClient()

  const { data: queue } = await supabase
    .from('reviews')
    .select(`
      id, rating, title, body, created_at, is_verified_training,
      trainer_id,
      trainer_profiles(slug, users(full_name))
    `)
    .eq('is_approved', false)
    .order('created_at', { ascending: true }) as { data: any[] | null }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Review Moderation
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Approve or reject submitted reviews. Approved reviews are immediately visible on trainer profiles.
      </p>

      {queue.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-md)', color: 'var(--color-muted)' }}>
            <CheckCircle size={20} strokeWidth={1.75} style={{ color: 'var(--color-cta)' }} />
            No pending reviews
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {queue.map((review: any) => {
            const trainerName = review.trainer_profiles?.users?.full_name ?? 'Unknown Trainer'
            const trainerSlug = review.trainer_profiles?.slug ?? ''

            return (
              <div key={review.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Trainer + rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>For: {trainerName}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            size={14}
                            strokeWidth={1.5}
                            fill={review.rating >= n ? 'var(--color-accent)' : 'none'}
                            color={review.rating >= n ? 'var(--color-accent)' : 'var(--color-border)'}
                          />
                        ))}
                      </div>
                      {review.is_verified_training && (
                        <span style={{ fontSize: '11px', color: 'var(--color-cta-dark)', background: 'var(--color-cta-light)', padding: '1px 7px', borderRadius: 'var(--radius-pill)' }}>
                          Verified training
                        </span>
                      )}
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                        {new Date(review.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Review content */}
                    {review.title && (
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-1)' }}>{review.title}</p>
                    )}
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>{review.body}</p>

                    {trainerSlug && (
                      <a
                        href={`/trainers/${trainerSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: 'var(--color-accent)', textDecoration: 'none', marginTop: 'var(--space-2)', display: 'inline-block' }}
                      >
                        View trainer profile →
                      </a>
                    )}
                  </div>

                  <ReviewActions reviewId={review.id} trainerId={review.trainer_id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
