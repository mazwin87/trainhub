import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

export const alt = 'Trainer profile on TrainHub Malaysia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=DM+Sans:wght@${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
  ).then(r => r.text())
  const url = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)?.[1]
  if (!url) throw new Error('Font URL not found')
  return fetch(url).then(r => r.arrayBuffer())
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('trainer_profiles')
    .select(`
      tagline, location_state, location_city, avg_rating, review_count,
      years_experience, is_verified_hrdf,
      users!inner(full_name, avatar_url),
      trainer_topics(topics(name))
    `)
    .eq('slug', slug)
    .single()

  const name     = (data?.users as any)?.full_name ?? 'Trainer'
  const tagline  = data?.tagline ?? 'HRDC Certified Trainer'
  const location = data ? `${data.location_city}, ${data.location_state}` : 'Malaysia'
  const rating   = (data?.avg_rating ?? 0) > 0 ? (data?.avg_rating ?? 0).toFixed(1) : null
  const reviews  = data?.review_count ?? 0
  const experience = data?.years_experience ?? 0
  const isHrdf  = data?.is_verified_hrdf ?? false
  const topics  = ((data?.trainer_topics as any[]) ?? []).slice(0, 3).map((t: any) => t.topics?.name).filter(Boolean)
  const avatarUrl = (data?.users as any)?.avatar_url as string | null

  const [r400, r700] = await Promise.allSettled([loadFont(400), loadFont(700)])
  type W = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  const fonts: { name: string; data: ArrayBuffer; weight: W; style: 'normal' | 'italic' }[] = []
  if (r400.status === 'fulfilled') fonts.push({ name: 'DM Sans', data: r400.value, weight: 400 as W, style: 'normal' })
  if (r700.status === 'fulfilled') fonts.push({ name: 'DM Sans', data: r700.value, weight: 700 as W, style: 'normal' })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(135deg, #9A3412 0%, #C2410C 55%, #EA8A4B 100%)',
          fontFamily: 'DM Sans, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '380px', height: '380px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '40px', left: '-50px', width: '220px', height: '220px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', display: 'flex' }} />

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, padding: '52px 60px 36px', gap: '48px', alignItems: 'center' }}>

          {/* Avatar column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <div style={{
              width: '156px', height: '156px', borderRadius: '78px',
              border: '4px solid rgba(255,255,255,0.85)',
              overflow: 'hidden', background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '60px', color: 'white', fontWeight: 700, flexShrink: 0,
            }}>
              {avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarUrl} width={156} height={156} alt={name} style={{ objectFit: 'cover', width: '156px', height: '156px' }} />
                : name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              }
            </div>

            {rating && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.18)', padding: '8px 20px',
                borderRadius: '999px', color: 'white',
              }}>
                <span style={{ fontSize: '18px' }}>★</span>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>{rating}</span>
                <span style={{ fontSize: '14px', opacity: 0.75 }}>({reviews})</span>
              </div>
            )}
          </div>

          {/* Info column */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {isHrdf && (
                <div style={{
                  background: 'rgba(255,255,255,0.95)', color: '#4A5E1A',
                  padding: '6px 18px', borderRadius: '999px',
                  fontSize: '14px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  ✓ HRDC Verified
                </div>
              )}
              {experience > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 18px', borderRadius: '999px', fontSize: '14px',
                  display: 'flex', alignItems: 'center',
                }}>
                  {experience} years experience
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{ fontSize: '50px', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.5px' }}>
              {name}
            </div>

            {/* Tagline */}
            <div style={{ fontSize: '21px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.35 }}>
              {tagline.length > 90 ? tagline.slice(0, 87) + '…' : tagline}
            </div>

            {/* Location */}
            <div style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📍</span><span>{location}</span>
            </div>

            {/* Topic pills */}
            {topics.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {topics.map((topic: string) => (
                  <div key={topic} style={{
                    background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    padding: '7px 16px', borderRadius: '999px', fontSize: '15px',
                    display: 'flex', alignItems: 'center',
                  }}>
                    {topic}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 60px',
          background: 'rgba(0,0,0,0.22)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #C2410C, #EA8A4B)', borderRadius: '5px', display: 'flex' }} />
            </div>
            <span style={{ color: 'white', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.3px' }}>
              TrainHub Malaysia
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>
            Malaysia's HRDC Trainer Directory
          </span>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
