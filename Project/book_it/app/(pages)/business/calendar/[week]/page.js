"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import s from "./page.module.scss";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

const MOCK_BOOKINGS = [
  { id: 1, name: "Sarah K.", dayOffset: 0, startHour: 8, duration: 1 },
  { id: 2, name: "Jane Doe", dayOffset: 0, startHour: 8, duration: 1 },
  { id: 3, name: "Mike R.", dayOffset: 0, startHour: 8, duration: 2 },
  { id: 4, name: "Lisa M.", dayOffset: 1, startHour: 8, duration: 2 },
  { id: 5, name: "Tom B.", dayOffset: 1, startHour: 9, duration: 1 },
  { id: 6, name: "Alex P.", dayOffset: 2, startHour: 8, duration: 1 },
  { id: 7, name: "Rita J.", dayOffset: 2, startHour: 8, duration: 2 },
  { id: 8, name: "Sam Q.", dayOffset: 3, startHour: 8, duration: 1 },
  { id: 9, name: "Dee V.", dayOffset: 3, startHour: 9, duration: 2 },
  { id: 10, name: "Pat L.", dayOffset: 4, startHour: 8, duration: 2 },
];

function parseWeekSlug(slug) {
  const date = new Date(slug + "T00:00:00");
  if (isNaN(date)) return null;
  // Snap to Monday
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

function formatHeaderDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function CalendarWeekPage() {
  const router = useRouter();
  const { week } = useParams();

  const monday = parseWeekSlug(week) ?? getMondayOfCurrentWeek();

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  function navigate(offset) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + offset * 7);
    router.push(`/business/calendar/${toSlug(next)}`);
  }

  function goToday() {
    router.push(`/business/calendar/${toSlug(getMondayOfCurrentWeek())}`);
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
          <div className={s.avatar}>JD</div>
        </div>
      </nav>

      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <button className={s.todayBtn} onClick={goToday}>Today</button>
          <button className={s.arrowBtn} onClick={() => navigate(-1)}>&#8249;</button>
          <button className={s.arrowBtn} onClick={() => navigate(1)}>&#8250;</button>
          <span className={s.weekRange}>{formatWeekRange(monday)}</span>
        </div>
        <div className={s.toolbarRight}>
          <div className={s.viewToggle}>
            <button className={s.viewBtn}>Day</button>
            <button className={`${s.viewBtn} ${s.viewBtnActive}`}>Week</button>
            <button className={s.viewBtn}>Month</button>
          </div>
          <button className={s.newBtn}>+ New</button>
        </div>
      </div>

      <div className={s.grid}>
        {/* Corner cell */}
        <div className={s.cornerCell} />

        {/* Day headers */}
        {days.map((day, i) => (
          <div key={i} className={`${s.dayHeader} ${isToday(day) ? s.todayHeader : ""}`}>
            <span className={s.dayName}>{DAY_NAMES[i]} {day.getDate()}</span>
            {isToday(day) && <span className={s.todayBadge}>today</span>}
          </div>
        ))}

        {/* Time rows */}
        {HOURS.map((hour) => (
          <React.Fragment key={`row-${hour}`}>
            <div className={s.timeCell}>
              {formatHour(hour)}
            </div>
            {days.map((_, dayIdx) => {
              const bookings = MOCK_BOOKINGS.filter(
                (b) => b.dayOffset === dayIdx && b.startHour === hour
              );
              return (
                <div key={`cell-${hour}-${dayIdx}`} className={s.cell}>
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className={s.booking}
                      style={{ "--duration": b.duration }}
                    >
                      {b.name}
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
