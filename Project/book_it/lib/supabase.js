import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_PROJECT_URL,
    process.env.NEXT_PUBLIC_ANON_KEY
)

export default supabase
