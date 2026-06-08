'use client'

/* ============================================================
   CERT MANAGER — trainer-side certification CRUD with file upload
   Files go to the PRIVATE `certificates` bucket at ${userId}/<file>
   (first folder MUST be auth.uid() to satisfy storage RLS).
   The certifications row stores the PATH in cert_file_url and links
   trainer_id → trainer_profiles.id.
   ============================================================ */

import { useState, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Certification } from '@/features/trainers/types/trainer'
import { ShieldCheck, FileText, Trash2, Plus } from 'lucide-react'

interface Props {
  trainerId: string // trainer_profiles.id (FK target for certifications.trainer_id)
  userId: string    // auth.uid() — MUST be the first folder in the storage path (RLS)
  initialCerts: Certification[]
}

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

const EMPTY = { name: '', issuing_body: '', issue_date: '', expiry_date: '' }

export function CertManager({ trainerId, userId, initialCerts }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [certs, setCerts] = useState<Certification[]>(initialCerts)
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof EMPTY, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleAdd = async () => {
    setError(null)
    if (!form.name.trim()) { setError('Certification name is required'); return }
    if (!file) { setError('Please attach the certificate file (PDF or image)'); return }
    if (!ACCEPTED.includes(file.type)) { setError('File must be a PDF or image (PNG/JPG/WEBP)'); return }
    if (file.size > MAX_BYTES) { setError('File too large. Max 10MB.'); return }

    setBusy(true)
    try {
      const supabase = createBrowserClient()

      // First path folder MUST equal auth.uid() or the storage RLS policy rejects it.
      const safe = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const path = `${userId}/${Date.now()}-${safe}`

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(path, file, { upsert: false, cacheControl: '3600' })
      if (uploadError) throw uploadError

      // Insert the row — trainer_id is trainer_profiles.id, NOT the auth user id.
      const { data, error: insertError } = await supabase
        .from('certifications')
        .insert({
          trainer_id: trainerId,
          name: form.name.trim(),
          issuing_body: form.issuing_body.trim() || null,
          issue_date: form.issue_date || null,
          expiry_date: form.expiry_date || null,
          cert_file_url: path,
          is_verified: false,
        } as any)
        .select('id, trainer_id, name, issuing_body, issue_date, expiry_date, cert_file_url, is_verified')
        .single() as { data: Certification | null; error: any }

      if (insertError) {
        // roll back the orphaned upload so storage doesn't accumulate junk
        await supabase.storage.from('certificates').remove([path])
        throw insertError
      }

      if (data) setCerts(prev => [data, ...prev])
      setForm(EMPTY)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (cert: Certification) => {
    if (!confirm(`Remove "${cert.name}"?`)) return
    setError(null)
    setBusy(true)
    try {
      const supabase = createBrowserClient()
      // Remove the private file first (no-op if there's no path), then the row.
      if (cert.cert_file_url) {
        await supabase.storage.from('certificates').remove([cert.cert_file_url])
      }
      const { error: delError } = await supabase.from('certifications').delete().eq('id', cert.id)
      if (delError) throw delError
      setCerts(prev => prev.filter(c => c.id !== cert.id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {/* Existing certs */}
      {certs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {certs.map(cert => (
            <div key={cert.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', background: 'var(--color-bg)',
            }}>
              <FileText size={18} strokeWidth={1.75} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {cert.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  {[cert.issuing_body, cert.issue_date].filter(Boolean).join(' · ') || (cert.cert_file_url ? 'File attached' : 'No file')}
                </div>
              </div>
              {cert.is_verified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-cta-dark)', flexShrink: 0 }}>
                  <ShieldCheck size={14} strokeWidth={2} /> Verified
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(cert)}
                disabled={busy}
                aria-label={`Remove ${cert.name}`}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'inline-flex', flexShrink: 0 }}
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div style={{ border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>Certification name *</label>
            <input className="input" placeholder="HRDC Certified Trainer" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>Issuing body</label>
            <input className="input" placeholder="HRD Corp Malaysia" value={form.issuing_body} onChange={e => set('issuing_body', e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>Issue date</label>
            <input className="input" type="date" value={form.issue_date} onChange={e => set('issue_date', e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: 'var(--text-xs)' }}>Expiry date</label>
            <input className="input" type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}
        />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
          PDF or image · Max 10MB · Stored privately, visible only to you and TrainHub admins.
        </p>

        {error && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-text)', marginBottom: 'var(--space-3)' }}>{error}</p>
        )}

        <button type="button" onClick={handleAdd} disabled={busy} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>
          <Plus size={15} strokeWidth={2} /> {busy ? 'Uploading…' : 'Add certification'}
        </button>
      </div>
    </div>
  )
}
