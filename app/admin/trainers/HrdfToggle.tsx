'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  trainerId: string
  isVerified: boolean
}

export function HrdfToggle({ trainerId, isVerified }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(isVerified)

  const toggle = async () => {
    setLoading(true)
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('trainer_profiles')
      .update({ is_verified_hrdf: !verified })
      .eq('id', trainerId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setVerified(v => !v)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        fontSize: '11px',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        cursor: loading ? 'wait' : 'pointer',
        borderColor: verified ? 'var(--color-cta-dark)' : 'var(--color-border)',
        background: verified ? 'var(--color-cta-light)' : 'transparent',
        color: verified ? 'var(--color-cta-dark)' : 'var(--color-muted)',
        transition: 'all 0.15s ease',
      }}
    >
      {verified ? '✓ HRDC' : 'Set HRDC'}
    </button>
  )
}
