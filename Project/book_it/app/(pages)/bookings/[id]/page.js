"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { BUSINESSES } from "@/lib/data";
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

  const business = BUSINESSES.find(b => b.id === slug);

  const formattedDate = dateParam
    ? new Date(dateParam + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "long", day: "numeric", year: "numeric",
      })
    : "—";

  const service = business?.services?.[0];

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
              {business ? business.name.slice(0, 2).toUpperCase() : "?"}
            </div>
            <div>
              <h2>{business ? business.name : "Business"}</h2>
              <p>{service ? service.name : business?.tagline ?? "Service"}</p>
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
              <p className="detail-label">Location</p>
              <p className="detail-value">{business?.location ?? "—"}</p>
            </div>
            <div>
              <p className="detail-label">Price</p>
              <p className="detail-value">
                {service ? `${service.price} · pay on site` : business ? `From $${business.fromPrice}` : "—"}
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
