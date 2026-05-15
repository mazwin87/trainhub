import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai.nimonimo.tech/trainhub'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerClient()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/trainers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const { data: trainers } = await supabase
    .from('trainer_profiles')
    .select('slug, updated_at')
    .eq('is_published', true)
    .eq('approval_status', 'approved') as { data: { slug: string; updated_at: string }[] | null }

  const trainerPages: MetadataRoute.Sitemap = (trainers ?? []).map(t => ({
    url: `${BASE_URL}/trainers/${t.slug}`,
    lastModified: new Date(t.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true) as { data: { slug: string; updated_at: string }[] | null }

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...trainerPages, ...blogPages]
}