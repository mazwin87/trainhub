'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { marked } from 'marked'
import { Pencil, Eye, Search, Check } from 'lucide-react'

interface Props {
  initialPost?: any
  onSaved?: (id: string) => void
}

const EMPTY_POST = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'HRDF Guide',
  tags: '',
  cover_image_url: '',
  meta_title: '',
  meta_description: '',
  reading_minutes: 5,
  is_published: false,
}

const CATEGORIES = ['HRDF Guide', 'Trainer Tips', 'Industry News', 'Case Studies', 'Resources']

export function BlogEditor({ initialPost, onSaved }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title:            initialPost?.title           ?? EMPTY_POST.title,
    slug:             initialPost?.slug            ?? EMPTY_POST.slug,
    excerpt:          initialPost?.excerpt         ?? EMPTY_POST.excerpt,
    content:          initialPost?.content         ?? EMPTY_POST.content,
    category:         initialPost?.category        ?? EMPTY_POST.category,
    tags:             (initialPost?.tags ?? []).join(', '),
    cover_image_url:  initialPost?.cover_image_url ?? EMPTY_POST.cover_image_url,
    meta_title:       initialPost?.meta_title      ?? EMPTY_POST.meta_title,
    meta_description: initialPost?.meta_description ?? EMPTY_POST.meta_description,
    reading_minutes:  initialPost?.reading_minutes ?? EMPTY_POST.reading_minutes,
    is_published:     initialPost?.is_published    ?? EMPTY_POST.is_published,
  })
  const [tab, setTab] = useState<'write' | 'preview' | 'seo'>('write')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTitleChange = (title: string) => {
    update('title', title)
    if (!initialPost) {
      // Auto-generate slug from title for new posts
      const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      update('slug', slug)
    }
  }

  const estimateReadingTime = (content: string) => {
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Title, slug, and content are required' })
      return
    }

    setSaving(true)
    setMessage(null)
    const supabase = createBrowserClient()

    const data: any = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      category: form.category,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      cover_image_url: form.cover_image_url || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      reading_minutes: estimateReadingTime(form.content),
      is_published: publish !== undefined ? publish : form.is_published,
    }

    if (publish === true && !initialPost?.published_at) {
      data.published_at = new Date().toISOString()
    }

    try {
      if (initialPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(data)
          .eq('id', initialPost.id)
        if (error) throw error

        if (publish !== undefined) update('is_published', publish)
        setMessage({ type: 'success', text: publish === true ? '✓ Published!' : publish === false ? '✓ Unpublished' : '✓ Saved' })
        if (onSaved) onSaved(initialPost.id)
      } else {
        const { data: created, error } = await supabase
          .from('blog_posts')
          .insert(data)
          .select('id')
          .single() as { data: { id: string } | null; error: any }
        if (error) throw error
        setMessage({ type: 'success', text: '✓ Post created!' })
        if (created && onSaved) onSaved(created.id)
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initialPost?.id) return
    if (!confirm('Delete this post permanently?')) return

    const supabase = createBrowserClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', initialPost.id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    router.push('/admin/blog')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
            {initialPost ? 'Edit post' : 'New post'}
          </h1>
          {initialPost && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
              {form.is_published ? '✓ Published' : 'Draft'} · {form.reading_minutes} min read
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {initialPost && (
            <button onClick={handleDelete} className="btn btn-outline" style={{ color: 'var(--color-error-text)' }}>
              Delete
            </button>
          )}
          <button onClick={() => handleSave()} disabled={saving} className="btn btn-outline">
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          {!form.is_published ? (
            <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary">
              Publish
            </button>
          ) : (
            <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-outline">
              Unpublish
            </button>
          )}
        </div>
      </div>

      {message && (
        <div style={{
          padding: 'var(--space-3)',
          background: message.type === 'success' ? 'var(--color-cta-light)' : 'var(--color-error)',
          color: message.type === 'success' ? 'var(--color-cta-dark)' : 'var(--color-error-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {message.type === 'success' && <Check size={15} strokeWidth={2} />}
          {message.text.replace(/^✓\s*/, '')}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        {[
          { key: 'write',   label: 'Write',   Icon: Pencil },
          { key: 'preview', label: 'Preview', Icon: Eye },
          { key: 'seo',     label: 'SEO',     Icon: Search },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: 'var(--space-3) var(--space-5)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: tab === t.key ? 'var(--color-accent)' : 'var(--color-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: tab === t.key ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              marginBottom: '-1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <t.Icon size={14} strokeWidth={1.75} /> {t.label}
          </button>
        ))}
      </div>

      {/* WRITE TAB */}
      {tab === 'write' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="How to Claim HRDF SBL-Khas..."
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}
            />
          </div>

          <div>
            <label className="label">URL slug</label>
            <input
              className="input"
              placeholder="how-to-claim-hrdf"
              value={form.slug}
              onChange={e => update('slug', e.target.value)}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
              yoursite.com/blog/{form.slug || 'your-slug'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input className="input" placeholder="HRDF, Training, HR" value={form.tags} onChange={e => update('tags', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Cover image URL</label>
            <input className="input" placeholder="https://..." value={form.cover_image_url} onChange={e => update('cover_image_url', e.target.value)} />
          </div>

          <div>
            <label className="label">Excerpt (shown in listing)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Short summary that appears on the blog listing page..."
              value={form.excerpt}
              onChange={e => update('excerpt', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="label">Content (Markdown)</label>
            <textarea
              className="input"
              rows={25}
              placeholder={`## Heading\n\nYour content here. Use **bold**, *italic*, [links](url), and:\n\n- Bullet points\n- Like this\n\n### Subheading\n\nMore content...`}
              value={form.content}
              onChange={e => update('content', e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
              {form.content.split(/\s+/).length} words · ~{estimateReadingTime(form.content)} min read
            </p>
          </div>
        </div>
      )}

      {/* PREVIEW TAB */}
      {tab === 'preview' && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)' }}>
          {form.category && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', fontWeight: 500, marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>
              {form.category}
            </div>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', fontWeight: 500 }}>
            {form.title || 'Your title here'}
          </h1>
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="" style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)' }} />
          )}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: marked.parse(form.content || '*Nothing to preview yet*') as string }}
            style={{ fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)' }}
          />
        </div>
      )}

      {/* SEO TAB */}
      {tab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '600px' }}>
          <div>
            <label className="label">Meta title (for Google)</label>
            <input
              className="input"
              placeholder="Best HRDF Trainers in Malaysia 2026"
              value={form.meta_title}
              onChange={e => update('meta_title', e.target.value)}
              maxLength={60}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
              {form.meta_title.length}/60 characters · Leave blank to use the title
            </p>
          </div>

          <div>
            <label className="label">Meta description (for Google snippet)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="A compelling 1-2 sentence description that appears in search results..."
              value={form.meta_description}
              onChange={e => update('meta_description', e.target.value)}
              maxLength={160}
              style={{ resize: 'vertical' }}
            />
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
              {form.meta_description.length}/160 characters
            </p>
          </div>

          {/* Google preview */}
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div className="section-label">Google preview</div>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
              <p style={{ fontSize: '14px', color: '#202124', marginBottom: '4px' }}>
                yoursite.com › blog › {form.slug || 'post-slug'}
              </p>
              <h3 style={{ color: '#1a0dab', fontSize: '20px', fontWeight: 400, marginBottom: '4px', lineHeight: 1.3 }}>
                {form.meta_title || form.title || 'Your title here'}
              </h3>
              <p style={{ fontSize: '14px', color: '#4d5156', lineHeight: 1.5 }}>
                {form.meta_description || form.excerpt || 'Your description here...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}