'use client'

import Link from 'next/link'
import type { TrainerCard as TrainerCardType } from '../types'
import { formatPrice, getWhatsAppUrl, truncate } from '@/lib/utils'

interface Props {
  trainer: TrainerCardType
}

export function TrainerCard({ trainer }: Props) {
  const topics = trainer.topics ?? []
  const visibleTopics = topics.slice(0, 3)
  const extraCount = topics.length - 3

  return (
    <Link href={`/trainers/${trainer.slug}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <article className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div
            className="avatar avatar-md"
            style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >
            {trainer.avatar_url ? (
              <img
                src={trainer.avatar_url}
                alt={trainer.full_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span style={{ fontFamily: 'var(--font-display)' }}>
                {(trainer.full_name || trainer.users?.full_name || 'T').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-md)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '0.2rem',
              }}
            >
              {trainer.full_name || trainer.users?.full_name || 'Trainer'}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.4 }}>
              {truncate(trainer.tagline, 72)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
          {trainer.is_verified_hrdf && (
            <span className="badge badge-hrdf">✓ HRDF Verified</span>
          )}
          {trainer.is_featured && (
            <span className="badge badge-featured">Featured</span>
          )}
          {trainer.avg_rating >= 4.8 && (
            <span className="badge badge-top">★ Top Rated</span>
          )}
        </div>

        {/* Topics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem', flex: 1 }}>
          {visibleTopics.map((topic: any) => (
            <span key={topic.id} className="badge badge-tag">
              {topic.name}
            </span>
          ))}
          {extraCount > 0 && (
            <span
              className="badge"
              style={{
                background: 'transparent',
                border: '1px dashed var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              +{extraCount} more
            </span>
          )}
        </div>

        {/* Footer — pinned to bottom via flex */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'auto',
            gap: '0.5rem',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>
              {formatPrice(trainer.pricing_mode, trainer.pricing_from, trainer.pricing_to)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.1rem' }}>
              ★ {trainer.avg_rating.toFixed(1)} · {trainer.review_count} reviews
            </div>
          </div>

          {trainer.whatsapp_number && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(
                  getWhatsAppUrl(
                    trainer.whatsapp_number!,
                    `Hi, I found your profile on TrainHub Malaysia and I'm interested in your training services.`
                  ),
                  '_blank'
                )
              }}
              className="btn btn-cta"
              style={{ fontSize: 'var(--text-xs)', padding: '0.5rem 0.9rem', flexShrink: 0 }}
            >
              WhatsApp
            </button>
          )}
        </div>
      </article>
    </Link>
  )
}
