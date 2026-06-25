"use client";

import { useState } from "react";
import Link from "next/link";
import s from "./page.module.scss";

const services = [
  {
    id: 1,
    title: "Leak Diagnosis & Repair",
    provider: "Acme Plumbing Co.",
    category: "Plumbing",
    price: 95,
    mode: "In-person",
    rating: 4.8,
    location: "Waterloo, ON",
  },
  {
    id: 2,
    title: "Full Pet Grooming",
    provider: "Pawsh Pet Salon",
    category: "Pet grooming",
    price: 75,
    mode: "In-person",
    rating: 4.7,
    location: "Kitchener, ON",
  },
  {
    id: 3,
    title: "Home Cleaning",
    provider: "Sparkle Home Services",
    category: "Cleaning",
    price: 120,
    mode: "In-person",
    rating: 4.6,
    location: "Waterloo, ON",
  },
  {
    id: 4,
    title: "Math Tutoring",
    provider: "BrightPath Tutors",
    category: "Tutoring",
    price: 40,
    mode: "Online",
    rating: 4.9,
    location: "Online",
  },
  {
    id: 5,
    title: "Portrait Photography",
    provider: "Frame Studio",
    category: "Photography",
    price: 150,
    mode: "In-person",
    rating: 4.5,
    location: "Waterloo, ON",
  },
  {
    id: 6,
    title: "Personal Training Session",
    provider: "FitLife Coaching",
    category: "Fitness Training",
    price: 60,
    mode: "Hybrid",
    rating: 4.7,
    location: "Kitchener, ON",
  },
];

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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredServices = services.filter((service) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(searchText) ||
      service.provider.toLowerCase().includes(searchText) ||
      service.category.toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;

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
              {filteredServices.map((service) => (
                <article key={service.id} className={s.card}>
                  <div className={s.coverPhoto}>cover photo</div>

                  <div className={s.cardBody}>
                    <h2>{service.provider}</h2>
                    <p>{service.title}</p>
                    <p>
                      {service.category} · ${service.price} · {service.mode}
                    </p>
                    <p>
                      ★ {service.rating} · {service.location}
                    </p>

                    <Link href={`/browse/${service.id}`} className={s.detailsLink}>
                      View Details →
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