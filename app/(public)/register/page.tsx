'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { OAuthButtons } from '@/features/auth/components/OAuthButtons'

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

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const role = data.user.user_metadata?.role
        router.replace(role === 'admin' ? '/admin' : '/trainer/dashboard')
      }
    })
  }, [router])

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

      router.push('/login?registered=true')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-height) - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-10) var(--space-5)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#fff',
        borderRadius: '16px',
        padding: 'var(--space-8) var(--space-7)',
        boxShadow: '0 8px 40px rgba(154, 52, 18, 0.15)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 600,
          color: '#9A3412',
          marginBottom: 'var(--space-2)',
          lineHeight: 1.15,
        }}>
          Create your profile
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          Join Malaysia&apos;s HRDC trainer directory. It&apos;s free.
        </p>

        <OAuthButtons />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-2) 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>or register with email</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
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
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-error)',
              color: 'var(--color-error-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: 'var(--space-4)', marginTop: 'var(--space-2)' }}
          >
            {loading ? 'Creating account…' : 'Create account — it\'s free'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#EA8A4B', fontWeight: 600, transition: 'color 0.3s ease' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
