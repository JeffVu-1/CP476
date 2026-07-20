"use client"
import { usePathname } from "next/navigation"
import NavigationHeader from "./navigationHeader"

const NO_NAV = ["/login", "/signup"]

export default function NavWrapper({ children }) {
    const pathname = usePathname()
    const showNav = !NO_NAV.includes(pathname)

    return (
        <>
            {showNav && <NavigationHeader />}
            <div style={showNav ? { paddingTop: "80px" } : undefined}>
                {children}
            </div>
        </>
    )
}
