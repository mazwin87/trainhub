import { createServerClient } from '@/lib/supabase/server'
import { ApprovalActions } from './ApprovalActions'
import { CheckCircle } from 'lucide-react'

export default async function ApprovalsPage() {
  const supabase = await createServerClient()

  const { data: pending } = await supabase
    .from('trainer_profiles')
    .select(`
      id, slug, bio, tagline, hrdf_cert_number, location_state, location_city,
      created_at, user_id,
      users(full_name, email)
    `)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Pending Approvals
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Review and approve new trainer registrations
      </p>

      {!pending || pending.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-md)', color: 'var(--color-muted)' }}>
            <CheckCircle size={20} strokeWidth={1.75} style={{ color: 'var(--color-cta)' }} />
            No pending approvals
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {pending.map((trainer: any) => (
            <div key={trainer.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>
                    {trainer.users?.full_name || 'Unnamed Trainer'}
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                    {trainer.users?.email}
                  </p>
                  {trainer.hrdf_cert_number && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 'var(--space-2)' }}>
                      HRDC: {trainer.hrdf_cert_number}
                    </p>
                  )}
                </div>
                <ApprovalActions trainerId={trainer.id} hrdfCertNumber={trainer.hrdf_cert_number} />
              </div>

              {trainer.tagline && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', marginBottom: 'var(--space-2)' }}>
                  <strong>Tagline:</strong> {trainer.tagline}
                </p>
              )}

              {trainer.bio && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>
                  {trainer.bio}
                </p>
              )}

              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', marginTop: 'var(--space-3)' }}>
                Registered: {new Date(trainer.created_at).toLocaleDateString('en-MY')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}