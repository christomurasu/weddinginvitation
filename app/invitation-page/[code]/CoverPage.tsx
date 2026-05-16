export default function CoverPage({
  partner1,
  partner2,
  date,
  couplePhotoUrl,
  coverPhotoUrl,
  verse,
  verseSource,
}: {
  partner1: string
  partner2: string
  date: string
  couplePhotoUrl?: string
  coverPhotoUrl?: string
  verse?: string
  verseSource?: string
}) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "60px 32px 48px",
      overflow: "hidden",
      background: "#f5f0e8",
    }}>

      {/* Background tekstur */}
      {coverPhotoUrl ? (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${coverPhotoUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.35,
          zIndex: 0
        }} />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #f5f0e8 0%, #ede5d8 100%)",
          zIndex: 0
        }} />
      )}

      {/* Konten */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", width: "100%"
      }}>

        {/* Logo SF */}
        <div style={{ width: 80, height: 80, marginBottom: 28 }}>
          <img
            src="/images/SF_Invitation_Logo.png"
            alt="SF Invitation"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Foto mempelai */}
        <div style={{
          width: 220, height: 220,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1px solid rgba(184,150,90,0.4)",
          marginBottom: 32,
          background: "#e4ddd0"
        }}>
          {couplePhotoUrl ? (
            <img
              src={couplePhotoUrl}
              alt="Couple"
              style={{
                width: "100%", height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <p style={{ color: "#888780", fontSize: 12, textAlign: "center" }}>
                Foto<br />Mempelai
              </p>
            </div>
          )}
        </div>

        {/* Nama */}
        <p style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic", fontSize: 14,
          color: "#888780", marginBottom: 10
        }}>
          The wedding of
        </p>
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: 38, fontWeight: 300,
          color: "#2c2c2a", lineHeight: 1.15,
          textAlign: "center", marginBottom: 4,
          letterSpacing: "0.02em"
        }}>
          {partner1}
        </h1>
        <p style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic", fontSize: 26,
          color: "#b8965a", marginBottom: 4
        }}>
          &
        </p>
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: 38, fontWeight: 300,
          color: "#2c2c2a", lineHeight: 1.15,
          textAlign: "center", marginBottom: 20,
          letterSpacing: "0.02em"
        }}>
          {partner2}
        </h1>

        <div style={{
          width: 48, height: 1,
          background: "#b8965a", marginBottom: 16
        }} />

        <p style={{
          fontSize: 12, color: "#888780",
          letterSpacing: "0.15em", textTransform: "uppercase"
        }}>
          {date}
        </p>
      </div>

      {/* Ayat & scroll hint */}
      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center", marginTop: 40
      }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic", fontSize: 14,
          color: "#888780", lineHeight: 1.8,
          maxWidth: 280, margin: "0 auto 8px"
        }}>
          {verse || "Two are better than one."}
        </p>
        <p style={{
          fontSize: 11, color: "#b8965a",
          letterSpacing: "0.12em"
        }}>
          {verseSource || "Ecclesiastes 4:9-12"}
        </p>

        <div style={{ marginTop: 36 }}>
          <p style={{
            fontSize: 10, color: "#b4b2a9",
            letterSpacing: "0.15em", textTransform: "uppercase",
            marginBottom: 6
          }}>
            Scroll
          </p>
          <p style={{ fontSize: 18, color: "#b4b2a9" }}>↓</p>
        </div>
      </div>

    </div>
  )
}