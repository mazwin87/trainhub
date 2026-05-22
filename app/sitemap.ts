import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/client'
import { MALAYSIAN_STATES } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai.nimonimo.tech/trainhub'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                  lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/trainers`,    lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE_URL}/blog`,        lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // Trainer profiles
  const { data: trainers } = await supabase
    .from('trainer_profiles')
    .select('slug, updated_at')
    .eq('is_published', true)
    .eq('approval_status', 'approved') as { data: { slug: string; updated_at: string }[] | null }

  const trainerPages: MetadataRoute.Sitemap = (trainers ?? []).map(t => ({
    url: `${BASE_URL}/trainers/${t.slug}`,
    lastModified: new Date(t.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Topic landing pages
  const { data: topics } = await supabase
    .from('topics')
    .select('slug, updated_at')
    .not('slug', 'is', null) as { data: { slug: string; updated_at: string }[] | null }

  const topicPages: MetadataRoute.Sitemap = (topics ?? []).filter(t => t.slug).map(t => ({
    url: `${BASE_URL}/trainers/topic/${t.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Location landing pages
  const locationPages: MetadataRoute.Sitemap = MALAYSIAN_STATES.map(s => ({
    url: `${BASE_URL}/trainers/location/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  // Blog posts (table may not be in generated types yet)
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await (supabase as any)
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true) as { data: { slug: string; updated_at: string }[] | null }
    blogPages = (posts ?? []).map(p => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch { /* blog table not yet migrated */ }

  return [...staticPages, ...trainerPages, ...topicPages, ...locationPages, ...blogPages]
}