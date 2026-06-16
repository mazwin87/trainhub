import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/features/trainers/components'
import { formatPrice } from '@/lib/utils'
import { Heart, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SavedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/company/saved')

  const { data: favs, error } = await supabase
    .from('favourites')
    .select(`
      created_at,
      trainer_profiles!inner (
        id, slug, tagline, location_state, location_city,
        is_online, is_offline, is_verified_hrdf, is_featured,
        pricing_mode, pricing_from, pricing_to, whatsapp_number,
        avg_rating, review_count, years_experience,
        users!inner(full_name),
        trainer_topics(topics(id, name, slug))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  if (error) console.error('Saved trainers query failed:', error)

  const trainers = (favs ?? []).map(f => f.trainer_profiles).filter(Boolean)

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          Your shortlist
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-muted)', background: 'var(--color-surface-alt)', padding: '2px 10px', borderRadius: 999 }}>{trainers.length}</span>
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
          Trainers you’ve saved — compare them side by side, then reach out directly.
        </p>
      </div>

      {trainers.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <Heart size={28} strokeWidth={1.75} style={{ color: 'var(--color-accent)', marginBottom: 'var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>No saved trainers yet</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-5)' }}>
            Browse the directory and tap the heart on any trainer to add them here.
          </p>
          <Link href="/trainers" className="btn btn-primary" style={{ display: 'inline-flex' }}>Browse trainers</Link>
        </div>
      ) : (
        <>
          <div className="featured-grid" style={{ marginBottom: 'var(--space-8)' }}>
            {trainers.map((t: any) => <TrainerCard key={t.id} trainer={t} />)}
          </div>

          {trainers.length >= 2 && (
            <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', overflowX: 'auto' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Compare</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)', minWidth: 480 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--color-muted)', fontWeight: 500 }}></th>
                    {trainers.map((t: any) => (
                      <th key={t.id} style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                        <Link href={`/trainers/${t.slug}`} style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{t.users?.full_name ?? 'Trainer'}</Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Day rate', render: (t: any) => formatPrice(t.pricing_mode, t.pricing_from, t.pricing_to) },
                    { label: 'Rating', render: (t: any) => `★ ${Number(t.avg_rating ?? 0).toFixed(1)} (${t.review_count ?? 0})` },
                    { label: 'Experience', render: (t: any) => `${t.years_experience ?? 0} yrs` },
                    { label: 'Location', render: (t: any) => t.location_state ?? '—' },
                    { label: 'HRDC verified', render: (t: any) => t.is_verified_hrdf ? '✓' : '—' },
                    { label: 'Delivery', render: (t: any) => [t.is_online && 'Online', t.is_offline && 'On-site'].filter(Boolean).join(' · ') || '—' },
                  ].map(row => (
                    <tr key={row.label}>
                      <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--color-border)' }}>{row.label}</td>
                      {trainers.map((t: any) => (
                        <td key={t.id} style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-border)' }}>
                          {row.label === 'HRDC verified' && t.is_verified_hrdf
                            ? <span style={{ color: 'var(--color-cta-dark)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={13} strokeWidth={2.5} /> Yes</span>
                            : row.render(t)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  )
}
