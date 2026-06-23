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

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
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
      background: "rgba(44,44,42,0.75)",
      border: "1px solid rgba(184,150,90,0.3)",
      padding: "16px 24px",
      marginBottom: 24,
      backdropFilter: "blur(4px)"
    }}>
      <p style={{
        fontFamily: "Georgia, serif", fontStyle: "italic",
        fontSize: 12, color: "rgba(255,255,255,0.5)",
        marginBottom: 12, textAlign: "center", letterSpacing: "0.05em"
      }}>
        Counting days until the wedding
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
        {[
          { value: timeLeft.days,    label: "Days" },
          { value: timeLeft.hours,   label: "Hours" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Sec" },
        ].map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", minWidth: 56 }}>
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 32, fontWeight: 300,
                color: "#fff", lineHeight: 1, marginBottom: 4
              }}>
                {String(item.value).padStart(2, "0")}
              </p>
              <p style={{
                fontSize: 9, color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.15em", textTransform: "uppercase"
              }}>
                {item.label}
              </p>
            </div>
            {i < 3 && (
              <p style={{
                fontSize: 24, color: "rgba(184,150,90,0.6)",
                margin: "0 4px", paddingBottom: 16
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