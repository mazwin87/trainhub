import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { trainer_id, rating, title, body } = await req.json()

    if (!trainer_id || !rating || !title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Auth check via session cookie (optional — anonymous reviews allowed)
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()

    // Use admin client to bypass RLS for all DB operations
    const admin = createAdminClient()

    // Prevent duplicate reviews from the same logged-in user
    if (user) {
      const { data: existing } = await admin
        .from('reviews')
        .select('id')
        .eq('trainer_id', trainer_id)
        .eq('reviewer_user_id', user.id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this trainer' }, { status: 409 })
      }
    }

    const { error } = await admin.from('reviews').insert({
      trainer_id,
      rating,
      title: title.trim(),
      body: body.trim(),
      reviewer_user_id: user?.id ?? null,
      is_approved: false,
    })

    if (error) {
      console.error('Review insert error:', error)
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Review API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
