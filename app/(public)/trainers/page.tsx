import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { TrainerCard } from '@/features/trainers/components'
import { FilterBarClient } from '@/features/search/components/FilterBarClient'
import type { TrainerCard as TrainerCardType, TrainerSearchFilters } from '@/features/trainers/types'
import { MALAYSIAN_STATES, TRAINER_TOPICS } from '@/types'

export const metadata: Metadata = {
  title: 'Find HRDF Trainers in Malaysia',
  description: 'Search and filter 500+ verified HRDF-certified trainers by topic, state, language, and budget.',
}

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getTrainers(filters: TrainerSearchFilters): Promise<{ data: TrainerCardType[]; total: number }> {
  console.log('🔍 getTrainers called with filters:', filters)
  
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

    if (filters.verified) query = query.eq('is_verified_hrdf', true)
    if (filters.online)   query = query.eq('is_online', true)
    if (filters.offline)  query = query.eq('is_offline', true)
    if (filters.state)    query = query.eq('location_state', filters.state)
    if (filters.min_price) query = query.gte('pricing_from', filters.min_price)
    if (filters.max_price) query = query.lte('pricing_to', filters.max_price)
    if (filters.q)         query = query.textSearch('search_vector', filters.q)

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
    
    if (error) {
      console.error('❌ SUPABASE ERROR:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Query OK — count:', count, 'rows:', data?.length)
    }
    
    return { data: (data ?? []) as unknown as TrainerCardType[], total: count ?? 0 }
  } catch (err) {
    console.error('❌ EXCEPTION:', err)
    return { data: [], total: 0 }
  }
}

export default async function TrainersPage({ searchParams }: PageProps) {
  const params = await searchParams

  const filters: TrainerSearchFilters = {
    q:        typeof params.q === 'string' ? params.q : undefined,
    state:    typeof params.state === 'string' ? params.state : undefined,
    topics:   params.topic ? (Array.isArray(params.topic) ? params.topic : [params.topic]) : undefined,
    verified: params.verified === 'true',
    online:   params.online === 'true',
    sort:     (params.sort as TrainerSearchFilters['sort']) ?? 'rating',
    page:     params.page ? Number(params.page) : 1,
    limit:    12,
  }

  const { data: trainers, total } = await getTrainers(filters)
  const activeTopic = filters.topics?.[0] ?? 'All topics'

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-8) var(--space-10)' }}>

      {/* Page heading */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 500 }}>Trainer directory</h1>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', background: 'var(--color-surface-alt)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)' }}>
          {total.toLocaleString()} trainer{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + sort row */}
      <form method="GET" style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <input
          name="q"
          defaultValue={filters.q}
          className="input"
          placeholder="Search by name, topic, or course…"
          style={{ flex: 1, minWidth: '200px', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b6560' stroke-width='2' viewBox='0 0 24 24'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: '0.85rem center', paddingLeft: '2.5rem' }}
        />
        <select
          name="state"
          defaultValue={filters.state}
          className="input"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="">All states</option>
          {MALAYSIAN_STATES.map(s => (
            <option key={s.slug} value={s.name}>{s.name}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={filters.sort}
          className="input"
          style={{ width: 'auto', minWidth: '160px' }}
        >
          <option value="rating">Sort: Top rated</option>
          <option value="reviews">Most reviews</option>
          <option value="experience">Most experience</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {/* Topic filter bar (client component) */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <FilterBarClient activeTopic={activeTopic} />
      </div>

      {/* Layout: sidebar + grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-6)' }}>

        {/* Filter sidebar */}
        <aside>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', position: 'sticky', top: '80px' }}>

            <div className="section-label">Verification</div>
            {[
              { label: 'HRDF verified', name: 'verified' },
              { label: 'Top rated (4.8+)', name: 'top' },
            ].map(f => (
              <label key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer' }}>
                <input type="checkbox" name={f.name} style={{ accentColor: 'var(--color-accent)' }} />
                {f.label}
              </label>
            ))}
            <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Delivery</div>
            {[
              { label: 'Online', name: 'online' },
              { label: 'Offline / On-site', name: 'offline' },
            ].map(f => (
              <label key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer' }}>
                <input type="checkbox" name={f.name} style={{ accentColor: 'var(--color-accent)' }} />
                {f.label}
              </label>
            ))}

            <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Language</div>
            {['English', 'Bahasa Malaysia', 'Mandarin', 'Tamil'].map(lang => (
              <label key={lang} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', cursor: 'pointer' }}>
                <input type="checkbox" name="language" value={lang} style={{ accentColor: 'var(--color-accent)' }} />
                {lang}
              </label>
            ))}

            <div className="section-label" style={{ marginTop: 'var(--space-4)' }}>Budget (MYR/day)</div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <input className="input" name="min_price" type="number" placeholder="Min" defaultValue={filters.min_price} style={{ padding: '0.4rem 0.6rem', fontSize: 'var(--text-xs)' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>to</span>
              <input className="input" name="max_price" type="number" placeholder="Max" defaultValue={filters.max_price} style={{ padding: '0.4rem 0.6rem', fontSize: 'var(--text-xs)' }} />
            </div>
          </div>
        </aside>

        {/* Results grid */}
        <div>
          {trainers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-muted)' }}>
              <p style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>No trainers found</p>
              <p style={{ fontSize: 'var(--text-sm)' }}>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
              {trainers.map(t => <TrainerCard key={t.id} trainer={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


