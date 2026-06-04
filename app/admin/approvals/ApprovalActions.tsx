'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { TablesUpdate } from '@/lib/supabase/database.types'

interface Props {
  trainerId: string
  hrdfCertNumber?: string | null
}

export function ApprovalActions({ trainerId, hrdfCertNumber }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [markHrdf, setMarkHrdf] = useState(!!hrdfCertNumber)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    const supabase = createBrowserClient()

    const updates: TablesUpdate<'trainer_profiles'> =
      action === 'approve'
        ? { approval_status: 'approved', is_published: true, is_verified_hrdf: markHrdf }
        : { approval_status: 'rejected', is_published: false }

    const { error } = await supabase
      .from('trainer_profiles')
      .update(updates)
      .eq('id', trainerId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        fontSize: 'var(--text-xs)', color: 'var(--color-muted)', cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={markHrdf}
          onChange={e => setMarkHrdf(e.target.checked)}
          style={{ accentColor: 'var(--color-accent)', width: '14px', height: '14px' }}
        />
        Mark HRDC verified
      </label>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="btn btn-outline"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Reject
        </button>
        <button
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="btn btn-cta"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Approve
        </button>
      </div>
    </div>
  )
}