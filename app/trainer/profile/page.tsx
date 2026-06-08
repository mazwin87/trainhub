import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProfileEditor } from './ProfileEditor'
import type { Certification } from '@/features/trainers/types/trainer'

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch existing profile
  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: any }

  // Fetch trainer's existing topics
  const { data: trainerTopics } = await supabase
    .from('trainer_topics')
    .select('topic_id, topics(id, name)')
    .eq('trainer_id', profile?.id) as { data: any[] | null }

  // Fetch user info
  const { data: userInfo } = await supabase
    .from('users')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .single() as { data: { full_name: string; email: string; avatar_url: string | null } | null }
  
  const { data: existingCerts } = await supabase
    .from('certifications')
    .select('id, trainer_id, name, issuing_body, issue_date, expiry_date, cert_file_url, is_verified')
    .eq('trainer_id', profile?.id)
    .order('created_at', { ascending: false }) as { data: Certification[] | null }

  return (
    <ProfileEditor
        userId={user.id}
        userInfo={userInfo}
        profile={profile}
        selectedTopicIds={(trainerTopics ?? []).map(t => t.topic_id)}
        certifications={existingCerts ?? []}
    />
)
}