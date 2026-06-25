import Link from "next/link"
import s from "./categoryGrid.module.scss"

// SOMEONE NEEDS TO LINK THIS TO THE DB under /API FOLDER, BUILD THE BACKEND FOR THIS
const CATEGORIES = [
    "Plumbing",
    "Pet grooming",
    "Home cleaning",
    "Auto repair",
    "Hair & beauty",
    "Tutoring",
    "Photography",
    "Personal training",
]

export default function CategoryGrid() {
    return (
        <section className={s.section}>
            <div className={s.header}>
                <h2 className={s.title}>Browse by category</h2>
                <Link href="/browse" className={s.viewAll}>View all →</Link>
            </div>
            <div className={s.grid}>
                {CATEGORIES.map((name) => (
                    <div key={name} className={s.card}>
                        <div className={s.icon} />
                        <span className={s.label}>{name}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}
