import { createClient } from "@supabase/supabase-js"

let admin = null

export function getSupabaseAdmin() {
  if (admin) return admin
  admin = createClient(
    process.env.NEXT_PUBLIC_PROJECT_URL,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_ANON_KEY
  )
  return admin
}
