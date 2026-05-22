import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { HrdfToggle } from './HrdfToggle'

const PER_PAGE = 20

interface SearchParams {
  q?: string
  status?: string
  page?: string
}

export default async function AdminTrainersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const status = params.status ?? 'all'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = await createServerClient()

  // Build query
  let query = supabase
    .from('trainer_profiles')
    .select(`
      id, slug, hrdf_cert_number, location_state,
      approval_status, is_published, is_verified_hrdf, profile_completeness,
      created_at, user_id,
      users(full_name, email, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // Status filter
  if (status !== 'all') {
    query = query.eq('approval_status', status)
  }

  // Pagination
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  query = query.range(from, to)

  const { data: rawTrainers, count } = await query as { data: any[] | null; count: number | null }

  // Search filter — client-side (Supabase doesn't easily search joined columns)
  const trainers = q
    ? (rawTrainers ?? []).filter(t => {
        const haystack = `${t.users?.full_name ?? ''} ${t.users?.email ?? ''} ${t.hrdf_cert_number ?? ''} ${t.location_state ?? ''}`.toLowerCase()
        return haystack.includes(q.toLowerCase())
      })
    : (rawTrainers ?? [])

  // Get total counts for status filter (separate from filtered query)
  const { data: allForCount } = await supabase
    .from('trainer_profiles')
    .select('approval_status') as { data: { approval_status: string }[] | null }

  const stats = {
    all:      allForCount?.length ?? 0,
    approved: allForCount?.filter(t => t.approval_status === 'approved').length ?? 0,
    pending:  allForCount?.filter(t => t.approval_status === 'pending').length ?? 0,
    rejected: allForCount?.filter(t => t.approval_status === 'rejected').length ?? 0,
  }

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const next = { ...params, ...overrides }
    const sp = new URLSearchParams()
    if (next.q) sp.set('q', next.q)
    if (next.status && next.status !== 'all') sp.set('status', next.status)
    if (next.page && next.page !== '1') sp.set('page', next.page)
    const qs = sp.toString()
    return qs ? `/admin/trainers?${qs}` : '/admin/trainers'
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        All Trainers
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        {count ?? 0} total · Page {page} of {totalPages || 1}
      </p>

      {/* Search */}
      <form action="/admin/trainers" method="GET" style={{ marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          name="q"
          placeholder="Search by name, email, HRDF cert, or state..."
          defaultValue={q}
          className="input"
          style={{ maxWidth: '480px' }}
        />
        {status !== 'all' && <input type="hidden" name="status" value={status} />}
      </form>

      {/* Status filter pills */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'all',      label: `All (${stats.all})` },
          { key: 'approved', label: `Approved (${stats.approved})` },
          { key: 'pending',  label: `Pending (${stats.pending})` },
          { key: 'rejected', label: `Rejected (${stats.rejected})` },
        ].map(f => {
          const isActive = status === f.key
          return (
            <Link
              key={f.key}
              href={buildUrl({ status: f.key, page: '1' })}
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

      {/* Trainer list */}
      {trainers.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            {q ? `No trainers matching "${q}"` : 'No trainers in this category'}
          </p>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header">
            <div></div>
            <div>Trainer</div>
            <div>HRDF / Location</div>
            <div>Status</div>
            <div style={{ textAlign: 'center' }}>Complete</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          {trainers.map((trainer, i) => {
            const statusColor =
              trainer.approval_status === 'approved' ? 'var(--color-cta-dark)' :
              trainer.approval_status === 'rejected' ? 'var(--color-error-text)' :
              'var(--color-accent)'

            return (
              <div
                key={trainer.id}
                className="admin-table-row"
                style={{ borderBottom: i < trainers.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <div className="avatar avatar-sm admin-cell-avatar" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', overflow: 'hidden' }}>
                  {trainer.users?.avatar_url ? (
                    <img src={trainer.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (trainer.users?.full_name ?? '?').slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="admin-cell-name">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {trainer.users?.full_name ?? 'Unnamed'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {trainer.users?.email}
                  </div>
                </div>

                <div className="admin-cell-meta">
                  <span className="admin-cell-label">HRDF · </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {trainer.hrdf_cert_number ?? 'No HRDF'} · {trainer.location_state ?? '—'}
                  </span>
                </div>

                <div className="admin-cell-status">
                  <span className="admin-cell-label">Status · </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: statusColor, fontWeight: 500, textTransform: 'capitalize' }}>
                    {trainer.approval_status}
                  </span>
                </div>

                <div className="admin-cell-complete" style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
                  <span className="admin-cell-label">Complete · </span>
                  {trainer.profile_completeness ?? 0}%
                </div>

                <div className="admin-cell-action" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  {trainer.approval_status === 'approved' && (
                    <HrdfToggle trainerId={trainer.id} isVerified={!!trainer.is_verified_hrdf} />
                  )}
                  {trainer.is_published && (
                    <Link
                      href={`/trainers/${trainer.slug}`}
                      target="_blank"
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
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