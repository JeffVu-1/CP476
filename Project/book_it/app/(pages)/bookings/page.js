"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

function formatDate(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr) {
  if (!timeStr) return "—";

  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";

  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function MyBookingsPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const user = getUser();

    if (!user) {
      router.replace("/login?redirect=/bookings");
      return;
    }

    setCurrentUser(user);

    fetch(`/api/bookings?customer_id=${user.id}`)
      .then(response => response.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCancel(id) {
    setCancelling(true);

    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: "cancelled",
      }),
    });

    if (response.ok) {
      setBookings(current =>
        current.map(booking =>
          booking.id === id
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
    }

    setCancelling(false);
    setConfirmCancel(null);
  }

  function openReview(booking, businessName) {
    setReviewBooking({
      id: booking.id,
      title: `${businessName} — ${booking.service?.title}`,
    });

    setRating(5);
    setComment("");
    setReviewError("");
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewError("");
    setSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: reviewBooking.id,
          customer_id: currentUser.id,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit review");
      }

      setBookings(current =>
        current.map(booking =>
          booking.id === reviewBooking.id
            ? { ...booking, review: data.review }
            : booking
        )
      );

      setReviewBooking(null);
    } catch (error) {
      setReviewError(error.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  const canCancel = booking =>
    booking.status !== "cancelled" &&
    booking.status !== "completed";

  return (
    <div className={s.shell}>
      <div className={s.content}>
        <h1 className={s.heading}>My Bookings</h1>

        {loading ? (
          <p className={s.empty}>Loading…</p>
        ) : bookings.length === 0 ? (
          <div className={s.emptyState}>
            <p className={s.emptyTitle}>No bookings yet</p>
            <p className={s.emptySub}>
              When you book a service it will show up here.
            </p>

            <Link href="/browse" className={s.browseBtn}>
              Browse services
            </Link>
          </div>
        ) : (
          <ul className={s.list}>
            {bookings.map(booking => {
              const businessName =
                booking.service?.provider?.business_name ||
                booking.service?.provider?.full_name ||
                "Business";

              return (
                <li
                  key={booking.id}
                  className={`${s.card} ${
                    booking.status === "cancelled"
                      ? s.cardCancelled
                      : ""
                  }`}
                >
                  <div className={s.cardLeft}>
                    <div className={s.avatar}>
                      {businessName.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <p className={s.bizName}>{businessName}</p>
                      <p className={s.serviceName}>
                        {booking.service?.title}
                      </p>
                    </div>
                  </div>

                  <div className={s.cardMid}>
                    <p className={s.date}>
                      {formatDate(booking.time_slot?.slot_date)}
                    </p>

                    <p className={s.time}>
                      {formatTime(booking.time_slot?.start_time)}
                      {" · "}
                      {booking.service?.duration_minutes} min
                    </p>
                  </div>

                  <div className={s.cardRight}>
                    <p className={s.price}>
                      ${booking.service?.price}
                    </p>

                    {booking.status === "completed" ? (
                      booking.review ? (
                        <span className={s.reviewedLabel}>
                          Review submitted
                        </span>
                      ) : (
                        <button
                          className={s.reviewBtn}
                          onClick={() =>
                            openReview(booking, businessName)
                          }
                        >
                          Leave a review
                        </button>
                      )
                    ) : canCancel(booking) ? (
                      <button
                        className={s.cancelBtn}
                        onClick={() =>
                          setConfirmCancel({
                            id: booking.id,
                            title: `${businessName} — ${booking.service?.title}`,
                          })
                        }
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className={s.cancelledLabel}>
                        {booking.status}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirmCancel && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>Cancel booking?</h3>

            <p className={s.modalBody}>
              <strong>{confirmCancel.title}</strong> will be cancelled
              and the time slot will be released.
            </p>

            <div className={s.modalActions}>
              <button
                className={s.modalKeep}
                onClick={() => setConfirmCancel(null)}
              >
                Keep it
              </button>

              <button
                className={s.modalConfirm}
                onClick={() => handleCancel(confirmCancel.id)}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewBooking && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <h3 className={s.modalTitle}>Leave a review</h3>

            <p className={s.modalBody}>
              Tell others about your experience with{" "}
              <strong>{reviewBooking.title}</strong>.
            </p>

            <form
              className={s.reviewForm}
              onSubmit={handleReviewSubmit}
            >
              <label className={s.reviewLabel}>Your rating</label>

              <div className={s.ratingPicker}>
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} stars`}
                    className={`${s.starButton} ${
                      value <= rating ? s.starActive : ""
                    }`}
                    onClick={() => setRating(value)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label className={s.reviewLabel}>
                Your review
                <textarea
                  className={s.reviewTextarea}
                  value={comment}
                  onChange={event => setComment(event.target.value)}
                  placeholder="Describe your experience…"
                  maxLength={1000}
                  required
                />
              </label>

              {reviewError && (
                <p className={s.reviewError}>{reviewError}</p>
              )}

              <div className={s.modalActions}>
                <button
                  type="button"
                  className={s.modalKeep}
                  onClick={() => setReviewBooking(null)}
                  disabled={submittingReview}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={s.modalConfirm}
                  disabled={submittingReview}
                >
                  {submittingReview
                    ? "Submitting…"
                    : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}