// Cliente de Supabase simple para API routes (sin cookies)
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createApiClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
