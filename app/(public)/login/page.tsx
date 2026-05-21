'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import type { TablesInsert } from '@/lib/supabase/database.types'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered') === 'true'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect away if already logged in
  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const role = data.user.user_metadata?.role
        router.replace(role === 'admin' ? '/admin' : '/trainer/dashboard')
      }
    })
  }, [router])

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

      let { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if ((profileError as { code?: string } | null)?.code === 'PGRST116') {
        const newUserData = {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata?.full_name || 'User',
          role: authData.user.user_metadata?.role || 'trainer',
        } satisfies TablesInsert<'users'>

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert(newUserData as any)
          .select('role')
          .single()

        if (insertError) throw insertError
        userProfile = newUser
      }

      if (userProfile?.role === 'admin') {
        router.push('/admin')
        return
      }

      const { data: profile } = await supabase
        .from('trainer_profiles')
        .select('approval_status')
        .eq('user_id', authData.user.id)
        .single()

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
        boxShadow: '0 8px 40px rgba(107, 33, 168, 0.15)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 600,
          color: '#6B21A8',
          marginBottom: 'var(--space-2)',
          lineHeight: 1.15,
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          Sign in to your TrainHub Malaysia account
        </p>

        {registered && (
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-cta-light)',
            color: 'var(--color-cta-dark)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-5)',
          }}>
            ✓ Account created! Please sign in with your email and password.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
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
            <div style={{ textAlign: 'right', marginTop: 'var(--space-2)' }}>
              <Link href="/forgot-password" style={{ fontSize: 'var(--text-sm)', color: '#A855F7', transition: 'color 0.3s ease' }}>
                Forgot password?
              </Link>
            </div>
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
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#A855F7', fontWeight: 600, transition: 'color 0.3s ease' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
