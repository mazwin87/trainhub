'use server'

/* ============================================================
   ADMIN CERT ACTIONS
   Server-only. Both actions run with the ADMIN's authenticated
   session (createServerClient) and re-check role server-side —
   never trust the client. We do NOT use the service-role client
   or make the bucket public; cert files are PDPA-sensitive.
   ============================================================ */

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/** Resolve the current session and assert admin. Returns the session client. */
async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (!profile || profile.role !== 'admin') return { error: 'Forbidden' as const }
  return { supabase }
}

/**
 * Generate a short-lived (60s) signed URL for a stored cert PATH.
 * Uses the admin's session, so the storage admin-SELECT RLS policy grants access.
 */
export async function getCertSignedUrl(
  path: string,
): Promise<{ url?: string; error?: string }> {
  if (!path) return { error: 'Missing file path' }
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  const { data, error } = await guard.supabase.storage
    .from('certificates')
    .createSignedUrl(path, 60)

  if (error || !data?.signedUrl) return { error: error?.message ?? 'Could not create signed URL' }
  return { url: data.signedUrl }
}

/**
 * Mark a single certification as verified (is_verified = true).
 * This is the granular, per-document truth. It deliberately does NOT
 * flip trainer_profiles.is_verified_hrdf — the public HRDC badge stays a
 * separate, explicit admin decision in ApprovalActions.
 */
export async function verifyCertification(
  certId: string,
): Promise<{ ok?: boolean; error?: string }> {
  if (!certId) return { error: 'Missing certification id' }
  const guard = await requireAdmin()
  if ('error' in guard) return { error: guard.error }

  const { data, error } = await guard.supabase
    .from('certifications')
    .update({ is_verified: true } as any)
    .eq('id', certId)
    .select('id') as { data: { id: string }[] | null; error: any }

  if (error) return { error: error.message }
  // RLS can succeed with 0 rows updated — surface that instead of a silent no-op.
  if (!data || data.length === 0) {
    return { error: 'No certification updated (check admin UPDATE policy on certifications).' }
  }

  revalidatePath('/admin/approvals')
  return { ok: true }
}
