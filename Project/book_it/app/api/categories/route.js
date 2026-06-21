import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"

//THIS IS AN EXAMPLE OF HOW TO MAKE A BACKENDPOINT so the frontend can hit
// btw this endpoint is /api/categories -> so when you append a button in the frontend to hit this
// target /api/categories
export async function GET() {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, icon_emoji")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ categories: data })
}
