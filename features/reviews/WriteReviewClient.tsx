'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  trainerId: string
  trainerName: string
}

export function WriteReviewClient({ trainerId, trainerName }: Props) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setErrorMsg('Please select a star rating.'); return }
    if (body.trim().length < 20) { setErrorMsg('Review must be at least 20 characters.'); return }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: trainerId, rating, title, body }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-outline"
        style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <Star size={14} strokeWidth={1.75} /> Write a review
      </button>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>
          <Star size={32} strokeWidth={1.5} fill="var(--color-accent)" color="var(--color-accent)" style={{ margin: '0 auto' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>Thanks for your review!</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          It will appear on {trainerName}&apos;s profile once approved by our team.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500 }}>
          Write a review
        </h3>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: 'var(--text-lg)', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Star picker */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your rating</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
              >
                <Star
                  size={28}
                  strokeWidth={1.5}
                  fill={(hover || rating) >= n ? 'var(--color-accent)' : 'none'}
                  color={(hover || rating) >= n ? 'var(--color-accent)' : 'var(--color-border)'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <input
            className="input"
            type="text"
            placeholder="Summary (e.g. Excellent facilitator)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', fontSize: 'var(--text-sm)' }}
          />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <textarea
            className="input"
            placeholder="Share your experience — what did you learn, how was the delivery?"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            required
            style={{ width: '100%', fontSize: 'var(--text-sm)', resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: 'var(--leading-relaxed)' }}
          />
        </div>

        {errorMsg && (
          <p style={{ fontSize: 'var(--text-xs)', color: '#c0392b', marginBottom: 'var(--space-3)' }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit review'}
        </button>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
          Reviews are reviewed by our team before appearing publicly.
        </p>
      </form>
    </div>
  )
}
