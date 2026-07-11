"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"
import { t, Lang } from "./Translations"

export default function WishForm({
  weddingId, guestName, lang = "en"
}: {
  weddingId: string
  guestName: string
  lang?: Lang
}) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const tr = t[lang]

  async function handleSubmit() {
    if (!message.trim()) return
    setLoading(true)
    await supabase.from("wishes").insert({ wedding_id: weddingId, guest_name: guestName, message })
    setSent(true)
    setLoading(false)
    setMessage("")
    router.refresh()
  }

  if (sent) {
    return (
      <div style={{ background: "rgba(83,90,54,0.08)", border: "1px solid rgba(83,90,54,0.25)", padding: "20px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: 14, color: "#5F5F5F" }}>
          {tr.wishSent}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 2 }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={tr.wishPlaceholder}
          rows={1}
          style={{
            width: "100%", background: "#fdf8ee",
            border: "1px solid rgba(0,0,0,0.15)",
            color: "#5F5F5F", padding: "10px 10px", fontSize: 12,
            outline: "none", fontFamily: "'Poppins', sans-serif",
            fontStyle: "italic", resize: "vertical", lineHeight: 1,
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        style={{
          width: "100%", background: "#535A36", color: "#fff", border: "none",
          padding: "8px 12px", fontSize: 12, fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, letterSpacing: "0.05em",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading || !message.trim() ? 0.5 : 1
        }}
      >
        {loading ? "..." : tr.wishButton}
      </button>
    </div>
  )
}