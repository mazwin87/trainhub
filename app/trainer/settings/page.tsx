import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { SettingsClient } from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userInfo } = await supabase
    .from('users')
    .select('full_name, email, role, created_at')
    .eq('id', user.id)
    .single() as { data: any }

  return <SettingsClient userId={user.id} userInfo={userInfo} />
}