"use client"
import { usePathname } from "next/navigation"
import NavigationHeader from "./navigationHeader"

const HIDDEN_ON = ["/login", "/signup"]

export default function ConditionalNav() {
    const pathname = usePathname()
    if (HIDDEN_ON.includes(pathname)) return null
    return <NavigationHeader />
}
