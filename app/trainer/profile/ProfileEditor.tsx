'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { MALAYSIAN_STATES, TRAINER_TOPICS } from '@/types'
import { AvatarUpload } from '@/features/trainers/components/AvatarUpload'
import { CertManager } from '@/features/trainers/components/CertManager'
import type { Certification } from '@/features/trainers/types/trainer'

interface Props {
  userId: string
  userInfo: { full_name: string; email: string; avatar_url: string | null } | null
  profile: any
  selectedTopicIds: string[]
  certifications: Certification[]
}

export function ProfileEditor({ userId, userInfo, profile, selectedTopicIds, certifications }: Props) {  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    tagline: profile?.tagline ?? '',
    bio: profile?.bio ?? '',
    hrdf_cert_number: profile?.hrdf_cert_number ?? '',
    years_experience: profile?.years_experience ?? 0,
    location_state: profile?.location_state ?? '',
    location_city: profile?.location_city ?? '',
    is_online: profile?.is_online ?? true,
    is_offline: profile?.is_offline ?? true,
    pricing_mode: profile?.pricing_mode ?? 'quotation',
    pricing_from: profile?.pricing_from ?? '',
    pricing_to: profile?.pricing_to ?? '',
    whatsapp_number: profile?.whatsapp_number ?? '',
    website_url: profile?.website_url ?? '',
    linkedin_url: profile?.linkedin_url ?? '',
  })

  const [topicIds, setTopicIds] = useState<string[]>(selectedTopicIds)
  const [allTopics, setAllTopics] = useState<{ id: string; name: string }[]>([])

  // Load all topics on mount
    useEffect(() => {
    const loadTopics = async () => {
        const supabase = createBrowserClient()
        const { data } = await supabase.from('topics').select('id, name').order('name')
        setAllTopics((data as { id: string; name: string }[]) ?? [])
    }
    loadTopics()
    }, [])

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleTopic = (topicId: string) => {
    setTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createBrowserClient()

    try {
      const profileData = {
        user_id: userId,
        slug: profile?.slug ?? generateSlug(userInfo?.full_name ?? 'trainer-' + Date.now()),
        tagline: form.tagline,
        bio: form.bio,
        hrdf_cert_number: form.hrdf_cert_number,
        years_experience: Number(form.years_experience),
        location_state: form.location_state,
        location_city: form.location_city,
        is_online: form.is_online,
        is_offline: form.is_offline,
        pricing_mode: form.pricing_mode,
        pricing_from: form.pricing_from ? Number(form.pricing_from) : null,
        pricing_to: form.pricing_to ? Number(form.pricing_to) : null,
        whatsapp_number: form.whatsapp_number || null,
        website_url: form.website_url || null,
        linkedin_url: form.linkedin_url || null,
      }

     let trainerId = profile?.id

      if (profile?.id) {
        // Update existing
        const { error } = await supabase
          .from('trainer_profiles')
          .update(profileData as any)
          .eq('id', profile.id)
        if (error) throw error
      } else {
        // Create new
        const { data, error } = await supabase
          .from('trainer_profiles')
          .insert(profileData as any)
          .select('id')
          .single() as { data: { id: string } | null; error: any }
        if (error) throw error
        trainerId = data?.id
      }

      // ── Update topics ────────────────────────────────────
      if (trainerId) {
        console.log('🔍 Saving topics. trainerId:', trainerId, 'topicIds:', topicIds)
        await supabase.from('trainer_topics').delete().eq('trainer_id', trainerId)
        if (topicIds.length > 0) {
          const { error: topicError } = await supabase.from('trainer_topics').insert(
            topicIds.map(tid => ({ trainer_id: trainerId, topic_id: tid })) as any
          )
          if (topicError) console.error('❌ Topic insert error:', topicError)
          else console.log('✅ Topics saved successfully')
        }
      }

      // Certifications are managed independently via <CertManager> (file uploads),
      // so they are intentionally NOT touched by the profile save.

      setMessage({ type: 'success', text: '✓ Profile saved!' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '720px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Edit your profile
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        This is what companies will see when they find you
      </p>

      {message && (
        <div style={{
          padding: 'var(--space-3)',
          background: message.type === 'success' ? 'var(--color-cta-light)' : 'var(--color-error)',
          color: message.type === 'success' ? 'var(--color-cta-dark)' : 'var(--color-error-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-6)',
        }}>
          {message.text}
        </div>
      )}
      {/* Avatar upload */}
        <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <label className="label">Profile photo</label>
        <AvatarUpload
            userId={userId}
            currentAvatarUrl={userInfo?.avatar_url ?? null}
            fullName={userInfo?.full_name ?? 'Trainer'}
            onUploaded={() => router.refresh()}
        />
        </div>

      {/* SECTION: Basic info */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Basic information
        </h2>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Tagline</label>
          <input className="input" placeholder="e.g. Organisational Psychologist & Leadership Coach" value={form.tagline} onChange={e => update('tagline', e.target.value)} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>Short, punchy description of what you do</p>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Bio</label>
          <textarea
            className="input"
            rows={6}
            placeholder="Tell companies about your expertise, achievements, and training approach..."
            value={form.bio}
            onChange={e => update('bio', e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>{form.bio.length} characters · Aim for 200+ for better discoverability</p><p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>{form.bio.length} characters · Aim for 100+ for better discoverability</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="label">HRDC cert number</label>
            <input className="input" placeholder="HRD/22/04/0391" value={form.hrdf_cert_number} onChange={e => update('hrdf_cert_number', e.target.value)} />
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input className="input" type="number" min="0" value={form.years_experience} onChange={e => update('years_experience', e.target.value)} />
          </div>
        </div>
      </section>

      {/* SECTION: Location */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Location & delivery
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div>
            <label className="label">State</label>
            <select className="input" value={form.location_state} onChange={e => update('location_state', e.target.value)}>
              <option value="">Select state</option>
              {MALAYSIAN_STATES.map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" placeholder="Shah Alam" value={form.location_city} onChange={e => update('location_city', e.target.value)} />
          </div>
        </div>

        <label className="label">Delivery modes</label>
        <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_online} onChange={e => update('is_online', e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} />
            Online (Zoom/Teams)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={form.is_offline} onChange={e => update('is_offline', e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} />
            Offline / On-site
          </label>
        </div>
      </section>

      {/* SECTION: Topics */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          Topics & expertise
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>Select all that apply</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {allTopics.map(topic => {
            const selected = topicIds.includes(topic.id)
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic.id)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid',
                  borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)',
                  background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: selected ? '#fff' : 'var(--color-muted)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {topic.name}
              </button>
            )
          })}
        </div>
      </section>

      {/* SECTION: Pricing */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Pricing (MYR per day)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <label className="label">Pricing mode</label>
            <select className="input" value={form.pricing_mode} onChange={e => update('pricing_mode', e.target.value)}>
              <option value="quotation">By quotation</option>
              <option value="fixed">Fixed price</option>
              <option value="range">Price range</option>
            </select>
          </div>
          <div>
            <label className="label">From (MYR)</label>
            <input className="input" type="number" placeholder="1500" value={form.pricing_from} onChange={e => update('pricing_from', e.target.value)} disabled={form.pricing_mode === 'quotation'} />
          </div>
          <div>
            <label className="label">To (MYR)</label>
            <input className="input" type="number" placeholder="5000" value={form.pricing_to} onChange={e => update('pricing_to', e.target.value)} disabled={form.pricing_mode !== 'range'} />
          </div>
        </div>
      </section>

      {/* SECTION: Contact */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Contact & links
        </h2>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">WhatsApp number (with country code)</label>
          <input className="input" placeholder="+60123456789" value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} />
        </div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Website URL</label>
          <input className="input" placeholder="https://yoursite.com" value={form.website_url} onChange={e => update('website_url', e.target.value)} />
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" placeholder="https://linkedin.com/in/you" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} />
        </div>
      </section>
      {/* SECTION: Certifications */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          Certifications
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
          Upload your professional certificates (PDF or image). Files are private — only you and TrainHub admins can view them.
        </p>

        {profile?.id ? (
          <CertManager trainerId={profile.id} userId={userId} initialCerts={certifications} />
        ) : (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Save your profile first to start uploading certificates.
          </p>
        )}
      </section>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', padding: 'var(--space-4)', fontSize: 'var(--text-base)' }}
      >
        {loading ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}