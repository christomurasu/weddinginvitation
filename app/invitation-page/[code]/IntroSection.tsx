export default function IntroSection({
  guestGreeting,
  name,
  parentLabel,
  parentNames,
  photoUrl,
  backgroundUrl,
  align,
}: {
  guestGreeting: string
  name: string
  parentLabel: string
  parentNames: string
  photoUrl?: string
  backgroundUrl?: string
  align: "left" | "right"
}) {
  const textAlign = align === "left" ? "left" : "right"
  const textSide = align === "left" ? "flex-start" : "flex-end"
  const photoSide = align === "left" ? "flex-end" : "flex-start"

  return (
    <div style={{
      width: "100%", height: "100%",
      position: "relative",
      display: "flex", flexDirection: "column",
      background: backgroundUrl
        ? `url('${backgroundUrl}') center/cover no-repeat`
        : "#f5f0e8"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italianno&display=swap');
      `}</style>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: textSide, justifyContent: "center",
        padding: "32px 28px", textAlign
      }}>
        <p style={{
          fontFamily: "Georgia, serif", fontStyle: "italic",
          fontSize: 13, color: "#888780", marginBottom: 6
        }}>
          Dear {guestGreeting},
        </p>
        <p style={{
          fontSize: 11, color: "#888780",
          letterSpacing: "0.05em", marginBottom: 20,
          maxWidth: 260
        }}>
          You are invited to celebrate the wedding of
        </p>
        <h1 style={{
          fontFamily: "'Italianno', cursive",
          fontSize: 64, fontWeight: 400,
          color: "#2c2c2a", lineHeight: 1,
          marginBottom: 16
        }}>
          {name}
        </h1>
        <p style={{
          fontSize: 12, color: "#888780",
          lineHeight: 1.6, maxWidth: 240
        }}>
          {parentLabel}
          <br />
          {parentNames}
        </p>
      </div>

      <div style={{
        flex: 1, display: "flex",
        alignItems: "flex-end", justifyContent: photoSide
      }}>
        {photoUrl && (
          <div style={{
            width: "70%", height: "100%",
            overflow: "hidden"
          }}>
            <img src={photoUrl} alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>
    </div>
  )
}