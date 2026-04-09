"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "INV-"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function WeddingAddGuestForm({
  weddingId,
  slug,
}: {
  weddingId: string
  slug: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: "", greeting: "",
    table_number: "", max_attendees: "1", note: "",
  })

  async function handleSubmit() {
    if (!form.name.trim()) return
    setLoading(true)
    const code = makeCode()
    await supabase.from("guests").insert({
      wedding_id: weddingId,
      code,
      name: form.name,
      greeting: form.greeting || `Dear ${form.name}`,
      table_number: form.table_number,
      max_attendees: parseInt(form.max_attendees) || 1,
      note: form.note,
    })
    setGeneratedLink(`${window.location.origin}/invitation-page/${code}`)
    setForm({ name: "", greeting: "", table_number: "", max_attendees: "1", note: "" })
    setLoading(false)
    router.refresh()
  }

  const inputStyle = {
    width: "100%", border: "1px solid #e4ddd0",
    padding: "10px 12px", fontSize: 13, color: "#2c2c2a",
    background: "#fdf8ee", outline: "none", fontFamily: "inherit"
  }
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#888780", display: "block", marginBottom: 6
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px" }}>
      <p style={{
        fontSize: 10, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#b8965a", marginBottom: 20
      }}>
        Add New Guest
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Guest Name *</label>
          <input style={inputStyle} type="text" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bapak & Ibu Santoso" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Greeting Line</label>
          <input style={inputStyle} type="text" value={form.greeting}
            onChange={e => setForm({ ...form, greeting: e.target.value })}
            placeholder="e.g. Dear Uncle Santoso" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Table Number</label>
          <input style={inputStyle} type="text" value={form.table_number}
            onChange={e => setForm({ ...form, table_number: e.target.value })}
            placeholder="e.g. Table 3" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Max Attendees</label>
          <input style={inputStyle} type="number" value={form.max_attendees}
            min="1" max="20"
            onChange={e => setForm({ ...form, max_attendees: e.target.value })} />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Personal Note (optional)</label>
        <input style={inputStyle} type="text" value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
          placeholder="e.g. Vegetarian meal arranged for you" />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !form.name.trim()}
        style={{
          background: loading || !form.name.trim() ? "#888780" : "#2c2c2a",
          color: "#fff", border: "none", padding: "12px 32px",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: loading || !form.name.trim() ? "not-allowed" : "pointer",
          fontFamily: "inherit"
        }}>
        {loading ? "Generating..." : "Generate Invitation Link"}
      </button>

      {generatedLink && (
        <div style={{
          marginTop: 20, padding: "16px",
          background: "#fdf8ee", border: "1px solid #e8d5a3"
        }}>
          <p style={{
            fontSize: 10, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#b8965a", marginBottom: 8
          }}>
            Invitation Link — share via WhatsApp
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <p style={{
              fontSize: 11, color: "#2c2c2a",
              fontFamily: "monospace", flex: 1, wordBreak: "break-all"
            }}>
              {generatedLink}
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              style={{
                background: "#2c2c2a", color: "#fff", border: "none",
                padding: "8px 16px", fontSize: 11, cursor: "pointer",
                whiteSpace: "nowrap", fontFamily: "inherit"
              }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}