'use client'

import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'

export function FoundingTrainerForm() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/founding-trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="lp-fb-ok" role="status">
        <Check size={18} strokeWidth={2.6} aria-hidden /> Thanks — you’re in. We’ll reach out about your founding profile.
      </div>
    )
  }

  return (
    <form className="lp-fb-cta" onSubmit={handleSubmit} noValidate>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Your email"
        aria-invalid={error ? true : undefined}
        disabled={submitting}
      />
      <button type="submit" className="lp-btn lp-btn-w" disabled={submitting}>
        {submitting ? 'Sending…' : 'Apply to join'}
      </button>
      <span className="lp-fb-note">
        {error ? error : 'Takes 5 minutes · We review every application'}
      </span>
    </form>
  )
}
