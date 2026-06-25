"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BUSINESSES } from "@/lib/data";
import s from "./page.module.scss";

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMockAvail(year, month, day) {
  const seed = (day * 13 + month * 7 + (year % 100) * 3) % 12;
  if (seed < 2) return { status: "booked", slots: [] };
  if (seed < 4) return { status: "few",  slots: ["9:00 AM", "2:00 PM"] };
  if (seed < 7) return { status: "some", slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:30 PM"] };
  return {
    status: "lots",
    slots: ["9:00 AM", "9:30 AM", "10:00 AM", "11:00 AM", "12:30 PM", "1:00 PM", "2:00 PM", "3:30 PM"],
  };
}

function dotCount(status) {
  if (status === "few")  return 1;
  if (status === "some") return 2;
  if (status === "lots") return 3;
  return 0;
}

export default function BookDatePage() {
  const params  = useParams();
  const router  = useRouter();
  const b       = BUSINESSES.find((biz) => biz.id === params.slug);

  const today  = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const [viewYear,  setViewYear]  = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);
  const [selDate,   setSelDate]   = useState({ y: todayY, m: todayM, d: todayD });
  const [selTime,   setSelTime]   = useState(null);

  const cells = useMemo(() => {
    const first      = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMo   = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out        = Array(first).fill(null);
    for (let d = 1; d <= daysInMo; d++) out.push(d);
    return out;
  }, [viewYear, viewMonth]);

  function isPast(d) {
    return new Date(viewYear, viewMonth, d) < new Date(todayY, todayM, todayD);
  }

  function availFor(d) {
    if (isPast(d)) return null;
    return getMockAvail(viewYear, viewMonth, d);
  }

  function isSelected(d) {
    return d === selDate.d && viewMonth === selDate.m && viewYear === selDate.y;
  }

  function isToday(d) {
    return d === todayD && viewMonth === todayM && viewYear === todayY;
  }

  function selectDay(d) {
    const a = availFor(d);
    if (!a || a.status === "booked") return;
    setSelDate({ y: viewYear, m: viewMonth, d });
    setSelTime(null);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  function goToday() {
    setViewYear(todayY);
    setViewMonth(todayM);
    setSelDate({ y: todayY, m: todayM, d: todayD });
    setSelTime(null);
  }

  const selectedAvail = getMockAvail(selDate.y, selDate.m, selDate.d);

  const selectedDateLong = useMemo(() => {
    return new Date(selDate.y, selDate.m, selDate.d)
      .toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
  }, [selDate]);

  const selectedDateShort = useMemo(() => {
    return new Date(selDate.y, selDate.m, selDate.d)
      .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      .toUpperCase();
  }, [selDate]);

  function handleContinue() {
    if (!selTime) return;
    const bookingId = `${selDate.y}${String(selDate.m + 1).padStart(2, "0")}${String(selDate.d).padStart(2, "0")}`;
    const dd = String(selDate.d).padStart(2, "0");
    const mm = String(selDate.m + 1).padStart(2, "0");
    router.push(
      `/bookings/${bookingId}?slug=${params.slug}&date=${selDate.y}-${mm}-${dd}&time=${encodeURIComponent(selTime)}`
    );
  }

  if (!b) return null;

  return (
    <div className={s.shell}>
      <div className={s.topBar}>
        <nav className={s.breadcrumb}>
          <Link href={`/browse/${params.slug}`} className={s.breadcrumbLink}>{b.name}</Link>
          <span className={s.sep}>›</span>
          <span>Book</span>
        </nav>

        <div className={s.steps}>
          <span className={s.stepActive}>1 · Date</span>
          <span className={s.stepArrow}>→</span>
          <span className={s.stepInactive}>2 · Time</span>
          <span className={s.stepArrow}>→</span>
          <span className={s.stepInactive}>3 · Details</span>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.calPanel}>
          <div className={s.calHeader}>
            <button className={s.chevronBtn} onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={15} />
            </button>
            <span className={s.monthTitle}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button className={s.chevronBtn} onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={15} />
            </button>
            <button className={s.todayBtn} onClick={goToday}>Today</button>
          </div>

          <div className={s.dayHeaderRow}>
            {DAY_NAMES.map((n) => (
              <div key={n} className={s.dayHeaderCell}>{n}</div>
            ))}
          </div>
          <div className={s.calGrid}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className={s.emptyCell} />;

              const a       = availFor(day);
              const past    = !a;
              const booked  = a?.status === "booked";
              const sel     = isSelected(day);
              const tod     = isToday(day);
              const dots    = a ? dotCount(a.status) : 0;

              return (
                <div
                  key={day}
                  onClick={() => selectDay(day)}
                  className={[
                    s.cell,
                    sel                        && s.cellSelected,
                    (past || booked)           && s.cellDisabled,
                    !past && !booked && !sel   && s.cellClickable,
                  ].filter(Boolean).join(" ")}
                >
                  <span className={s.dayNum}>{day}</span>
                  {tod && !sel && <span className={s.newBadge}>new</span>}
                  <span className={s.cellBottom}>
                    {booked  && <span className={s.bookedDot}>●</span>}
                    {!booked && dots > 0 && (
                      <span className={s.dots}>{"·".repeat(dots)}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={s.legend}>
            <span><span className={s.legendDot}>●</span> fully booked</span>
            <span><span className={s.legendDots}>●●●</span> lots of slots</span>
          </div>
        </div>

        <div className={s.slotsPanel}>
          <p className={s.availHeader}>
            AVAILABLE · <strong>{selectedDateShort}</strong>
          </p>

          {selectedAvail.slots.length === 0 ? (
            <p className={s.noSlots}>No availability on this date.</p>
          ) : (
            <div className={s.slotGrid}>
              {selectedAvail.slots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelTime(t)}
                  className={selTime === t ? s.slotActive : s.slotBtn}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <p className={s.tzNote}>All times in EDT · 30 min slots</p>

          <div className={s.summary}>
            <p className={s.summaryLabel}>Selected</p>
            <p className={s.summaryValue}>
              {selTime ? `${selectedDateLong} · ${selTime}` : "—"}
            </p>
          </div>

          <button
            className={s.continueBtn}
            disabled={!selTime}
            onClick={handleContinue}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
