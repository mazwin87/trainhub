'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (registered) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, '', '/login')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [registered])

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

    try {
      const supabase = createBrowserClient()

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError
      if (!authData.user) throw new Error('Login failed')

      // Check if trainer profile is approved
      const { data: profile } = await supabase
        .from('trainer_profiles' as any)
        .select('approval_status')
        .eq('user_id', authData.user.id)
        .single() as { data: { approval_status: string } | null }

      if (profile?.approval_status === 'approved') {
        router.push('/trainer/dashboard')
      } else {
        router.push('/trainer/pending')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Sign in to your account
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Welcome back to TrainHub Malaysia
      </p>

      {registered && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-cta-light)', color: 'var(--color-cta-dark)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
          ✓ Account created! Please sign in with your email and password.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Don't have an account?{' '}
        <Link href="/register" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
          Create one
        </Link>
      </p>
    </div>
  )
}