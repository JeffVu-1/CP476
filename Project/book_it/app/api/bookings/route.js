import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request) {
    const body = await request.json()
    const { customer_id, service_id, time_slot_id } = body
    if (!customer_id)  return NextResponse.json({ error: "customer_id is required" }, { status: 400 })
    if (!service_id)   return NextResponse.json({ error: "service_id is required" }, { status: 400 })
    if (!time_slot_id) return NextResponse.json({ error: "time_slot_id is required" }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Verify slot is still available
    const { data: slot, error: slotErr } = await supabase
        .from("time_slots")
        .select("id, is_booked")
        .eq("id", time_slot_id)
        .single()

    if (slotErr || !slot) return NextResponse.json({ error: "Time slot not found" }, { status: 404 })
    if (slot.is_booked)   return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 })

    // Create the booking
    const { data: booking, error: bookErr } = await supabase
        .from("bookings")
        .insert({ customer_id, service_id, time_slot_id, status: "pending" })
        .select()
        .single()

    if (bookErr) return NextResponse.json({ error: bookErr.message }, { status: 500 })

    // Mark slot as booked
    await supabase.from("time_slots").update({ is_booked: true }).eq("id", time_slot_id)

    return NextResponse.json({ booking }, { status: 201 })
}

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const booking_id  = searchParams.get("booking_id")
    const provider_id = searchParams.get("provider_id")
    const customer_id = searchParams.get("customer_id")
    const week        = searchParams.get("week") // "2026-07-20"

    const supabase = getSupabaseAdmin()

    // Customer bookings list
    if (customer_id) {
        const { data, error } = await supabase
            .from("bookings")
            .select(`*, service:service_id (id, title, duration_minutes, price, provider:provider_id (id, full_name, business_name)), time_slot:time_slot_id (slot_date, start_time)`)
            .eq("customer_id", customer_id)
            .order("created_at", { ascending: false })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ bookings: data ?? [] })
    }

    // Single booking lookup
    if (booking_id) {
        const { data, error } = await supabase
            .from("bookings")
            .select(`*, service:service_id (id, title, duration_minutes, price, provider:provider_id (id, full_name, business_name)), time_slot:time_slot_id (slot_date, start_time), customer:customer_id (id, full_name, email)`)
            .eq("id", booking_id)
            .single()
        if (error) return NextResponse.json({ error: error.message }, { status: 404 })
        return NextResponse.json({ booking: data })
    }

    // Provider — all bookings (no week filter)
    if (provider_id && !week) {
        const { data: services } = await supabase
            .from("services").select("id").eq("provider_id", provider_id)
        if (!services || services.length === 0) return NextResponse.json({ bookings: [] })
        const serviceIds = services.map(s => s.id)
        const { data, error } = await supabase
            .from("bookings")
            .select(`*, service:service_id (id, title, duration_minutes, price), time_slot:time_slot_id (slot_date, start_time), customer:customer_id (id, full_name, email)`)
            .in("service_id", serviceIds)
            .order("created_at", { ascending: false })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ bookings: data ?? [] })
    }

    // Provider calendar view
    if (provider_id && week) {
        const monday = new Date(week + "T00:00:00")
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        const weekStart = monday.toISOString().split("T")[0]
        const weekEnd   = sunday.toISOString().split("T")[0]

        // Get provider's service IDs first
        const { data: services } = await supabase
            .from("services")
            .select("id")
            .eq("provider_id", provider_id)

        if (!services || services.length === 0) return NextResponse.json({ bookings: [] })
        const serviceIds = services.map(s => s.id)

        // Get time_slot IDs in this week range first
        const { data: slots } = await supabase
            .from("time_slots")
            .select("id")
            .in("service_id", serviceIds)
            .gte("slot_date", weekStart)
            .lte("slot_date", weekEnd)

        const slotIds = (slots ?? []).map(s => s.id)
        if (slotIds.length === 0) return NextResponse.json({ bookings: [] })

        const { data, error } = await supabase
            .from("bookings")
            .select(`*, service:service_id (id, title, duration_minutes), time_slot:time_slot_id (slot_date, start_time), customer:customer_id (id, full_name)`)
            .in("time_slot_id", slotIds)
            .neq("status", "cancelled")

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ bookings: data ?? [] })
    }

    return NextResponse.json({ error: "booking_id or provider_id+week required" }, { status: 400 })
}

export async function PATCH(request) {
    const body = await request.json()
    const { id, status } = body
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If cancelled, free the time slot back up
    if (status === "cancelled") {
        const booking = data
        if (booking?.time_slot_id) {
            await supabase.from("time_slots").update({ is_booked: false }).eq("id", booking.time_slot_id)
        }
    }

    return NextResponse.json({ booking: data })
}
