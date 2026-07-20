"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import "./booking-confirmation.scss";

export default function BookingConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const { id }       = useParams();
  const searchParams = useSearchParams();
  const slug         = searchParams.get("slug");
  const dateParam    = searchParams.get("date");
  const timeParam    = searchParams.get("time");

  const [services, setServices] = useState([]);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/services?provider_id=${slug}`)
      .then(r => r.json())
      .then(data => {
        const svcs = data.services ?? [];
        setServices(svcs);
        if (svcs.length > 0) setProvider(svcs[0].provider);
      });
  }, [slug]);

  const bizName  = provider?.business_name || provider?.full_name || "Business";
  const service  = services[0];
  const fromPrice = services.length > 0 ? Math.min(...services.map(s => Number(s.price))) : null;

  const formattedDate = dateParam
    ? new Date(dateParam + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="booking-logo">Book <span>it.</span></Link>
        <nav className="booking-nav">
          <Link href="/browse" className="active">Browse</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/for-business">For Business</Link>
        </nav>
        <div className="booking-header-right">
          <div className="user-circle">✓</div>
        </div>
      </header>

      <section className="confirmation-wrapper">
        <div className="check-circle">✓</div>

        <h1>You&apos;re booked!</h1>

        <p className="confirmation-subtitle">
          Confirmation #BK-{id} · Sent to your email
        </p>

        <section className="booking-card">
          <div className="business-row">
            <div className="logo-box">
              {bizName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2>{bizName}</h2>
              <p>{service ? service.title : "Service"}</p>
            </div>
          </div>

          <hr />

          <div className="booking-details-grid">
            <div>
              <p className="detail-label">Date</p>
              <p className="detail-value">{formattedDate}</p>
            </div>
            <div>
              <p className="detail-label">Time</p>
              <p className="detail-value">{timeParam ?? "—"}</p>
            </div>
            <div>
              <p className="detail-label">Duration</p>
              <p className="detail-value">{service ? `${service.duration_minutes} min` : "—"}</p>
            </div>
            <div>
              <p className="detail-label">Price</p>
              <p className="detail-value">
                {service ? `$${service.price} · pay on site` : fromPrice ? `From $${fromPrice}` : "—"}
              </p>
            </div>
          </div>
        </section>

        <div className="confirmation-actions">
          <button type="button">📅 Add to calendar</button>
          <button type="button">✉ Message business</button>
          <button type="button">× Cancel</button>
        </div>

        <p className="change-note">
          Need to change something? Modify up to 24h before.
        </p>

        <Link href="/browse" className="all-bookings-link">
          ← Back to browse
        </Link>
      </section>
    </main>
  );
}
