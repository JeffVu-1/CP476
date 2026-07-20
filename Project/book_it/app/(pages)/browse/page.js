"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import s from "./page.module.scss";

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  )
}

function BrowseContent() {
  const searchParams = useSearchParams()
  const [search, setSearch]               = useState(searchParams.get("q") ?? "")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [services, setServices]           = useState([])
  const [categories, setCategories]       = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [svcRes, catRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/categories"),
        ])
        const svcData = await svcRes.json()
        const catData = await catRes.json()
        setServices(svcData.services ?? [])
        setCategories(["All", ...(catData.categories ?? []).map(c => c.name)])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = services.filter(svc => {
    const text = search.toLowerCase()
    const matchesSearch =
      svc.title?.toLowerCase().includes(text) ||
      svc.provider?.business_name?.toLowerCase().includes(text) ||
      svc.category?.name?.toLowerCase().includes(text)

    const matchesCategory =
      selectedCategory === "All" || svc.category?.name === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className={s.page}>
      <section className={s.searchSection}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="What service do you need?"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          className={s.searchInput}
          type="text"
          placeholder="Location"
          defaultValue="Waterloo, ON"
        />
        <button className={s.searchButton}>Search</button>
      </section>

      <section className={s.content}>
        <aside className={s.sidebar}>
          <h3>Category</h3>
          {categories.map(cat => (
            <label key={cat} className={s.filterOption}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </aside>

        <section className={s.results}>
          <div className={s.resultsHeader}>
            <h1>{loading ? "Loading…" : `${filtered.length} services found`}</h1>
            <select className={s.sort}>
              <option>Lowest price</option>
              <option>Highest price</option>
            </select>
          </div>

          {loading ? (
            <p className={s.emptyMessage}>Loading services…</p>
          ) : filtered.length === 0 ? (
            <p className={s.emptyMessage}>No services available yet.</p>
          ) : (
            <div className={s.grid}>
              {filtered.map(svc => (
                <article key={svc.id} className={s.card}>
                  <div className={s.coverPhoto}>{svc.category?.icon_emoji ?? "🔧"}</div>

                  <div className={s.cardBody}>
                    <h2>{svc.provider?.business_name || svc.provider?.full_name}</h2>
                    <p>{svc.title}</p>
                    <p>
                      {svc.category?.name} · ${svc.price} · {svc.delivery_mode}
                    </p>
                    <p>{svc.duration_minutes} min</p>

                    <Link href={`/browse/${svc.provider_id}`} className={s.detailsLink}>
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
