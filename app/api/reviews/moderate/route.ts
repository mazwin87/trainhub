import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  try {
    const { reviewId, trainerId, action } = await req.json()

    if (!reviewId || !trainerId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'approve') {
      // Mark approved
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Recompute aggregate from all approved reviews for this trainer
      const { data: approved } = await supabase
        .from('reviews')
        .select('rating')
        .eq('trainer_id', trainerId)
        .eq('is_approved', true)

      const ratings = (approved ?? []).map((r: any) => r.rating as number)
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

      await supabase
        .from('trainer_profiles')
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          review_count: ratings.length,
        })
        .eq('id', trainerId)

    } else {
      // Reject: mark as explicitly rejected (is_approved = false, already set for pending)
      // Delete the review entirely to keep the table clean
      await supabase.from('reviews').delete().eq('id', reviewId)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Moderate API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
