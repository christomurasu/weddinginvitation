export default function DateMapsRow({
  dayName,
  day,
  monthYear,
  time,
  mapsUrl,
}: {
  dayName: string
  day: string | number
  monthYear: string
  time: string
  mapsUrl?: string
}) {
  const monthPart = monthYear.split(" ")[0] ?? ""
  const yearPart = monthYear.split(" ")[1] ?? ""

  return (
    <div style={{ textAlign: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
      `}</style>

      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: 14, marginBottom: 4
      }}>
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 400, fontSize: 20, color: "#5F5F5F"
        }}>
          {dayName}
        </p>
        <div style={{ width: 1, height: 32, background: "#c9c2b4" }} />
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 400, fontSize: 35, color: "#5F5F5F",
          lineHeight: 1
        }}>
          {day}
        </p>
        <div style={{ width: 1, height: 32, background: "#c9c2b4" }} />
        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 400, fontSize: 20, color: "#5F5F5F",
          lineHeight: 1.3
        }}>
          {monthPart}
          <br />
          {yearPart}
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
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#535A36",
            color: "#fff",
            padding: "12px 28px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none"
          }}
        >
          Google Maps
        </a>
      )}
    </div>
  )
}