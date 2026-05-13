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
    <Link href={`/trainers/${trainer.slug}`} className="block">
      <article className="card group">

        {/* Header */}
        <div className="flex gap-3 items-start mb-4">
          <div
            className="avatar avatar-md flex-shrink-0"
            style={{
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
            }}
          >
            {trainer.avatar_url ? (
              <img
                src={trainer.avatar_url}
                alt={trainer.full_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span style={{ fontFamily: 'var(--font-display)' }}>
                {(trainer.full_name || trainer.users?.full_name || 'T').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="font-medium truncate"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-md)',
              }}
            >
              {trainer.full_name || trainer.users?.full_name || 'Trainer'}
            </h3>
            <p
              className="text-muted mt-0.5"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {truncate(trainer.tagline, 80)}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
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
        <div className="flex flex-wrap gap-1.5 mb-4">
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

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <div>
            <div
              className="font-medium"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {formatPrice(trainer.pricing_mode, trainer.pricing_from, trainer.pricing_to)}
            </div>
            <div
              className="text-muted"
              style={{ fontSize: 'var(--text-xs)' }}
            >
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
              style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.85rem' }}
            >
              WhatsApp
            </button>
          )}
        </div>
      </article>
    </Link>
  )
}
