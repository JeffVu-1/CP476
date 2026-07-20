"use client"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { setUser } from "@/lib/auth"
import s from "./page.module.scss"

export default function LoginPage() {
    return <Suspense><LoginContent /></Suspense>
}

function LoginContent() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const redirect     = searchParams.get("redirect")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { data } = await axios.post("/api/auth/login", { email, password })
            setUser(data)
            router.push(redirect || (data.role === "provider" ? "/business/dashboard" : "/browse"))
        } catch (err) {
            setError(err.response?.data?.error || "Login failed")
            setLoading(false)
        }
    }

    return (
        <div className={s.page}>
            {/* ── LEFT ── */}
            <div className={s.left}>
                <Link href="/"><div className={s.logo}>Book <span>it.</span></div></Link>
                <div className={s.copy}>
                    <h1>Get appointments<br />at your fingertips.</h1>
                    <p>Login to preview thousands of plumbers, groomers, cleaners, and more all from one place.</p>
                </div>
                <p className={s.testimonial}></p>
            </div>

            {/* ── RIGHT ── */}
            <div className={s.right}>
                <h2>Log in to your account</h2>
                <p className={s.loginPrompt}>
                    Don&apos;t have one? <Link href="/signup">Sign up</Link>
                </p>

                {error && <p className={s.error}>{error}</p>}

                <form className={s.form} onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input
                            type="email"
                            placeholder="jane@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label>
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
            </div>
        </div>
    )
}