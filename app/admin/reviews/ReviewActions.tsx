'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

interface Props {
  reviewId: string
  trainerId: string
}

export function ReviewActions({ reviewId, trainerId }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      await fetch('/api/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, trainerId, action }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <button
        onClick={() => act('approve')}
        disabled={loading !== null}
        className="btn btn-primary"
        style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
      >
        <Check size={13} strokeWidth={2.5} />
        {loading === 'approve' ? 'Approving…' : 'Approve'}
      </button>
      <button
        onClick={() => act('reject')}
        disabled={loading !== null}
        className="btn btn-outline"
        style={{ fontSize: 'var(--text-xs)', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#c0392b', borderColor: '#c0392b' }}
      >
        <X size={13} strokeWidth={2.5} />
        {loading === 'reject' ? 'Rejecting…' : 'Reject'}
      </button>
    </div>
  )
}
