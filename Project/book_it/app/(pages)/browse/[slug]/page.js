"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import s from "./page.module.scss";

const TABS = ["Overview", "Services", "Reviews", "Contact"];

function Stars({ rating }) {
  const full = Math.floor(rating ?? 0);
  return (
    <span className={s.stars}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

export default function BusinessProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [services, setServices]   = useState([]);
  const [provider, setProvider]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/services?provider_id=${params.slug}`);
        const data = await res.json();
        const svcs = data.services ?? [];
        setServices(svcs);
        if (svcs.length > 0) setProvider(svcs[0].provider);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.slug]);

  const fromPrice = services.length > 0
    ? Math.min(...services.map(s => Number(s.price)))
    : null;

  if (loading) {
    return <div className={s.shell}><p style={{ padding: "80px 24px" }}>Loading…</p></div>;
  }

  if (!provider && services.length === 0) {
    return (
      <div className={s.shell}>
        <div className={s.notFound}>
          <p>Business not found.</p>
          <Link href="/browse">← Back to browse</Link>
        </div>
      </div>
    );
  }

  const bizName = provider?.business_name || provider?.full_name || "Business";

  return (
    <div className={s.shell}>
      <div className={s.cover}>
        <span className={s.coverLabel}>cover photo</span>
      </div>

      <div className={s.pageWrapper}>
        {/* Identity */}
        <div className={s.identity}>
          <div className={s.logoBox}>{bizName.slice(0, 2).toUpperCase()}</div>
          <div className={s.identityText}>
            <h1 className={s.bizName}>{bizName}</h1>
            <div className={s.meta}>
              <span>{services[0]?.category?.name ?? "Services"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={s.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? s.tabActive : s.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={s.contentRow}>
          <main className={s.main}>
            {activeTab === "Overview" && (
              <>
                <section className={s.section}>
                  <h2 className={s.sectionTitle}>About</h2>
                  <p className={s.bodyText}>
                    {services[0]?.description || `${bizName} offers ${services.length} service${services.length !== 1 ? "s" : ""} available for booking.`}
                  </p>
                </section>
                <section className={s.section}>
                  <h2 className={s.sectionTitle}>Services &amp; pricing</h2>
                  <ServiceList services={services} />
                </section>
              </>
            )}

            {activeTab === "Services" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Services &amp; pricing</h2>
                <ServiceList services={services} />
              </section>
            )}

            {activeTab === "Reviews" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Reviews</h2>
                <p className={s.bodyText} style={{ color: "#888" }}>No reviews yet.</p>
              </section>
            )}

            {activeTab === "Contact" && (
              <section className={s.section}>
                <h2 className={s.sectionTitle}>Contact</h2>
                <ul className={s.contactList}>
                  <li><MapPin size={14} /> {provider?.full_name}</li>
                </ul>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className={s.sidebar}>
            <div className={s.sidebarCard}>
              {fromPrice !== null && (
                <>
                  <p className={s.fromLabel}>FROM</p>
                  <p className={s.fromPrice}>
                    <strong>${fromPrice}</strong>
                  </p>
                </>
              )}
              <Link href={`/browse/${params.slug}/book`} className={s.bookBtn}>
                Book Now
              </Link>
              <button className={s.messageBtn}>Message business</button>
              <hr className={s.divider} />
              <p className={s.hoursLine}><Clock size={13} /> {services.length} service{services.length !== 1 ? "s" : ""} available</p>
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
      {services.map(svc => (
        <li key={svc.id} className={s.serviceItem}>
          <div className={s.serviceInfo}>
            <p className={s.serviceName}>{svc.title}</p>
            <p className={s.serviceDuration}>{svc.duration_minutes} min · {svc.delivery_mode}</p>
          </div>
          <span className={s.servicePrice}>${svc.price}</span>
        </li>
      ))}
    </ul>
  );
}
