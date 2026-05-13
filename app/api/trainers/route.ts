import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q       = searchParams.get('q')
  const state   = searchParams.get('state')
  const topic   = searchParams.getAll('topic')
  const verified = searchParams.get('verified') === 'true'
  const online  = searchParams.get('online') === 'true'
  const sort    = searchParams.get('sort') ?? 'rating'
  const page    = Number(searchParams.get('page') ?? 1)
  const limit   = Number(searchParams.get('limit') ?? 12)

  try {
    const supabase = await createServerClient()

    let query = supabase
      .from('trainer_profiles')
      .select(`
        id, slug, tagline, avatar_url, location_state, location_city,
        is_online, is_offline, is_verified_hrdf, is_featured,
        pricing_mode, pricing_from, pricing_to, whatsapp_number,
        avg_rating, review_count, years_experience,
        users!inner(full_name),
        trainer_topics(topics(id, name, slug))
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('approval_status', 'approved')

    if (verified) query = query.eq('is_verified_hrdf', true)
    if (online)   query = query.eq('is_online', true)
    if (state)    query = query.eq('location_state', state)
    if (q)        query = query.textSearch('search_vector', q)

    switch (sort) {
      case 'reviews':    query = query.order('review_count', { ascending: false }); break
      case 'experience': query = query.order('years_experience', { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('avg_rating', { ascending: false })
    }

    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    })
  } catch (err) {
    console.error('Trainers API error:', err)
    return NextResponse.json({ error: 'Failed to fetch trainers' }, { status: 500 })
  }
}
