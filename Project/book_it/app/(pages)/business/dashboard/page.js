"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "@/lib/auth";
import s from "./page.module.scss";

const TODAY_SCHEDULE = [
  { time: "9:00 AM",  name: "Sarah K.", service: "Leak repair",          status: "confirmed" },
  { time: "10:00 AM", name: "Jane Doe", service: "Leak diagnosis",        status: "confirmed" },
  { time: "11:30 AM", name: "Mike R.",  service: "Drain cleaning",        status: "confirmed" },
  { time: "1:00 PM",  name: null,       service: null,                    status: "open"      },
  { time: "2:30 PM",  name: "Lisa M.",  service: "Water heater install",  status: "pending"   },
  { time: "4:00 PM",  name: "Tom B.",   service: "Pipe inspection",       status: "confirmed" },
];

const PENDING = [
  { name: "Lisa M.", service: "Water heater install", when: "Tue 2:30 PM" },
  { name: "Alex P.", service: "Drain cleaning",       when: "Wed 9:00 AM" },
  { name: "Rita J.", service: "Leak repair",          when: "Thu 11:00 AM" },
];

const QUICK_ACTIONS = [
  "Block off time",
  "Add a service",
  "Set business hours",
  "View public page",
];

function initials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser_] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "provider") {
      router.replace("/login");
      return;
    }
    setUser_(u);
  }, []);

  if (!user) return null;

  const businessName = user.business_name || user.full_name;

  return (
    <div className={s.shell}>
      <div className={s.content}>
        <div className={s.pageHeader}>
          <div>
            <h1 className={s.bizName}>{businessName}</h1>
            <p className={s.dateLabel}>Today · {todayLabel()}</p>
          </div>
          <button className={s.addBtn}>+ Add appointment</button>
        </div>

        <div className={s.kpiRow}>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>TODAY</p>
            <p className={s.kpiValue}>6</p>
            <p className={s.kpiSub}>appointments</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>THIS WEEK</p>
            <p className={s.kpiValue}>24</p>
            <p className={s.kpiSub}>+12% vs last</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>REVENUE (MO)</p>
            <p className={s.kpiValue}>$4,820</p>
            <p className={s.kpiSub}>↑ on track</p>
          </div>
          <div className={s.kpi}>
            <p className={s.kpiLabel}>PENDING</p>
            <p className={s.kpiValue}>3</p>
            <p className={s.kpiSub}>requests to confirm</p>
          </div>
        </div>

        <div className={s.body}>
          <section className={s.schedule}>
            <h2 className={s.sectionTitle}>Today&apos;s schedule</h2>
            <ul className={s.scheduleList}>
              {TODAY_SCHEDULE.map((item, i) => (
                <li key={i} className={`${s.scheduleItem} ${item.status === "open" ? s.openSlot : ""}`}>
                  <span className={s.slotTime}>{item.time}</span>
                  <span className={s.slotInfo}>
                    {item.status === "open"
                      ? <span className={s.available}>— available —</span>
                      : <>
                          <span className={s.slotName}>{item.name}</span>
                          <span className={s.slotService}>{item.service}</span>
                        </>
                    }
                  </span>
                  <span className={`${s.badge} ${s[`badge_${item.status}`]}`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className={s.rightCol}>
            <section className={s.pendingSection}>
              <h2 className={s.sectionTitle}>
                Pending requests
                <span className={s.newBadge}>{PENDING.length} new</span>
              </h2>
              <ul className={s.pendingList}>
                {PENDING.map((p, i) => (
                  <li key={i} className={s.pendingItem}>
                    <div className={s.pendingAvatar}>{initials(p.name)}</div>
                    <div className={s.pendingInfo}>
                      <p className={s.pendingName}>{p.name}</p>
                      <p className={s.pendingDetail}>{p.service} · {p.when}</p>
                    </div>
                    <div className={s.pendingActions}>
                      <button className={s.declineBtn}>Decline</button>
                      <button className={s.acceptBtn}>Accept</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={s.quickSection}>
              <h2 className={s.sectionTitle}>Quick actions</h2>
              <ul className={s.quickList}>
                {QUICK_ACTIONS.map((a, i) => (
                  <li key={i} className={s.quickItem}>
                    <button className={s.quickBtn}>→ {a}</button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
