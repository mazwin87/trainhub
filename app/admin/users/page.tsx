import { createServerClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createServerClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role, avatar_url, created_at')
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const stats = {
    total:   users?.length ?? 0,
    admin:   users?.filter(u => u.role === 'admin').length ?? 0,
    trainer: users?.filter(u => u.role === 'trainer').length ?? 0,
    company: users?.filter(u => u.role === 'company').length ?? 0,
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Users
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        All registered users on the platform
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Users',  value: stats.total,   color: 'var(--color-ink)' },
          { label: 'Trainers',     value: stats.trainer, color: 'var(--color-accent)' },
          { label: 'Companies',    value: stats.company, color: 'var(--color-cta-dark)' },
          { label: 'Admins',       value: stats.admin,   color: 'var(--color-featured-text)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: s.color, fontWeight: 500 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* User list */}
      {!users || users.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>No users yet</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 2fr 1fr 1fr 120px',
              gap: 'var(--space-3)',
              alignItems: 'center',
              padding: 'var(--space-3) var(--space-5)',
              background: 'var(--color-surface-alt)',
              borderBottom: '1px solid var(--color-border)',
              fontSize: 'var(--text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-muted)',
              fontWeight: 500,
            }}
          >
            <div></div>
            <div>Name / Email</div>
            <div>Role</div>
            <div>Joined</div>
            <div style={{ textAlign: 'right' }}>ID</div>
          </div>

          {users.map((user, i) => {
            const roleColor =
              user.role === 'admin'   ? 'var(--color-featured-text)' :
              user.role === 'trainer' ? 'var(--color-accent)' :
              'var(--color-cta-dark)'

            return (
              <div
                key={user.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 1fr 1fr 120px',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', overflow: 'hidden' }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.full_name ?? '?').slice(0, 2).toUpperCase()
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {user.full_name ?? 'Unnamed'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {user.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: roleColor, fontWeight: 500, textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                  {user.id.slice(0, 8)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}