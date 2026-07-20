"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  X, Lightbulb, ArrowLeft, ArrowRight, Check,
  ChevronDown, ChevronUp, Upload, ImagePlus, Trash2,
  Clock, DollarSign, Pencil, Plus
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getUser } from "@/lib/auth"
import s from "./page.module.scss"

const WIZARD_STEPS = [
  { n: 1, label: "Details" },
  { n: 2, label: "Hours" },
  { n: 3, label: "Photos" },
  { n: 4, label: "Save" },
]

const CATEGORIES = [
  { id: 1, name: "Home Services",        icon_emoji: "🏠" },
  { id: 2, name: "Beauty & Grooming",    icon_emoji: "✂️" },
  { id: 3, name: "Pet Care",             icon_emoji: "🐾" },
  { id: 4, name: "Fitness & Wellness",   icon_emoji: "💪" },
  { id: 5, name: "Tutoring & Education", icon_emoji: "📚" },
  { id: 6, name: "Photography",          icon_emoji: "📷" },
  { id: 7, name: "Cleaning",             icon_emoji: "🧹" },
  { id: 8, name: "Other",                icon_emoji: "⭐" },
]

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map((d, i) => [d, { open: i < 5, from: "09:00", to: "17:00" }])
)

let nextId = 10

function blankService() {
  return {
    id: `temp_${nextId++}`,
    title: "", category_id: "", duration_minutes: "", price: "",
    delivery_mode: "in-person", description: "",
    hours: Object.fromEntries(DAYS.map((d, i) => [d, { open: i < 5, from: "09:00", to: "17:00" }])),
    photos: [],
    _isNew: true,
  }
}

export default function SettingsPage() {
  const router  = useRouter()
  const fileRef = useRef(null)

  const [services, setServices]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState("list")
  const [editing, setEditing]       = useState(null)
  const [wizardStep, setWizardStep] = useState(1)
  const [toast, setToast]           = useState(null)
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== "provider") { router.replace("/login"); return }
    fetchServices(user.id)
  }, [router])

  async function fetchServices(providerId) {
    setLoading(true)
    try {
      const res  = await fetch(`/api/services?provider_id=${providerId}`)
      const data = await res.json()
      if (res.ok) {
        setServices(data.services.map(svc => ({
          ...svc,
          price: String(svc.price),
          hours: DEFAULT_HOURS,
          photos: [],
        })))
      }
    } catch (e) {
      showToast("Failed to load services.", "error")
    } finally {
      setLoading(false)
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function openWizard(svc) {
    setEditing({ ...svc })
    setWizardStep(1)
    setSaved(false)
    setView("wizard")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function openNew() {
    openWizard(blankService())
  }

  function backToList() {
    setView("list")
    setEditing(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function setField(field, value) {
    setEditing(prev => ({ ...prev, [field]: value }))
  }

  function toggleDay(day) {
    setEditing(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], open: !prev.hours[day].open } }
    }))
  }

  function updateHour(day, field, val) {
    setEditing(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: val } }
    }))
  }

  function handleFiles(files) {
    const incoming = Array.from(files).map(f => ({
      id: nextId++, name: f.name, url: URL.createObjectURL(f),
    }))
    setEditing(prev => ({ ...prev, photos: [...prev.photos, ...incoming] }))
  }

  function removePhoto(photoId) {
    setEditing(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== photoId) }))
  }

  function validateStep() {
    if (wizardStep === 1) {
      if (!editing.title.trim())    { showToast("Service name is required.", "error"); return false }
      if (!editing.category_id)     { showToast("Please select a category.", "error"); return false }
      if (!editing.duration_minutes){ showToast("Duration is required.", "error"); return false }
      if (!editing.price)           { showToast("Price is required.", "error"); return false }
    }
    return true
  }

  function goNext() {
    if (!validateStep()) return
    setWizardStep(s => Math.min(s + 1, 4))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function goBack() {
    if (wizardStep === 1) return backToList()
    setWizardStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleSave() {
    const user = getUser()
    if (!user) return

    setSaving(true)
    try {
      // Step 1 — create the service row
      const svcRes  = await fetch("/api/services", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id:      user.id,
          category_id:      editing.category_id,
          title:            editing.title,
          description:      editing.description,
          price:            editing.price,
          duration_minutes: editing.duration_minutes,
          delivery_mode:    editing.delivery_mode,
        }),
      })
      const svcData = await svcRes.json()
      if (!svcRes.ok) { showToast(svcData.error || "Failed to save service.", "error"); return }

      const serviceId = svcData.service.id

      // Step 2 — generate time slots from the hours config
      const slotsRes  = await fetch("/api/time_slots", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id:       serviceId,
          duration_minutes: Number(editing.duration_minutes),
          hours:            editing.hours,
          weeks_ahead:      4,
        }),
      })
      const slotsData = await slotsRes.json()
      if (!slotsRes.ok) { showToast(slotsData.error || "Failed to save availability.", "error"); return }

      // Update local list with the real DB id
      setServices(prev => {
        const exists = prev.find(s => s.id === editing.id)
        const updated = { ...editing, id: serviceId, _isNew: false }
        return exists ? prev.map(s => s.id === editing.id ? updated : s) : [...prev, updated]
      })
      setSaved(true)
      showToast(`Service saved with ${slotsData.count ?? 0} time slots generated.`)
    } catch (e) {
      showToast("Network error. Try again.", "error")
    } finally {
      setSaving(false)
    }
  }

  function catLabel(id) {
    const c = CATEGORIES.find(c => c.id === Number(id))
    return c ? `${c.icon_emoji} ${c.name}` : "—"
  }

  if (view === "list") {
    return (
      <div className={s.shell}>
        {toast && (
          <div className={`${s.toast} ${s[toast.type]}`}>
            {toast.type === "success" && <Check size={14} />}
            {toast.msg}
          </div>
        )}

        <div className={s.listHeader}>
          <div>
            <h1 className={s.heading}>Your services</h1>
            <p className={s.subheading}>Click a service to edit its details, hours, and photos.</p>
          </div>
          <button className={s.addServiceBtn} onClick={openNew}>
            <Plus size={15} /> Add service
          </button>
        </div>

        {loading ? (
          <div className={s.emptyState}>
            <p className={s.emptyBody}>Loading your services…</p>
          </div>
        ) : services.length === 0 ? (
          <div className={s.emptyState}>
            <p className={s.emptyTitle}>No services yet</p>
            <p className={s.emptyBody}>Add your first service to start accepting bookings.</p>
            <button className={s.addServiceBtn} onClick={openNew}>
              <Plus size={15} /> Add your first service
            </button>
          </div>
        ) : (
          <div className={s.serviceCardList}>
            {services.map(svc => (
              <button key={svc.id} className={s.serviceListCard} onClick={() => openWizard(svc)}>
                <div className={s.serviceCardInfo}>
                  <p className={s.serviceCardTitle}>{svc.title || "Untitled service"}</p>
                  <p className={s.serviceCardMeta}>
                    {catLabel(svc.category_id)}
                    {svc.duration_minutes && <span><Clock size={11} /> {svc.duration_minutes} min</span>}
                    {svc.price && <span><DollarSign size={11} />{svc.price}</span>}
                    {svc.delivery_mode && <span>{svc.delivery_mode}</span>}
                  </p>
                </div>
                <div className={s.serviceCardEdit}>
                  <Pencil size={14} /> Edit
                </div>
              </button>
            ))}
          </div>
        )}

        <div className={s.listFooter}>
          <Link href="/business/dashboard" className={s.backBtn}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={s.shell}>
      {toast && (
        <div className={`${s.toast} ${s[toast.type]}`}>
          {toast.type === "success" && <Check size={14} />}
          {toast.msg}
        </div>
      )}

      <div className={s.wizardHeader}>
        <button className={s.wizardBackLink} onClick={backToList}>
          <ArrowLeft size={14} /> All services
        </button>
        <p className={s.wizardServiceName}>
          {editing?.title || "New service"}
        </p>
      </div>

      <div className={s.stepperWrapper}>
        <div className={s.stepper}>
          {WIZARD_STEPS.map((st, i) => {
            const done   = st.n < wizardStep
            const active = st.n === wizardStep
            return (
              <div
                key={st.n}
                className={s.stepItem}
                onClick={() => { if (done) setWizardStep(st.n) }}
                style={{ cursor: done ? "pointer" : "default" }}
              >
                {i > 0 && (
                  <div className={`${s.stepLine} ${done || active ? s.stepLineDone : ""}`} />
                )}
                <div className={`${s.stepCircle} ${active ? s.stepActive : ""} ${done ? s.stepDone : ""}`}>
                  {done ? <Check size={12} /> : st.n}
                </div>
                <span className={`${s.stepLabel} ${active ? s.stepLabelActive : ""}`}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Nav — always in the same spot, right under the stepper ── */}
      {!saved && (
        <div className={s.footer}>
          <button className={s.backBtn} onClick={goBack}>
            <ArrowLeft size={14} /> {wizardStep === 1 ? "All services" : "Back"}
          </button>
          <div className={s.footerSpacer} />
          {wizardStep < 4 && (
            <button className={s.nextBtn} onClick={goNext}>
              {wizardStep === 3 ? "Review" : "Next"} <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {wizardStep === 1 && (
        <>
          <div className={s.pageHeader}>
            <h1 className={s.heading}>Service details</h1>
            <p className={s.subheading}>Describe what you offer and how it's delivered.</p>
          </div>

          <div className={s.formGrid}>
            <label className={s.fieldLabel} style={{ gridColumn: "1 / -1" }}>
              <span>Service name <span className={s.req}>*</span></span>
              <input
                className={s.fieldInput}
                type="text"
                placeholder="e.g. Haircut & style"
                value={editing.title}
                onChange={e => setField("title", e.target.value)}
              />
            </label>

            <label className={s.fieldLabel}>
              <span>Category <span className={s.req}>*</span></span>
              <select
                className={s.fieldSelect}
                value={editing.category_id}
                onChange={e => setField("category_id", Number(e.target.value))}
              >
                <option value="">Select…</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.icon_emoji} {c.name}</option>
                ))}
              </select>
            </label>

            <label className={s.fieldLabel}>
              <span>Delivery mode <span className={s.req}>*</span></span>
              <select
                className={s.fieldSelect}
                value={editing.delivery_mode}
                onChange={e => setField("delivery_mode", e.target.value)}
              >
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
              </select>
            </label>

            <label className={s.fieldLabel}>
              <span>Duration <span className={s.req}>*</span></span>
              <div className={s.durationWrapper}>
                <input
                  className={s.durationInput}
                  type="number" min="5" step="5" placeholder="30"
                  value={editing.duration_minutes}
                  onChange={e => setField("duration_minutes", e.target.value)}
                />
                <span className={s.durationUnit}>min</span>
              </div>
            </label>

            <label className={s.fieldLabel}>
              <span>Price <span className={s.req}>*</span></span>
              <div className={s.priceWrapper}>
                <span className={s.priceDollar}>$</span>
                <input
                  className={s.priceInput}
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={editing.price}
                  onChange={e => setField("price", e.target.value)}
                />
              </div>
            </label>

            <label className={s.fieldLabel} style={{ gridColumn: "1 / -1" }}>
              <span>Description <span className={s.optional}>(optional)</span></span>
              <textarea
                className={s.fieldTextarea}
                placeholder="What's included, what to expect…"
                value={editing.description}
                rows={3}
                onChange={e => setField("description", e.target.value)}
              />
            </label>
          </div>
        </>
      )}

      {wizardStep === 2 && (
        <>
          <div className={s.pageHeader}>
            <h1 className={s.heading}>Availability</h1>
            <p className={s.subheading}>Set when customers can book <strong>{editing.title || "this service"}</strong>.</p>
          </div>

          <div className={s.hoursList}>
            {DAYS.map(day => (
              <div key={day} className={`${s.dayRow} ${!editing.hours[day].open ? s.dayRowClosed : ""}`}>
                <label className={s.dayToggle}>
                  <input
                    type="checkbox"
                    checked={editing.hours[day].open}
                    onChange={() => toggleDay(day)}
                    className={s.toggleInput}
                  />
                  <span className={s.toggleTrack}>
                    <span className={`${s.toggleThumb} ${editing.hours[day].open ? s.toggleThumbOn : ""}`} />
                  </span>
                  <span className={s.dayName}>{day}</span>
                </label>

                {editing.hours[day].open ? (
                  <div className={s.timeRange}>
                    <input
                      type="time"
                      className={s.timeInput}
                      value={editing.hours[day].from}
                      onChange={e => updateHour(day, "from", e.target.value)}
                    />
                    <span className={s.timeSep}>–</span>
                    <input
                      type="time"
                      className={s.timeInput}
                      value={editing.hours[day].to}
                      onChange={e => updateHour(day, "to", e.target.value)}
                    />
                  </div>
                ) : (
                  <span className={s.closedLabel}>Closed</span>
                )}
              </div>
            ))}
          </div>

          <div className={s.tip}>
            <p className={s.tipTitle}><Lightbulb size={13} /> Tip</p>
            <p className={s.tipBody}>These hours only apply to <strong>{editing.title || "this service"}</strong>. Each service can have different availability.</p>
          </div>
        </>
      )}

      {wizardStep === 3 && (
        <>
          <div className={s.pageHeader}>
            <h1 className={s.heading}>Photos</h1>
            <p className={s.subheading}>Add Cover Photo For <strong>{editing.title || "this service"}</strong>.</p>
          </div>

          <div
            className={s.dropZone}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(s.dragOver) }}
            onDragLeave={e => e.currentTarget.classList.remove(s.dragOver)}
            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove(s.dragOver); handleFiles(e.dataTransfer.files) }}
          >
            <Upload size={28} strokeWidth={1.5} className={s.uploadIcon} />
            <p className={s.dropTitle}>Drop photos here or <span>browse</span></p>
            <p className={s.dropSub}>PNG, JPG up to 10 MB each</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className={s.hiddenInput} onChange={e => handleFiles(e.target.files)} />
          </div>

          {editing.photos.length > 0 && (
            <div className={s.photoGrid}>
              {editing.photos.map(photo => (
                <div key={photo.id} className={s.photoThumb}>
                  <img src={photo.url} alt={photo.name} />
                  <button className={s.photoRemove} onClick={() => removePhoto(photo.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button className={s.addPhotoTile} onClick={() => fileRef.current?.click()}>
                <ImagePlus size={20} strokeWidth={1.5} />
                <span>Add more</span>
              </button>
            </div>
          )}

          <div className={s.tip}>
            <p className={s.tipTitle}><Lightbulb size={13} /> Tip</p>
            <p className={s.tipBody}>Listings with photos get 3× more bookings.</p>
          </div>
        </>
      )}

      {wizardStep === 4 && (
        <>
          <div className={s.pageHeader}>
            <h1 className={s.heading}>Review &amp; save</h1>
            <p className={s.subheading}>Everything look good?</p>
          </div>

          {saved ? (
            <div className={s.publishSuccess}>
              <div className={s.publishCheckCircle}><Check size={28} /></div>
              <h2 className={s.publishSuccessTitle}>Service saved!</h2>
              <p className={s.publishSuccessBody}>
                <strong>{editing.title}</strong> has been updated.
              </p>
              <button className={s.backToListBtn} onClick={backToList}>
                Back to all services
              </button>
            </div>
          ) : (
            <>
              <div className={s.summaryGrid}>
                <div className={s.summaryCard}>
                  <p className={s.summaryLabel}>Service</p>
                  <p className={s.summaryValue}>{editing.title || <span className={s.empty}>Not set</span>}</p>
                  <p className={s.summaryMeta}>{catLabel(editing.category_id)}</p>
                </div>
                <div className={s.summaryCard}>
                  <p className={s.summaryLabel}>Pricing & duration</p>
                  <p className={s.summaryValue}>${editing.price || "—"}</p>
                  <p className={s.summaryMeta}>{editing.duration_minutes ? `${editing.duration_minutes} min` : "—"} · {editing.delivery_mode}</p>
                </div>
                <div className={s.summaryCard}>
                  <p className={s.summaryLabel}>Availability</p>
                  <p className={s.summaryValue}>{DAYS.filter(d => editing.hours[d].open).length} days / week</p>
                  <p className={s.summaryMeta}>{DAYS.filter(d => editing.hours[d].open).map(d => d.slice(0, 3)).join(", ")} · 4 weeks of slots</p>
                </div>
                <div className={s.summaryCard}>
                  <p className={s.summaryLabel}>Photos</p>
                  <p className={s.summaryValue}>{editing.photos.length} photo{editing.photos.length !== 1 ? "s" : ""}</p>
                  <p className={s.summaryMeta}>{editing.photos.length === 0 ? "None uploaded" : "Ready"}</p>
                </div>
              </div>

              <button className={s.publishBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : <> Save service <Check size={16} /></>}
              </button>
            </>
          )}
        </>
      )}

    </div>
  )
}
