'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { AuthUser } from '../types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', authUser.id)
          .single()
        setUser(data as unknown as AuthUser)
      }
      setLoading(false)
    }

    getUser()
  }, [])

  return { user, loading }
}