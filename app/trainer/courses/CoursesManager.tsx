'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string | null
  duration_hours: number | null
  delivery_mode: string
  is_hrdf_claimable: boolean
  price_per_pax: number | null
  topic_id: string | null
  topics?: { id: string; name: string }
}

interface Props {
  trainerId: string
  initialCourses: Course[]
  topics: { id: string; name: string }[]
}

const EMPTY_FORM = {
  title: '',
  description: '',
  duration_hours: '',
  delivery_mode: 'hybrid',
  is_hrdf_claimable: true,
  price_per_pax: '',
  topic_id: '',
}

export function CoursesManager({ trainerId, initialCourses, topics }: Props) {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  const startEdit = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description ?? '',
      duration_hours: course.duration_hours?.toString() ?? '',
      delivery_mode: course.delivery_mode,
      is_hrdf_claimable: course.is_hrdf_claimable,
      price_per_pax: course.price_per_pax?.toString() ?? '',
      topic_id: course.topic_id ?? '',
    })
    setEditingId(course.id)
    setShowForm(true)
    setError(null)
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createBrowserClient()

    const data = {
      trainer_id: trainerId,
      title: form.title,
      description: form.description || null,
      duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
      delivery_mode: form.delivery_mode,
      is_hrdf_claimable: form.is_hrdf_claimable,
      price_per_pax: form.price_per_pax ? Number(form.price_per_pax) : null,
      topic_id: form.topic_id || null,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('courses')
          .update(data as any)
          .eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(data as any)
        if (error) throw error
      }

      // Refresh
      router.refresh()
      setShowForm(false)
      setEditingId(null)

      // Optimistic UI update
      const { data: refreshed } = await supabase
        .from('courses')
        .select('*, topics(id, name)')
        .eq('trainer_id', trainerId)
        .order('created_at', { ascending: false })

      setCourses((refreshed as Course[]) ?? [])
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete this course?')) return

    const supabase = createBrowserClient()
    const { error } = await supabase.from('courses').delete().eq('id', courseId)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setCourses(prev => prev.filter(c => c.id !== courseId))
    router.refresh()
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
            My courses
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Add courses you can deliver. HRDF-claimable courses get featured priority.
          </p>
        </div>
        {!showForm && (
          <button onClick={startNew} className="btn btn-primary">
            + Add course
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
            {editingId ? 'Edit course' : 'New course'}
          </h3>

          {error && (
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-error)', color: 'var(--color-error-text)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Course title *</label>
            <input className="input" placeholder="High-Impact Leadership Program" value={form.title} onChange={e => update('title', e.target.value)} />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Brief description of what participants will learn and outcomes..."
              value={form.description}
              onChange={e => update('description', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div>
              <label className="label">Duration (hours)</label>
              <input className="input" type="number" placeholder="16" value={form.duration_hours} onChange={e => update('duration_hours', e.target.value)} />
            </div>
            <div>
              <label className="label">Delivery mode</label>
              <select className="input" value={form.delivery_mode} onChange={e => update('delivery_mode', e.target.value)}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="label">Price per pax (MYR)</label>
              <input className="input" type="number" placeholder="1500" value={form.price_per_pax} onChange={e => update('price_per_pax', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Topic</label>
            <select className="input" value={form.topic_id} onChange={e => update('topic_id', e.target.value)}>
              <option value="">Select topic (optional)</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_hrdf_claimable} onChange={e => update('is_hrdf_claimable', e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} />
            HRDF claimable
          </label>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={handleSave} disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : (editingId ? 'Update course' : 'Add course')}
            </button>
            <button onClick={cancel} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* LIST */}
      {courses.length === 0 && !showForm ? (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-12)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-muted)', marginBottom: 'var(--space-2)' }}>No courses yet</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-subtle)', marginBottom: 'var(--space-4)' }}>
            Add your first course to start receiving inquiries
          </p>
          <button onClick={startNew} className="btn btn-primary">+ Add your first course</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {courses.map(course => (
            <div key={course.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 500 }}>
                  {course.title}
                </h3>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button onClick={() => startEdit(course)} className="btn btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.3rem 0.7rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="btn btn-outline" style={{ fontSize: 'var(--text-xs)', padding: '0.3rem 0.7rem', color: 'var(--color-error-text)' }}>
                    Delete
                  </button>
                </div>
              </div>

              {course.description && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-3)' }}>
                  {course.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {course.topics && (
                  <span className="badge badge-tag">{course.topics.name}</span>
                )}
                {course.duration_hours && (
                  <span className="badge badge-tag">⏱ {course.duration_hours}h</span>
                )}
                <span className="badge badge-tag">🖥 {course.delivery_mode}</span>
                {course.price_per_pax && (
                  <span className="badge badge-tag">RM {course.price_per_pax}/pax</span>
                )}
                {course.is_hrdf_claimable && (
                  <span className="badge badge-hrdf">✓ HRDF claimable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}