'use client'

/* ============================================================
   SCHEDULE MANAGER — trainer marks the dates they're BOOKED.
   Everything not listed shows as available on the public profile.
   `note` is private (trainer-only); never shown to companies.
   ============================================================ */

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { CalendarDays, Trash2, Plus } from 'lucide-react'

export interface ScheduleEntry {
  id: string
  trainer_id: string
  start_date: string
  end_date: string | null
  note: string | null
  created_at?: string | null
}

interface Props {
  trainerId: string
  initialEntries: ScheduleEntry[]
}

function fmt(d: string) {
  // d is 'YYYY-MM-DD'; parse as local date to avoid TZ shift
  const [y, m, day] = d.split('-').map(Number)
  return new Date(y, m - 1, day).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function rangeLabel(e: ScheduleEntry) {
  if (e.end_date && e.end_date !== e.start_date) return `${fmt(e.start_date)} – ${fmt(e.end_date)}`
  return fmt(e.start_date)
}

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ScheduleManager({ trainerId, initialEntries }: Props) {
  const [entries, setEntries] = useState<ScheduleEntry[]>(
    [...initialEntries].sort((a, b) => a.start_date.localeCompare(b.start_date))
  )
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = todayStr()
  const upcoming = entries.filter(e => (e.end_date ?? e.start_date) >= today)
  const past = entries.filter(e => (e.end_date ?? e.start_date) < today)

  const handleAdd = async () => {
    setError(null)
    if (!start) { setError('Pick a start date'); return }
    if (end && end < start) { setError('End date can’t be before the start date'); return }

    setBusy(true)
    try {
      const supabase = createBrowserClient()
      const { data, error: insertError } = await supabase
        .from('trainer_schedule' as any)
        .insert({
          trainer_id: trainerId,
          start_date: start,
          end_date: end || null,
          note: note.trim() || null,
        } as any)
        .select('id, trainer_id, start_date, end_date, note, created_at')
        .single() as { data: ScheduleEntry | null; error: any }

      if (insertError) throw insertError
      if (data) setEntries(prev => [...prev, data].sort((a, b) => a.start_date.localeCompare(b.start_date)))
      setStart(''); setEnd(''); setNote('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const supabase = createBrowserClient()
      const { error: delError } = await supabase.from('trainer_schedule' as any).delete().eq('id', id)
      if (delError) throw delError
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const Row = ({ e, faded }: { e: ScheduleEntry; faded?: boolean }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      padding: 'var(--space-3)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', opacity: faded ? 0.55 : 1,
    }}>
      <CalendarDays size={18} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>{rangeLabel(e)}</div>
        {e.note && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{e.note}</div>}
      </div>
      <button type="button" onClick={() => handleDelete(e.id)} disabled={busy}
        aria-label="Remove" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'inline-flex' }}>
        <Trash2 size={16} strokeWidth={1.75} />
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Availability
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        Mark the dates you’re already booked. Companies see these as “Unavailable” on your profile —
        the details you add here stay private to you.
      </p>

      {/* Add form */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>From *</label>
            <input className="input" type="date" min={today} value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>To (optional, for multi-day)</label>
            <input className="input" type="date" min={start || today} value={end} onChange={e => setEnd(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="label" style={{ fontSize: 'var(--text-xs)' }}>Private note (only you can see this)</label>
          <input className="input" placeholder="e.g. Leadership workshop — Acme Corp" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-text)', marginBottom: 'var(--space-3)' }}>{error}</p>}
        <button type="button" onClick={handleAdd} disabled={busy} className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
          <Plus size={15} strokeWidth={2} /> {busy ? 'Saving…' : 'Mark as booked'}
        </button>
      </section>

      {/* Upcoming */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
        Upcoming bookings
      </h2>
      {upcoming.length === 0 ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
          No booked dates yet — your profile shows you as fully available.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {upcoming.map(e => <Row key={e.id} e={e} />)}
        </div>
      )}

      {past.length > 0 && (
        <details>
          <summary style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', marginBottom: 'var(--space-3)' }}>
            Past ({past.length})
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {past.map(e => <Row key={e.id} e={e} faded />)}
          </div>
        </details>
      )}
    </div>
  )
}
