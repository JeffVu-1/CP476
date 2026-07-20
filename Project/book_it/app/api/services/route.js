import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const provider_id = searchParams.get("provider_id")

    const supabase = getSupabaseAdmin()

    let query = supabase
        .from("services")
        .select(`*, provider:provider_id (id, full_name, business_name), category:category_id (id, name, icon_emoji)`)
        .order("created_at", { ascending: true })

    if (provider_id) query = query.eq("provider_id", provider_id)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ services: data })
}

export async function POST(request) {
    const body = await request.json()
    const { provider_id, category_id, title, description, price, duration_minutes, delivery_mode } = body
    if (!provider_id)       return NextResponse.json({ error: "provider_id is required" }, { status: 400 })
    if (!category_id)       return NextResponse.json({ error: "category is required" }, { status: 400 })
    if (!title?.trim())     return NextResponse.json({ error: "title is required" }, { status: 400 })
    if (!price)             return NextResponse.json({ error: "price is required" }, { status: 400 })
    if (!duration_minutes)  return NextResponse.json({ error: "duration is required" }, { status: 400 })
    if (!delivery_mode)     return NextResponse.json({ error: "delivery_mode is required" }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from("services")
        .insert({ provider_id: Number(provider_id), category_id: Number(category_id), title: title.trim(), description: description?.trim() || null, price: parseFloat(price), duration_minutes: parseInt(duration_minutes), delivery_mode,})
        .select()
        .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ service: data }, { status: 201 })
}
