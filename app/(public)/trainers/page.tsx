import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { TrainerCard } from '@/features/trainers/components'
import { FilterBarClient } from '@/features/search/components/FilterBarClient'
import type { TrainerCard as TrainerCardType, TrainerSearchFilters } from '@/features/trainers/types'
import { MALAYSIAN_STATES } from '@/types'

export const metadata: Metadata = {
  title: 'Find HRDF Trainers in Malaysia',
  description: 'Search and filter 500+ verified HRDF-certified trainers by topic, state, language, and budget.',
}

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getTrainers(filters: TrainerSearchFilters): Promise<{ data: TrainerCardType[]; total: number }> {
  try {
    const supabase = await createServerClient()

    let query = supabase
      .from('trainer_profiles')
      .select(`
        id, slug, tagline, location_state, location_city,
        is_online, is_offline, is_verified_hrdf, is_featured,
        pricing_mode, pricing_from, pricing_to, whatsapp_number,
        avg_rating, review_count, years_experience,
        user_id,
        users(full_name),
        trainer_topics(topics(id, name, slug))
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('approval_status', 'approved')

    if (filters.verified)   query = query.eq('is_verified_hrdf', true)
    if (filters.top_rated)  query = query.gte('avg_rating', 4.8)
    if (filters.online)     query = query.eq('is_online', true)
    if (filters.offline)    query = query.eq('is_offline', true)
    if (filters.state)      query = query.eq('location_state', filters.state)
    if (filters.min_price)  query = query.gte('pricing_from', filters.min_price)
    if (filters.max_price)  query = query.lte('pricing_to', filters.max_price)
    if (filters.q)          query = query.textSearch('search_vector', filters.q)

    // Language filter: resolve trainer IDs that speak the selected languages
    if (filters.languages && filters.languages.length > 0) {
      const { data: langRows } = await supabase
        .from('trainer_languages')
        .select('trainer_id')
        .in('language', filters.languages)
      const trainerIds = [...new Set((langRows ?? []).map((r: any) => r.trainer_id))]
      if (trainerIds.length > 0) {
        query = query.in('id', trainerIds)
      } else {
        return { data: [], total: 0 }
      }
    }

    switch (filters.sort) {
      case 'reviews':     query = query.order('review_count', { ascending: false }); break
      case 'experience':  query = query.order('years_experience', { ascending: false }); break
      case 'newest':      query = query.order('created_at', { ascending: false }); break
      case 'price_asc':   query = query.order('pricing_from', { ascending: true }); break
      default:            query = query.order('avg_rating', { ascending: false })
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 12
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, count, error } = await query
    if (error) console.error('Supabase error:', JSON.stringify(error))

    return { data: (data ?? []) as unknown as TrainerCardType[], total: count ?? 0 }
  } catch (err) {
    console.error('getTrainers exception:', err)
    return { data: [], total: 0 }
  }
}

async function logSearch(query: string, state: string | undefined) {
  try {
    const supabase = await createServerClient()
    await (supabase as any).from('search_logs').insert({ query: query.trim().toLowerCase(), state: state || null })
  } catch { /* silently ignore */ }
}

export default async function TrainersPage({ searchParams }: PageProps) {
  const params = await searchParams

  const rawLangs = params.language
  const languages = rawLangs ? (Array.isArray(rawLangs) ? rawLangs : [rawLangs]) : undefined

  const filters: TrainerSearchFilters = {
    q:         typeof params.q === 'string' ? params.q : undefined,
    state:     typeof params.state === 'string' ? params.state : undefined,
    topics:    params.topic ? (Array.isArray(params.topic) ? params.topic : [params.topic]) : undefined,
    languages,
    verified:  params.verified === 'true',
    top_rated: params.top === 'true',
    online:    params.online === 'true',
    offline:   params.offline === 'true',
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    sort:      (params.sort as TrainerSearchFilters['sort']) ?? 'rating',
    page:      params.page ? Number(params.page) : 1,
    limit:     12,
  }

  if (filters.q && filters.q.trim().length >= 2) {
    logSearch(filters.q, filters.state)
  }

  const { data: trainers, total } = await getTrainers(filters)
  const activeTopic = filters.topics?.[0] ?? 'All topics'

  const page = filters.page ?? 1
  const limit = filters.limit ?? 12
  const totalPages = Math.ceil(total / limit)

  // Build a URL with updated page, preserving all other params
  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    if (filters.q)         sp.set('q', filters.q)
    if (filters.state)     sp.set('state', filters.state)
    if (filters.topics?.[0]) sp.set('topic', filters.topics[0])
    if (filters.verified)  sp.set('verified', 'true')
    if (filters.top_rated) sp.set('top', 'true')
    if (filters.online)    sp.set('online', 'true')
    if (filters.offline)   sp.set('offline', 'true')
    if (filters.min_price) sp.set('min_price', String(filters.min_price))
    if (filters.max_price) sp.set('max_price', String(filters.max_price))
    if (filters.sort && filters.sort !== 'rating') sp.set('sort', filters.sort)
    filters.languages?.forEach(l => sp.append('language', l))
    sp.set('page', String(p))
    return `/trainers?${sp.toString()}`
  }

  return (
    <div
      className="dir-wrapper"
      style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-8) var(--space-10)' }}
    >

      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 500 }}>Trainer directory</h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', background: 'var(--color-surface-alt)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>
          {total.toLocaleString()} trainer{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + sort row */}
      <form method="GET" className="search-row" style={{ marginBottom: 'var(--space-5)' }}>
        {/* Preserve hidden filter state across search submissions */}
        {filters.verified  && <input type="hidden" name="verified" value="true" />}
        {filters.top_rated && <input type="hidden" name="top" value="true" />}
        {filters.online    && <input type="hidden" name="online" value="true" />}
        {filters.offline   && <input type="hidden" name="offline" value="true" />}
        {filters.topics?.[0] && <input type="hidden" name="topic" value={filters.topics[0]} />}
        {filters.languages?.map(l => <input key={l} type="hidden" name="language" value={l} />)}

        <input
          name="q"
          defaultValue={filters.q}
          className="input"
          placeholder="Search by name, topic, or course…"
          style={{
            flex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b6560' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0.85rem center',
            paddingLeft: '2.5rem',
          }}
        />
        <select name="state" defaultValue={filters.state ?? ''} className="input" style={{ width: 'auto' }}>
          <option value="">All states</option>
          {MALAYSIAN_STATES.map(s => (
            <option key={s.slug} value={s.name}>{s.name}</option>
          ))}
        </select>
        <select name="sort" defaultValue={filters.sort ?? 'rating'} className="input" style={{ width: 'auto' }}>
          <option value="rating">Sort: Top rated</option>
          <option value="reviews">Most reviews</option>
          <option value="experience">Most experience</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Topic filter bar */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBarClient activeTopic={activeTopic} />
      </div>

      {/* Layout: sidebar + grid */}
      <div className="dir-layout">

        {/* Filter sidebar */}
        <aside>
          <form method="GET">
            {/* Preserve search + sort + topic across filter changes */}
            {filters.q       && <input type="hidden" name="q" value={filters.q} />}
            {filters.state   && <input type="hidden" name="state" value={filters.state} />}
            {filters.topics?.[0] && <input type="hidden" name="topic" value={filters.topics[0]} />}
            {filters.sort && filters.sort !== 'rating' && <input type="hidden" name="sort" value={filters.sort} />}

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>

              <div className="section-label">Verification</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', minHeight: '28px' }}>
                <input type="checkbox" name="verified" value="true" defaultChecked={filters.verified} style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                HRDF verified
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', minHeight: '28px' }}>
                <input type="checkbox" name="top" value="true" defaultChecked={filters.top_rated} style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                Top rated (4.8+)
              </label>

              <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Delivery</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', minHeight: '28px' }}>
                <input type="checkbox" name="online" value="true" defaultChecked={filters.online} style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                Online
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', minHeight: '28px' }}>
                <input type="checkbox" name="offline" value="true" defaultChecked={filters.offline} style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                Offline / On-site
              </label>

              <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Language</div>
              {['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'].map(lang => (
                <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer', minHeight: '28px' }}>
                  <input type="checkbox" name="language" value={lang} defaultChecked={filters.languages?.includes(lang)} style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px', flexShrink: 0 }} />
                  {lang}
                </label>
              ))}

              <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Budget (MYR/day)</div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <input
                  className="input"
                  name="min_price"
                  type="number"
                  placeholder="Min"
                  defaultValue={filters.min_price}
                  style={{ padding: '0.5rem 0.6rem', fontSize: 'var(--text-xs)', minHeight: '40px' }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', flexShrink: 0 }}>to</span>
                <input
                  className="input"
                  name="max_price"
                  type="number"
                  placeholder="Max"
                  defaultValue={filters.max_price}
                  style={{ padding: '0.5rem 0.6rem', fontSize: 'var(--text-xs)', minHeight: '40px' }}
                />
              </div>

              <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-2)' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontSize: 'var(--text-xs)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <SlidersHorizontal size={13} strokeWidth={2} /> Apply
                </button>
                <Link href="/trainers" className="btn btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.5rem 0.75rem' }}>
                  Clear
                </Link>
              </div>
            </div>
          </form>
        </aside>

        {/* Results grid */}
        <div>
          {trainers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-muted)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <Search size={40} strokeWidth={1.25} style={{ opacity: 0.35 }} />
              </div>
              <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)', color: 'var(--color-ink)' }}>No trainers found</p>
              <p style={{ fontSize: 'var(--text-sm)' }}>Try adjusting your filters or search term.</p>
              <Link href="/trainers" className="btn btn-outline" style={{ marginTop: 'var(--space-5)', display: 'inline-block' }}>
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className="dir-grid">
                {trainers.map(t => <TrainerCard key={t.id} trainer={t} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
                  {page > 1 && (
                    <Link href={pageUrl(page - 1)} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>
                      ← Previous
                    </Link>
                  )}
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', padding: '0 var(--space-2)' }}>
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link href={pageUrl(page + 1)} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)' }}>
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
