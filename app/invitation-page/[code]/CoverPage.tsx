export default function CoverPage({
  partner1,
  partner2,
  date,
  couplePhotoUrl,
  coverPhotoUrl,
  verse,
  verseSource,
  logoUrl,
  frameUrl,
}: {
  partner1: string
  partner2: string
  date: string
  couplePhotoUrl?: string
  coverPhotoUrl?: string
  verse?: string
  verseSource?: string
  logoUrl?: string
  frameUrl?: string
}) {
  return (
    <div style={{
      minHeight: "100dvh", width: "100%",
      position: "relative", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      padding: "clamp(40px, 8vh, 60px) clamp(20px, 6vw, 32px) clamp(32px, 6vh, 48px)",
      overflow: "hidden", background: "#f5f0e8",
      boxSizing: "border-box",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap');
      `}</style>

      {coverPhotoUrl && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('" + coverPhotoUrl + "')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.35, zIndex: 0
        }} />
      )}

      <div style={{
        position: "relative", zIndex: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", width: "100%",
        transform: "translateY(-10%)"
      }}>

        {logoUrl && (
          <div style={{
            width: "clamp(56px, 18vw, 80px)",
            height: "clamp(56px, 18vw, 80px)",
            marginBottom: "clamp(18px, 4vh, 28px)"
          }}>
            <img src={logoUrl} alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        <div style={{
          width: "clamp(180px, 55vw, 260px)",
          height: "clamp(180px, 55vw, 260px)",
          position: "relative",
          marginBottom: "clamp(24px, 5vh, 36px)",
          background: "transparent"
        }}>
          {couplePhotoUrl ? (
            <img
              src={couplePhotoUrl}
              alt="Couple"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "contain",
                background: "transparent"
              }}
            />
          ) : (
            <div style={{
              position: "absolute", inset: 0,
              background: "#e4ddd0", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <p style={{ color: "#888780", fontSize: 12, textAlign: "center" }}>
                Foto<br />Mempelai
              </p>
            </div>
          )}

          {frameUrl && (
            <img
              src={frameUrl}
              alt="Frame"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "contain", zIndex: 0
              }}
            />
          )}
        </div>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "clamp(10px, 3vw, 11px)",
          color: "#5F5F5F", lineHeight: 1.2,
          textAlign: "center",
          maxWidth: "min(280px, 80vw)",
          margin: "0 auto 8px"
        }}>
          {verse || "Two are better than one."}
        </p>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "clamp(10px, 3vw, 11px)",
          color: "#5F5F5F", lineHeight: 1.2,
          textAlign: "center",
          maxWidth: "min(280px, 80vw)",
          margin: "0 auto 8px"
        }}>
          {verseSource || "Ecclesiastes 4:9-12"}
        </p>

      </div>

      <div style={{
        position: "absolute", bottom: "clamp(16px, 4vh, 24px)",
        left: 0, right: 0,
        textAlign: "center", zIndex: 0
      }}>
        <p style={{
          fontSize: 10, color: "#b4b2a9",
          letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6
        }}>
          Scroll
        </p>
        <p style={{ fontSize: 18, color: "#b4b2a9" }}>↓</p>
      </div>
    </div>
  )
}