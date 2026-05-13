import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: 'var(--color-ink)', padding: 'var(--space-12) var(--space-10)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--space-10)' }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: 'var(--space-3)' }}>
            Train<span style={{ color: 'var(--color-accent)' }}>Hub</span> Malaysia
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: '#7a7370', lineHeight: 'var(--leading-relaxed)', maxWidth: '280px' }}>
            Malaysia's HRDF trainer directory. Connecting companies with verified, certified training professionals.
          </p>
        </div>

        {/* Trainers */}
        <div>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7370', marginBottom: 'var(--space-4)' }}>For trainers</div>
          {['Create profile', 'Trainer dashboard', 'Pricing plans', 'How it works'].map(l => (
            <Link key={l} href="#" style={{ display: 'block', fontSize: 'var(--text-sm)', color: '#a09890', marginBottom: 'var(--space-2)' }}>{l}</Link>
          ))}
        </div>

        {/* Companies */}
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

      <div style={{ maxWidth: 'var(--max-width-content)', margin: 'var(--space-8) auto 0', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
