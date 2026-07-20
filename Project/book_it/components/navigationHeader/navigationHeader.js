"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { getUser, clearUser } from "@/lib/auth"
import s from "./navigationHeader.module.scss"

export default function NavigationHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser_] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => { setUser_(getUser()) }, [])

    useEffect(() => { setDrawerOpen(false) }, [pathname])

    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [drawerOpen])

    function handleLogout() {
        clearUser()
        setUser_(null)
        setDropdownOpen(false)
        setDrawerOpen(false)
        router.push("/")
    }

    const initials = user
        ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : ""

    const links = user?.role === "provider"
        ? [
            { href: "/browse",            label: "Browse" },
            { href: "/business/dashboard", label: "Dashboard" },
            { href: "/business/bookings",  label: "Bookings" },
            { href: `/business/calendar/${new Date().toISOString().slice(0,10)}`, label: "Calendar" },
            { href: "/business/settings",  label: "My Services" },
          ]
        : [
            { href: "/browse",    label: "Browse" },
            { href: "/bookings",  label: "My Bookings" },
          ]

    return (
        <>
            <header className={s.header}>
                <nav className={s.nav}>
                    {/* Logo */}
                    <Link href="/" className={s.logo}>
                        Book <span className={s.logoAccent}>it.</span>
                    </Link>

                    {/* Desktop links */}
                    <ul className={s.navLinks}>
                        {links.map(l => (
                            <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
                        ))}
                    </ul>

                    {/* Desktop auth */}
                    <div className={s.authButtons}>
                        {user ? (
                            <div className={s.profileWrapper} ref={dropdownRef}>
                                <button
                                    className={s.avatar}
                                    onClick={() => setDropdownOpen(o => !o)}
                                    aria-label="Account menu"
                                >
                                    {initials}
                                </button>
                                {dropdownOpen && (
                                    <div className={s.dropdown}>
                                        <p className={s.dropdownName}>{user.full_name}</p>
                                        <p className={s.dropdownEmail}>{user.email}</p>
                                        <p className={s.dropdownRole}>{user.role === "provider" ? "Business" : "Customer"}</p>
                                        <hr className={s.dropdownDivider} />
                                        <button className={s.logoutBtn} onClick={handleLogout}>Log out</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className={s.loginLink}>Log in</Link>
                                <Link href="/signup" className={s.signupButton}>Sign up</Link>
                            </>
                        )}

                        {/* Hamburger — mobile only */}
                        <button
                            className={s.hamburger}
                            onClick={() => setDrawerOpen(o => !o)}
                            aria-label="Open menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Overlay */}
            <div
                className={`${s.overlay} ${drawerOpen ? s.overlayVisible : ""}`}
                onClick={() => setDrawerOpen(false)}
            />

            {/* Left drawer */}
            <div className={`${s.drawer} ${drawerOpen ? s.drawerOpen : ""}`}>
                <div className={s.drawerHeader}>
                    <Link href="/" className={s.drawerLogo} onClick={() => setDrawerOpen(false)}>
                        Book <span>it.</span>
                    </Link>
                    <button className={s.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                        ✕
                    </button>
                </div>

                <ul className={s.drawerLinks}>
                    {links.map(l => (
                        <li key={l.href}>
                            <Link href={l.href} className={pathname === l.href ? s.drawerLinkActive : s.drawerLink}>
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className={s.drawerFooter}>
                    {user ? (
                        <>
                            <p className={s.drawerUserName}>{user.full_name}</p>
                            <p className={s.drawerUserEmail}>{user.email}</p>
                            <p className={s.drawerUserRole}>{user.role === "provider" ? "Business account" : "Customer account"}</p>
                            <button className={s.drawerLogout} onClick={handleLogout}>Log out</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={s.drawerAuthLink} onClick={() => setDrawerOpen(false)}>Log in</Link>
                            <Link href="/signup" className={s.drawerSignup} onClick={() => setDrawerOpen(false)}>Sign up</Link>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
