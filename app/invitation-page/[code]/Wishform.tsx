"use client"
import { useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import { t, Lang } from "./Translations"
import RSVPSection, { RSVPSectionRef } from "./RSVPSection"
import RSVPPopup from "./RSVPPopUp" // 👈 Mengimpor langsung popup yang sudah ada

export default function WishForm({
  weddingId, guestName, lang = "en",
  guestCode, guestGreeting, isCeremonyOnly, maxAttendees,
  ceremonyRsvp, ceremonyAdults, ceremonyKids,
  receptionRsvp, receptionAdults, receptionKids
}: {
  weddingId: string
  guestName: string
  lang?: Lang
  guestCode: string
  guestGreeting: string
  isCeremonyOnly: boolean
  maxAttendees: number
  ceremonyRsvp: string
  ceremonyAdults: number
  ceremonyKids: number
  receptionRsvp: string
  receptionAdults: number
  receptionKids: number
}) {
  const router = useRouter()
  const rsvpRef = useRef<RSVPSectionRef>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  
  // 👈 Fungsi dan State penampil popup dibuat di dalam file ini:
  const [showPopup, setShowPopup] = useState(
    ceremonyRsvp === "confirmed" || (!isCeremonyOnly && receptionRsvp === "confirmed")
  )
  const tr = t[lang]

  async function handleSubmit() {
    setLoading(true)
    await rsvpRef.current?.save()
    if (message.trim()) {
      await supabase.from("wishes").insert({ wedding_id: weddingId, guest_name: guestName, message })
      setMessage("")
      router.refresh()
    }
    setLoading(false)
    
    // 👈 Memunculkan popup setelah rsvp/wishes tersimpan
    setShowPopup(true)
  }

  return (
    <div>
      {/* 👈 Menampilkan RSVPPopup bawaan Anda di sini */}
      {showPopup && (
        <RSVPPopup 
          guestCode={guestCode} 
          lang={lang} 
          onClose={() => setShowPopup(false)} 
        />
      )}

      {/* RSVP + Wish Form */}
      <RSVPSection
        ref={rsvpRef}
        guestCode={guestCode}
        guestGreeting={guestGreeting}
        isCeremonyOnly={isCeremonyOnly}
        maxAttendees={maxAttendees}
        ceremonyRsvp={ceremonyRsvp}
        ceremonyAdults={ceremonyAdults}
        ceremonyKids={ceremonyKids}
        receptionRsvp={receptionRsvp}
        receptionAdults={receptionAdults}
        receptionKids={receptionKids}
        lang={lang}
      />

      <div style={{ marginBottom: 2 }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={tr.wishPlaceholder}
          rows={1}
          style={{
            width: "100%", background: "#fdf8ee",
            border: "1px solid rgba(0,0,0,0.15)",
            color: "#5F5F5F", padding: "10px 10px", fontSize: 12,
            outline: "none", fontFamily: "'Poppins', sans-serif",
            fontStyle: "italic", resize: "vertical", lineHeight: 1,
            fontWeight: 400
          }}
        />
      </div>
      <style>{`textarea::placeholder { font-weight: 400; font-style: italic; }`}</style>

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", background: "#535A36", color: "#fff", border: "none",
          padding: "8px 12px", fontSize: 12, fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, letterSpacing: "0.05em",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? "..." : tr.wishButton}
      </button>
    </div>
  )
}