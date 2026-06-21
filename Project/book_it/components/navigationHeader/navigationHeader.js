import Link from "next/link"
import s from "./navigationHeader.module.scss"

export default function NavigationHeader() {
    return (
        <header className={s.header}>
            <nav className={s.nav}>
                <ul className={s.navLinks}>
                   <Link href="/"><div className={s.logo}>Book <span className={s.logoAccent}>it.</span></div></Link>
                    <li><Link href="/browse">Browse</Link></li>
                    <li><Link href="/categories">Categories</Link></li>
                    <li><Link href="/for-business">For Business</Link></li>
                </ul>
                <div className={s.authButtons}>
                    <Link href="/login" className={s.loginLink}>Log in</Link>
                    <Link href="/signup" className={s.signupButton}>Sign up</Link>
                </div>
            </nav>
        </header>
    )
}
