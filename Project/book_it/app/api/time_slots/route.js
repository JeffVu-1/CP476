import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const service_id = searchParams.get("service_id")
    if (!service_id) return NextResponse.json({ error: "service_id is required" }, { status: 400 })

    const today = new Date().toISOString().split("T")[0]
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from("time_slots")
        .select("id, slot_date, start_time")
        .eq("service_id", service_id)
        .eq("is_booked", false)
        .gte("slot_date", today)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Group by date: { "2026-07-21": ["09:00:00", ...], ... }
    const byDate = {}
    for (const row of data) {
        if (!byDate[row.slot_date]) byDate[row.slot_date] = []
        byDate[row.slot_date].push({ id: row.id, time: row.start_time })
    }
    return NextResponse.json({ byDate })
}

export async function POST(request) {
    const body = await request.json()
    const { service_id, duration_minutes, hours, weeks_ahead = 4 } = body
    if (!service_id)       return NextResponse.json({ error: "service_id is required" }, { status: 400 })
    if (!duration_minutes) return NextResponse.json({ error: "duration_minutes is required" }, { status: 400 })
    if (!hours)            return NextResponse.json({ error: "hours is required" }, { status: 400 })
    const slots = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const totalDays = weeks_ahead * 7
    for (let offset = 0; offset < totalDays; offset++) {
        const date = new Date(today)
        date.setDate(today.getDate() + offset)
        const dayName   = DAY_NAMES[date.getDay()]
        const dayConfig = hours[dayName]
        if (!dayConfig?.open) continue
        const [fromH, fromM] = dayConfig.from.split(":").map(Number)
        const [toH, toM]     = dayConfig.to.split(":").map(Number)
        const startMin = fromH * 60 + fromM
        const endMin   = toH   * 60 + toM
        for (let m = startMin; m + duration_minutes <= endMin; m += duration_minutes) {
            const h       = Math.floor(m / 60)
            const min     = m % 60
            const timeStr = `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}:00`
            const dateStr = date.toISOString().split("T")[0]

            slots.push({ service_id, slot_date: dateStr, start_time: timeStr, is_booked: false })
        }
    }

    if (slots.length === 0) {
        return NextResponse.json({ message: "No open days selected — no slots generated.", count: 0 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from("time_slots")
        .insert(slots)
        .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ count: data.length }, { status: 201 })
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url)
    const service_id = searchParams.get("service_id")
    if (!service_id) return NextResponse.json({ error: "service_id is required" }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
        .from("time_slots")
        .delete()
        .eq("service_id", service_id)
        .eq("is_booked", false)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
