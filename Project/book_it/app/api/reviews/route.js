import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const provider_id = searchParams.get("provider_id")

  if (!provider_id) {
    return NextResponse.json(
      { error: "provider_id is required" },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id")
    .eq("provider_id", Number(provider_id))

  if (servicesError) {
    return NextResponse.json(
      { error: servicesError.message },
      { status: 500 }
    )
  }

  const serviceIds = (services ?? []).map(service => service.id)

  if (serviceIds.length === 0) {
    return NextResponse.json({ reviews: [] })
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      booking_id,
      customer_id,
      service_id,
      rating,
      comment,
      created_at,
      customer:customer_id (id, full_name),
      service:service_id (id, title)
    `)
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(request) {
  const body = await request.json()
  const { booking_id, customer_id, rating, comment } = body

  const bookingId = Number(booking_id)
  const customerId = Number(customer_id)
  const numericRating = Number(rating)

  if (!bookingId) {
    return NextResponse.json(
      { error: "booking_id is required" },
      { status: 400 }
    )
  }

  if (!customerId) {
    return NextResponse.json(
      { error: "customer_id is required" },
      { status: 400 }
    )
  }

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    )
  }

  if (!comment?.trim()) {
    return NextResponse.json(
      { error: "Please write a review" },
      { status: 400 }
    )
  }

  const supabase = getSupabaseAdmin()

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_id, service_id, status")
    .eq("id", bookingId)
    .maybeSingle()

  if (bookingError) {
    return NextResponse.json(
      { error: bookingError.message },
      { status: 500 }
    )
  }

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    )
  }

  if (booking.customer_id !== customerId) {
    return NextResponse.json(
      { error: "This booking does not belong to this customer" },
      { status: 403 }
    )
  }

  if (booking.status !== "completed") {
    return NextResponse.json(
      { error: "Only completed bookings can be reviewed" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      customer_id: customerId,
      service_id: booking.service_id,
      rating: numericRating,
      comment: comment.trim(),
    })
    .select(`
      id,
      booking_id,
      customer_id,
      service_id,
      rating,
      comment,
      created_at,
      customer:customer_id (id, full_name),
      service:service_id (id, title)
    `)
    .single()

  if (error?.code === "23505") {
    return NextResponse.json(
      { error: "You have already reviewed this booking" },
      { status: 409 }
    )
  }

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ review: data }, { status: 201 })
}