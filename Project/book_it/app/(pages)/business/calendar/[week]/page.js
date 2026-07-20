"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseWeekSlug(slug) {
  const date = new Date(slug + "T00:00:00");
  if (isNaN(date)) return null;
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  today.setDate(today.getDate() + diff);
  return today;
}

function toSlug(date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekRange(monday) {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const month = monday.toLocaleDateString("en-US", { month: "long" });
  return `${month} ${monday.getDate()} – ${friday.getDate()}, ${monday.getFullYear()}`;
}

function formatHour(h) {
  if (h === 12) return "12p";
  if (h > 12) return `${h - 12}p`;
  return `${h}a`;
}

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function timeToHour(timeStr) {
  // "09:00:00" → 9
  return parseInt(timeStr.split(":")[0], 10);
}

function durationToBlocks(minutes) {
  // round to nearest hour block (each block = 1 hr)
  return Math.max(1, Math.round(minutes / 60));
}

export default function CalendarWeekPage() {
  const router    = useRouter();
  const { week }  = useParams();
  const monday    = parseWeekSlug(week) ?? getMondayOfCurrentWeek();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    setLoading(true);
    fetch(`/api/bookings?provider_id=${user.id}&week=${toSlug(monday)}`)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [week]);

  function navigate(offset) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + offset * 7);
    router.push(`/business/calendar/${toSlug(next)}`);
  }

  function goToday() {
    router.push(`/business/calendar/${toSlug(getMondayOfCurrentWeek())}`);
  }

  // Build lookup: { "2026-07-21": { 9: [booking, ...], 10: [...] } }
  const bookingMap = {};
  for (const b of bookings) {
    if (!b.time_slot) continue;
    const date = b.time_slot.slot_date;
    const hour = timeToHour(b.time_slot.start_time);
    if (!bookingMap[date]) bookingMap[date] = {};
    if (!bookingMap[date][hour]) bookingMap[date][hour] = [];
    bookingMap[date][hour].push(b);
  }

  function dayKey(date) {
    return date.toISOString().slice(0, 10);
  }

  return (
    <div className={s.shell}>
      <nav className={s.nav}>
        <span className={s.logo}>Book <em>it.</em></span>
        <div className={s.navLinks}>
          <Link href="/business/dashboard" className={s.navLink}>Dashboard</Link>
          <Link href="#" className={`${s.navLink} ${s.active}`}>Calendar</Link>
          <Link href="/business/customers" className={s.navLink}>Customers</Link>
          <Link href="/business/settings" className={s.navLink}>Settings</Link>
        </div>
        <div className={s.navRight}>
          <button className={s.bookingsBtn}>Bookings</button>
          <div className={s.avatar}>
            {getUser()?.full_name?.slice(0, 2).toUpperCase() ?? "??"}
          </div>
        </div>
      </nav>

      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <button className={s.todayBtn} onClick={goToday}>Today</button>
          <button className={s.arrowBtn} onClick={() => navigate(-1)}>&#8249;</button>
          <button className={s.arrowBtn} onClick={() => navigate(1)}>&#8250;</button>
          <span className={s.weekRange}>{formatWeekRange(monday)}</span>
          {loading && <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: 8 }}>Loading…</span>}
        </div>
        <div className={s.toolbarRight}>
          <div className={s.viewToggle}>
            <button className={s.viewBtn}>Day</button>
            <button className={`${s.viewBtn} ${s.viewBtnActive}`}>Week</button>
            <button className={s.viewBtn}>Month</button>
          </div>
        </div>
      </div>

      <div className={s.grid}>
        <div className={s.cornerCell} />

        {days.map((day, i) => (
          <div key={i} className={`${s.dayHeader} ${isToday(day) ? s.todayHeader : ""}`}>
            <span className={s.dayName}>{DAY_NAMES[i]} {day.getDate()}</span>
            {isToday(day) && <span className={s.todayBadge}>today</span>}
          </div>
        ))}

        {HOURS.map(hour => (
          <React.Fragment key={`row-${hour}`}>
            <div className={s.timeCell}>{formatHour(hour)}</div>
            {days.map((day, dayIdx) => {
              const cellBookings = bookingMap[dayKey(day)]?.[hour] ?? [];
              return (
                <div key={`cell-${hour}-${dayIdx}`} className={s.cell}>
                  {cellBookings.map(b => (
                    <div
                      key={b.id}
                      className={s.booking}
                      style={{ "--duration": durationToBlocks(b.service?.duration_minutes ?? 60) }}
                      title={`${b.customer?.full_name} · ${b.service?.title}`}
                    >
                      <span className={s.bookingName}>{b.customer?.full_name ?? "Customer"}</span>
                      <span className={s.bookingService}>{b.service?.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
