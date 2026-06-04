/* ============================================================
   SUPABASE BROWSER CLIENT
   Client-only — use in Client Components
   For Server Components / API routes, use server.ts
   For admin/service-role access, use admin.ts
   ============================================================ */

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowserClient() {
  return _createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
