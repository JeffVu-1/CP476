"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "./booking-confirmation.scss";

export default function BookingConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}

function formatTime(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
}

function ConfirmationContent() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings?booking_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setBooking(data.booking);
      })
      .catch(() => setError("Failed to load booking."))
      .finally(() => setLoading(false));
  }, [id]);

  const bizName = booking?.service?.provider
    ? (booking.service.provider.business_name || booking.service.provider.full_name)
    : "Business";

  if (loading) {
    return (
      <main className="booking-page">
        <section className="confirmation-wrapper">
          <p style={{ color: "#888" }}>Loading booking…</p>
        </section>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="booking-page">
        <section className="confirmation-wrapper">
          <p style={{ color: "red" }}>{error || "Booking not found."}</p>
          <Link href="/browse">← Back to browse</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="booking-logo">Book <span>it.</span></Link>
        <nav className="booking-nav">
          <Link href="/browse" className="active">Browse</Link>
        </nav>
      </header>

      <section className="confirmation-wrapper">
        <div className="check-circle">✓</div>

        <h1>You&apos;re booked!</h1>

        <p className="confirmation-subtitle">
          Confirmation #BK-{booking.id} · Status: {booking.status}
        </p>

        <section className="booking-card">
          <div className="business-row">
            <div className="logo-box">
              {bizName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2>{bizName}</h2>
              <p>{booking.service?.title ?? "Service"}</p>
            </div>
          </div>

          <hr />

          <div className="booking-details-grid">
            <div>
              <p className="detail-label">Date</p>
              <p className="detail-value">{formatDate(booking.time_slot?.slot_date)}</p>
            </div>
            <div>
              <p className="detail-label">Time</p>
              <p className="detail-value">{formatTime(booking.time_slot?.start_time)}</p>
            </div>
            <div>
              <p className="detail-label">Duration</p>
              <p className="detail-value">{booking.service?.duration_minutes ?? "—"} min</p>
            </div>
            <div>
              <p className="detail-label">Price</p>
              <p className="detail-value">
                {booking.service?.price ? `$${booking.service.price} · pay on site` : "—"}
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
