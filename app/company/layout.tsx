import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/company/saved')

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-8) var(--space-10)' }}>
      {children}
    </div>
  )
}
