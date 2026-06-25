import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req) {
  const { full_name, email, password, role, business_name } = await req.json()

  if (!full_name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Check for existing email
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from("users")
    .insert({
      full_name,
      email,
      password_hash,
      role,
      business_name: role === "provider" ? (business_name || null) : null,
    })
    .select("id, full_name, email, role, business_name")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
