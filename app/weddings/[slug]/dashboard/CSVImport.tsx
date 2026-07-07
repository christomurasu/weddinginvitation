"use client"
import { useState, useRef } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const random = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `INV-${random}`
}

function parseCSV(text: string) {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? "" })
    return row
  }).filter(row => row.name)
}

const COLUMNS = ["name", "greeting", "phone", "table_number", "invitation_type", "max_attendees", "seats", "language", "note"]

export default function CSVImport({ weddingId }: { weddingId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; error: number } | null>(null)
  const [parseError, setParseError] = useState("")

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
  const divider = { height: 1, background: "#f0ebe3", margin: "24px 0" }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null); setParseError(""); setPreview([])
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const rows = parseCSV(ev.target?.result as string)
        if (rows.length === 0) { setParseError("File CSV kosong atau format tidak sesuai."); return }
        setPreview(rows)
      } catch { setParseError("Gagal membaca file CSV.") }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!preview.length) return
    setLoading(true); setResult(null)
    let success = 0, errorCount = 0

    for (const row of preview) {
      const phone = row.phone?.replace(/\D/g, "") || null
      const { error } = await supabase.from("guests").insert({
        wedding_id: weddingId,
        code: generateCode(),
        name: row.name,
        greeting: row.greeting || row.name,
        phone,
        table_number: row.table_number || null,
        invitation_type: row.invitation_type === "ceremony" ? "ceremony" : "full",
        max_attendees: parseInt(row.max_attendees) || 1,
        seats: parseInt(row.seats) || 1,
        language: row.language === "id" ? "id" : "en",
        note: row.note || null,
        rsvp: "pending",
        ceremony_rsvp: "pending", reception_rsvp: "pending",
        ceremony_adults: 0, ceremony_kids: 0,
        reception_adults: 0, reception_kids: 0,
      })
      if (error) errorCount++; else success++
    }

    setLoading(false)
    setResult({ success, error: errorCount })
    setPreview([])
    if (fileRef.current) fileRef.current.value = ""
    router.refresh()
  }

  function handleReset() {
    setPreview([]); setResult(null); setParseError("")
    if (fileRef.current) fileRef.current.value = ""
  }

  const templateCSV = `name,greeting,phone,table_number,invitation_type,max_attendees,seats,language,note\nChristopher Sonny,Mr. Christopher,081234567890,Table 1,full,2,2,en,\nFelyn Karina,Mrs. Felyn,089876543210,Table 2,ceremony,1,1,id,Special guest`
  const templateBlob = `data:text/csv;charset=utf-8,${encodeURIComponent(templateCSV)}`

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginBottom: 24 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a", marginBottom: 24 }}>
        Import Tamu dari CSV
      </p>

      <p style={labelStyle}>Format Kolom</p>
      <div style={{ background: "#fdf8ee", border: "1px solid #e4ddd0", padding: "12px 14px", marginBottom: 16, fontSize: 12, fontFamily: "monospace", color: "#2c2c2a", lineHeight: 1.8 }}>
        name, greeting, phone, table_number, invitation_type, max_attendees, seats, language, note
      </div>

      <div style={{ background: "#f5f0e8", border: "1px solid #e4ddd0", padding: "12px 14px", marginBottom: 20, fontSize: 12, lineHeight: 1.8 }}>
        <p style={{ color: "#888780", marginBottom: 4, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>Keterangan</p>
        {[
          ["name", "✅ Wajib", "Nama lengkap tamu"],
          ["greeting", "✅ Wajib", "Sapaan (Mr., Mrs., The ... Family)"],
          ["phone", "❌ Opsional", "Nomor WA (misal: 08123456789)"],
          ["table_number", "❌ Opsional", "Nomor meja (misal: Table 1)"],
          ["invitation_type", "✅ Wajib", "full atau ceremony"],
          ["max_attendees", "✅ Wajib", "Jumlah tamu maksimal"],
          ["seats", "✅ Wajib", "Jumlah kursi"],
          ["language", "✅ Wajib", "en (Inggris) atau id (Indonesia)"],
          ["note", "❌ Opsional", "Catatan personal"],
        ].map(([col, req, desc]) => (
          <div key={col} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "monospace", color: "#2c2c2a", minWidth: 130 }}>{col}</span>
            <span style={{ color: "#b8965a", minWidth: 80 }}>{req}</span>
            <span style={{ color: "#5F5F5F" }}>{desc}</span>
          </div>
        ))}
      </div>

      <div style={divider} />

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Template CSV</label>
        <a href={templateBlob} download="template_tamu.csv" style={{ display: "inline-block", background: "#2c2c2a", color: "#fff", padding: "9px 18px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
          Download Template
        </a>
      </div>

      <div style={divider} />

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Upload File CSV</label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <label htmlFor="csv-upload" style={{ display: "inline-block", background: "#2c2c2a", color: "#fff", padding: "9px 18px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>
            Pilih File
          </label>
          <input ref={fileRef} id="csv-upload" type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
          <p style={{ fontSize: 12, color: "#888780" }}>
            {preview.length > 0 ? `${preview.length} baris siap diimport` : "Belum ada file dipilih"}
          </p>
        </div>
        {parseError && <p style={{ fontSize: 12, color: "#a32d2d", marginTop: 8 }}>{parseError}</p>}
      </div>

      {result && (
        <div style={{ background: result.error > 0 ? "#fef3c7" : "#f0fdf4", border: `1px solid ${result.error > 0 ? "#fbbf24" : "#86efac"}`, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          ✅ {result.success} tamu berhasil diimport
          {result.error > 0 && <span style={{ color: "#a32d2d" }}> — ❌ {result.error} gagal</span>}
        </div>
      )}

      {preview.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Preview ({preview.length} tamu)</label>
          <div style={{ overflowX: "auto", border: "1px solid #e4ddd0" }}>
            <table style={{ fontSize: 12, borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f5f0e8" }}>
                  {COLUMNS.map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #e4ddd0", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888780", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fdf8ee" }}>
                    {COLUMNS.map(h => (
                      <td key={h} style={{ padding: "8px 12px", borderBottom: "1px solid #f0ebe3", color: "#2c2c2a", fontSize: 12 }}>
                        {row[h] || <span style={{ color: "#b4b2a9" }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleImport} disabled={loading} style={{ background: loading ? "#888780" : "#2c2c2a", color: "#fff", border: "none", padding: "12px 32px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {loading ? "Mengimport..." : `Import ${preview.length} Tamu`}
          </button>
          <button onClick={handleReset} disabled={loading} style={{ background: "transparent", color: "#888780", border: "1px solid #e4ddd0", padding: "12px 24px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            Batal
          </button>
        </div>
      )}
    </div>
  )
}