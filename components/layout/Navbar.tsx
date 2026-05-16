'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)

  return (
    <>
      <header
        className="navbar-header"
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
        <Link
          href="/"
          onClick={close}
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}
        >
          Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 400, marginLeft: '0.35rem', fontFamily: 'var(--font-body)' }}>Malaysia</span>
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav">
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

        {/* Hamburger — mobile only */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <span className={`hamburger-icon${isOpen ? ' open' : ''}`}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={close}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <Link href="/trainers" className="mobile-menu-link" onClick={close}>
              Find trainers
            </Link>
            <Link href="/blog" className="mobile-menu-link" onClick={close}>
              Blog
            </Link>
            <div className="mobile-menu-divider" />
            <Link href="/login" className="mobile-menu-link mobile-menu-link--outlined" onClick={close}>
              Sign in
            </Link>
            <Link href="/register" className="mobile-menu-link mobile-menu-link--primary" onClick={close}>
              List your profile
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
