/* ============================================================
   HERO DASHBOARD MOCKUP — a faithful mini-preview of the real
   /trainers directory page, shown beside the hero headline.
   Purely presentational.

   ⬇️ ALL NAMES/NUMBERS BELOW ARE PLACEHOLDER DEMO DATA — edit freely.
   ============================================================ */
import { Search, ChevronDown, MapPin, Star, Check, MessageCircle } from 'lucide-react'

const TRAINER_COUNT = '10' // placeholder
const CHIPS = ['All topics', 'AI & Data', 'Leadership', 'Communication', 'Health & Safety']
const FILTERS = [
  { group: 'Verification', items: [{ label: 'HRDC verified', checked: true }, { label: 'Top rated (4.8+)', checked: false }] },
  { group: 'Delivery', items: [{ label: 'Online', checked: false }, { label: 'Offline / On-site', checked: false }] },
]

const DEMO_TRAINERS = [
  { initials: 'AO', name: 'Dr. Amara Osei',   role: 'Organisational Psychologist & Leadership Specialist', price: 'RM 1,800 – 5,500', rating: '4.9', location: 'Selangor', badges: ['verified', 'featured', 'top'] },
  { initials: 'LF', name: 'Dr. Lena Fischer',  role: 'Corporate Strategy Consultant',                       price: 'RM 3,000 – 9,000', rating: '4.9', location: 'Johor',    badges: ['verified', 'top'] },
]

const BADGE_STYLE: Record<string, { bg: string; color: string; label: string; icon?: 'check' | 'star' }> = {
  verified: { bg: 'var(--color-verified)', color: 'var(--color-verified-text)', label: 'HRDC Verified', icon: 'check' },
  featured: { bg: 'var(--color-featured)', color: 'var(--color-featured-text)', label: 'Featured' },
  top:      { bg: 'var(--color-top)',      color: 'var(--color-top-text)',      label: 'Top Rated', icon: 'star' },
}

export function HeroDashboardMockup() {
  return (
    <div className="hero-mock">
      {/* Header */}
      <div className="hero-mock-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.98rem', color: 'var(--color-ink)' }}>Trainer directory</span>
          <span style={{ fontSize: '0.66rem', color: 'var(--color-muted)', background: 'var(--color-surface-alt)', padding: '2px 8px', borderRadius: 999 }}>{TRAINER_COUNT} trainers</span>
        </div>
      </div>

      {/* Search row */}
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: 'var(--color-accent-light)', borderRadius: 8, color: 'var(--color-muted)', fontSize: '0.74rem' }}>
          <Search size={13} strokeWidth={2} /> Search by name, topic…
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', background: 'var(--color-accent-light)', borderRadius: 8, color: 'var(--color-muted)', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
          All states <ChevronDown size={12} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#fff', background: 'var(--color-accent)', padding: '7px 12px', borderRadius: 8 }}>Search</span>
      </div>

      {/* Topic chips */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CHIPS.map((c, i) => (
          <span key={c} style={{
            fontSize: '0.68rem', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
            background: i === 0 ? 'var(--color-ink)' : 'var(--color-surface)',
            color: i === 0 ? '#fff' : 'var(--color-muted)',
            border: i === 0 ? 'none' : '1px solid var(--color-border)',
          }}>{c}</span>
        ))}
      </div>

      {/* Body: filters + results */}
      <div className="hero-mock-body" style={{ marginTop: 12 }}>
        <aside className="hero-mock-filters">
          {FILTERS.map(f => (
            <div key={f.group} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-subtle)', marginBottom: 9 }}>{f.group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.items.map(it => (
                  <label key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: 'var(--color-muted)' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, background: it.checked ? 'var(--color-accent)' : 'transparent', border: it.checked ? 'none' : '1.5px solid var(--color-border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {it.checked && <Check size={9} strokeWidth={3.5} color="#fff" />}
                    </span>
                    {it.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, color: '#fff', background: 'var(--color-accent)', padding: '6px 14px', borderRadius: 8 }}>Apply</span>
        </aside>

        {/* Results */}
        <div className="hero-mock-results">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_TRAINERS.map(t => (
              <div key={t.name} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--color-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.78rem' }}>{t.initials}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-ink)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                  {t.badges.map(b => {
                    const s = BADGE_STYLE[b]
                    return (
                      <span key={b} style={{ fontSize: '0.6rem', fontWeight: 500, color: s.color, background: s.bg, padding: '2px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        {s.icon === 'check' && <Check size={9} strokeWidth={2.5} />}
                        {s.icon === 'star' && <Star size={9} strokeWidth={2} fill="currentColor" />}
                        {s.label}
                      </span>
                    )
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-ink)' }}>{t.price}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star size={10} strokeWidth={1.75} fill="var(--color-gold)" color="var(--color-gold)" /> {t.rating} · <MapPin size={10} strokeWidth={1.75} /> {t.location}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#fff', background: 'var(--color-cta-dark)', padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <MessageCircle size={11} strokeWidth={2} /> WhatsApp
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
