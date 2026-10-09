"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface Guest {
  id: string
  code: string
  name: string
  phone: string | null
  rsvp: string | null
  food_name: string | null
  drink_name: string | null
  menu_note: string | null
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "BD-"
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const link = (code: string) => `https://sfinvitation.id/birthday/${code}`

// ponytail: format WA sementara, ganti sesuai teks dari owner
function waMessage(g: Guest, eventTitle: string) {
  return `Dear *${g.name}*,\n\nYou are invited to celebrate _${eventTitle}_!\n\nOpen your invitation & choose your menu here:\n${link(g.code)}\n\nPlease keep the QR Code on your ticket and show it at Check In.`
}

export default function GuestManager({
  birthdayId, eventTitle, guests,
}: {
  birthdayId: string
  eventTitle: string
  guests: Guest[]
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  async function handleAdd() {
    if (!name.trim()) return
    setLoading(true)
    const { error } = await supabase.from("birthday_guests").insert({
      birthday_id: birthdayId, code: makeCode(), name: name.trim(), phone: phone || null,
    })
    setLoading(false)
    if (error) {
      alert("Gagal menambah tamu: " + error.message)
      return
    }
    setName("")
    setPhone("")
    router.refresh()
  }

  async function handleDelete(g: Guest) {
    if (!confirm(`Hapus tamu "${g.name}"?`)) return
    await supabase.from("birthday_guests").delete().eq("id", g.id)
    router.refresh()
  }

  const inputStyle = {
    width: "100%", border: "1px solid #e4ddd0", padding: "10px 12px", fontSize: 13,
    color: "#2c2c2a", background: "#fdf8ee", outline: "none", fontFamily: "inherit"
  }
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const,
    color: "#888780", display: "block", marginBottom: 6
  }
  const th = { textAlign: "left" as const, padding: "8px 6px", fontSize: 10, letterSpacing: "0.12em", color: "#888780", fontWeight: 400 }
  const td = { padding: "10px 6px", fontSize: 12, color: "#2c2c2a", verticalAlign: "top" as const }

  const q = query.trim().toLowerCase()
  const shown = guests.filter(g => g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q))

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a", marginBottom: 16 }}>
        Tamu ({guests.length})
      </p>

      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="bg-name" style={labelStyle}>Nama Tamu *</label>
          <input id="bg-name" style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mr. Budi Doremi" />
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label htmlFor="bg-phone" style={labelStyle}>Nomor HP (WhatsApp)</label>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #e4ddd0", background: "#fdf8ee" }}>
            <span style={{ padding: "10px 12px", fontSize: 13, color: "#888780", borderRight: "1px solid #e4ddd0" }}>+62</span>
            <input id="bg-phone" style={{ ...inputStyle, border: "none", flex: 1 }} type="tel" value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="8123456789" />
          </div>
        </div>
      </div>
      <button onClick={handleAdd} disabled={loading || !name.trim()} style={{
        background: loading || !name.trim() ? "#888780" : "#2c2c2a", color: "#fff", border: "none",
        padding: "12px 32px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: loading || !name.trim() ? "not-allowed" : "pointer", fontFamily: "inherit"
      }}>
        {loading ? "Generating..." : "Generate Invitation Link"}
      </button>

      <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama / kode..."
        aria-label="Cari tamu" style={{ ...inputStyle, marginTop: 24 }} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e4ddd0" }}>
              <th style={th}>NAMA</th><th style={th}>KODE</th><th style={th}>HADIR</th><th style={th}>MENU</th><th style={th}>LINK</th><th />
            </tr>
          </thead>
          <tbody>
            {shown.map(g => (
              <tr key={g.id} style={{ borderBottom: "1px solid #f0ebe3" }}>
                <td style={td}>{g.name}</td>
                <td style={{ ...td, fontFamily: "monospace" }}>{g.code}</td>
                <td style={{ ...td, color: g.rsvp === "attending" ? "#3b6d11" : g.rsvp === "declined" ? "#a32d2d" : "#b4b2a9" }}>
                  {g.rsvp === "attending" ? "Hadir" : g.rsvp === "declined" ? "Tidak" : "Belum"}
                </td>
                <td style={td}>
                  <span style={{ color: g.food_name ? "#3b6d11" : "#b4b2a9" }}>{g.food_name ?? "Belum pilih makanan"}</span>
                  <br />
                  <span style={{ color: g.drink_name ? "#3b6d11" : "#b4b2a9" }}>{g.drink_name ?? "Belum pilih minuman"}</span>
                  {g.menu_note && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#a32d2d", fontStyle: "italic" }}>Note: {g.menu_note}</p>}
                </td>
                <td style={{ ...td, whiteSpace: "nowrap" }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(link(g.code))
                    setCopied(g.id)
                    setTimeout(() => setCopied(null), 2000)
                  }} style={{ background: "none", border: "1px solid #e4ddd0", padding: "4px 8px", fontSize: 11, cursor: "pointer", marginRight: 6 }}>
                    {copied === g.id ? "Copied!" : "Copy"}
                  </button>
                  <a href={`/birthday/${g.code}`} target="_blank" style={{ fontSize: 11, color: "#b8965a", marginRight: 6 }}>Open</a>
                  {g.phone && (
                    <a href={`https://wa.me/62${g.phone.replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(waMessage(g, eventTitle))}`}
                      target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#3b6d11" }}>WA</a>
                  )}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button onClick={() => handleDelete(g)} aria-label={"Hapus " + g.name} style={{ background: "none", border: "none", color: "#a32d2d", cursor: "pointer" }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
