"use client"
import { createContext, useContext, useState } from "react"
import { supabase } from "../../lib/supabase"

type Rsvp = "attending" | "declined" | null

const RsvpContext = createContext<{ rsvp: Rsvp; setRsvp: (r: Rsvp) => void }>({ rsvp: null, setRsvp: () => {} })

// Bungkus semua page; CSS di page.tsx menyembunyikan .only-attending / .only-declined sesuai data-rsvp
export function RsvpProvider({ initial, children }: { initial: Rsvp; children: React.ReactNode }) {
  const [rsvp, setRsvp] = useState<Rsvp>(initial)
  return (
    <RsvpContext.Provider value={{ rsvp, setRsvp }}>
      <div id="bday-wrapper" data-rsvp={rsvp ?? "none"}>{children}</div>
    </RsvpContext.Provider>
  )
}

export function RsvpButtons({ guestCode }: { guestCode: string }) {
  const { rsvp, setRsvp } = useContext(RsvpContext)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  async function answer(value: "attending" | "declined") {
    setSaving(true)
    setError(false)
    const { error } = await supabase.from("birthday_guests").update({ rsvp: value }).eq("code", guestCode)
    setSaving(false)
    if (error) {
      setError(true)
      return
    }
    setRsvp(value)
    // Bawa tamu ke page berikutnya setelah halaman yang relevan muncul
    requestAnimationFrame(() =>
      document.querySelector(value === "attending" ? ".only-attending" : ".only-declined")?.scrollIntoView({ behavior: "smooth" })
    )
  }

  const small = { fontSize: "2.8cqw", color: "#8a8a8a", lineHeight: 1.3, textAlign: "center" as const }
  const change = (
    <button onClick={() => setRsvp(null)} style={{
      background: "none", border: "none", padding: "1cqw 2cqw", cursor: "pointer", fontFamily: "inherit",
      fontSize: "3.4cqw", color: "#6b6b6b", textDecoration: "underline"
    }}>
      Change
    </button>
  )

  // Sudah jawab → tampilkan jawaban + tombol Change
  if (rsvp) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1cqw" }}>
        <p style={{ fontSize: "4cqw", fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.04em" }}>
          {rsvp === "attending" ? "I WILL ATTEND" : "NOT ATTENDING"}
        </p>
        {change}
      </div>
    )
  }

  const btn = (primary: boolean) => ({
    width: "58%", padding: "1.8cqw 0", cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
    fontSize: "3cqw", fontWeight: 700, letterSpacing: "0.06em",
    border: "1.5px solid #8b0d14", background: primary ? "#8b0d14" : "#fff", color: primary ? "#fff" : "#8b0d14",
  })

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.8cqw" }}>
      <p style={{ fontSize: "3.8cqw", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.5cqw" }}>Will you attend?</p>
      <button onClick={() => answer("attending")} disabled={saving} style={btn(true)}>WILL ATTEND</button>
      <button onClick={() => answer("declined")} disabled={saving} style={btn(false)}>CAN&apos;T ATTEND</button>
      {error && <p style={{ ...small, color: "#a32d2d" }}>Failed, please try again</p>}
    </div>
  )
}
