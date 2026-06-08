/* ============================================================
   HERO DASHBOARD MOCKUP — a faux "Trainer Directory" app preview
   shown beside the hero headline. Purely presentational.

   ⬇️ ALL NUMBERS/NAMES BELOW ARE PLACEHOLDER DEMO DATA — edit freely.
   ============================================================ */
import { Bell, Bookmark, Star, MapPin, ChevronDown, BadgeCheck } from 'lucide-react'

const TRAINERS_FOUND = '1,248' // placeholder

const CATEGORIES = [
  { label: 'Leadership & Management', checked: true },
  { label: 'Sales & Marketing', checked: false },
  { label: 'IT & Digital Skills', checked: false },
  { label: 'HR & Soft Skills', checked: false },
  { label: 'Finance & Accounting', checked: false },
  { label: 'Safety & Health', checked: false },
]

const DEMO_TRAINERS = [
  { name: 'Mr. Jason Lim',    role: 'Leadership & Management Expert', location: 'Kuala Lumpur', rating: '4.9', reviews: 128, initials: 'JL', from: 'var(--color-accent)',  to: 'var(--color-secondary)' },
  { name: 'Puan Siti Aisyah', role: 'HR & Soft Skills Specialist',   location: 'Selangor',     rating: '4.8', reviews: 96,  initials: 'SA', from: 'var(--color-sage)',    to: 'var(--color-sage-dark)' },
  { name: 'En. Ahmad Razak',  role: 'Sales Excellence Coach',        location: 'Johor',        rating: '4.7', reviews: 74,  initials: 'AR', from: 'var(--color-gold)',    to: 'var(--color-gold-dark)' },
]

function LeafLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21c0-6 2-10 8-12-1 6-3 9-8 12Z" fill="var(--color-sage)" />
      <path d="M12 21c0-6-2-10-8-12 1 6 3 9 8 12Z" fill="var(--color-accent)" />
    </svg>
  )
}

export function HeroDashboardMockup() {
  return (
    <div className="hero-mock">
      {/* Window header */}
      <div className="hero-mock-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LeafLogo />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-ink)' }}>Trainer Directory</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ position: 'relative', display: 'inline-flex', color: 'var(--color-muted)' }}>
            <Bell size={18} strokeWidth={1.75} />
            <span style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }} />
          </span>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600 }}>You</span>
        </div>
      </div>

      {/* Body: filters + results */}
      <div className="hero-mock-body">
        {/* Refine search */}
        <aside className="hero-mock-filters">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-ink)' }}>Refine Search</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 500 }}>Clear all</span>
          </div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-subtle)', marginBottom: 10 }}>Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {CATEGORIES.map(c => (
              <label key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, background: c.checked ? 'var(--color-accent)' : 'transparent', border: c.checked ? 'none' : '1.5px solid var(--color-border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                </span>
                {c.label}
              </label>
            ))}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-accent)', fontWeight: 500, marginTop: 12 }}>View more</div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-subtle)', margin: '18px 0 8px' }}>Location</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--color-muted)' }}>
            All States <ChevronDown size={14} strokeWidth={2} />
          </div>
        </aside>

        {/* Results */}
        <div className="hero-mock-results">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-ink)' }}><strong style={{ fontWeight: 600 }}>{TRAINERS_FOUND}</strong> trainers found</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>Sort by: Most Relevant <ChevronDown size={13} strokeWidth={2} /></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_TRAINERS.map(t => (
              <div key={t.name} className="hero-mock-card">
                <span style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${t.from}, ${t.to})`, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>{t.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-ink)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>{t.role}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-subtle)', display: 'inline-flex', alignItems: 'center', gap: 3, margin: '3px 0' }}><MapPin size={11} strokeWidth={1.75} /> {t.location}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.64rem', fontWeight: 500, color: 'var(--color-sage-dark)', background: 'var(--color-sage-light)', padding: '2px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}><BadgeCheck size={11} strokeWidth={2} /> HRDC Certified Trainer</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-ink)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Star size={11} strokeWidth={1.75} fill="var(--color-gold)" color="var(--color-gold)" /> {t.rating} <span style={{ color: 'var(--color-subtle)' }}>({t.reviews})</span></span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <Bookmark size={15} strokeWidth={1.75} style={{ color: 'var(--color-subtle)' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-accent)', border: '1px solid var(--color-border-strong)', padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>View Profile</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div className="hero-mock-cta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BadgeCheck size={17} strokeWidth={1.9} /></span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-ink)' }}>New to the directory?</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>Create your profile and get discovered by organisations.</div>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: 'var(--color-accent)', padding: '8px 14px', borderRadius: 8, whiteSpace: 'nowrap' }}>List Your Profile</span>
      </div>
    </div>
  )
}
