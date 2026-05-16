'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  userName: string
  completeness: number
  approvalStatus: string
}

const NAV_ITEMS = [
  { href: '/trainer/dashboard', label: '📊 Dashboard' },
  { href: '/trainer/profile',   label: '👤 My Profile' },
  { href: '/trainer/courses',   label: '📚 Courses' },
  { href: '/trainer/inquiries', label: '📬 Inquiries' },
  { href: '/trainer/analytics', label: '📈 Analytics' },
  { href: '/trainer/settings',  label: '⚙️ Settings' },
]

export function TrainerSidebar({ userName, completeness, approvalStatus }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="trainer-sidebar">      
      <div style={{ padding: '0 var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-ink)' }}>
          Train<span style={{ color: 'var(--color-accent)' }}>Hub</span>
        </Link>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>Trainer Portal</p>
      </div>

      <div style={{ padding: '0 var(--space-6) var(--space-5)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
        <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{userName}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: approvalStatus === 'approved' ? 'var(--color-cta-dark)' : 'var(--color-accent)', textTransform: 'capitalize' }}>
          {approvalStatus}
        </p>

        <div style={{ marginTop: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: '4px' }}>
            <span>Profile completeness</span>
            <span style={{ color: 'var(--color-cta)', fontWeight: 500 }}>{completeness}%</span>
          </div>
          <div style={{ height: '5px', background: 'var(--color-surface-alt)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completeness}%`, background: 'var(--color-cta)', borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      <nav>
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