"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { setUser } from "@/lib/auth"
import s from "./page.module.scss"

export default function SignupPage() {
    const router = useRouter()
    const [role, setRole] = useState("customer")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [businessName, setBusinessName] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { data } = await axios.post("/api/auth/signup", {
                full_name: fullName,
                email,
                password,
                role,
                business_name: role === "provider" ? businessName : undefined,
            })
            setUser(data)
            router.push(data.role === "provider" ? "/business/dashboard" : "/browse")
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed")
            setLoading(false)
        }
    }

    return (
        <div className={s.page}>
            <div className={s.left}>
                <Link href="/"><div className={s.logo}>Book <span>it.</span></div></Link>
                <div className={s.copy}>
                    <h1>Get appointments<br />at your fingertips.</h1>
                    <p>Join thousands of customers who book plumbers, groomers, cleaners, and more — all from one place.</p>
                    <ul className={s.perks}>
                        <li>✓ Real-time availability</li>
                        <li>✓ Free cancellation up to 24h</li>
                        <li>✓ One profile, every service</li>
                    </ul>
                </div>
                <div><p></p></div>
            </div>

            <div className={s.right}>
                <h2>Create your account</h2>
                <p className={s.loginPrompt}>Already have one? <Link href="/login">Log in</Link></p>

                <div className={s.tabs}>
                    <button
                        type="button"
                        className={role === "customer" ? s.active : ""}
                        onClick={() => setRole("customer")}
                    >
                        I&apos;m a customer
                    </button>
                    <button
                        type="button"
                        className={role === "provider" ? s.active : ""}
                        onClick={() => setRole("provider")}
                    >
                        I&apos;m a business
                    </button>
                </div>

                {error && <p className={s.error}>{error}</p>}

                <form className={s.form} onSubmit={handleSubmit}>
                    <label>
                        Full name
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                        />
                    </label>

                    {role === "provider" && (
                        <label>
                            Business name
                            <input
                                type="text"
                                placeholder="Acme Plumbing Co."
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                                required
                            />
                        </label>
                    )}

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
                            minLength={6}
                        />
                    </label>

                    <button type="submit" className={s.submit} disabled={loading}>
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>
            </div>
        </div>
    )
}
