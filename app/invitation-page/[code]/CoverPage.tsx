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
      minHeight: "100vh", width: "100%",
      position: "relative", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      padding: "60px 32px 48px",
      overflow: "hidden", background: "#f5f0e8",
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
        alignItems: "center", width: "100%"
      }}>

        {logoUrl && (
          <div style={{ width: 80, height: 80, marginBottom: 28 }}>
            <img src={logoUrl} alt="Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}

        <div style={{
          width: 260, height: 260,
          position: "relative", marginBottom: 36,
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
                objectFit: "contain", zIndex: 2
              }}
            />
          )}
        </div>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          color: "#5F5F5F", lineHeight: 1.2,
          textAlign: "center", maxWidth: 280,
          margin: "0 auto 8px"
        }}>
          {verse || "Two are better than one."}
        </p>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 11,
          color: "#5F5F5F", lineHeight: 1.2,
          textAlign: "center", maxWidth: 280,
          margin: "0 auto 8px"
        }}>
          {verseSource || "Ecclesiastes 4:9-12"}
        </p>

      </div>

      <div style={{
        position: "absolute", bottom: 24,
        left: 0, right: 0,
        textAlign: "center", zIndex: 1
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