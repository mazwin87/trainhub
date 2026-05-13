'use client'

import { TRAINER_TOPICS } from '@/types'

interface Props {
  activeTopic: string
  onChange: (topic: string) => void
}

export function FilterBar({ activeTopic, onChange }: Props) {
  const topics = ['All topics', ...TRAINER_TOPICS]

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onChange(topic)}
          className="btn"
          style={{
            fontSize: 'var(--text-xs)',
            padding: '0.38rem 0.9rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: activeTopic === topic ? 'var(--color-ink)' : 'var(--color-surface)',
            color: activeTopic === topic ? '#fff' : 'var(--color-muted)',
            borderColor: activeTopic === topic ? 'var(--color-ink)' : 'var(--color-border)',
            transition: 'all var(--transition-base)',
          }}
        >
          {topic}
        </button>
      ))}
    </div>
  )
}
