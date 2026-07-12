"use client"
import { useState, forwardRef, useImperativeHandle } from "react"
import { supabase } from "../../lib/supabase"
import { t, Lang } from "./Translations"

function Counter({ label, value, onChange, textColor, max }: {
  label: string; value: number; onChange: (v: number) => void; textColor: string; max: number
}) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "clamp(10px, 1.5dvh, 13px)", color: textColor, textAlign: "center", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", background: "#fdf8ee", border: "1px solid rgba(0,0,0,0.15)" }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 32, height: 32, background: "transparent", border: "none", borderRight: "1px solid rgba(0,0,0,0.1)", color: "#5F5F5F", fontSize: 16, cursor: "pointer" }}>−</button>
        <p style={{ flex: 1, textAlign: "center", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#5F5F5F", margin: 0 }}>{value}</p>
        <button onClick={() => { if (value < max) onChange(value + 1) }} style={{ width: 32, height: 32, background: "transparent", border: "none", borderLeft: "1px solid rgba(0,0,0,0.1)", color: "#5F5F5F", fontSize: 16, cursor: "pointer" }}>+</button>
      </div>
    </div>
  )
}

function RSVPCard({ title, bgColor, titleColor, field, maxAttendees, initialRsvp, initialAdults, initialKids, lang, onChange }: {
  title: string; bgColor: string; titleColor: string
  field: "ceremony" | "reception"; maxAttendees: number
  initialRsvp: string; initialAdults: number; initialKids: number; lang: Lang
  onChange: (rsvp: string, adults: number, kids: number) => void
}) {
  const [rsvp, setRsvp] = useState(initialRsvp === "pending" ? "confirmed" : initialRsvp)
  const [adults, setAdults] = useState(initialRsvp === "pending" ? 1 : initialAdults)
  const [kids, setKids] = useState(initialRsvp === "pending" ? 0 : initialKids)
  const tr = t[lang]

  function handleYes() {
    setRsvp("confirmed")
    onChange("confirmed", adults || 1, kids)
  }
  function handleNo() {
    setRsvp("declined")
    setAdults(0); setKids(0)
    onChange("declined", 0, 0)
  }
  function handleAdults(v: number) {
    if (v + kids > maxAttendees) return
    setAdults(v)
    onChange(rsvp, v, kids)
  }
  function handleKids(v: number) {
    if (adults + v > maxAttendees) return
    setKids(v)
    onChange(rsvp, adults, v)
  }

  return (
    <div style={{ background: bgColor, padding: "clamp(8px, 1.5dvh, 12px) clamp(8px, 1.5dvh, 12px) clamp(10px, 1.8dvh, 14px)", marginBottom: "clamp(12px, 2dvh, 20px)" }}>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(12px, 2dvh, 15px)", color: titleColor, textAlign: "center", marginBottom: "clamp(6px, 1dvh, 8px)" }}>
        {title}
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: rsvp === "confirmed" ? 10 : 0 }}>
        <button onClick={handleYes} style={{ flex: 1, padding: "clamp(8px, 1.2dvh, 11px)", background: rsvp === "declined" ? "#faf7f2" : "#535A36", color: rsvp === "declined" ? "#888780" : "#fff" , border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: rsvp === "declined" ? 400 : 700, fontSize: "clamp(12px, 1.8dvh, 14px)", cursor: "pointer" }}>
          {tr.yes}
        </button>
        <button onClick={handleNo} style={{ flex: 1, padding: "clamp(8px, 1.2dvh, 11px)", background: rsvp === "declined" ? "#535A36" : "#faf7f2", color: rsvp === "declined" ? "#fff" : "#888780", border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: rsvp === "declined" ? 700 : 400, fontSize: "clamp(12px, 1.8dvh, 14px)", cursor: "pointer" }}>
          {tr.no}
        </button>
      </div>
      {rsvp === "confirmed" && (
        <div style={{ display: "flex", gap: 16 }}>
          <Counter label={tr.adults} value={adults} onChange={handleAdults} textColor={titleColor} max={maxAttendees - kids} />
          <Counter label={tr.kids} value={kids} onChange={handleKids} textColor={titleColor} max={maxAttendees - adults} />
        </div>
      )}
    </div>
  )
}

export interface RSVPSectionRef {
  save: () => Promise<void>
}

const RSVPSection = forwardRef<RSVPSectionRef, {
  guestCode: string; guestGreeting: string; isCeremonyOnly: boolean; maxAttendees: number
  ceremonyRsvp: string; ceremonyAdults: number; ceremonyKids: number
  receptionRsvp: string; receptionAdults: number; receptionKids: number; lang?: Lang
}>(({ guestCode, guestGreeting, isCeremonyOnly, maxAttendees, ceremonyRsvp, ceremonyAdults, ceremonyKids, receptionRsvp, receptionAdults, receptionKids, lang = "en" }, ref) => {
  const tr = t[lang]
  const [cState, setCState] = useState({ rsvp: ceremonyRsvp === "pending" ? "confirmed" : ceremonyRsvp, adults: ceremonyRsvp === "pending" ? 1 : ceremonyAdults, kids: ceremonyRsvp === "pending" ? 0 : ceremonyKids })
  const [rState, setRState] = useState({ rsvp: receptionRsvp === "pending" ? "confirmed" : receptionRsvp, adults: receptionRsvp === "pending" ? 1 : receptionAdults, kids: receptionRsvp === "pending" ? 0 : receptionKids })

  useImperativeHandle(ref, () => ({
    save: async () => {
      await supabase.from("guests").update({
        ceremony_rsvp: cState.rsvp,
        ceremony_adults: cState.adults,
        ceremony_kids: cState.kids,
        ...(!isCeremonyOnly ? {
          reception_rsvp: rState.rsvp,
          reception_adults: rState.adults,
          reception_kids: rState.kids,
        } : {})
      }).eq("code", guestCode)
    }
  }))

  return (
    <div style={{ width: "100%" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');`}</style>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(14px, 2.5dvh, 20px)", color: "#5F5F5F", textAlign: "center", marginBottom: 16 }}>
        {tr.rsvpTitle}
      </p>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "clamp(11px, 2.5dvh, 15px)", color: "#5F5F5F", marginBottom: 4 }}>
        {tr.dearGuest}, <span style={{ fontWeight: 700 }}>{guestGreeting}</span>
      </p>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "clamp(11px, 2.5dvh, 15px)", color: "#5F5F5F", marginBottom: 4, lineHeight: 1.5 }}>
        {tr.rsvpSubtitle}
      </p>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "clamp(10px, 1.6dvh, 12px)", color: "#888780", marginBottom: 20 }}>
        Valid for {maxAttendees} {maxAttendees === 1 ? "person" : "persons"}
      </p>

      <RSVPCard
        title={tr.holyMatrimony} bgColor="#f2d857" titleColor="#5F5F5F"
        field="ceremony" maxAttendees={maxAttendees}
        initialRsvp={ceremonyRsvp} initialAdults={ceremonyAdults} initialKids={ceremonyKids}
        lang={lang} onChange={(rsvp, adults, kids) => setCState({ rsvp, adults, kids })}
      />
      {!isCeremonyOnly && (
        <RSVPCard
          title={tr.reception} bgColor="#c6294b" titleColor="#F4F1EA"
          field="reception" maxAttendees={maxAttendees}
          initialRsvp={receptionRsvp} initialAdults={receptionAdults} initialKids={receptionKids}
          lang={lang} onChange={(rsvp, adults, kids) => setRState({ rsvp, adults, kids })}
        />
      )}
    </div>
  )
})

RSVPSection.displayName = "RSVPSection"
export default RSVPSection