'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Hourglass,
  MessageSquare,
  FileText,
  Settings,
  ExternalLink,
  LineChart
} from 'lucide-react'

interface Props {
  userName: string
}

const NAV_ITEMS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/admin',           label: 'Dashboard',         Icon: LayoutDashboard },
  { href: '/admin/trainers',  label: 'All Trainers',      Icon: Users },
  { href: '/admin/approvals', label: 'Pending Approvals', Icon: Hourglass },
  { href: '/admin/inquiries', label: 'Inquiries',         Icon: MessageSquare },
  { href: '/admin/blog',      label: 'Blog Posts',        Icon: FileText },
  { href: '/admin/search-trends',  label: 'Search Trends',     Icon: LineChart },  // ← NEW
  { href: '/admin/users',     label: 'Users',             Icon: Settings },
  { href: '/',                label: 'View site',         Icon: ExternalLink, external: true },
]

export function AdminSidebar({ userName }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className={`admin-sidebar ${menuOpen ? 'menu-open' : ''}`}>
      {/* Mobile header with hamburger */}
      <div className="admin-sidebar-mobile-header">
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>
          Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Brand */}
      <div className="admin-sidebar-brand" style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
        </Link>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px', fontWeight: 500 }}>ADMIN CONTROL</p>
      </div>

      {/* User info */}
      <div className="admin-sidebar-user" style={{ padding: 'var(--space-6)', background: 'linear-gradient(135deg, var(--color-accent-light) 0%, rgba(193, 125, 60, 0.05) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{ background: 'var(--color-accent)', color: 'white', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>{userName}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500 }}>👑 Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href
          const Icon = item.Icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                background: isActive ? 'var(--color-accent-light)' : 'transparent',
                borderRight: isActive ? '3px solid var(--color-accent)' : 'none',
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
              }}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Logout */}
      <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
        <button
          onClick={handleLogout}
          className="admin-sidebar-logout"
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s ease',
          }}
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  )
}