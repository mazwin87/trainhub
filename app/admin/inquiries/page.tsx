import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

const PER_PAGE = 20

interface SearchParams {
  q?: string
  status?: string
  page?: string
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const status = params.status ?? 'all'
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const supabase = await createServerClient()

  let query = supabase
    .from('inquiries')
    .select(`
      id, contact_name, contact_email, company_name, training_topic,
      pax_count, status, created_at,
      trainer_profiles(slug, users(full_name))
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  query = query.range(from, to)

  const { data: rawInq, count } = await query as { data: any[] | null; count: number | null }

  const inquiries = q
    ? (rawInq ?? []).filter(i => {
        const haystack = `${i.contact_name ?? ''} ${i.contact_email ?? ''} ${i.company_name ?? ''} ${i.training_topic ?? ''}`.toLowerCase()
        return haystack.includes(q.toLowerCase())
      })
    : (rawInq ?? [])

  const { data: allForCount } = await supabase
    .from('inquiries')
    .select('status') as { data: { status: string }[] | null }

  const stats = {
    all:     allForCount?.length ?? 0,
    new:     allForCount?.filter(i => i.status === 'new').length ?? 0,
    replied: allForCount?.filter(i => i.status === 'replied').length ?? 0,
    closed:  allForCount?.filter(i => i.status === 'closed').length ?? 0,
  }

  const totalPages = Math.ceil((count ?? 0) / PER_PAGE)

  const STATUS_COLOR: Record<string, string> = {
    new:     'var(--color-accent)',
    read:    'var(--color-muted)',
    replied: 'var(--color-cta-dark)',
    closed:  'var(--color-subtle)',
  }

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const next = { ...params, ...overrides }
    const sp = new URLSearchParams()
    if (next.q) sp.set('q', next.q)
    if (next.status && next.status !== 'all') sp.set('status', next.status)
    if (next.page && next.page !== '1') sp.set('page', next.page)
    const qs = sp.toString()
    return qs ? `/admin/inquiries?${qs}` : '/admin/inquiries'
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        All Inquiries
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        {count ?? 0} total · Page {page} of {totalPages || 1}
      </p>

      <form action="/admin/inquiries" method="GET" style={{ marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          name="q"
          placeholder="Search by name, email, company, or topic..."
          defaultValue={q}
          className="input"
          style={{ maxWidth: '480px' }}
        />
        {status !== 'all' && <input type="hidden" name="status" value={status} />}
      </form>

      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'all',     label: `All (${stats.all})` },
          { key: 'new',     label: `New (${stats.new})` },
          { key: 'replied', label: `Replied (${stats.replied})` },
          { key: 'closed',  label: `Closed (${stats.closed})` },
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

      {inquiries.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>
            {q ? `No inquiries matching "${q}"` : 'No inquiries in this category'}
          </p>
        </div>
      ) : (
        <div className="admin-table">
          <div className="admin-table-header" style={{ gridTemplateColumns: '2fr 2fr 1.5fr 80px 100px' }}>
            <div>From</div>
            <div>To Trainer</div>
            <div>Topic</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Date</div>
          </div>

          {inquiries.map((inq, i) => (
            <div
              key={inq.id}
              className="admin-table-row"
              style={{
                gridTemplateColumns: '2fr 2fr 1.5fr 80px 100px',
                borderBottom: i < inquiries.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div className="admin-cell-name">
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {inq.company_name || inq.contact_name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  {inq.contact_email}
                </div>
              </div>

              <div className="admin-cell-meta" style={{ fontSize: 'var(--text-sm)' }}>
                <span className="admin-cell-label">To · </span>
                {inq.trainer_profiles?.users?.full_name ?? '—'}
              </div>

              <div className="admin-cell-status" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                <span className="admin-cell-label">Topic · </span>
                {inq.training_topic ?? '—'}
                {inq.pax_count && <span style={{ color: 'var(--color-subtle)' }}> · {inq.pax_count} pax</span>}
              </div>

              <div className="admin-cell-complete">
                <span className="admin-cell-label">Status · </span>
                <span style={{ fontSize: 'var(--text-xs)', color: STATUS_COLOR[inq.status], fontWeight: 500, textTransform: 'capitalize' }}>
                  {inq.status}
                </span>
              </div>

              <div className="admin-cell-action" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textAlign: 'right' }}>
                <span className="admin-cell-label">Date · </span>
                {new Date(inq.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
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