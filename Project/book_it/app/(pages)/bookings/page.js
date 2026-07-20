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

const STATUS_LABEL = {
  pending:   "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/login?redirect=/bookings"); return; }
    fetch(`/api/bookings?customer_id=${user.id}`)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

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
                <li key={b.id} className={s.card}>
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
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
