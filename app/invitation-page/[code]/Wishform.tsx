"use client"
import { useState, useRef } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import { t, Lang } from "./Translations"
import RSVPSection, { RSVPSectionRef } from "./RSVPSection"
import QRCodeDisplay from "./QRCodeDisplay"

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
  const [showPopup, setShowPopup] = useState(
    ceremonyRsvp === "confirmed" || (!isCeremonyOnly && receptionRsvp === "confirmed")
  )
  const [showQRCode, setShowQRCode] = useState(false)
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
    setShowPopup(true)
  }

  return (
    <div>
      {/* QR Popup */}
      {showPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#faf7f2", padding: 32, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: "#5F5F5F", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {lang === "id" ? "RSVP Berhasil!" : "RSVP Confirmed!"}
            </p>

            {showQRCode ? (
              <>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 12, color: "#888780", marginBottom: 20, lineHeight: 1.5 }}>
                  {lang === "id"
                    ? "Simpan screenshot halaman ini untuk registrasi."
                    : "Please save a screenshot of this page for registration."}
                </p>
                <QRCodeDisplay code={guestCode} />
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 13, color: "#5F5F5F", marginBottom: 20, lineHeight: 1.5 }}>
                  {lang === "id" ? "Terima kasih telah mengisi RSVP." : "Thank you for submitting the RSVP."}
                </p>
                <button
                  onClick={() => setShowQRCode(true)}
                  style={{
                    width: "100%", background: "#535A36", color: "#fff", border: "none",
                    padding: "12px", fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    marginBottom: 10
                  }}
                >
                  {lang === "id" ? "Tampilkan QR Code" : "Show QR Code"}
                </button>
              </>
            )}

            <button
              onClick={() => { setShowPopup(false); setShowQRCode(false) }}
              style={{
                width: "100%", marginTop: showQRCode ? 16 : 0,
                background: "transparent", color: "#888780",
                border: "1px solid rgba(0,0,0,0.15)",
                padding: "12px", fontFamily: "'Poppins', sans-serif",
                fontWeight: 400, fontSize: 12, cursor: "pointer",
                letterSpacing: "0.05em", textTransform: "uppercase"
              }}
            >
              {lang === "id" ? "Kembali ke Undangan" : "Back to Invitation"}
            </button>
          </div>
        </div>
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