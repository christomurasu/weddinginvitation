export default function IntroSection({
  guestGreeting,
  name,
  parentLabel,
  parentNames,
  photoUrl,
  backgroundUrl,
  stampUrl,
  roleLabel,
  align,
  showGreeting = true,
}: {
  guestGreeting: string
  name: string
  parentLabel: string
  parentNames: string
  photoUrl?: string
  backgroundUrl?: string
  stampUrl?: string
  roleLabel: string
  align: "left" | "right"
  showGreeting?: boolean
}) {
  const textAlign = align === "left" ? "left" : "right"
  const textSide = align === "left" ? "flex-start" : "flex-end"
  const photoSide = align === "left" ? "flex-end" : "flex-start"

  const stampSize = 165

  return (
    <div style={{
      width: "100%", height: "100%",
      position: "relative",
      display: "flex", flexDirection: "column",
      background: backgroundUrl
        ? `url('${backgroundUrl}') center/100% 100% no-repeat`
        : "#f5f0e8"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,700;1,700&display=swap');
        @font-face {
          font-family: 'Sloop';
          src: url('/fonts/Sloop-ScriptThree.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: textSide, justifyContent: "center",
        padding: "32px 28px", textAlign
      }}>
        {showGreeting && (
          <>
            <p style={{ marginBottom: 6 }}>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500, fontSize: 15, color: "#5F5F5F"
              }}>
                Dear{" "}
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700, fontSize: 15, color: "#5F5F5F"
              }}>
                {guestGreeting},
              </span>
            </p>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500, fontSize: 15, color: "#5F5F5F",
              marginBottom: 20, maxWidth: 260
            }}>
              You are invited to celebrate the wedding of
            </p>
          </>
        )}
        <h1 style={{
          fontFamily: "'Sloop', cursive",
          fontSize: 64, fontWeight: 400,
          color: "#5F5F5F", lineHeight: 1,
          marginBottom: align === "left" ? 16 : 30,
          marginTop: align === "left" ? 0 :90
        }}>
          {name}
        </h1>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500, fontSize: 15, color: "#5F5F5F",
          marginBottom: 4
        }}>
          {parentLabel}
        </p>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, fontSize: 15, color: "#5F5F5F",
          maxWidth: 260
        }}>
          {parentNames}
        </p>
      </div>

      <div style={{
        flex: 1, display: "flex",
        alignItems: "flex-start", justifyContent: photoSide
      }}>
        {photoUrl && (
          <div style={{
            width: "55%",
            aspectRatio: "231 / 280",
            marginRight: align === "left" ? 28 : 0,
            marginLeft: align === "right" ? 28 : 0,
            marginBottom: 28,
            marginTop: 28,
            position: "relative"
          }}>
            {stampUrl && align === "left" && (
              <img src={stampUrl} alt="Stamp"
                style={{
                  position: "absolute",
                  top: 0, left: 0,
                  width: stampSize, height: stampSize,
                  objectFit: "contain",
                  transform: "translate(-50%, -50%) rotate(-10deg)",
                  zIndex: 2
                }} />
            )}

            {stampUrl && align === "right" && (
              <img src={stampUrl} alt="Stamp"
                style={{
                  position: "absolute",
                  bottom: 30, right: 0,
                  width: stampSize, height: stampSize,
                  objectFit: "contain",
                  transform: "translate(50%, 50%) rotate(10deg)",
                  zIndex: 2
                }} />
            )}

            <p style={{
              position: "absolute",
              top: -24,
              right: align === "left" ? 0 : "auto",
              left: align === "right" ? 0 : "auto",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700, fontStyle: "italic",
              fontSize: 14, color: "#5F5F5F",
              whiteSpace: "nowrap",
              zIndex: 2
            }}>
              {roleLabel}
            </p>

            <div style={{
              width: "100%", height: "100%",
              overflow: "hidden",
              position: "relative"
            }}>
              <img src={photoUrl} alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}