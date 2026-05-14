import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { InquiryInbox } from './InquiryInbox'

export default async function InquiriesPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }

  if (!profile) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Complete your profile first.</p>
      </div>
    )
  }

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('trainer_id', profile.id)
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return <InquiryInbox initialInquiries={inquiries ?? []} />
}