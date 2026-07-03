"use client"
import { useEffect, useState } from "react"

function calcTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().getTime()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownBanner({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; seconds: number
  } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return null

  return (
    <div style={{
      width: "100%",
      height: "calc((126 / 844) * 100svh)",
      marginTop: 24,
      background: "#535A36",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap');
        @font-face {
          font-family: 'Sloop';
          src: url('/fonts/Sloop-ScriptThree.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>

      <p style={{
        fontFamily: "'Sloop', cursive",
        fontWeight: 400, fontSize: 35,
        color: "#F4F1EA", textAlign: "center",
        marginBottom: 12
      }}>
        Counting days until the wedding
      </p>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
        {[
          { value: timeLeft.days,    label: "Days" },
          { value: timeLeft.hours,   label: "Hours" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", minWidth: 44 }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 200, fontSize: 25,
                color: "#F4F1EA", lineHeight: 1
              }}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 200, fontSize: 11,
                color: "#F4F1EA", marginTop: 2
              }}>
                {item.label}
              </p>
            </div>
            {i < 3 && (
              <p style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 200, fontSize: 25,
                color: "#F4F1EA",
                margin: "0 4px"
              }}>
                :
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}