import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from("users")
    .select("id, full_name, email, password_hash, role, business_name")
    .eq("email", email)
    .maybeSingle()

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  // Never send the hash back to the client
  const { password_hash, ...safeUser } = user
  return NextResponse.json(safeUser)
}
