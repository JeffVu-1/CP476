"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabaseBrowser"
import s from "./page.module.scss"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)
        const supabase = getSupabaseBrowser()
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) { setError(authError.message); setLoading(false); return }
        const { data: profile } = await supabase
            .from("users").select("role").eq("id", data.user.id).single()
        router.push(profile?.role === "provider" ? "/dashboard/provider" : "/dashboard/customer")
    }

    return (
        <div className={s.page}>
            <div className={s.left}>
                <Link href="/"><div className={s.logo}>Book <span>it.</span></div></Link>
                <div className={s.copy}>
                    <h1>Welcome back.</h1>
                    <p>Log in to manage your appointments and bookings.</p>
                </div>
            </div>
            <div className={s.right}>
                <h2>Log in to your account</h2>
                <p className={s.signupPrompt}>Don&apos;t have one? <Link href="/signup">Sign up</Link></p>
                {error && <p className={s.error}>{error}</p>}
                <form className={s.form} onSubmit={handleSubmit}>
                    <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
                    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
                    <button type="submit" className={s.submit} disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
                </form>
            </div>
        </div>
    )
}
