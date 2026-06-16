import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Rate limit: simple in-memory store (use Upstash Redis in production)
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = 60_000 // 1 minute
  const limit = 5       // max 5 inquiries per minute per IP

  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + window })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const { trainer_id, contact_name, contact_email, message } = body

    // Basic validation
    if (!trainer_id || !contact_name || !contact_email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Public contact form: insert with the service-role client so the
    // submission isn't blocked by RLS (inquiries has no public-insert
    // policy by design — only trainers can read their own). This route
    // already validates the payload and rate-limits by IP.
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        trainer_id,
        contact_name,
        contact_email,
        message,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) throw error

    // TODO: send email notification via Resend (Phase 2)

    return NextResponse.json({ success: true, id: data!.id })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Failed to send inquiry.' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  // Trainer fetches their own inquiries (requires auth)
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('trainer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Trainer profile not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('trainer_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
