"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user,         setUser_]        = useState(null);
  const [weekBookings, setWeekBookings] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") { router.replace("/login"); return; }
    setUser_(u);

    const monday = getMondayOfWeek(new Date());
    fetch(`/api/bookings?provider_id=${u.id}&week=${monday}`)
      .then(r => r.json())
      .then(data => setWeekBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  const today = todayISO();

  const todayBookings = weekBookings
    .filter(b => b.time_slot?.slot_date === today)
    .sort((a, b) => a.time_slot.start_time.localeCompare(b.time_slot.start_time));

  const pendingCount  = weekBookings.filter(b => b.status === "pending").length;
  const weekRevenue   = weekBookings
    .filter(b => b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.service?.price ?? 0), 0);

  return (
    <div className={s.shell}>
      <div className={s.content}>
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.bizName}>{user.business_name || user.full_name}</h1>
            <p className={s.dateLabel}>Today · {todayLabel()}</p>
          </div>
        </div>

        <div className={s.kpiRow}>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>TODAY</p>
            <p className={s.kpiValue}>{loading ? "—" : todayBookings.length}</p>
            <p className={s.kpiSub}>appointments</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>THIS WEEK</p>
            <p className={s.kpiValue}>{loading ? "—" : weekBookings.filter(b => b.status !== "cancelled").length}</p>
            <p className={s.kpiSub}>bookings</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>REVENUE (WK)</p>
            <p className={s.kpiValue}>{loading ? "—" : `$${weekRevenue}`}</p>
            <p className={s.kpiSub}>this week</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>PENDING</p>
            <p className={s.kpiValue}>{loading ? "—" : pendingCount}</p>
            <p className={s.kpiSub}>to confirm</p>
          </div>
        </div>

        <div className={s.body}>
          <section className={s.schedule}>
            <h2 className={s.sectionTitle}>Today&apos;s schedule</h2>
            {loading ? (
              <p className={s.empty}>Loading…</p>
            ) : todayBookings.length === 0 ? (
              <p className={s.empty}>No bookings today.</p>
            ) : (
              <ul className={s.scheduleList}>
                {todayBookings.map(b => (
                  <li key={b.id} className={s.scheduleItem}>
                    <span className={s.slotTime}>{formatTime(b.time_slot.start_time)}</span>
                    <span className={s.slotInfo}>
                      <span className={s.slotName}>{b.customer?.full_name ?? "Customer"}</span>
                      <span className={s.slotService}>{b.service?.title}</span>
                    </span>
                    <span className={`${s.badge} ${s[`badge_${b.status}`]}`}>
                      {b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
