import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { createServerClient } from '@/lib/supabase/server'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, meta_title, meta_description, cover_image_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: any }

  if (!post) return { title: 'Post not found' }

  return {
    title: post.meta_title ?? post.title,
    description: post.meta_description ?? post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, users(full_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single() as { data: any }

  if (!post) notFound()

  const html = DOMPurify.sanitize(await marked.parse(post.content))
  const authorName = post.users?.full_name ?? 'TrainHub Team'

  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--space-10) var(--space-6) var(--space-16)' }}>

      <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
        ← All posts
      </Link>

      {post.category && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {post.category}
        </div>
      )}

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 500, lineHeight: 'var(--leading-tight)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
        {post.title}
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="avatar avatar-sm" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
          {authorName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{authorName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            {new Date(post.published_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.reading_minutes} min read
          </div>
        </div>
      </div>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt={post.title}
          style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)' }}
        />
      )}

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-ink)' }}
      />

      {/* CTA */}
      <div style={{ marginTop: 'var(--space-12)', padding: 'var(--space-8)', background: 'var(--color-accent-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          Looking for an HRDC trainer?
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
          Browse 500+ verified, HRDC-certified trainers across Malaysia.
        </p>
        <Link href="/trainers" className="btn btn-primary">
          Find a trainer →
        </Link>
      </div>
    </article>
  )
}