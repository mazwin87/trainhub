/* ============================================================
   SUPABASE BROWSER CLIENT
   Client-only — use in Client Components
   For Server Components / API routes, use server.ts
   ============================================================ */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/* ── Browser client (Client Components) ─────────────────── */
export function createBrowserClient() {
  return _createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/* ── Admin client (server-only — bypasses RLS) ───────────── */
export function createAdminClient() {
  return _createBrowserClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
