import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="home-section"
      style={{ background: 'var(--color-ink)', marginTop: 'auto' }}
    >
      <div className="footer-grid" style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto' }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: 'var(--space-3)' }}>
            Train<span style={{ color: 'var(--color-accent)' }}>Hub</span> Malaysia
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: '#7a7370', lineHeight: 'var(--leading-relaxed)', maxWidth: '280px' }}>
            Malaysia's HRDF trainer directory. Connecting companies with verified, certified training professionals.
          </p>
        </div>

        {/* For trainers */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7370', marginBottom: 'var(--space-4)' }}>For trainers</div>
          {['Create profile', 'Trainer dashboard', 'Pricing plans', 'How it works'].map(l => (
            <Link key={l} href="#" style={{ display: 'block', fontSize: 'var(--text-sm)', color: '#a09890', marginBottom: 'var(--space-2)' }}>{l}</Link>
          ))}
        </div>

        {/* For companies */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7370', marginBottom: 'var(--space-4)' }}>For companies</div>
          {['Find trainers', 'Post a training need', 'HRDF guide', 'Verified trainers'].map(l => (
            <Link key={l} href="#" style={{ display: 'block', fontSize: 'var(--text-sm)', color: '#a09890', marginBottom: 'var(--space-2)' }}>{l}</Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7370', marginBottom: 'var(--space-4)' }}>Company</div>
          {['About us', 'Blog', 'Privacy policy', 'Terms of service'].map(l => (
            <Link key={l} href="#" style={{ display: 'block', fontSize: 'var(--text-sm)', color: '#a09890', marginBottom: 'var(--space-2)' }}>{l}</Link>
          ))}
        </div>
      </div>

      <div
        className="footer-bottom"
        style={{ maxWidth: 'var(--max-width-content)', margin: 'var(--space-8) auto 0', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p style={{ fontSize: 'var(--text-xs)', color: '#7a7370' }}>
          © 2026 TrainHub Sdn Bhd · Cyberjaya, Malaysia
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: '#7a7370' }}>
          Registered with HRD Corp Malaysia
        </p>
      </div>
    </footer>
  )
}
