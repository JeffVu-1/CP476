import { createBrowserClient } from "@supabase/ssr"
let client = null
export function getSupabaseBrowser() {
    if (client) return client
    client = createBrowserClient(
        process.env.NEXT_PUBLIC_PROJECT_URL,
        process.env.NEXT_PUBLIC_ANON_KEY
    )
    return client
}
