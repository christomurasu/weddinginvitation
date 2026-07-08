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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 4 }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 20, color: "#5F5F5F" }}>
          {dayName}
        </p>
        <div style={{ width: 1, height: 32, background: "#c9c2b4" }} />
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 35, color: "#5F5F5F", lineHeight: 1 }}>
          {day}
        </p>
        <div style={{ width: 1, height: 32, background: "#c9c2b4" }} />
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 20, color: "#5F5F5F", lineHeight: 1.3 }}>
          {monthPart}<br />{yearPart}
        </p>
      </div>

      <p style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 400, fontSize: 20, color: "#5F5F5F",
        marginBottom: 24
      }}>
        {time?.split(" ")[5]} WIB
      </p>

      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", background: "#535A36", color: "#fff",
          padding: "12px 28px", fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, fontSize: 13, textDecoration: "none"
        }}>
          {tr.googleMaps}
        </a>
      )}
    </div>
  )
}