"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseWeekSlug(slug) {
  const date = new Date(slug + "T00:00:00");
  if (isNaN(date)) return null;
  return getMondayOf(date);
}

function getMondayOfCurrentWeek() {
  return getMondayOf(new Date());
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

function formatDayLabel(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
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
  return parseInt(timeStr.split(":")[0], 10);
}

function durationToBlocks(minutes) {
  return Math.max(1, Math.round(minutes / 60));
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarWeekPage() {
  const router   = useRouter();
  const { week } = useParams();
  const monday   = parseWeekSlug(week) ?? getMondayOfCurrentWeek();

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view, setView]         = useState("week");

  // selected day for day-view (default: today if in this week, else monday)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(monday);
    end.setDate(monday.getDate() + 6);
    return today >= monday && today <= end ? today : new Date(monday);
  });

  // auto switch to day view on narrow screens
  useEffect(() => {
    if (window.innerWidth < 640) setView("day");
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const displayDays = view === "day"
    ? days.filter(d => dayKey(d) === dayKey(selectedDate))
    : days;

  useEffect(() => {
    const user = getUser();
    if (!user) return;
    setLoading(true);
    fetch(`/api/bookings?provider_id=${user.id}&week=${toSlug(monday)}`)
      .then(r => r.json())
      .then(data => setBookings(data.bookings ?? []))
      .finally(() => setLoading(false));
  }, [week]);

  function navigateWeek(offset) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + offset * 7);
    router.push(`/business/calendar/${toSlug(next)}`);
  }

  function navigateDay(offset) {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + offset);
    setSelectedDate(next);
    const nextMonday = getMondayOf(next);
    if (toSlug(nextMonday) !== toSlug(monday)) {
      router.push(`/business/calendar/${toSlug(nextMonday)}`);
    }
  }

  function navigate(offset) {
    if (view === "day") navigateDay(offset);
    else navigateWeek(offset);
  }

  function goToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
    router.push(`/business/calendar/${toSlug(getMondayOfCurrentWeek())}`);
  }

  function switchView(v) {
    setView(v);
    if (v === "day") {
      // select today if it's in the current week, else first displayed day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(monday);
      end.setDate(monday.getDate() + 6);
      setSelectedDate(today >= monday && today <= end ? today : new Date(monday));
    }
  }

  const bookingMap = {};
  for (const b of bookings) {
    if (!b.time_slot) continue;
    const date = b.time_slot.slot_date;
    const hour = timeToHour(b.time_slot.start_time);
    if (!bookingMap[date]) bookingMap[date] = {};
    if (!bookingMap[date][hour]) bookingMap[date][hour] = [];
    bookingMap[date][hour].push(b);
  }

  const colCount = displayDays.length;

  return (
    <div className={s.shell}>
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <button className={s.todayBtn} onClick={goToday}>Today</button>
          <button className={s.arrowBtn} onClick={() => navigate(-1)}>&#8249;</button>
          <button className={s.arrowBtn} onClick={() => navigate(1)}>&#8250;</button>
          <span className={s.weekRange}>
            {view === "day" ? formatDayLabel(selectedDate) : formatWeekRange(monday)}
          </span>
          {loading && <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: 8 }}>Loading…</span>}
        </div>
        <div className={s.toolbarRight}>
          <div className={s.viewToggle}>
            <button
              className={`${s.viewBtn} ${view === "day" ? s.viewBtnActive : ""}`}
              onClick={() => switchView("day")}
            >Day</button>
            <button
              className={`${s.viewBtn} ${view === "week" ? s.viewBtnActive : ""}`}
              onClick={() => switchView("week")}
            >Week</button>
          </div>
        </div>
      </div>

      <div
        className={s.grid}
        style={{ gridTemplateColumns: `52px repeat(${colCount}, 1fr)` }}
      >
        <div className={s.cornerCell} />

        {displayDays.map((day, i) => (
          <div key={i} className={`${s.dayHeader} ${isToday(day) ? s.todayHeader : ""}`}>
            <span className={s.dayName}>{DAY_NAMES[days.indexOf(day)] ?? ""} {day.getDate()}</span>
            {isToday(day) && <span className={s.todayBadge}>today</span>}
          </div>
        ))}

        {HOURS.map(hour => (
          <React.Fragment key={`row-${hour}`}>
            <div className={s.timeCell}>{formatHour(hour)}</div>
            {displayDays.map((day, dayIdx) => {
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
