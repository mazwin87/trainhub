'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export function OAuthButtons() {
  const [loading, setLoading] = useState<'google' | 'linkedin' | null>(null)

  async function signInWith(provider: 'google' | 'linkedin_oidc') {
    const label = provider === 'google' ? 'google' : 'linkedin'
    setLoading(label as any)
    const supabase = createBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <button
        type="button"
        onClick={() => signInWith('google')}
        disabled={loading !== null}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: 'var(--space-3) var(--space-4)',
          background: '#fff',
          border: '1px solid #dadce0',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          color: '#3c4043',
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          opacity: loading !== null ? 0.7 : 1,
          transition: 'box-shadow 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <GoogleIcon />
        {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <button
        type="button"
        onClick={() => signInWith('linkedin_oidc')}
        disabled={loading !== null}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: 'var(--space-3) var(--space-4)',
          background: '#0A66C2',
          border: '1px solid #0A66C2',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          color: '#fff',
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          opacity: loading !== null ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <LinkedInIcon />
        {loading === 'linkedin' ? 'Redirecting…' : 'Continue with LinkedIn'}
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="18" height="18" rx="2" fill="white" fillOpacity="0.15"/>
      <path d="M4.5 7H6.5V13.5H4.5V7ZM5.5 6C4.948 6 4.5 5.552 4.5 5C4.5 4.448 4.948 4 5.5 4C6.052 4 6.5 4.448 6.5 5C6.5 5.552 6.052 6 5.5 6Z" fill="white"/>
      <path d="M8 7H9.9V7.9C10.2 7.3 11 7 11.8 7C13.6 7 14 8.2 14 9.8V13.5H12V10.2C12 9.5 12 8.7 11.1 8.7C10.2 8.7 10 9.4 10 10.1V13.5H8V7Z" fill="white"/>
    </svg>
  )
}
