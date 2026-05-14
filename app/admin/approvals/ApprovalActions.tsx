'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { TablesUpdate } from '@/lib/supabase/database.types'

interface Props {
  trainerId: string
}

export function ApprovalActions({ trainerId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    const supabase = createBrowserClient()

    const updates: TablesUpdate<'trainer_profiles'> = action === 'approve'
      ? { approval_status: 'approved', is_published: true }
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
  )
}