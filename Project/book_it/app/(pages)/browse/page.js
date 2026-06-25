"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BUSINESSES } from "@/lib/data";
import s from "./page.module.scss";

const categories = [
  "All",
  "Plumbing",
  "Pet grooming",
  "Cleaning",
  "Hair & beauty",
  "Tutoring",
  "Photography",
  "Fitness Training",
];

export default function BrowsePage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) setSearch(q)
  }, [searchParams]);

  const filteredServices = BUSINESSES.filter((b) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      b.tagline.toLowerCase().includes(searchText) ||
      b.name.toLowerCase().includes(searchText) ||
      b.category.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || b.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className={s.page}>
      <section className={s.searchSection}>
        <input
          className={s.searchInput}
          type="text"
          placeholder="What service do you need?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

          {categories.map((category) => (
            <label key={category} className={s.filterOption}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
              />
              {category}
            </label>
          ))}

          <h3>Price</h3>
          <label className={s.filterOption}>
            <input type="checkbox" /> $
          </label>
          <label className={s.filterOption}>
            <input type="checkbox" /> $$
          </label>
          <label className={s.filterOption}>
            <input type="checkbox" /> $$$
          </label>

          <h3>Availability</h3>
          <label className={s.filterOption}>
            <input type="checkbox" /> Today
          </label>
          <label className={s.filterOption}>
            <input type="checkbox" /> This week
          </label>
        </aside>

        <section className={s.results}>
          <div className={s.resultsHeader}>
            <h1>{filteredServices.length} services found</h1>

            <select className={s.sort}>
              <option>Top rated</option>
              <option>Lowest price</option>
              <option>Highest price</option>
            </select>
          </div>

          {filteredServices.length === 0 ? (
            <p className={s.emptyMessage}>
              No services available in this category yet.
            </p>
          ) : (
            <div className={s.grid}>
              {filteredServices.map((b) => (
                <article key={b.id} className={s.card}>
                  <div className={s.coverPhoto}>cover photo</div>

                  <div className={s.cardBody}>
                    <h2>{b.name}</h2>
                    <p>{b.tagline}</p>
                    <p>
                      {b.category} · ${b.price} · {b.mode}
                    </p>
                    <p>
                      ★ {b.rating} · {b.location}
                    </p>

                    <Link href={`/browse/${b.id}`} className={s.detailsLink}>
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