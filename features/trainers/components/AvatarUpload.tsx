'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  currentAvatarUrl: string | null
  fullName: string
  onUploaded: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, fullName, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createBrowserClient()

      // File path: userId/avatar.{ext} — overwrites previous avatar
      const ext = file.name.split('.').pop()
      const fileName = `${userId}/avatar.${ext}`

      // Upload (upsert=true overwrites)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Add cache-bust so the new image shows immediately
      const finalUrl = `${publicUrl}?t=${Date.now()}`

      // Update user record with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: finalUrl } as any)
        .eq('id', userId)

      if (updateError) throw updateError

      setPreviewUrl(finalUrl)
      onUploaded(finalUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          background: previewUrl ? 'transparent' : 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 500,
          overflow: 'hidden',
          border: '2px solid var(--color-border)',
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          initials
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn btn-outline"
          style={{ marginBottom: '4px' }}
        >
          {uploading ? 'Uploading...' : (previewUrl ? 'Change photo' : 'Upload photo')}
        </button>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
          JPG, PNG or GIF · Max 5MB
        </p>
        {error && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-text)', marginTop: '4px' }}>
            {error}
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}