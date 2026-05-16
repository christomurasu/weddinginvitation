"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function WishForm({ weddingId }: { weddingId: string }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !message.trim()) return
    setLoading(true)
    await supabase.from("wishes").insert({
      wedding_id: weddingId,
      guest_name: name,
      message
    })
    setSent(true)
    setLoading(false)
    setName("")
    setMessage("")
    router.refresh()
  }

  if (sent) {
    return (
      <div style={{
        background: "rgba(184,150,90,0.1)",
        border: "1px solid rgba(184,150,90,0.3)",
        padding: "20px", textAlign: "center"
      }}>
        <p style={{
          color: "#e8d5a3", fontSize: 15,
          fontFamily: "Georgia, serif", fontStyle: "italic"
        }}>
          Terima kasih atas ucapan dan doa kamu! 🤍
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "24px"
    }}>
      <p style={{
        fontSize: 10, letterSpacing: "0.15em",
        textTransform: "uppercase", color: "#b8965a", marginBottom: 16
      }}>
        Tulis Ucapan
      </p>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama kamu"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", padding: "10px 12px", fontSize: 13,
            outline: "none", fontFamily: "inherit"
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tulis ucapan dan doa untuk mempelai..."
          rows={3}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", padding: "10px 12px", fontSize: 13,
            outline: "none", fontFamily: "Georgia, serif",
            fontStyle: "italic", resize: "vertical", lineHeight: 1.7
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim() || !message.trim()}
        style={{
          background: "#b8965a", color: "#fff", border: "none",
          padding: "11px 28px", fontSize: 11,
          letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading || !name.trim() || !message.trim() ? 0.5 : 1,
          fontFamily: "inherit"
        }}
      >
        {loading ? "Mengirim..." : "Kirim Ucapan"}
      </button>
    </div>
  )
}