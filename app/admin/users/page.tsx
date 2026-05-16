import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

const PER_PAGE = 20

interface SearchParams {
  q?: string
  role?: string
  page?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const role = params.role ?? 'all'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = await createServerClient()

  let query = supabase
    .from('users')
    .select('id, full_name, email, role, avatar_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  query = query.range(from, to)

  const { data: rawUsers, count } = await query as { data: any[] | null; count: number | null }

  const users = q
    ? (rawUsers ?? []).filter(u => {
        const haystack = `${u.full_name ?? ''} ${u.email ?? ''}`.toLowerCase()
        return haystack.includes(q.toLowerCase())
      })
    : (rawUsers ?? [])

  const { data: allForCount } = await supabase
    .from('users')
    .select('role') as { data: { role: string }[] | null }

  const stats = {
    all:     allForCount?.length ?? 0,
    trainer: allForCount?.filter(u => u.role === 'trainer').length ?? 0,
    company: allForCount?.filter(u => u.role === 'company').length ?? 0,
    admin:   allForCount?.filter(u => u.role === 'admin').length ?? 0,
  }

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const next = { ...params, ...overrides }
    const sp = new URLSearchParams()
    if (next.q) sp.set('q', next.q)
    if (next.role && next.role !== 'all') sp.set('role', next.role)
    if (next.page && next.page !== '1') sp.set('page', next.page)
    const qs = sp.toString()
    return qs ? `/admin/users?${qs}` : '/admin/users'
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Users
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        {count ?? 0} total · Page {page} of {totalPages || 1}
      </p>

      <form action="/admin/users" method="GET" style={{ marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          name="q"
          placeholder="Search by name or email..."
          defaultValue={q}
          className="input"
          style={{ maxWidth: '480px' }}
        />
        {role !== 'all' && <input type="hidden" name="role" value={role} />}
      </form>

      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'all',     label: `All (${stats.all})` },
          { key: 'trainer', label: `Trainers (${stats.trainer})` },
          { key: 'company', label: `Companies (${stats.company})` },
          { key: 'admin',   label: `Admins (${stats.admin})` },
        ].map(f => {
          const isActive = role === f.key
          return (
            <Link
              key={f.key}
              href={buildUrl({ role: f.key, page: '1' })}
              style={{
                padding: '0.4rem 0.95rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid',
                borderColor: isActive ? 'var(--color-ink)' : 'var(--color-border)',
                background: isActive ? 'var(--color-ink)' : 'var(--color-surface)',
                color: isActive ? '#fff' : 'var(--color-muted)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {users.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            {q ? `No users matching "${q}"` : 'No users in this category'}
          </p>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header" style={{ gridTemplateColumns: '40px 2fr 1fr 1fr 120px' }}>
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
                className="admin-table-row"
                style={{
                  gridTemplateColumns: '40px 2fr 1fr 1fr 120px',
                  borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div className="avatar avatar-sm admin-cell-avatar" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', overflow: 'hidden' }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (user.full_name ?? '?').slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="admin-cell-name">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {user.full_name ?? 'Unnamed'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {user.email}
                  </div>
                </div>

                <div className="admin-cell-meta">
                  <span className="admin-cell-label">Role · </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: roleColor, fontWeight: 500, textTransform: 'capitalize' }}>
                    {user.role}
                  </span>
                </div>

                <div className="admin-cell-status">
                  <span className="admin-cell-label">Joined · </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="admin-cell-complete" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                  <span className="admin-cell-label">ID · </span>
                  {user.id.slice(0, 8)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)', alignItems: 'center' }}>
          <Link
            href={buildUrl({ page: String(Math.max(1, page - 1)) })}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: page === 1 ? 'var(--color-subtle)' : 'var(--color-ink)',
              pointerEvents: page === 1 ? 'none' : 'auto',
              textDecoration: 'none',
              background: 'var(--color-surface)',
            }}
          >
            ← Previous
          </Link>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', padding: '0 var(--space-3)' }}>
            Page <strong>{page}</strong> of {totalPages}
          </span>
          <Link
            href={buildUrl({ page: String(Math.min(totalPages, page + 1)) })}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: page === totalPages ? 'var(--color-subtle)' : 'var(--color-ink)',
              pointerEvents: page === totalPages ? 'none' : 'auto',
              textDecoration: 'none',
              background: 'var(--color-surface)',
            }}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  )
}