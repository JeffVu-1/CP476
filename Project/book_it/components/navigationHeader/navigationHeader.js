"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUser, clearUser } from "@/lib/auth"
import s from "./navigationHeader.module.scss"

export default function NavigationHeader() {
    const router = useRouter()
    const [user, setUser_] = useState(null)
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        setUser_(getUser())
    }, [])
    
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    function handleLogout() {
        clearUser()
        setUser_(null)
        setOpen(false)
        router.push("/")
    }

    const initials = user ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : ""

    return (
        <header className={s.header}>
            <nav className={s.nav}>
                <ul className={s.navLinks}>
                    <Link href="/"><div className={s.logo}>Book <span className={s.logoAccent}>it.</span></div></Link>
                    {user?.role === "provider" ? (
                        <>
                            <li><Link href="/browse">Browse</Link></li>
                            <li><Link href="/business/dashboard">Dashboard</Link></li>
                            <li><Link href="/business/bookings">Bookings</Link></li>
                            <li><Link href={`/business/calendar/${new Date().toISOString().slice(0,10)}`}>Calendar</Link></li>
                            <li><Link href="/business/settings">My Services</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link href="/browse">Browse</Link></li>
                            <li><Link href="/bookings">My Bookings</Link></li>
                        </>
                    )}
                </ul>

                <div className={s.authButtons}>
                    {user ? (
                        <>
                            <div className={s.profileWrapper} ref={dropdownRef}>
                                <button className={s.avatar} onClick={() => setOpen(o => !o)} aria-label="Account menu">{initials}</button>

                                {open && (
                                    <div className={s.dropdown}>
                                        <p className={s.dropdownName}>{user.full_name}</p>
                                        <p className={s.dropdownEmail}>{user.email}</p>
                                        <p className={s.dropdownRole}>{user.role === "provider" ? "Business" : "Customer"}</p>
                                        <hr className={s.dropdownDivider} />
                                        <button className={s.logoutBtn} onClick={handleLogout}>
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={s.loginLink}>Log in</Link>
                            <Link href="/signup" className={s.signupButton}>Sign up</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
