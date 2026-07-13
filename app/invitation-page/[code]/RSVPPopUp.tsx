"use client"
import { useState } from "react"
import QRCodeDisplay from "./QRCodeDisplay"
import { Lang } from "./Translations"

export default function RSVPPopup({ 
  guestCode, 
  lang = "en",
  onClose 
}: { 
  guestCode: string; 
  lang?: Lang;
  onClose: () => void
}) {
  const [showQRCode, setShowQRCode] = useState(false)

  return (
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
                letterSpacing: "0.05em",
                marginBottom: 10
              }}
            >
              {lang === "id" ? "Tampilkan QR Code" : "Show QR Code"}
            </button>
          </>
        )}

        <button
          onClick={() => { 
            setShowQRCode(false)
            onClose()
          }}
          style={{
            width: "100%", marginTop: showQRCode ? 16 : 0,
            background: "transparent", color: "#888780",
            border: "1px solid rgba(0,0,0,0.15)",
            padding: "12px", fontFamily: "'Poppins', sans-serif",
            fontWeight: 400, fontSize: 12, cursor: "pointer",
            letterSpacing: "0.05em"
          }}
        >
          {lang === "id" ? "Kembali ke Undangan" : "Back to Invitation"}
        </button>
      </div>
    </div>
  )
}