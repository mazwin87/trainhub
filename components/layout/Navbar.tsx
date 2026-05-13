import Link from 'next/link'

export function Navbar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-10)',
        height: 'var(--nav-height)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
        Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 400, marginLeft: '0.35rem', fontFamily: 'var(--font-body)' }}>Malaysia</span>
      </Link>

      {/* Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        <Link href="/trainers" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Find trainers
        </Link>
        <Link href="/blog" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
          Blog
        </Link>
        <Link href="/login" className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>
          Sign in
        </Link>
        <Link href="/register" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
          List your profile
        </Link>
      </nav>
    </header>
  )
}
