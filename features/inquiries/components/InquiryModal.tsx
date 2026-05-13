'use client'

import { useState } from 'react'
import type { InquiryFormData } from '../types/inquiry'

interface Props {
  trainerName: string
  trainerId: string
  isOpen: boolean
  onClose: () => void
}

const EMPTY_FORM: InquiryFormData = {
  contact_name: '',
  company_name: '',
  contact_email: '',
  contact_phone: '',
  training_topic: '',
  pax_count: null,
  preferred_date: '',
  delivery_mode: 'flexible',
  message: '',
}

export function InquiryModal({ trainerName, trainerId, isOpen, onClose }: Props) {
  const [form, setForm] = useState<InquiryFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const update = (field: keyof InquiryFormData, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.contact_name || !form.contact_email || !form.message) {
      setError('Please fill in name, email, and message.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, trainer_id: trainerId }),
      })
      if (!res.ok) throw new Error('Failed to send inquiry')
      setSuccess(true)
      setForm(EMPTY_FORM)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,23,20,0.55)',
        zIndex: 'var(--z-modal)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '520px', width: '100%',
          border: '1px solid var(--color-border)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Head */}
        <div style={{
          padding: '1.5rem 1.75rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)' }}>
              Send inquiry
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: '2px' }}>
              to {trainerName}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ fontSize: '1.3rem', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.75rem' }}>
          {success ? (
            <div style={{
              textAlign: 'center', padding: '2rem 1rem',
              background: 'var(--color-cta-light)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
              <p style={{ fontWeight: 'var(--weight-medium)', color: 'var(--color-cta-dark)' }}>
                Inquiry sent successfully!
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                {trainerName} will respond within 24–48 hours.
              </p>
              <button onClick={onClose} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Your name *</label>
                  <input className="input" placeholder="Ahmad Razif" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Company</label>
                  <input className="input" placeholder="Sime Darby Berhad" value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" placeholder="ahmad@company.com" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input className="input" placeholder="+60 12-345 6789" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} />
                </div>
                <div>
                  <label className="label">No. of participants</label>
                  <input className="input" type="number" placeholder="30" value={form.pax_count ?? ''} onChange={(e) => update('pax_count', Number(e.target.value) || null)} />
                </div>
                <div>
                  <label className="label">Preferred date</label>
                  <input className="input" type="date" value={form.preferred_date} onChange={(e) => update('preferred_date', e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Training topic</label>
                <input className="input" placeholder="e.g. Leadership for mid-level managers" value={form.training_topic} onChange={(e) => update('training_topic', e.target.value)} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Message *</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Tell the trainer about your training needs and objectives…"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error-text)', marginBottom: '0.75rem' }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? 'Sending…' : 'Send inquiry →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
