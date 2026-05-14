'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient()

      // Sign up
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'trainer',
          },
        },
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Sign up failed')

      // Redirect to login with message
      router.push('/login?registered=true')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Create your trainer profile
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Join Malaysia's HRDF trainer directory. It's free.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            name="full_name"
            type="text"
            placeholder="Dr. Amara Osei"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input
            className="input"
            name="email"
            type="email"
            placeholder="amara@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Password</label>
          <input
            className="input"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="label">Confirm password</label>
          <input
            className="input"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}