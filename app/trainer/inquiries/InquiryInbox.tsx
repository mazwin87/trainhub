'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Inquiry {
  id: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  company_name: string | null
  message: string
  training_topic: string | null
  pax_count: number | null
  preferred_date: string | null
  delivery_mode: string | null
  status: string
  created_at: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new:     { bg: 'var(--color-accent-light)', text: 'var(--color-accent-dark)' },
  read:    { bg: 'var(--color-surface-alt)',  text: 'var(--color-muted)' },
  replied: { bg: 'var(--color-cta-light)',    text: 'var(--color-cta-dark)' },
  closed:  { bg: 'var(--color-surface-alt)',  text: 'var(--color-subtle)' },
}

export function InquiryInbox({ initialInquiries }: { initialInquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selectedId, setSelectedId] = useState<string | null>(initialInquiries[0]?.id ?? null)
  const [filter, setFilter] = useState<'all' | 'new' | 'replied' | 'closed'>('all')

  const selected = inquiries.find(i => i.id === selectedId)

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter(i => i.status === filter)

  const newCount = inquiries.filter(i => i.status === 'new').length

  const markStatus = async (id: string, status: string) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('inquiries')
      .update({ status } as any)
      .eq('id', id)

    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    }
  }

  const handleSelect = (id: string) => {
    setSelectedId(id)
    const inq = inquiries.find(i => i.id === id)
    if (inq && inq.status === 'new') {
      markStatus(id, 'read')
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Inquiries {newCount > 0 && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>· {newCount} new</span>}
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        Messages from companies looking for trainers like you
      </p>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'all',     label: `All (${inquiries.length})` },
          { key: 'new',     label: `New (${newCount})` },
          { key: 'replied', label: 'Replied' },
          { key: 'closed',  label: 'Closed' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            style={{
              padding: '0.4rem 0.95rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: filter === f.key ? 'var(--color-ink)' : 'var(--color-surface)',
              color: filter === f.key ? '#fff' : 'var(--color-muted)',
              borderColor: filter === f.key ? 'var(--color-ink)' : 'var(--color-border)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>📭</div>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>No inquiries yet</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-subtle)' }}>
            Complete your profile to start receiving inquiries from companies
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-4)', minHeight: '500px' }}>

          {/* LEFT — list */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
                Nothing here
              </div>
            ) : filtered.map(inq => {
              const isSelected = inq.id === selectedId
              const isNew = inq.status === 'new'
              return (
                <button
                  key={inq.id}
                  onClick={() => handleSelect(inq.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    background: isSelected ? 'var(--color-accent-light)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--color-accent)' : '3px solid transparent',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: isNew ? 600 : 500, color: 'var(--color-ink)' }}>
                      {inq.company_name || inq.contact_name}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: '4px' }}>
                    {inq.contact_name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inq.message.slice(0, 60)}...
                  </p>
                  {isNew && (
                    <span style={{ display: 'inline-block', fontSize: '10px', marginTop: '6px', padding: '2px 6px', background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--radius-pill)' }}>
                      NEW
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* RIGHT — detail */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
            {!selected ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-muted)' }}>
                Select an inquiry to view details
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
                        {selected.company_name || selected.contact_name}
                      </h2>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                        {selected.contact_name} · {selected.contact_email}
                      </p>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: STATUS_COLORS[selected.status]?.bg,
                        color: STATUS_COLORS[selected.status]?.text,
                        textTransform: 'capitalize',
                      }}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                    {new Date(selected.created_at).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                  {selected.training_topic && (
                    <div>
                      <div className="section-label">Training topic</div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{selected.training_topic}</p>
                    </div>
                  )}
                  {selected.pax_count && (
                    <div>
                      <div className="section-label">Participants</div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{selected.pax_count} pax</p>
                    </div>
                  )}
                  {selected.preferred_date && (
                    <div>
                      <div className="section-label">Preferred date</div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{new Date(selected.preferred_date).toLocaleDateString('en-MY')}</p>
                    </div>
                  )}
                  {selected.delivery_mode && (
                    <div>
                      <div className="section-label">Delivery</div>
                      <p style={{ fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>{selected.delivery_mode}</p>
                    </div>
                  )}
                  {selected.contact_phone && (
                    <div>
                      <div className="section-label">Phone</div>
                      <p style={{ fontSize: 'var(--text-sm)' }}>{selected.contact_phone}</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="section-label">Message</div>
                  <p style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap' }}>
                    {selected.message}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <a
                    href={`mailto:${selected.contact_email}?subject=Re: Training inquiry`}
                    className="btn btn-primary"
                  >
                    📧 Reply via email
                  </a>
                  {selected.contact_phone && (
                    <a
                      href={`https://wa.me/${selected.contact_phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-cta"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                  {selected.status !== 'replied' && (
                    <button onClick={() => markStatus(selected.id, 'replied')} className="btn btn-outline">
                      Mark as replied
                    </button>
                  )}
                  {selected.status !== 'closed' && (
                    <button onClick={() => markStatus(selected.id, 'closed')} className="btn btn-outline">
                      Close
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}