import { t, Lang } from "./Translations"

export default function IntroSection({
  guestGreeting, name, parentLabel, parentNames,
  photoUrl, backgroundUrl, stampUrl, roleLabel, align,
  showGreeting = true, lang = "en"
}: {
  guestGreeting: string; name: string; parentLabel: string; parentNames: string
  photoUrl?: string; backgroundUrl?: string; stampUrl?: string
  roleLabel: string; align: "left" | "right"; showGreeting?: boolean; lang?: Lang
}) {
  const textAlign = align === "left" ? "left" : "right"
  const textSide = align === "left" ? "flex-start" : "flex-end"
  const photoSide = align === "left" ? "flex-end" : "flex-start"
  const tr = t[lang]

  return (
    <div style={{
      width: "100%", height: "100%", position: "relative",
      display: "flex", flexDirection: "column",
      background: backgroundUrl ? `url('${backgroundUrl}') center/100% 100% no-repeat` : "#f5f0e8"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,700;1,700&display=swap');
        @font-face { font-family: 'Sloop'; src: url('/fonts/Sloop-ScriptThree.ttf') format('truetype'); }
      `}</style>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: textSide, justifyContent: "center", padding: "3dvh 28px 1dvh", textAlign }}>
        {showGreeting && (
          <>
            <p style={{ marginBottom: "0.8dvh" }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "clamp(11px, 1.8dvh, 15px)", color: "#5F5F5F" }}>{tr.dearGuest} </span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(11px, 1.8dvh, 15px)", color: "#5F5F5F" }}>{guestGreeting},</span>
            </p>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "clamp(11px, 1.8dvh, 15px)", color: "#5F5F5F", marginBottom: "2dvh", maxWidth: 260 }}>
              {tr.invitedTo}
            </p>
          </>
        )}
        <h1 style={{
          fontFamily: "'Sloop', cursive",
          fontSize: "clamp(42px, 8dvh, 64px)", fontWeight: 400,
          color: "#5F5F5F", lineHeight: 1,
          marginBottom: align === "left" ? "1.5dvh" : "2.5dvh",
          marginTop: align === "left" ? 0 : "6dvh"
        }}>
          {name}
        </h1>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500, fontSize: "clamp(11px, 1.8dvh, 15px)", color: "#5F5F5F", marginBottom: "0.5dvh" }}>
          {parentLabel}
        </p>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "clamp(11px, 1.8dvh, 15px)", color: "#5F5F5F", maxWidth: 260 }}>
          {parentNames}
        </p>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: photoSide }}>
        {photoUrl && (
          <div style={{
            width: "55%", aspectRatio: "231 / 280",
            marginRight: align === "left" ? 28 : 0,
            marginLeft: align === "right" ? 28 : 0,
            marginBottom: "3dvh", marginTop: "2dvh", position: "relative"
          }}>
            {stampUrl && align === "left" && (
              <img src={stampUrl} alt="Stamp" style={{
                position: "absolute", top: 0, left: 0,
                width: "clamp(100px, 20dvh, 165px)" as unknown as number,
                height: "clamp(100px, 20dvh, 165px)" as unknown as number,
                objectFit: "contain",
                transform: "translate(-50%, -50%) rotate(-10deg)", zIndex: 2
              }} />
            )}
            {stampUrl && align === "right" && (
              <img src={stampUrl} alt="Stamp" style={{
                position: "absolute",
                bottom: 30, right: 0,
                width: "clamp(100px, 20dvh, 165px)" as unknown as number,
                height: "clamp(100px, 20dvh, 165px)" as unknown as number,
                objectFit: "contain",
                transform: "translate(50%, 50%) rotate(10deg)", zIndex: 2
              }} />
            )}
            <p style={{
              position: "absolute", top: -24,
              right: align === "left" ? 0 : "auto",
              left: align === "right" ? 0 : "auto",
              fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontStyle: "italic",
              fontSize: "clamp(11px, 1.6dvh, 14px)", color: "#5F5F5F", whiteSpace: "nowrap", zIndex: 2
            }}>
              {roleLabel}
            </p>
            <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
              <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}