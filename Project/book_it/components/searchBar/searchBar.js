"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import s from "./searchBar.module.scss"

export default function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState("")

    function handleSearch(e) {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        router.push(`/browse${params.toString() ? `?${params}` : ""}`)
    }

    return (
        <form className={s.wrapper} onSubmit={handleSearch}>
            <div className={s.inputs}>
                <div className={s.field}>
                    <input
                        type="text"
                        placeholder="What service do you need?"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <div className={s.divider} />
                <div className={s.field}>
                    <input type="text" placeholder="Location" />
                </div>
            </div>
            <button type="submit" className={s.searchBtn}>Search</button>
        </form>
    )
}
