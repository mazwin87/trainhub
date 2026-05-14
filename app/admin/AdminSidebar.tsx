'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  userName: string
}

const NAV_ITEMS = [
  { href: '/admin', label: '📊 Dashboard', icon: '📊' },
  { href: '/admin/trainers', label: '👥 All Trainers', icon: '👥' },
  { href: '/admin/approvals', label: '✓ Pending Approvals', icon: '✓' },
  { href: '/admin/inquiries', label: '📬 Inquiries', icon: '📬' },
  { href: '/admin/users', label: '⚙️ Users', icon: '⚙️' },
]

export function AdminSidebar({ userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', padding: 'var(--space-6) 0', display: 'flex', flexDirection: 'column' }}>

      {/* Brand */}
      <div style={{ padding: '0 var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
          Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
        </Link>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>Admin Panel</p>
      </div>

      {/* User info */}
      <div style={{ padding: '0 var(--space-6) var(--space-6)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
        <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{userName}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Administrator</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                borderRight: isActive ? '3px solid var(--color-accent)' : 'none',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          margin: 'var(--space-4) var(--space-6)',
          padding: 'var(--space-3)',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-muted)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        Sign out
      </button>
    </aside>
  )
}