'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const redirectTo = `${window.location.origin}/reset-password`

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Forgot password?
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Enter your email and we'll send you a reset link
      </p>

      {sent ? (
        <div style={{ padding: 'var(--space-5)', background: 'var(--color-cta-light)', color: 'var(--color-cta-dark)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>✓</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
            Check your email
          </h2>
          <p style={{ fontSize: 'var(--text-sm)' }}>
            We sent a password reset link to <strong>{email}</strong>
          </p>
          <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-3)', opacity: 0.8 }}>
            Don't see it? Check your spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-error)', color: 'var(--color-error-text)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Remember your password?{' '}
        <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}