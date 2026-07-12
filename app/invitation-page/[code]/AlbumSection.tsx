"use client"
import { useState } from "react"

export default function AlbumSection({
  bgUrl,
  title,
  stripUrl,
  photos,
}: {
  bgUrl?: string
  title?: string
  stripUrl?: string
  photos: (string | null)[]
}) {
  const [showPopup, setShowPopup] = useState(false)
  const validPhotos = photos.filter(Boolean) as string[]

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      {bgUrl && (
        <img src={bgUrl} alt="Background"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      )}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingBottom: "30px",
        paddingTop: "30px",
        gap: "2dvh"
      }}>
        {/* Judul */}
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: "clamp(13px, 2dvh, 18px)",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#5F5F5F", textAlign: "center"
        }}>
          {title || "Our Gallery"}
        </p>

        {/* Strip foto */}
        {stripUrl && (
          <div style={{ width: "100%", maxHeight: "95dvh", overflow: "hidden" }}>
            <img src={stripUrl} alt="Strip"
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
          </div>
        )}

        {/* Button See More */}
        {validPhotos.length > 0 && (
          <button
            onClick={() => setShowPopup(true)}
            style={{
              background: "#535A36", color: "#fff", border: "none",
              padding: "clamp(6px, 1dvh, 10px) clamp(24px, 5dvh, 40px)",
              fontFamily: "'Poppins', sans-serif", fontWeight: 700,
              fontSize: "clamp(11px, 1.8dvh, 13px)",
              letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: "pointer"
            }}
          >
            See More
          </button>
        )}
      </div>

      {/* Popup */}
      {/* Popup */}
{showPopup && (
  <div style={{
    position: "absolute", inset: 0, 
    background: "rgba(0, 0, 0, 0.7)", 
    zIndex: 9999, 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center", /* Memposisikan konten tepat di tengah secara vertikal */
    overflowY: "auto",
    padding: "25px"
  }}>
    {/* Grid foto */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 0,
      background: "#222", 
      width: "100%"
    }}>
      {validPhotos.map((url, i) => (
        <div key={i} style={{ overflow: "hidden", lineHeight: 0, margin: 0, padding: 0 }}>
          <img src={url} alt={`Photo ${i + 1}`}
            style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
        </div>
      ))}
    </div>

    {/* Back button */}
    <button
      onClick={() => setShowPopup(false)}
      style={{
        width: "100%", background: "#c6294b", color: "#fff", border: "none",
        padding: "16px", fontFamily: "'Poppins', sans-serif",
        fontWeight: 700, fontSize: 14, cursor: "pointer",
        letterSpacing: "0.05em", flexShrink: 0, marginTop: "20px"
      }}
    >
      Back
    </button>
  </div>
)}
    </div>
  )
}