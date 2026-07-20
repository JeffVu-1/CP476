"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import s from "./categoryGrid.module.scss"

export default function CategoryGrid() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetch("/api/categories")
            .then(r => r.json())
            .then(data => setCategories(data.categories ?? []))
    }, [])

    return (
        <section className={s.section}>
            <div className={s.header}>
                <h2 className={s.title}>Browse by category</h2>
                <Link href="/browse" className={s.viewAll}>View all</Link>
            </div>
            <div className={s.grid}>
                {categories.map(cat => (
                    <Link
                        key={cat.id}
                        href={`/browse?category=${encodeURIComponent(cat.name)}`}
                        className={s.card}
                    >
                        <div className={s.icon}>{cat.icon_emoji}</div>
                        <span className={s.label}>{cat.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
