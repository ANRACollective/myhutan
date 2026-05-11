import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Server-side client uses the service role key for trusted server contexts,
// or anon key for public-read routes. Never expose the service key to the client.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
