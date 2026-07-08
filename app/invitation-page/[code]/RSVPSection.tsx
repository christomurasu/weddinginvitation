"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { t, Lang } from "./Translations"
import QRCodeDisplay from "./QRCodeDisplay"

function Counter({ label, value, onChange, textColor, max }: {
  label: string; value: number; onChange: (v: number) => void; textColor: string; max: number
}) {
  return (
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 13, color: textColor, textAlign: "center", marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", background: "#fdf8ee", border: "1px solid rgba(0,0,0,0.15)" }}>
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          style={{ width: 32, height: 32, background: "transparent", border: "none", borderRight: "1px solid rgba(0,0,0,0.1)", color: "#5F5F5F", fontSize: 16, cursor: "pointer" }}
        >−</button>
        <p style={{ flex: 1, textAlign: "center", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#5F5F5F" }}>
          {value}
        </p>
        <button
          onClick={() => { if (value < max) onChange(value + 1) }}
          style={{ width: 32, height: 32, background: "transparent", border: "none", borderLeft: "1px solid rgba(0,0,0,0.1)", color: "#5F5F5F", fontSize: 16, cursor: "pointer" }}
        >+</button>
      </div>
    </div>
  )
}

function RSVPCard({ title, bgColor, titleColor, guestCode, field, maxAttendees, initialRsvp, initialAdults, initialKids, lang, onConfirmed }: {
  title: string; bgColor: string; titleColor: string; guestCode: string
  field: "ceremony" | "reception"; maxAttendees: number
  initialRsvp: string; initialAdults: number; initialKids: number; lang: Lang
  onConfirmed: (confirmed: boolean) => void
}) {
  const [rsvp, setRsvp] = useState(initialRsvp)
  const [adults, setAdults] = useState(initialAdults)
  const [kids, setKids] = useState(initialKids)
  const [saving, setSaving] = useState(false)
  const tr = t[lang]

  async function save(newRsvp: string, newAdults: number, newKids: number) {
    setSaving(true)
    await supabase.from("guests").update({
      [`${field}_rsvp`]: newRsvp,
      [`${field}_adults`]: newAdults,
      [`${field}_kids`]: newKids,
    }).eq("code", guestCode)
    setSaving(false)
    onConfirmed(newRsvp === "confirmed")
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
      <div style={{ display: "flex", gap: 10, marginBottom: rsvp === "confirmed" ? 10 : 0 }}>
        <button onClick={handleYes} disabled={saving} style={{ flex: 1, padding: "11px", background: rsvp === "confirmed" ? "#535A36" : "rgba(0,0,0,0.15)", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
          {tr.yes}
        </button>
        <button onClick={handleNo} disabled={saving} style={{ flex: 1, padding: "11px", background: rsvp === "declined" ? "#555" : "rgba(0,0,0,0.15)", color: "#fff", border: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer" }}>
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

export default function RSVPSection({ guestCode, guestGreeting, isCeremonyOnly, maxAttendees, ceremonyRsvp, ceremonyAdults, ceremonyKids, receptionRsvp, receptionAdults, receptionKids, lang = "en" }: {
  guestCode: string; guestGreeting: string; isCeremonyOnly: boolean; maxAttendees: number
  ceremonyRsvp: string; ceremonyAdults: number; ceremonyKids: number
  receptionRsvp: string; receptionAdults: number; receptionKids: number; lang?: Lang
}) {
  const tr = t[lang]
  const [showQR, setShowQR] = useState(false)

  // Track confirmed state from DB saves
  const [cConfirmed, setCConfirmed] = useState(ceremonyRsvp === "confirmed")
  const [rConfirmed, setRConfirmed] = useState(receptionRsvp === "confirmed")

  const hasConfirmed = cConfirmed || (!isCeremonyOnly && rConfirmed)

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

      {!showQR ? (
        <>
          <RSVPCard
            title={tr.holyMatrimony} bgColor="#f2d857" titleColor="#5F5F5F"
            guestCode={guestCode} field="ceremony" maxAttendees={maxAttendees}
            initialRsvp={ceremonyRsvp} initialAdults={ceremonyAdults} initialKids={ceremonyKids}
            lang={lang} onConfirmed={setCConfirmed}
          />
          {!isCeremonyOnly && (
            <RSVPCard
              title={tr.reception} bgColor="#c6294b" titleColor="#F4F1EA"
              guestCode={guestCode} field="reception" maxAttendees={maxAttendees}
              initialRsvp={receptionRsvp} initialAdults={receptionAdults} initialKids={receptionKids}
              lang={lang} onConfirmed={setRConfirmed}
            />
          )}
          {hasConfirmed && (
            <button
              onClick={() => setShowQR(true)}
              style={{
                width: "100%", marginTop: 8,
                background: "#535A36", color: "#F4F1EA",
                border: "none", padding: "14px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700, fontSize: 13,
                letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              {lang === "id" ? "Tampilkan Kode Check-in" : "Show Check-in Code"}
            </button>
          )}
        </>
      ) : (
        <>
          <QRCodeDisplay code={guestCode} />
          <button
            onClick={() => setShowQR(false)}
            style={{
              width: "100%", marginTop: 16,
              background: "transparent", color: "#888780",
              border: "1px solid rgba(0,0,0,0.1)", padding: "12px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400, fontSize: 12,
              letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            {lang === "id" ? "← Kembali ke RSVP" : "← Back to RSVP"}
          </button>
        </>
      )}
    </div>
  )
}