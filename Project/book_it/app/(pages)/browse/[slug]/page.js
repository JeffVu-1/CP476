"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Phone, MapPin, Clock } from "lucide-react";
import { BUSINESSES } from "@/lib/data";
import s from "./page.module.scss";

const TABS = ["Overview", "Services", "Reviews", "Photos", "Contact"];

function Stars({ rating }) {
  const full = Math.floor(rating);
  return (
    <span className={s.stars}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

export default function BusinessProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const b = BUSINESSES.find((biz) => biz.id === params.slug);

  if (!b) {
    return (
      <div className={s.shell}>
        <div className={s.notFound}>
          <p>Business not found.</p>
          <Link href="/browse">← Back to browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.shell}>
      {/* Cover photo */}
      <div className={s.cover}>
        <span className={s.coverLabel}>cover photo</span>
      </div>

      <div className={s.pageWrapper}>
        {/* Business identity */}
        <div className={s.identity}>
          <div className={s.logoBox}>Logo</div>
          <div className={s.identityText}>
            <h1 className={s.bizName}>{b.name}</h1>
            <div className={s.meta}>
              <Stars rating={b.rating} />
              <span className={s.ratingNum}>{b.rating}</span>
              <span className={s.reviewCount}>{b.reviewCount} reviews</span>
              <span className={s.dot}>·</span>
              <span>{b.category}</span>
              <span className={s.dot}>·</span>
              <span>{b.location}</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className={s.tabBar}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? s.tabActive : s.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className={s.contentRow}>
          <main className={s.main}>
            {activeTab === "Overview" && (
              <>
                <section className={s.section}>
                  <h2 className={s.sectionTitle}>About</h2>
                  <p className={s.bodyText}>{b.about}</p>
                </section>
                <section className={s.section}>
                  <h2 className={s.sectionTitle}>Services &amp; pricing</h2>
                  <ServiceList services={b.services} />
                </section>
              </>
            )}

            {activeTab === "Services" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Services &amp; pricing</h2>
                <ServiceList services={b.services} />
              </section>
            )}

            {activeTab === "Reviews" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>
                  Reviews{" "}
                  <span className={s.ratingBadge}>{b.rating} · {b.reviewCount} reviews</span>
                </h2>
                {b.reviews.map((r, i) => (
                  <div key={i} className={s.reviewItem}>
                    <div className={s.reviewHeader}>
                      <strong>{r.author}</strong>
                      <span className={s.reviewDate}>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                    <p className={s.reviewBody}>{r.body}</p>
                  </div>
                ))}
              </section>
            )}

            {activeTab === "Photos" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Photos</h2>
                <div className={s.photosGrid}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={s.photoPlaceholder} />
                  ))}
                </div>
              </section>
            )}

            {activeTab === "Contact" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Contact</h2>
                <ul className={s.contactList}>
                  <li><Phone size={14} /> {b.phone}</li>
                  <li><MapPin size={14} /> {b.location}</li>
                  <li><Clock size={14} /> {b.hoursToday}</li>
                </ul>
              </section>
            )}
          </main>

          {/* Sticky sidebar */}
          <aside className={s.sidebar}>
            <div className={s.sidebarCard}>
              <p className={s.fromLabel}>FROM</p>
              <p className={s.fromPrice}>
                <strong>${b.fromPrice}</strong>
                <span className={s.priceUnit}> / {b.priceUnit}</span>
              </p>
              <p className={s.nextAvail}>
                Next available: <strong>{b.nextAvailable}</strong>
              </p>
              <Link
                href={`/booking/new?business=${params.slug}`}
                className={s.bookBtn}
              >
                Book Now
              </Link>
              <button className={s.messageBtn}>Message business</button>
              <hr className={s.divider} />
              <p className={s.hoursLine}><Clock size={13} /> Hours · {b.hoursToday}</p>
              <p className={s.phoneLine}><Phone size={13} /> {b.phone}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ServiceList({ services }) {
  return (
    <ul className={s.serviceList}>
      {services.map((svc, i) => (
        <li key={i} className={s.serviceItem}>
          <div className={s.serviceInfo}>
            <p className={s.serviceName}>{svc.name}</p>
            <p className={s.serviceDuration}>{svc.duration}</p>
          </div>
          <span className={s.servicePrice}>{svc.price}</span>
        </li>
      ))}
    </ul>
  );
}
