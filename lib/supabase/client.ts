/* ============================================================
   SUPABASE CLIENT
   Two clients:
   - createBrowserClient()  → use in Client Components
   - createServerClient()   → use in Server Components / API routes
   ============================================================ */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/* ── Browser client (Client Components) ─────────────────── */
export function createBrowserClient() {
  return _createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/* ── Server client (Server Components, Route Handlers) ───── */
export async function createServerClient() {
  const cookieStore = await cookies()
  return _createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

/* ── Admin client (server-only — bypasses RLS) ───────────── */
export function createAdminClient() {
  return _createBrowserClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
