"use client"
import { useState, useEffect } from "react"

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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Background */}
      {bgUrl && (
        <img src={bgUrl} alt="Background"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      )}

      {/* Content Utama */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        paddingBottom: "30px",
        paddingTop: "30px",
        gap: "2dvh"
      }}>
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
          fontSize: "clamp(13px, 2dvh, 18px)",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#5F5F5F", textAlign: "center"
        }}>
          {title || "Our Gallery"}
        </p>

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
              letterSpacing: "0.15em",
              cursor: "pointer"
            }}
          >
            See More
          </button>
        )}
      </div>
      
      {/* FULLSCREEN NEW SECTION OVERLAY */}
{showPopup && (
  <div style={{
    position: "fixed", /* Tetap fixed agar mengunci layar belakang */
    inset: 0, 
    background: "rgba(0, 0, 0, 0.5)", /* Overlay transparan tipis di luar area undangan */
    zIndex: 99999, 
    display: "flex", 
    justifyContent: "center", /* Memposisikan kontainer di tengah layar */
    alignItems: "center"
  }}>
    
    {/* Kontainer Utama Galeri (Ukurannya disamakan dengan undangan) */}
    <div style={{
      width: "100%",
      maxWidth: "500px", /* SULP/Ukuran standar wrapper undangan mobile (bisa disesuaikan misal 450px atau 100% jika di HP) */
      height: "100%", /* Mengisi penuh tinggi layar */
      background: "#faf7f2",
      display: "flex", 
      flexDirection: "column",
      boxSizing: "border-box",
      position: "relative"
    }}>

      {/* Header Section */}
      <div style={{
        padding: "20px",
        textAlign: "center",
        background: "transparent"
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Poppins', sans-serif", fontWeight: 600,
          fontSize: "14px", letterSpacing: "0.2em", color: "#5F5F5F",
          textTransform: "uppercase"
        }}>
          {title || "Our Gallery"}
        </p>
      </div>

      {/* Area Grid Scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        width: "100%",
        WebkitOverflowScrolling: "touch"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2px", 
          background: "#111"
        }}>
          {validPhotos.map((url, i) => (
            <div 
              key={i} 
              style={{ 
                width: "100%",
                aspectRatio: "1 / 1", 
                position: "relative",
                overflow: "hidden"
              }}
            >
              <img 
                src={url} 
                alt={`Photo ${i + 1}`}
                style={{ 
                  position: "absolute",
                  inset: 0,
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover", 
                  display: "block" 
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stick Button */}
      <div style={{
        padding: "15px 20px",
        background: "#faf7f2",
        borderTop: "1px solid #333"
      }}>
        <button
          onClick={() => setShowPopup(false)}
          style={{
            width: "100%", background: "#c6294b", color: "#fff", border: "none",
            padding: "14px", fontFamily: "'Poppins', sans-serif",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            letterSpacing: "0.1em", borderRadius: "4px"
          }}
        >
          Back to Invitation
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  )
}