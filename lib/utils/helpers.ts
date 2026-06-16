/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/* ── Absolute app URL that honors basePath ───────────────────
   window.location.origin omits the Next.js basePath (e.g. "/trainhub"),
   so manually-built redirect URLs handed to Supabase (OAuth callback,
   password reset) must add it back — otherwise the redirect lands
   outside the app and the OAuth flow state is consumed in the wrong
   place ("flow_state_already_used"). Client-only (uses window). */
export function appUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${base}${path}`
}

/* ── Generate initials from a full name ──────────────────── */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ── Format price display ────────────────────────────────── */
export function formatPrice(
  mode: 'fixed' | 'quotation' | 'range',
  from?: number | null,
  to?: number | null
): string {
  if (mode === 'quotation') return 'Request quotation'
  if (mode === 'fixed' && from) return `RM ${from.toLocaleString()}`
  if (mode === 'range' && from && to)
    return `RM ${from.toLocaleString()} – ${to.toLocaleString()}`
  if (from) return `From RM ${from.toLocaleString()}`
  return 'Contact for pricing'
}

/* ── Format rating display ───────────────────────────────── */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/* ── Generate WhatsApp URL ───────────────────────────────── */
export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const msg = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${cleaned}${msg ? `?text=${msg}` : ''}`
}

/* ── Generate slug from name ─────────────────────────────── */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/* ── Truncate text ───────────────────────────────────────── */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

/* ── Calculate profile completeness ─────────────────────── */
export function calcCompleteness(profile: Record<string, unknown>): number {
  const checks = [
    { key: 'avatar_url',        points: 15 },
    { key: 'bio',               points: 15, minLength: 100 },
    { key: 'hrdf_cert_number',  points: 15 },
    { key: 'topics',            points: 10, minLength: 3 },
    { key: 'courses',           points: 10, minLength: 1 },
    { key: 'location_state',    points: 5  },
    { key: 'languages',         points: 5  },
    { key: 'linkedin_url',      points: 5  },
    { key: 'whatsapp_number',   points: 5  },
    { key: 'certifications',    points: 10, minLength: 1 },
    { key: 'gallery',           points: 5  },
  ]

  let score = 0
  for (const check of checks) {
    const val = profile[check.key]
    if (!val) continue
    if (check.minLength) {
      const len = Array.isArray(val) ? val.length : String(val).length
      if (len >= check.minLength) score += check.points
    } else {
      score += check.points
    }
  }
  return Math.min(score, 100)
}

/* ── Format date ────────────────────────────────────────── */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ── Debounce ────────────────────────────────────────────── */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/* ── Build URL query string from filters ─────────────────── */
export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)))
    } else {
      search.set(key, String(value))
    }
  }
  return search.toString()
}
