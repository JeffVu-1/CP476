import s from "./page.module.scss"
import SearchBar from "@/components/searchBar/searchBar"
import CategoryGrid from "@/components/categoryGrid/categoryGrid"

export default function Home() {
    return (
        <div className={s.page}>
            <section className={s.hero}>
                <h1 className={s.heroTitle}>Find & book local services</h1>
                <p className={s.heroSubtitle}>One place for every appointment from plumbers to pet groomers.</p>
                <SearchBar />
            </section>
            <section className={s.categories}>
                <CategoryGrid />
            </section>
        </div>
    )
}
