'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase/client'

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const close = () => setIsOpen(false)

  useEffect(() => {
    const supabase = createBrowserClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setAuthReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    close()
    router.push('/')
    router.refresh()
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Account'
  const dashboardHref = user?.user_metadata?.role === 'admin' ? '/admin' : '/trainer/dashboard'

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
          background: 'linear-gradient(135deg, var(--color-accent-dark) 0%, var(--color-secondary) 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--z-sticky)',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={close}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.35rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: '#fff',
          }}
        >
          Train<span style={{ color: '#E8C3A6' }}>Hub</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 400, marginLeft: '0.35rem', fontFamily: 'var(--font-body)' }}>
            Malaysia
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="main-nav">
          <Link
            href="/trainers"
            style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
          >
            Find trainers
          </Link>
          <Link
            href="/blog"
            style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', transition: 'color 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
          >
            Blog
          </Link>

          {/* Auth state — hidden until Supabase resolves to avoid flicker */}
          {authReady && (
            user ? (
              <>
                {/* Account chip — avatar + name links to the dashboard */}
                <Link
                  href={dashboardHref}
                  title="Go to your dashboard"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1.05rem',
                    color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.55)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.3rem 1rem 0.3rem 0.35rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'
                  }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    {firstName[0].toUpperCase()}
                  </span>
                  {firstName}
                </Link>
                <button
                  onClick={handleSignOut}
                  style={{
                    fontSize: '1.05rem',
                    color: 'rgba(255,255,255,0.75)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.4rem 0.5rem',
                    transition: 'color 0.3s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    fontSize: '1.1rem',
                    color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.55)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.45rem 1.25rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                    e.currentTarget.style.borderColor = '#fff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--color-accent-dark)',
                    background: '#fff',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.45rem 1.25rem',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--color-accent-light)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  List your profile
                </Link>
              </>
            )
          )}
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          style={{ background: 'transparent' }}
        >
          <span className={`hamburger-icon${isOpen ? ' open' : ''}`}>
            <span style={{ background: '#fff' }} />
            <span style={{ background: '#fff' }} />
            <span style={{ background: '#fff' }} />
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

            {authReady && (
              user ? (
                <>
                  <div style={{ padding: '0.8rem var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                    Signed in as <strong style={{ color: 'var(--color-ink)' }}>{firstName}</strong>
                  </div>
                  <Link href={dashboardHref} className="mobile-menu-link mobile-menu-link--outlined" onClick={close}>
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.8rem var(--space-3)',
                      fontSize: 'var(--text-base)',
                      color: '#A32D2D',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)',
                      minHeight: 48,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="mobile-menu-link mobile-menu-link--outlined" onClick={close}>
                    Sign in
                  </Link>
                  <Link href="/register" className="mobile-menu-link mobile-menu-link--primary" onClick={close}>
                    List your profile
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </>
  )
}
