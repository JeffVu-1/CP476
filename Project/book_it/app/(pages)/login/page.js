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

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single()

        router.push(profile?.role === "provider" ? "/dashboard/provider" : "/dashboard/customer")
    }

    async function handleGoogle() {
        const supabase = getSupabaseBrowser()
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    async function handleApple() {
        const supabase = getSupabaseBrowser()
        await supabase.auth.signInWithOAuth({
            provider: "apple",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
    }

    return (
        <div className={s.page}>
            {/* ── LEFT ── */}
            <div className={s.left}>
                <Link href="/"><div className={s.logo}>Book <span>it.</span></div></Link>

                <div className={s.copy}>
                    <h1>Get appointments<br />at your fingertips.</h1>
                    <p>Join thousands of customers who book plumbers, groomers, cleaners, and more — all from one place.</p>
                    <ul className={s.perks}>
                        >⊙ Real-time availability</li>
                        >⊙ Free cancellation up to 24h</li>
                        >⊙ One profile, every service</li>
                    </ul>
                </div>

                <p className={s.testimonial}>&ldquo;Booked a plumber in 30 seconds.&rdquo; — Sarah K.</p>
            </div>

            {/* ── RIGHT ── */}
            <div className={s.right}>
                <h2>Log in to your account</h2>
                <p className={s.loginPrompt}>
                    Don&apos;t have one? <Link href="/signup">Sign up</Link>
                </p>

                {error && <p className={s.error}>{error}</p>}

                <form className={s.form} onSubmit={handleSubmit}>
                    abel>
                        Email
                        <input
                            type="email"
                            placeholder="jane@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    abel>
                        Password
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" className={s.submit} disabled={loading}>
                        {loading ? "Logging in…" : "Log in"}
                    </button>
                </form>

                <div className={s.divider}><span>OR</span></div>

                <div className={s.oauthGroup}>
                    <button type="button" className={s.oauthBtn} onClick={handleGoogle}>
                        Continue with Google
                    </button>
                    <button type="button" className={s.oauthBtn} onClick={handleApple}>
                        Continue with Apple
                    </button>
                </div>

                <p className={s.terms}>
                    By signing in, you agree to our{" "}
                    <Link href="#">Terms of Service</Link> and{" "}
                    <Link href="#">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    )
}
