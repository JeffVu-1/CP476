"use client"
import { useState } from "react"
import Link from "next/link"
import s from "./page.module.scss"

export default function RegistrationPage() {
    const [tab, setTab] = useState("customer")
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
                <p></p>
            </div>

            <div className={s.right}>
                <h2>Create your account</h2>
                <p className={s.loginPrompt}>Already have one? <Link href="/login">Log in</Link></p>

                <div className={s.tabs}>
                    <button className={tab === "customer" ? s.active : ""} onClick={() => setTab("customer")}>I'm a customer</button>
                    <button className={tab === "business" ? s.active : ""} onClick={() => setTab("business")}>I'm a business</button>
                </div>

                <form className={s.form}>
                    <label>Full name<input type="text" placeholder="Jane Doe" /></label>
                    <label>Email<input type="email" placeholder="jane@email.com" /></label>
                    <label>Password<input type="password" placeholder="••••••••" /></label>
                    <button type="submit" className={s.submit}>Create account</button>
                </form>
            </div>
        </div>
    )
}
