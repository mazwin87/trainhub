import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="home-section"
      style={{ background: 'linear-gradient(135deg, #5A1E0A 0%, #9A3412 100%)', marginTop: 'auto' }}
    >
      <div className="footer-grid" style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: 'var(--space-3)' }}>
            Train<span style={{ color: '#EA8A4B' }}>Hub</span> Malaysia
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 'var(--leading-relaxed)', maxWidth: '280px' }}>
            Malaysia's HRDC trainer directory. Connecting companies with verified, certified training professionals.
          </p>
        </div>

        {/* For trainers */}
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 'var(--space-4)' }}>
            For trainers
          </div>
          {[
            { label: 'List your profile', href: '/register' },
            { label: 'Sign in', href: '/login' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
          ))}
        </div>

        {/* For companies */}
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 'var(--space-4)' }}>
            For companies
          </div>
          {[
            { label: 'Find trainers', href: '/trainers' },
            { label: 'How it works', href: '/#how-it-works' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
          ))}
        </div>

        {/* Resources */}
        <div>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 'var(--space-4)' }}>
            Resources
          </div>
          {[
            { label: 'Blog', href: '/blog' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="footer-link">{l.label}</Link>
          ))}
        </div>
      </div>

      <div
        className="footer-bottom"
        style={{ maxWidth: 'var(--max-width-content)', margin: 'var(--space-8) auto 0', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)' }}>
          © 2026 TrainHub Sdn Bhd · Cyberjaya, Malaysia
        </p>

      </div>
    </footer>
  )
}
