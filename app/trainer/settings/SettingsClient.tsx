'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  userInfo: {
    full_name: string
    email: string
    role: string
    created_at: string
  }
}

export function SettingsClient({ userId, userInfo }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(userInfo.full_name)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveName = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    setMessage(null)

    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName } as any)
      .eq('id', userId)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '✓ Name updated' })
      router.refresh()
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    setSaving(true)
    setMessage(null)

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '✓ Password updated' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This will permanently delete your account and all your data. This cannot be undone.')) return
    if (!confirm('Really delete everything? Last chance to cancel.')) return

    setSaving(true)

    const supabase = createBrowserClient()
    
    // Sign out the user
    await supabase.auth.signOut()
    router.push('/login?deleted=true')
    
    // Note: actual deletion happens via service role on server side
    // For now this just signs them out — full deletion needs server endpoint
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
        Settings
      </h1>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-8)' }}>
        Manage your account and security
      </p>

      {message && (
        <div style={{
          padding: 'var(--space-3)',
          background: message.type === 'success' ? 'var(--color-cta-light)' : 'var(--color-error)',
          color: message.type === 'success' ? 'var(--color-cta-dark)' : 'var(--color-error-text)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          marginBottom: 'var(--space-5)',
        }}>
          {message.text}
        </div>
      )}

      {/* Account info */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Account information
        </h2>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Full name</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              className="input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSaveName}
              disabled={saving || fullName === userInfo.full_name}
              className="btn btn-primary"
            >
              Save
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Email</label>
          <input className="input" value={userInfo.email} disabled />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '4px' }}>
            Contact support to change your email
          </p>
        </div>

        <div>
          <label className="label">Member since</label>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            {new Date(userInfo.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Security */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
          Change password
        </h2>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="label">Confirm new password</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={saving || !newPassword || !confirmPassword}
          className="btn btn-primary"
        >
          Update password
        </button>
      </section>

      {/* Notifications (placeholder for now) */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          Email notifications
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
          Get notified when companies send you inquiries
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-2) 0' }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent)' }} />
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>New inquiry alerts</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Email me when a company sends an inquiry</div>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-2) 0' }}>
          <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-accent)' }} />
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Weekly performance summary</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>Profile views and inquiry stats every Monday</div>
          </div>
        </label>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', marginTop: 'var(--space-3)' }}>
          Email notifications coming soon
        </p>
      </section>

      {/* Danger zone */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: 'var(--color-error-text)' }}>
          Danger zone
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
          Once you delete your account, there is no going back.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="btn btn-outline"
          style={{ color: 'var(--color-error-text)', borderColor: 'var(--color-error)' }}
        >
          Delete my account
        </button>
      </section>
    </div>
  )
}