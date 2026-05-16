'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { TRAINER_TOPICS } from '@/types'

interface Props {
  activeTopic: string
}

export function FilterBarClient({ activeTopic }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTopicChange(topic: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (topic === 'All topics') {
      params.delete('topic')
    } else {
      params.set('topic', topic)
    }
    params.delete('page')
    router.push(`/trainers?${params.toString()}`)
  }

  return (
    <div className="filter-bar">
      {['All topics', ...TRAINER_TOPICS].map((topic) => (
        <button
          key={topic}
          onClick={() => handleTopicChange(topic)}
          style={{
            fontSize: 'var(--text-xs)',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeTopic === topic ? 'var(--color-ink)' : 'var(--color-surface)',
            color: activeTopic === topic ? '#fff' : 'var(--color-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
            minHeight: '36px',
            whiteSpace: 'nowrap',
          }}
        >
          {topic}
        </button>
      ))}
    </div>
  )
}
