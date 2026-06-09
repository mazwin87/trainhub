'use client'

/* ============================================================
   FAVOURITE BUTTON — save/unsave a trainer to your shortlist.
   Works for any signed-in user; prompts sign-in otherwise.
   Self-contained: checks its own saved state on mount.
   ============================================================ */

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  trainerId: string            // trainer_profiles.id
  initialSaved?: boolean       // skip the self-fetch if the parent already knows
  variant?: 'icon' | 'button'  // small heart (cards) vs labelled (profile)
}

export function FavouriteButton({ trainerId, initialSaved, variant = 'icon' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [saved, setSaved] = useState(!!initialSaved)
  const [userId, setUserId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null
      setUserId(uid)
      if (uid && initialSaved === undefined) {
        const { data: rows } = await supabase
          .from('favourites')
          .select('id')
          .eq('user_id', uid)
          .eq('trainer_id', trainerId)
          .limit(1)
        setSaved(!!rows && rows.length > 0)
      }
    })
  }, [trainerId, initialSaved])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    setBusy(true)
    const supabase = createBrowserClient()
    const next = !saved
    setSaved(next) // optimistic
    try {
      if (next) {
        const { error } = await supabase.from('favourites').insert({ user_id: userId, trainer_id: trainerId } as any)
        if (error) throw error
      } else {
        const { error } = await supabase.from('favourites').delete().eq('user_id', userId).eq('trainer_id', trainerId)
        if (error) throw error
      }
      router.refresh()
    } catch {
      setSaved(!next) // revert on failure
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        className={saved ? 'btn btn-cta' : 'btn btn-outline'}
        style={{ gap: '6px' }}
      >
        <Heart size={15} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? 'Remove from saved' : 'Save trainer'}
      aria-pressed={saved}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: saved ? 'var(--color-accent)' : 'var(--color-muted)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'color 0.15s ease, border-color 0.15s ease',
      }}
    >
      <Heart size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} />
    </button>
  )
}
