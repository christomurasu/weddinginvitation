import { t, Lang } from "./Translations"

export default function DateMapsRow({
  dayName, day, monthYear, time, mapsUrl, lang = "en"
}: {
  dayName: string
  day: string | number
  monthYear: string
  time: string
  mapsUrl?: string
  lang?: Lang
}) {
  const monthPart = monthYear.split(" ")[0] ?? ""
  const yearPart = monthYear.split(" ")[1] ?? ""
  const tr = t[lang]

  return (
    <div style={{ textAlign: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');`}</style>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "clamp(8px, 2dvh, 14px)",
        marginBottom: "clamp(4px, 0.8dvh, 8px)"
      }}>
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 400,
          fontSize: "clamp(13px, 2.5dvh, 20px)",
          color: "#5F5F5F", margin: 0
        }}>
          {dayName}
        </p>
        <div style={{ width: 1, height: "clamp(20px, 3.5dvh, 32px)", background: "#c9c2b4" }} />
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 400,
          fontSize: "clamp(22px, 4.5dvh, 35px)",
          color: "#5F5F5F", lineHeight: 1, margin: 0
        }}>
          {day}
        </p>
        <div style={{ width: 1, height: "clamp(20px, 3.5dvh, 32px)", background: "#c9c2b4" }} />
        <p style={{
          fontFamily: "'Poppins', sans-serif", fontWeight: 400,
          fontSize: "clamp(13px, 2.5dvh, 20px)",
          color: "#5F5F5F", lineHeight: 1.3, margin: 0,
          textAlign: "left"
        }}>
          {monthPart}<br />{yearPart}
        </p>
      </div>

      <p style={{
        fontFamily: "'Poppins', sans-serif", fontWeight: 400,
        fontSize: "clamp(13px, 2.5dvh, 20px)",
        color: "#5F5F5F",
        margin: "0 0 clamp(12px, 2dvh, 24px) 0"
      }}>
        {time?.split(" ")[5]} WIB
      </p>

      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", background: "#535A36", color: "#fff",
          padding: "clamp(8px, 1.5dvh, 12px) clamp(16px, 3dvh, 28px)",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(11px, 1.8dvh, 13px)",
          textDecoration: "none"
        }}>
          {tr.googleMaps}
        </a>
      )}
    </div>
  )
}