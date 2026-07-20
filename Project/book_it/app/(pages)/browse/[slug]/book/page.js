"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import s from "./page.module.scss";

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatTime(timeStr) {
  // "09:00:00" → "9:00 AM"
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function dotCount(slots) {
  if (slots >= 6) return 3;
  if (slots >= 3) return 2;
  return 1;
}

export default function BookDatePage() {
  const params = useParams();
  const router = useRouter();

  const [services,          setServices]          = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [byDate,            setByDate]            = useState({});
  const [loadingSlots,      setLoadingSlots]      = useState(false);
  const [booking,           setBooking]           = useState(false);
  const [bookingError,      setBookingError]      = useState(null);

  const today  = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const [viewYear,  setViewYear]  = useState(todayY);
  const [viewMonth, setViewMonth] = useState(todayM);
  const [selDate,   setSelDate]   = useState(null);
  const [selSlot,   setSelSlot]   = useState(null);

  // Require login
  useEffect(() => {
    const user = getUser();
    if (!user) router.replace(`/login?redirect=/browse/${params.slug}/book`);
  }, [params.slug, router]);

  // Load provider services
  useEffect(() => {
    fetch(`/api/services?provider_id=${params.slug}`)
      .then(r => r.json())
      .then(data => {
        const svcs = data.services ?? [];
        setServices(svcs);
        if (svcs.length > 0) setSelectedServiceId(svcs[0].id);
      });
  }, [params.slug]);

  // Load time slots when service changes
  useEffect(() => {
    if (!selectedServiceId) return;
    setLoadingSlots(true);
    setByDate({});
    setSelDate(null);
    setSelSlot(null);
    fetch(`/api/time_slots?service_id=${selectedServiceId}`)
      .then(r => r.json())
      .then(data => setByDate(data.byDate ?? {}))
      .finally(() => setLoadingSlots(false));
  }, [selectedServiceId]);

  const cells = useMemo(() => {
    const first    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out      = Array(first).fill(null);
    for (let d = 1; d <= daysInMo; d++) out.push(d);
    return out;
  }, [viewYear, viewMonth]);

  function dateKey(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isPast(d) {
    return new Date(viewYear, viewMonth, d) < new Date(todayY, todayM, todayD);
  }

  function slotsFor(d) {
    return byDate[dateKey(viewYear, viewMonth, d)] ?? [];
  }

  function isSelected(d) {
    return selDate?.d === d && selDate?.m === viewMonth && selDate?.y === viewYear;
  }

  function isToday(d) {
    return d === todayD && viewMonth === todayM && viewYear === todayY;
  }

  function selectDay(d) {
    if (isPast(d) || slotsFor(d).length === 0) return;
    setSelDate({ y: viewYear, m: viewMonth, d });
    setSelSlot(null);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function goToday() {
    setViewYear(todayY);
    setViewMonth(todayM);
    setSelDate(null);
    setSelSlot(null);
  }

  const selectedSlots = selDate
    ? (byDate[dateKey(selDate.y, selDate.m, selDate.d)] ?? [])
    : [];

  const selectedDateLong = selDate
    ? new Date(selDate.y, selDate.m, selDate.d)
        .toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })
    : "—";

  const selectedDateShort = selDate
    ? new Date(selDate.y, selDate.m, selDate.d)
        .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
        .toUpperCase()
    : "—";

  const bizName = services[0]?.provider?.business_name || services[0]?.provider?.full_name || "Business";

  async function handleContinue() {
    if (!selSlot || !selDate || booking) return;
    const user = getUser();
    if (!user) { router.push("/login"); return; }

    setBooking(true);
    setBookingError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id:  user.id,
          service_id:   selectedServiceId,
          time_slot_id: selSlot.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setBookingError(data.error || "Failed to create booking."); setBooking(false); return; }
      router.push(`/bookings/${data.booking.id}`);
    } catch {
      setBookingError("Network error. Please try again.");
      setBooking(false);
    }
  }

  return (
    <div className={s.shell}>
      <div className={s.topBar}>
        <nav className={s.breadcrumb}>
          <Link href={`/browse/${params.slug}`} className={s.breadcrumbLink}>{bizName}</Link>
          <span className={s.sep}>›</span>
          <span>Book</span>
        </nav>
        <div className={s.steps}>
          <span className={s.stepActive}>1 · Date &amp; Time</span>
          <span className={s.stepArrow}>→</span>
          <span className={s.stepInactive}>2 · Confirm</span>
        </div>
      </div>

      {/* Service selector */}
      {services.length > 1 && (
        <div className={s.serviceSelector}>
          <p className={s.serviceSelectorLabel}>Select a service</p>
          <div className={s.serviceSelectorRow}>
            {services.map(svc => (
              <button
                key={svc.id}
                className={selectedServiceId === svc.id ? s.servicePillActive : s.servicePill}
                onClick={() => setSelectedServiceId(svc.id)}
              >
                {svc.title} · ${svc.price}
              </button>
            ))}
          </div>
        </div>
      )}

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
            {DAY_NAMES.map(n => <div key={n} className={s.dayHeaderCell}>{n}</div>)}
          </div>

          <div className={s.calGrid}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className={s.emptyCell} />;

              const past   = isPast(day);
              const slots  = slotsFor(day);
              const avail  = !past && slots.length > 0;
              const sel    = isSelected(day);
              const tod    = isToday(day);
              const dots   = avail ? dotCount(slots.length) : 0;

              return (
                <div
                  key={day}
                  onClick={() => selectDay(day)}
                  className={[
                    s.cell,
                    sel              && s.cellSelected,
                    (past || !avail) && s.cellDisabled,
                    avail && !sel    && s.cellClickable,
                  ].filter(Boolean).join(" ")}
                >
                  <span className={s.dayNum}>{day}</span>
                  {tod && !sel && <span className={s.newBadge}>today</span>}
                  <span className={s.cellBottom}>
                    {avail && !sel && dots > 0 && (
                      <span className={s.dots}>{"·".repeat(dots)}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={s.legend}>
            {loadingSlots
              ? <span>Loading availability…</span>
              : <>
                  <span><span className={s.legendDots}>·</span> limited slots</span>
                  <span><span className={s.legendDots}>···</span> lots of slots</span>
                </>
            }
          </div>
        </div>

        <div className={s.slotsPanel}>
          <p className={s.availHeader}>
            AVAILABLE · <strong>{selectedDateShort}</strong>
          </p>

          {!selDate ? (
            <p className={s.noSlots}>Select a date to see available times.</p>
          ) : selectedSlots.length === 0 ? (
            <p className={s.noSlots}>No availability on this date.</p>
          ) : (
            <div className={s.slotGrid}>
              {selectedSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelSlot(slot)}
                  className={selSlot?.id === slot.id ? s.slotActive : s.slotBtn}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          )}

          <p className={s.tzNote}>All times in EDT</p>

          <div className={s.summary}>
            <p className={s.summaryLabel}>Selected</p>
            <p className={s.summaryValue}>
              {selSlot ? `${selectedDateLong} · ${formatTime(selSlot.time)}` : "—"}
            </p>
          </div>

          {bookingError && <p style={{ color: "red", fontSize: "0.8rem", margin: "0" }}>{bookingError}</p>}
          <button
            className={s.continueBtn}
            disabled={!selSlot || booking}
            onClick={handleContinue}
          >
            {booking ? "Booking…" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
