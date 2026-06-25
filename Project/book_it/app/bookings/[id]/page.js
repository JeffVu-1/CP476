import Link from "next/link";
import "./booking-confirmation.scss";

export default function BookingConfirmationPage({ params }) {
  const bookingId = params.id;

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="booking-logo">
          Book <span>it.</span>
        </Link>

        <nav className="booking-nav">
          <Link href="/browse" className="active">Browse</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/business">For Business</Link>
        </nav>

        <div className="booking-header-right">
          <Link href="/bookings">Bookings</Link>
          <div className="user-circle">JD</div>
        </div>
      </header>

      <section className="confirmation-wrapper">
        <div className="check-circle">✓</div>

        <h1>You&apos;re booked!</h1>

        <p className="confirmation-subtitle">
          Confirmation #{bookingId ? `BK-${bookingId}` : "BK-8821"} · Sent to your email
        </p>

        <section className="booking-card">
          <div className="business-row">
            <div className="logo-box">Logo</div>

            <div>
              <h2>Acme Plumbing Co.</h2>
              <p>Leak diagnosis &amp; repair</p>
            </div>
          </div>

          <hr />

          <div className="booking-details-grid">
            <div>
              <p className="detail-label">Date</p>
              <p className="detail-value">Mon, May 18, 2026</p>
            </div>

            <div>
              <p className="detail-label">Time</p>
              <p className="detail-value">10:00 AM – 10:45 AM</p>
            </div>

            <div>
              <p className="detail-label">Address</p>
              <p className="detail-value">224 Atlantic Ave, Brooklyn NY</p>
            </div>

            <div>
              <p className="detail-label">Price</p>
              <p className="detail-value">$95 · pay on site</p>
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

        <Link href="/bookings" className="all-bookings-link">
          View all my bookings →
        </Link>
      </section>
    </main>
  );
}