import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminTrainersPage() {
  const supabase = await createServerClient()

  const { data: trainers } = await supabase
    .from('trainer_profiles')
    .select(`
      id, slug, tagline, hrdf_cert_number, location_state,
      approval_status, is_published, is_verified_hrdf,
      profile_completeness, views_count, inquiry_count,
      created_at, user_id,
      users(full_name, email, avatar_url)
    `)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  const stats = {
    total:    trainers?.length ?? 0,
    pending:  trainers?.filter(t => t.approval_status === 'pending').length ?? 0,
    approved: trainers?.filter(t => t.approval_status === 'approved').length ?? 0,
    rejected: trainers?.filter(t => t.approval_status === 'rejected').length ?? 0,
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        All Trainers
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        Manage all trainer profiles on the platform
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total',    value: stats.total,    color: 'var(--color-ink)' },
          { label: 'Approved', value: stats.approved, color: 'var(--color-cta-dark)' },
          { label: 'Pending',  value: stats.pending,  color: 'var(--color-accent)' },
          { label: 'Rejected', value: stats.rejected, color: 'var(--color-error-text)' },
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

      {/* Trainer list */}
      {!trainers || trainers.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>No trainers yet</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
         {/* Header row */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '40px 2fr 1fr 100px 80px 80px',
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
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 1fr 100px 80px 80px',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                  padding: 'var(--space-4) var(--space-5)',
                  borderBottom: i < trainers.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                {/* Avatar */}
                <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', overflow: 'hidden' }}>
                  {trainer.users?.avatar_url ? (
                    <img src={trainer.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (trainer.users?.full_name ?? '?').slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Name + email */}
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {trainer.users?.full_name ?? 'Unnamed'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {trainer.users?.email}
                  </div>
                </div>

                {/* HRDF + location */}
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                    {trainer.hrdf_cert_number ?? 'No HRDF'}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                    {trainer.location_state ?? '—'}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: statusColor, fontWeight: 500, textTransform: 'capitalize' }}>
                    {trainer.approval_status}
                  </span>
                </div>

                {/* Completeness */}
                <div style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }}>
                  {trainer.profile_completeness ?? 0}%
                </div>

                {/* View link */}
                <div style={{ textAlign: 'right' }}>
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
    </div>
  )
}