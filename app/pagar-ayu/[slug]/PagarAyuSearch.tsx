"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface Guest {
  id: string
  name: string
  greeting: string
  code: string
  table_number: string | null
  max_attendees: number
  invitation_type: string
  guest_side: string
  ceremony_rsvp: string
  ceremony_adults: number
  ceremony_kids: number
  reception_rsvp: string
  reception_adults: number
  reception_kids: number
  scanned_ceremony: boolean
  scanned_reception: boolean
  note: string | null
}

export default function PagarAyuSearch({
  weddingId, partner1, partner2, coverPhotoUrl,
}: {
  weddingId: string
  partner1: string
  partner2: string
  coverPhotoUrl: string | null
}) {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Guest[]>([])
  const [selected, setSelected] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(value: string) {
    setSearch(value)
    setSelected(null)
    if (value.trim().length < 2) { setResults([]); return }
    setLoading(true)
    const { data } = await supabase
      .from("guests").select("*").eq("wedding_id", weddingId)
      .or(`name.ilike.%${value}%,greeting.ilike.%${value}%`)
      .limit(10)
    setResults((data ?? []) as Guest[])
    setLoading(false)
  }

  const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #2c2c2a" }
  const labelStyle = { fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#888780" }
  const valueStyle = { fontSize: 15, color: "#fff", fontWeight: 300 as const }

  return (
    <div style={{
      minHeight: "100vh",
      background: coverPhotoUrl
        ? `linear-gradient(rgba(26,26,24,0.92), rgba(26,26,24,0.92)), url('${coverPhotoUrl}') center/cover fixed`
        : "#2c2c2a"
    }}>
      <div style={{ padding: "28px 24px", textAlign: "center", borderBottom: "1px solid #444441" }}>
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          {partner1} & {partner2}
        </p>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 300 }}>Cek Meja Tamu</h1>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px" }}>
        <input
          type="text"
          placeholder="Ketik nama tamu..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ width: "100%", background: "#1a1a18", border: "1px solid #444441", color: "#fff", padding: "14px 16px", fontSize: 15, outline: "none", fontFamily: "inherit", marginBottom: 16 }}
        />

        {loading && <p style={{ color: "#888780", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Mencari...</p>}

        {!selected && results.length > 0 && (
          <div style={{ background: "#1a1a18", border: "1px solid #444441" }}>
            {results.map(g => (
              <div key={g.id} onClick={() => { setSelected(g); setResults([]) }}
                style={{ padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid #2c2c2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#fff", fontSize: 14, marginBottom: 2 }}>{g.name}</p>
                  <p style={{ color: "#888780", fontSize: 11 }}>{g.greeting}</p>
                </div>
                <span style={{
                  background: g.table_number ? "#b8965a" : "#444441", color: "#fff",
                  fontSize: 12, padding: "4px 12px", whiteSpace: "nowrap"
                }}>
                  {g.table_number ? `Meja ${g.table_number}` : "No Meja"}
                </span>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div>
            <div style={{ background: "#1a1a18", border: "1px solid #b8965a", padding: "28px 24px", marginBottom: 14 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: "#e8d5a3", fontSize: 24, fontWeight: 300, marginBottom: 4 }}>{selected.name}</p>
                <p style={{ color: "#888780", fontSize: 12 }}>{selected.greeting}</p>
              </div>

              {/* Nomor Meja besar */}
              <div style={{ textAlign: "center", padding: "20px", background: "#2c2c2a", marginBottom: 18, border: "1px solid #444441" }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Nomor Meja</p>
                <p style={{ color: "#e8d5a3", fontSize: 48, fontWeight: 300, lineHeight: 1 }}>
                  {selected.table_number ?? "—"}
                </p>
              </div>

              <div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Tamu Dari</span>
                  <span style={{ ...valueStyle, color: selected.guest_side === "bride" ? "#f0a5b8" : "#a5c47d" }}>
                    {selected.guest_side === "bride" ? "Mempelai Wanita" : "Mempelai Pria"}
                  </span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Tipe Undangan</span>
                  <span style={valueStyle}>{selected.invitation_type === "ceremony" ? "Pemberkatan Saja" : "Full"}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Max Pax</span>
                  <span style={valueStyle}>{selected.max_attendees ?? 1}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>RSVP Pemberkatan</span>
                  <span style={valueStyle}>
                    {selected.ceremony_rsvp === "confirmed" ? `${selected.ceremony_adults + selected.ceremony_kids} pax` : selected.ceremony_rsvp === "declined" ? "Tidak hadir" : "Belum RSVP"}
                  </span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>RSVP Resepsi</span>
                  <span style={valueStyle}>
                    {selected.invitation_type === "ceremony" ? "N/A" : selected.reception_rsvp === "confirmed" ? `${selected.reception_adults + selected.reception_kids} pax` : selected.reception_rsvp === "declined" ? "Tidak hadir" : "Belum RSVP"}
                  </span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Hadir Pemberkatan</span>
                  <span style={{ ...valueStyle, color: selected.scanned_ceremony ? "#97c459" : "#444441" }}>
                    {selected.scanned_ceremony ? "✓ Sudah" : "Belum"}
                  </span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={labelStyle}>Hadir Resepsi</span>
                  <span style={{ ...valueStyle, color: selected.scanned_reception ? "#97c459" : "#444441" }}>
                    {selected.invitation_type === "ceremony" ? "N/A" : selected.scanned_reception ? "✓ Sudah" : "Belum"}
                  </span>
                </div>
              </div>

              {selected.note && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#2c2c2a", borderLeft: "2px solid #b8965a" }}>
                  <p style={{ color: "#888780", fontSize: 11, fontStyle: "italic" }}>{selected.note}</p>
                </div>
              )}
            </div>

            <button onClick={() => { setSelected(null); setSearch(""); setResults([]) }}
              style={{ width: "100%", background: "transparent", color: "#888780", border: "1px solid #444441", padding: "13px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Cari Tamu Lain
            </button>
          </div>
        )}

        {search.length >= 2 && !loading && results.length === 0 && !selected && (
          <p style={{ color: "#888780", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Tidak ada tamu ditemukan.</p>
        )}
      </div>
    </div>
  )
}