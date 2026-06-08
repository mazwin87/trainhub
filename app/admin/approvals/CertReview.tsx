'use client'

/* ============================================================
   CERT REVIEW (admin) — list a trainer's certs with secure
   view (60s signed URL) + verify. Calls server actions; no cert
   file URL is ever embedded in the page.
   ============================================================ */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ShieldCheck, ExternalLink } from 'lucide-react'
import { getCertSignedUrl, verifyCertification } from './actions'
import type { Certification } from '@/features/trainers/types/trainer'

export function CertReview({ certs }: { certs: Certification[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!certs || certs.length === 0) {
    return (
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
        No certifications uploaded.
      </p>
    )
  }

  const verifiedCount = certs.filter(c => c.is_verified).length

  const handleView = async (cert: Certification) => {
    if (!cert.cert_file_url) { setError('This certification has no file attached.'); return }
    setError(null)
    setBusyId(cert.id)
    const res = await getCertSignedUrl(cert.cert_file_url)
    setBusyId(null)
    if (res.error || !res.url) { setError(res.error ?? 'Could not open file'); return }
    window.open(res.url, '_blank', 'noopener,noreferrer')
  }

  const handleVerify = async (cert: Certification) => {
    setError(null)
    setBusyId(cert.id)
    const res = await verifyCertification(cert.id)
    setBusyId(null)
    if (res.error) { setError(res.error); return }
    router.refresh()
  }

  return (
    <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>
        Certifications · {verifiedCount}/{certs.length} verified
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {certs.map(cert => (
          <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <FileText size={16} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)' }}>{cert.name}</div>
              {cert.issuing_body && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{cert.issuing_body}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleView(cert)}
              disabled={busyId === cert.id || !cert.cert_file_url}
              className="btn btn-outline"
              style={{ fontSize: 'var(--text-xs)', minHeight: 32 }}
            >
              <ExternalLink size={13} strokeWidth={2} /> View
            </button>

            {cert.is_verified ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-cta-dark)', flexShrink: 0, minWidth: 70, justifyContent: 'center' }}>
                <ShieldCheck size={14} strokeWidth={2} /> Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleVerify(cert)}
                disabled={busyId === cert.id}
                className="btn btn-cta"
                style={{ fontSize: 'var(--text-xs)', minHeight: 32, minWidth: 70 }}
              >
                {busyId === cert.id ? '…' : 'Verify'}
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-text)', marginTop: 'var(--space-2)' }}>{error}</p>
      )}
    </div>
  )
}
