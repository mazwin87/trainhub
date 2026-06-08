'use client'

/* ============================================================
   AVAILABILITY CALENDAR (public, read-only)
   Shows a month grid; dates the trainer marked as booked render as
   "Unavailable". Everything else is implicitly available. No private
   details are passed in — only date ranges.
   ============================================================ */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BusyRange { start_date: string; end_date: string | null }

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_SPAN = 366

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function parse(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function AvailabilityCalendar({ busy }: { busy: BusyRange[] }) {
  // Expand ranges → a Set of booked 'YYYY-MM-DD' strings
  const bookedSet = useMemo(() => {
    const set = new Set<string>()
    for (const b of busy) {
      const start = parse(b.start_date)
      const end = b.end_date ? parse(b.end_date) : start
      let cur = new Date(start)
      let guard = 0
      while (cur <= end && guard < MAX_SPAN) {
        set.add(ymd(cur.getFullYear(), cur.getMonth(), cur.getDate()))
        cur.setDate(cur.getDate() + 1)
        guard++
      }
    }
    return set
  }, [busy])

  const now = new Date()
  const [offset, setOffset] = useState(0) // months from current
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const year = view.getFullYear()
  const month = view.getMonth()

  const monthLabel = view.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // JS getDay(): 0=Sun..6=Sat → shift so Monday=0
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
  const todayKey = ymd(now.getFullYear(), now.getMonth(), now.getDate())

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      {/* Header / nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <button type="button" onClick={() => setOffset(o => o - 1)} disabled={offset <= 0}
          aria-label="Previous month"
          className="btn btn-outline" style={{ minHeight: 34, padding: '0.3rem 0.6rem', opacity: offset <= 0 ? 0.4 : 1 }}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-md)' }}>{monthLabel}</div>
        <button type="button" onClick={() => setOffset(o => o + 1)} disabled={offset >= 11}
          aria-label="Next month"
          className="btn btn-outline" style={{ minHeight: 34, padding: '0.3rem 0.6rem', opacity: offset >= 11 ? 0.4 : 1 }}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Weekday row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {WEEKDAYS.map(w => (
          <div key={w} style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', fontWeight: 500 }}>{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />
          const key = ymd(year, month, day)
          const isBooked = bookedSet.has(key)
          const isPast = key < todayKey
          const isToday = key === todayKey
          return (
            <div
              key={key}
              title={isBooked ? 'Unavailable' : isPast ? '' : 'Available'}
              style={{
                aspectRatio: '1 / 1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                fontWeight: isToday ? 700 : 400,
                color: isBooked ? 'var(--color-accent-dark)' : isPast ? 'var(--color-subtle)' : 'var(--color-ink)',
                background: isBooked ? 'var(--color-accent-light)' : isPast ? 'transparent' : 'var(--color-surface)',
                border: isToday ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                textDecoration: isBooked ? 'line-through' : 'none',
                opacity: isPast && !isBooked ? 0.5 : 1,
              }}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }} /> Available
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-accent-light)', border: '1px solid var(--color-accent)' }} /> Unavailable
        </span>
      </div>
    </div>
  )
}
