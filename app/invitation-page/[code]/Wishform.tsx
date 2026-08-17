"use client"
import { useState, useRef, useEffect } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import { t, Lang } from "./Translations"
import RSVPSection, { RSVPSectionRef } from "./RSVPSection"
import RSVPPopupWrapper from "./RSVPPopupWrapper"

export default function WishForm({
  weddingId, guestName, lang = "en",
  guestCode, guestGreeting, isCeremonyOnly, maxAttendees,
  ceremonyRsvp, ceremonyAdults, ceremonyKids,
  receptionRsvp, receptionAdults, receptionKids,
  showQr = true, nonKristen
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
  showQr?: boolean
  nonKristen: boolean
}) {
  const router = useRouter()
  const rsvpRef = useRef<RSVPSectionRef>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPopup, setShowPopup] = useState(
    showQr && (ceremonyRsvp === "confirmed" || (!isCeremonyOnly && receptionRsvp === "confirmed"))
  )
  const tr = t[lang]

  useEffect(() => {
    const wrapper = document.getElementById("invitation-wrapper")
    if (!wrapper) return
    if (showPopup) {
      wrapper.style.overflowY = "hidden"
    } else {
      wrapper.style.overflowY = "scroll"
    }
    return () => { wrapper.style.overflowY = "scroll" }
  }, [showPopup])

  async function handleSubmit() {
    setLoading(true)
    await rsvpRef.current?.save()
    if (message.trim()) {
      await supabase.from("wishes").insert({ wedding_id: weddingId, guest_name: guestGreeting, message })
      setMessage("")
      router.refresh()
    }
    setLoading(false)
    if (showQr) setShowPopup(true)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  return (
    <div>
      {showPopup && (
        <RSVPPopupWrapper
          guestCode={guestCode}
          lang={lang}
          onClose={() => setShowPopup(false)}
        />
      )}

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
        nonKristen={nonKristen}
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
            color: "#5F5F5F", padding: "10px 10px", fontSize: "clamp(10px, 2dvh, 12px)",
            outline: "none", fontFamily: "'Poppins', sans-serif", 
            resize: "vertical", lineHeight: 1,
            fontWeight: 400
          }}
        />
      </div>
      <style>{`
        textarea::placeholder {
          font-weight: 400 !important;
          opacity: 0.6;
        }
      `}</style>

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
        {loading ? "..." : saved ? (lang === "id" ? "✓ Tersimpan!" : "✓ Saved!") : tr.wishButton}
      </button>

      <div style={{ margin: 24, textAlign: "center", alignContent: "center"}}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12 }}>
          <img src="/no-angpao.png" alt="Tanpa angpao" style={{ width: 64, height: 64, objectFit: "contain" }} />
          <img src="/no-gift.png" alt="Tanpa kado" style={{ width: 64, height: 64, objectFit: "contain" }} />
        </div>
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: "clamp(13px, 2dvh, 16px)",
          color: "#5F5F5F", lineHeight: 1.6, maxWidth: 300, margin: "0 auto"
        }}>
          Ungkapan tanda kasih yang diberikan mohon berupa doa untuk kebahagiaan anak kami. 
          <br />
          Terima kasih
        </p>
      </div>
    </div>
  )
}