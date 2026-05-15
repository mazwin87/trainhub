import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'HRDF Training Insights & Guides',
  description: 'Expert articles on HRDF claims, training trends, and corporate development in Malaysia.',
}

export const revalidate = 3600

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_image_url: string | null
  category: string | null
  published_at: string
  reading_minutes: number
}

export default async function BlogPage() {
  const supabase = await createServerClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, category, published_at, reading_minutes')
    .eq('is_published', true)
    .order('published_at', { ascending: false }) as { data: BlogPost[] | null }

  return (
    <div style={{ maxWidth: 'var(--max-width-content)', margin: '0 auto', padding: 'var(--space-12) var(--space-10)' }}>

      <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'inline-block', background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 500, padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', marginBottom: 'var(--space-4)' }}>
          The TrainHub Blog
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 500, marginBottom: 'var(--space-3)', letterSpacing: '-0.02em' }}>
          HRDF Training Insights
        </h1>
        <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', maxWidth: '520px', margin: '0 auto' }}>
          Expert guides on HRDF claims, training trends, and building a learning culture in Malaysia
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-muted)' }}>
          <p style={{ fontSize: 'var(--text-md)' }}>No posts yet — check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          {posts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              style={{ display: 'block', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all var(--transition-base)', textDecoration: 'none' }}
            >
              {post.cover_image_url && (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: 'var(--space-5)' }}>
                {post.category && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500, marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {post.category}
                  </div>
                )}
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500, marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-tight)' }}>
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-body)', marginBottom: 'var(--space-3)' }}>
                    {post.excerpt}
                  </p>
                )}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
                  {new Date(post.published_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.reading_minutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}