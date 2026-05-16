import { createServerClient } from '@/lib/supabase/server'

export default async function AdminInquiriesPage() {
  const supabase = await createServerClient()

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      id, contact_name, contact_email, company_name, message,
      training_topic, pax_count, status, created_at,
      trainer_profiles(slug, users(full_name))
    `)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const stats = {
    total:   inquiries?.length ?? 0,
    new:     inquiries?.filter(i => i.status === 'new').length ?? 0,
    replied: inquiries?.filter(i => i.status === 'replied').length ?? 0,
    closed:  inquiries?.filter(i => i.status === 'closed').length ?? 0,
  }

  const STATUS_COLOR: Record<string, string> = {
    new: 'var(--color-accent)',
    read: 'var(--color-muted)',
    replied: 'var(--color-cta-dark)',
    closed: 'var(--color-subtle)',
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        All Inquiries
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        Every inquiry sent through the platform
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total',   value: stats.total,   color: 'var(--color-ink)' },
          { label: 'New',     value: stats.new,     color: 'var(--color-accent)' },
          { label: 'Replied', value: stats.replied, color: 'var(--color-cta-dark)' },
          { label: 'Closed',  value: stats.closed,  color: 'var(--color-subtle)' },
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

      {/* Inquiry list */}
      {!inquiries || inquiries.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>No inquiries yet</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 80px 100px',
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
            <div>From</div>
            <div>To Trainer</div>
            <div>Topic</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Date</div>
          </div>

          {inquiries.map((inq, i) => (
            <div
              key={inq.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1.5fr 80px 100px',
                gap: 'var(--space-3)',
                alignItems: 'center',
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: i < inquiries.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {inq.company_name || inq.contact_name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  {inq.contact_email}
                </div>
              </div>

              <div style={{ fontSize: 'var(--text-sm)' }}>
                {inq.trainer_profiles?.users?.full_name ?? '—'}
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                {inq.training_topic ?? '—'}
                {inq.pax_count && <div style={{ color: 'var(--color-subtle)' }}>{inq.pax_count} pax</div>}
              </div>

              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: STATUS_COLOR[inq.status], fontWeight: 500, textTransform: 'capitalize' }}>
                  {inq.status}
                </span>
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', textAlign: 'right' }}>
                {new Date(inq.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}