"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
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
  const [bookings,       setBookings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [confirmCancel,  setConfirmCancel]  = useState(null); // { id, title }
  const [cancelling,     setCancelling]     = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/login?redirect=/bookings"); return; }
    fetch(`/api/bookings?customer_id=${user.id}`)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCancel(id) {
    setCancelling(true);
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    }
    setCancelling(false);
    setConfirmCancel(null);
  }

  const canCancel = (b) => b.status !== "cancelled" && b.status !== "completed";

  return (
    <div className={s.shell}>
      <div className={s.content}>
        <h1 className={s.heading}>My Bookings</h1>

        {loading ? (
          <p className={s.empty}>Loading…</p>
        ) : bookings.length === 0 ? (
          <div className={s.emptyState}>
            <p className={s.emptyTitle}>No bookings yet</p>
            <p className={s.emptySub}>When you book a service it will show up here.</p>
            <Link href="/browse" className={s.browseBtn}>Browse services</Link>
          </div>
        ) : (
          <ul className={s.list}>
            {bookings.map(b => {
              const biz = b.service?.provider?.business_name || b.service?.provider?.full_name || "Business";
              return (
                <li key={b.id} className={`${s.card} ${b.status === "cancelled" ? s.cardCancelled : ""}`}>
                  <div className={s.cardLeft}>
                    <div className={s.avatar}>{biz.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <p className={s.bizName}>{biz}</p>
                      <p className={s.serviceName}>{b.service?.title}</p>
                    </div>
                  </div>
                  <div className={s.cardMid}>
                    <p className={s.date}>{formatDate(b.time_slot?.slot_date)}</p>
                    <p className={s.time}>{formatTime(b.time_slot?.start_time)} · {b.service?.duration_minutes} min</p>
                  </div>
                  <div className={s.cardRight}>
                    <p className={s.price}>${b.service?.price}</p>
                    {canCancel(b) ? (
                      <button
                        className={s.cancelBtn}
                        onClick={() => setConfirmCancel({ id: b.id, title: `${biz} — ${b.service?.title}` })}
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className={s.cancelledLabel}>{b.status}</span>
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
              <strong>{confirmCancel.title}</strong> will be cancelled and the time slot will be released.
            </p>
            <div className={s.modalActions}>
              <button className={s.modalKeep} onClick={() => setConfirmCancel(null)}>Keep it</button>
              <button className={s.modalConfirm} onClick={() => handleCancel(confirmCancel.id)} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
