'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function PendingPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get user's full name
      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserName((profile as any)?.full_name || 'Trainer')
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⏳</div>
      
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Profile under review
      </h1>

      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        Thank you for joining TrainHub Malaysia, {userName}!
      </p>

      <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
        Your trainer profile is currently under review by our team. We verify all HRDF certifications and trainer credentials to maintain the quality of our directory.
      </p>

      <div style={{ background: 'var(--color-cta-light)', border: '1px solid var(--color-cta)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-8)', textAlign: 'left' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-cta-dark)', lineHeight: 'var(--leading-relaxed)' }}>
          ✓ We typically approve profiles within <strong>24-48 hours</strong>
          <br /><br />
          Once approved, you&apos;ll be able to:
          <br />
          • Set up your complete trainer profile
          <br />
          • Add courses and certifications
          <br />
          • Receive training inquiries from companies
          <br />
          • View analytics and ratings
        </p>
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
        Questions? Email us at <strong>support@trainhub.my</strong>
      </p>
    </div>
  )
}