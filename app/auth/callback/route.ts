import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/client'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  const cookieStore = await cookies()

  const supabase = _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('OAuth callback error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login?error=oauth_failed`)

  // Upsert into public.users — admin client bypasses RLS
  const admin = createAdminClient()

  const { data: existingUser } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!existingUser) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email!.split('@')[0]

    await admin.from('users').insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      role: 'trainer',
    } as any)
  }

  const role = existingUser?.role ?? 'trainer'
  if (role === 'admin') return NextResponse.redirect(`${origin}/admin`)

  // Redirect based on trainer profile status
  const { data: profile } = await admin
    .from('trainer_profiles')
    .select('approval_status')
    .eq('user_id', user.id)
    .single()

  if (profile?.approval_status === 'approved') {
    return NextResponse.redirect(`${origin}/trainer/dashboard`)
  }
  if (profile) {
    return NextResponse.redirect(`${origin}/trainer/pending`)
  }
  // New OAuth user with no trainer profile yet — send to dashboard to complete setup
  return NextResponse.redirect(`${origin}/trainer/dashboard`)
}
