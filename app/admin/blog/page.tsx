import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminBlogPage() {
  const supabase = await createServerClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, category, is_published, published_at, views_count, created_at')
    .order('created_at', { ascending: false }) as { data: any[] | null }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
            Blog Posts
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Manage your SEO content
          </p>
        </div>
        <Link href="/admin/blog/new" className="btn btn-primary">
          + New post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-muted)' }}>No posts yet</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/admin/blog/${post.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 120px 100px 100px',
                gap: 'var(--space-4)',
                alignItems: 'center',
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: i < posts.length - 1 ? '1px solid var(--color-border)' : 'none',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '4px' }}>
                  {post.title}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                  /{post.slug}
                </p>
              </div>
              <span className="badge badge-tag" style={{ justifySelf: 'start' }}>
                {post.category ?? 'Uncategorized'}
              </span>
              <span style={{ fontSize: 'var(--text-xs)' }}>
                {post.is_published ? (
                  <span style={{ color: 'var(--color-cta-dark)' }}>✓ Published</span>
                ) : (
                  <span style={{ color: 'var(--color-muted)' }}>Draft</span>
                )}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                {post.views_count} views
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}