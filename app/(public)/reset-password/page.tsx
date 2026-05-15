'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!validSession) {
    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
          Invalid or expired link
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-5)' }}>
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn btn-primary">
          Request new link
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Set new password
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Choose a strong password for your account
      </p>

      {success ? (
        <div style={{ padding: 'var(--space-5)', background: 'var(--color-cta-light)', color: 'var(--color-cta-dark)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>✓</div>
          <p style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>Password updated!</p>
          <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">New password</label>
            <input
              className="input"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input
              className="input"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  )
}