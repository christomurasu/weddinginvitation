"use client"
import { useEffect, useState } from "react"
import { t, Lang } from "./Translations"

function calcTimeLeft(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownBanner({ targetDate, lang = "en" }: { targetDate: string; lang?: Lang }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const tr = t[lang]

  return (
    <div style={{
      width: "100%",
      height: "calc(126dvh / 844 * 100)",
      marginTop: 24,
      background: "#535A36",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      padding: "0 12px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap');
        @font-face { font-family: 'Sloop'; src: url('/fonts/Sloop-ScriptThree.ttf') format('truetype'); }
      `}</style>

      <p style={{
        fontFamily: "'Sloop', cursive", fontWeight: 400,
        fontSize: "clamp(18px, 4dvh, 35px)",
        color: "#F4F1EA", textAlign: "center",
        marginBottom: "clamp(6px, 1.2dvh, 12px)",
        lineHeight: 1.2,
        width: "100%"
      }}>
        {tr.countingDays}
      </p>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(8px, 2dvh, 16px)" }}>
        {[
          { value: timeLeft.days,    label: tr.days },
          { value: timeLeft.hours,   label: tr.hours },
          { value: timeLeft.minutes, label: tr.min },
          { value: timeLeft.seconds, label: tr.sec },
        ].map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", minWidth: "clamp(30px, 5dvh, 44px)" }}>
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                fontSize: "clamp(14px, 3dvh, 25px)",
                color: "#F4F1EA", lineHeight: 1, margin: 0
              }}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                fontSize: "clamp(8px, 1.2dvh, 11px)",
                color: "#F4F1EA", marginTop: 2
              }}>
                {item.label}
              </p>
            </div>
            {i < 3 && (
              <p style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                fontSize: "clamp(14px, 3dvh, 25px)",
                color: "#F4F1EA", margin: "0 2px"
              }}>:</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}