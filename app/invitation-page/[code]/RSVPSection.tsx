"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { t, Lang } from "./Translations"

function Counter({ label, value, onChange, textColor, disabled }: {
  label: string; value: number; onChange: (v: number) => void; textColor: string; disabled: boolean
}) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 13, color: textColor, textAlign: "center", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", background: "#fdf8ee", border: "1px solid rgba(0,0,0,0.15)", opacity: disabled ? 0.6 : 1 }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 32, height: 32, background: "transparent", border: "none", borderRight: "1px solid rgba(0,0,0,0.1)", color: "#5F5F5F", fontSize: 16, cursor: "pointer" }}>−</button>
        <p style={{ flex: 1, textAlign: "center", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#5F5F5F" }}>{value}</p>
        <button onClick={() => onChange(value + 1)} disabled={disabled} style={{ width: 32, height: 32, background: "transparent", border: "none", borderLeft: "1px solid rgba(0,0,0,0.1)", color: disabled ? "#b4b2a9" : "#5F5F5F", fontSize: 16, cursor: disabled ? "not-allowed" : "pointer" }}>+</button>
      </div>
    </div>
  )
}

function RSVPCard({ title, bgColor, titleColor, guestCode, field, maxAttendees, initialRsvp, initialAdults, initialKids, lang }: {
  title: string; bgColor: string; titleColor: string; guestCode: string
  field: "ceremony" | "reception"; maxAttendees: number
  initialRsvp: string; initialAdults: number; initialKids: number; lang: Lang
}) {
  const [rsvp, setRsvp] = useState(initialRsvp)
  const [adults, setAdults] = useState(initialAdults)
  const [kids, setKids] = useState(initialKids)
  const [saving, setSaving] = useState(false)
  const tr = t[lang]

  const atMax = adults + kids >= maxAttendees

  async function save(newRsvp: string, newAdults: number, newKids: number) {
    setSaving(true)
    await supabase.from("guests").update({ [`${field}_rsvp`]: newRsvp, [`${field}_adults`]: newAdults, [`${field}_kids`]: newKids }).eq("code", guestCode)
    setSaving(false)
  }

  function handleYes() {
    setRsvp("confirmed")
    if (adults + kids === 0 && maxAttendees > 0) { setAdults(1); save("confirmed", 1, 0) }
    else save("confirmed", adults, kids)
  }

  function handleNo() { setRsvp("declined"); setAdults(0); setKids(0); save("declined", 0, 0) }
  function handleAdults(v: number) { if (v + kids > maxAttendees) return; setAdults(v); save(rsvp, v, kids) }
  function handleKids(v: number) { if (adults + v > maxAttendees) return; setKids(v); save(rsvp, adults, v) }

  return (
    <div style={{ background: bgColor, padding: "12px 12px 14px", marginBottom: 20 }}>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: titleColor, textAlign: "center", marginBottom: 8 }}>
        {title}
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button onClick={handleYes} disabled={saving} style={{ flex: 1, padding: "11px", background: rsvp === "confirmed" ? "#535A36" : "rgba(0,0,0,0.15)", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
          {tr.yes}
        </button>
        <button onClick={handleNo} disabled={saving} style={{ flex: 1, padding: "11px", background: rsvp === "declined" ? "#555" : "rgba(0,0,0,0.15)", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
          {tr.no}
        </button>
      </div>
      {rsvp === "confirmed" && (
        <div style={{ display: "flex", gap: 16 }}>
          <Counter label={tr.adults} value={adults} onChange={handleAdults} textColor={titleColor} disabled={atMax} />
          <Counter label={tr.kids} value={kids} onChange={handleKids} textColor={titleColor} disabled={atMax} />
        </div>
      )}
    </div>
  )
}

export default function RSVPSection({ guestCode, guestGreeting, isCeremonyOnly, maxAttendees, ceremonyRsvp, ceremonyAdults, ceremonyKids, receptionRsvp, receptionAdults, receptionKids, lang = "en" }: {
  guestCode: string; guestGreeting: string; isCeremonyOnly: boolean; maxAttendees: number
  ceremonyRsvp: string; ceremonyAdults: number; ceremonyKids: number
  receptionRsvp: string; receptionAdults: number; receptionKids: number; lang?: Lang
}) {
  const tr = t[lang]
  return (
    <div style={{ width: "100%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');`}</style>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, color: "#5F5F5F", textAlign: "center", marginBottom: 16 }}>
        {tr.rsvpTitle}
      </p>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 14, color: "#5F5F5F", marginBottom: 4 }}>
        {tr.dearGuest}, <span style={{ fontWeight: 700 }}>{guestGreeting}</span>
      </p>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 14, color: "#5F5F5F", marginBottom: 20, lineHeight: 1.5 }}>
        {tr.rsvpSubtitle}
      </p>
      <RSVPCard title={tr.holyMatrimony} bgColor="#f2d857" titleColor="#5F5F5F" guestCode={guestCode} field="ceremony" maxAttendees={maxAttendees} initialRsvp={ceremonyRsvp} initialAdults={ceremonyAdults} initialKids={ceremonyKids} lang={lang} />
      {!isCeremonyOnly && (
        <RSVPCard title={tr.reception} bgColor="#c6294b" titleColor="#F4F1EA" guestCode={guestCode} field="reception" maxAttendees={maxAttendees} initialRsvp={receptionRsvp} initialAdults={receptionAdults} initialKids={receptionKids} lang={lang} />
      )}
    </div>
  )
}