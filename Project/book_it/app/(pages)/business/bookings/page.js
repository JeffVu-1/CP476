"use client";

import { useState, useEffect } from "react";
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

const FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const ACTIONS = {
  pending:   [{ label: "Accept",   next: "confirmed", style: "accept"   },
              { label: "Decline",  next: "cancelled",  style: "decline"  }],
  confirmed: [{ label: "Complete", next: "completed", style: "complete" },
              { label: "Cancel",   next: "cancelled",  style: "decline"  }],
  completed: [],
  cancelled: [],
};

export default function ProviderBookingsPage() {
  const router = useRouter();
  const [bookings,  setBookings]  = useState([]);
  const [filter,    setFilter]    = useState("All");
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "provider") { router.replace("/login"); return; }
    fetch(`/api/bookings?provider_id=${user.id}`)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  async function updateStatus(id, status) {
    setUpdating(id);
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
    setUpdating(null);
  }

  const filtered = filter === "All"
    ? bookings
    : bookings.filter(b => b.status === filter.toLowerCase());

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className={s.shell}>
      <div className={s.content}>
        <h1 className={s.heading}>Bookings</h1>

        <div className={s.filterRow}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={filter === f ? s.filterActive : s.filterBtn}
              onClick={() => setFilter(f)}
            >
              {f}
              {f !== "All" && counts[f.toLowerCase()] > 0 && (
                <span className={s.filterCount}>{counts[f.toLowerCase()]}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className={s.empty}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={s.empty}>No {filter !== "All" ? filter.toLowerCase() : ""} bookings.</p>
        ) : (
          <ul className={s.list}>
            {filtered.map(b => (
              <li key={b.id} className={s.card}>
                <div className={s.cardTop}>
                  <div className={s.customerInfo}>
                    <div className={s.avatar}>
                      {(b.customer?.full_name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={s.customerName}>{b.customer?.full_name ?? "Customer"}</p>
                      <p className={s.customerEmail}>{b.customer?.email}</p>
                    </div>
                  </div>
                  <span className={`${s.badge} ${s[`badge_${b.status}`]}`}>{b.status}</span>
                </div>

                <div className={s.cardDetails}>
                  <div className={s.detail}>
                    <p className={s.detailLabel}>Service</p>
                    <p className={s.detailValue}>{b.service?.title}</p>
                  </div>
                  <div className={s.detail}>
                    <p className={s.detailLabel}>Date & Time</p>
                    <p className={s.detailValue}>{formatDate(b.time_slot?.slot_date)} · {formatTime(b.time_slot?.start_time)}</p>
                  </div>
                  <div className={s.detail}>
                    <p className={s.detailLabel}>Duration</p>
                    <p className={s.detailValue}>{b.service?.duration_minutes} min</p>
                  </div>
                  <div className={s.detail}>
                    <p className={s.detailLabel}>Price</p>
                    <p className={s.detailValue}>${b.service?.price}</p>
                  </div>
                </div>

                {ACTIONS[b.status]?.length > 0 && (
                  <div className={s.cardActions}>
                    {ACTIONS[b.status].map(action => (
                      <button
                        key={action.next}
                        className={s[action.style]}
                        disabled={updating === b.id}
                        onClick={() => updateStatus(b.id, action.next)}
                      >
                        {updating === b.id ? "…" : action.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
