"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface Guest {
  id: string
  name: string
  greeting: string
  code: string
  phone: string | null
  table_number: string | null
  max_attendees: number
  actual_attendees: number
  invitation_type: string
  rsvp: string
  ceremony_rsvp: string
  ceremony_adults: number
  ceremony_kids: number
  reception_rsvp: string
  reception_adults: number
  reception_kids: number
  language: string
  scanned: boolean
  scanned_ceremony: boolean
  scanned_reception: boolean
  guest_side: string
  checkin_number_ceremony: string | null
  checkin_number_reception: string | null
}

interface Wedding {
  partner1: string
  partner2: string
  date: string
  venue: string
  groom_father: string | null
  groom_mother: string | null
  bride_father: string | null
  bride_mother: string | null
  ceremony_venue: string | null
  ceremony_time: string | null
  ceremony_maps_url: string | null
  reception_venue: string | null
  reception_time: string | null
  reception_maps_url: string | null
}

export default function GuestTable({
  guests: initialGuests,
  wedding,
}: {
  guests: Guest[]
  wedding: Wedding
}) {
  const router = useRouter()
  const [guests, setGuests] = useState(initialGuests)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [updatingLang, setUpdatingLang] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filterRsvp, setFilterRsvp] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterSide, setFilterSide] = useState("all")
  const [sortBy, setSortBy] = useState("created")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const pageSize = 20

  function isCeremonyOnly(g: Guest) { return g.invitation_type === "ceremony" }

  const filtered = guests
    .filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.greeting.toLowerCase().includes(search.toLowerCase())) return false
      if (filterRsvp === "confirmed" && g.ceremony_rsvp !== "confirmed" && g.reception_rsvp !== "confirmed") return false
      if (filterRsvp === "pending" && (g.ceremony_rsvp !== "pending" || (!isCeremonyOnly(g) && g.reception_rsvp !== "pending"))) return false
      if (filterRsvp === "declined" && g.ceremony_rsvp !== "declined") return false
      if (filterType !== "all" && g.invitation_type !== filterType) return false
      if (filterSide !== "all" && g.guest_side !== filterSide) return false
      return true
    })
    .sort((a, b) => {
      // Sort berdasarkan nomor check-in (numerik, per side)
      if (sortBy === "checkin_ceremony" || sortBy === "checkin_reception") {
        const field = sortBy === "checkin_ceremony" ? "checkin_number_ceremony" : "checkin_number_reception"
        const parse = (v: string | null) => {
          if (!v) return { prefix: "", num: Infinity }
          const prefix = v.replace(/[0-9]/g, "")
          const num = parseInt(v.replace(/\D/g, "")) || Infinity
          return { prefix, num }
        }
        const pa = parse(a[field]), pb = parse(b[field])
        // yang belum punya nomor ditaruh di bawah
        if (pa.num === Infinity && pb.num === Infinity) return 0
        if (pa.num === Infinity) return 1
        if (pb.num === Infinity) return -1
        const prefixCmp = pa.prefix.localeCompare(pb.prefix)
        const cmp = prefixCmp !== 0 ? prefixCmp : pa.num - pb.num
        return sortDir === "asc" ? cmp : -cmp
      }
      let valA: string = "", valB: string = ""
      if (sortBy === "name") { valA = a.name; valB = b.name }
      else if (sortBy === "table") { valA = a.table_number ?? ""; valB = b.table_number ?? "" }
      else return 0
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedGuests = filtered.slice((page - 1) * pageSize, page * pageSize)

  function toggleSort(field: string) {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(field); setSortDir("asc") }
    setPage(1)
  }

  useEffect(() => {
    setGuests(initialGuests)
  }, [initialGuests])

  const allSelected = guests.length > 0 && selected.size === guests.length

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(guests.map(g => g.id)))
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  async function handleDelete() {
    if (selected.size === 0) return
    const confirm = window.confirm(`Hapus ${selected.size} tamu? Tindakan ini tidak dapat dibatalkan.`)
    if (!confirm) return
    setDeleting(true)
    const ids = Array.from(selected)
    await supabase.from("guests").delete().in("id", ids)
    setGuests(prev => prev.filter(g => !selected.has(g.id)))
    setSelected(new Set())
    setDeleting(false)
    router.refresh()
  }

  function handleExportCSV() {
    const rsvpStatus = (g: Guest) => {
      const c = g.ceremony_rsvp ?? "pending"
      const r = g.reception_rsvp ?? "pending"
      if (g.invitation_type === "ceremony") {
        return c === "confirmed" ? "Sudah RSVP" : c === "declined" ? "Menolak" : "Belum RSVP"
      }
      if (c === "confirmed" || r === "confirmed") return "Sudah RSVP"
      if (c === "declined" && r === "declined") return "Menolak"
      return "Belum RSVP"
    }
    const rows = [
      ["Nama", "Greeting", "Dari", "Status RSVP", "No Meja", "Terundang (Max Pax)", "RSVP Pemberkatan (Pax)", "RSVP Resepsi (Pax)", "No Check-in Pemberkatan", "No Check-in Resepsi", "No HP", "Tipe", "Link Undangan"],
      ...filtered.map(g => {
        const cPax = g.ceremony_rsvp === "confirmed" ? (g.ceremony_adults ?? 0) + (g.ceremony_kids ?? 0) : 0
        const rPax = g.reception_rsvp === "confirmed" ? (g.reception_adults ?? 0) + (g.reception_kids ?? 0) : 0
        return [
          g.name,
          g.greeting,
          g.guest_side === "bride" ? "Wanita" : "Pria",
          rsvpStatus(g),
          g.table_number ?? "",
          String((g.reception_adults ?? 1)+(g.reception_kids ?? 1)),
          g.ceremony_rsvp === "confirmed" ? String(cPax) : "-",
          g.invitation_type === "ceremony" ? "N/A" : g.reception_rsvp === "confirmed" ? String(rPax) : "-",
          g.checkin_number_ceremony ?? "",
          g.invitation_type === "ceremony" ? "N/A" : g.checkin_number_reception ?? "",
          g.phone ?? "",
          g.invitation_type === "ceremony" ? "Pemberkatan" : "Full",
          `https://sfinvitation.id/invitation-page/${g.code}`
        ]
      })
    ]

    // Baris total
    const totalMaxPax = filtered.reduce((s, g) => s + (g.max_attendees ?? 1), 0)
    const totalCeremonyPax = filtered.reduce((s, g) => s + (g.ceremony_rsvp === "confirmed" ? (g.ceremony_adults ?? 0) + (g.ceremony_kids ?? 0) : 0), 0)
    const totalReceptionPax = filtered.reduce((s, g) => s + (g.reception_rsvp === "confirmed" ? (g.reception_adults ?? 0) + (g.reception_kids ?? 0) : 0), 0)
    const totalCeremonyGuests = filtered.filter(g => g.ceremony_rsvp === "confirmed").length
    const totalReceptionGuests = filtered.filter(g => g.invitation_type !== "ceremony" && g.reception_rsvp === "confirmed").length

    rows.push([])
    rows.push([
      `TOTAL (${filtered.length} undangan)`, "", "", "", "",
      String(totalMaxPax),
      `${totalCeremonyPax} pax / ${totalCeremonyGuests} undangan`,
      `${totalReceptionPax} pax / ${totalReceptionGuests} undangan`,
      "", "", "", "", ""
    ])

    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tamu.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleLanguageChange(id: string, lang: string) {
    setUpdatingLang(id)
    await supabase.from("guests").update({ language: lang }).eq("id", id)
    setGuests(prev => prev.map(g => g.id === id ? { ...g, language: lang } : g))
    setUpdatingLang(null)
  }

  const waMessage = (guest: Guest) => {
    const link = `https://sfinvitation.id/invitation-page/${guest.code}`

    if (guest.language === "id") {
        const ceremony = `MISA SYUKUR\n${wedding.ceremony_time ?? ""}\n${wedding.ceremony_venue ?? ""}`
        const reception = guest.invitation_type === "full" ? `\n\nRAMAH TAMAH\n${wedding.reception_time ?? ""}\n${wedding.reception_venue ?? ""}` : ""
        return `Kepada Yth. Bapak/Ibu\n${guest.greeting},\n _(kami mohon maaf bila ada kesalahan penulisan nama maupun gelar)_ \n\nDengan hormat, anda diundang pada acara:\n*Misa Syukur Pernikahan ${wedding.partner1} & ${wedding.partner2}*\n\nBersama keluarga yang berbahagia,\n*${wedding.groom_father ?? ""} & ${wedding.groom_mother ?? ""}*\n_dan_\n*${wedding.bride_father ?? ""} & ${wedding.bride_mother ?? ""}*\n\n${ceremony}${reception}\n\nSilakan klik link di bawah untuk konfirmasi kehadiran:\n${link}\n\nHarap simpan *QR Code yang telah anda dapatkan saat RSVP* dan tunjukkan pada saat Check In. \n\nHormat kami,\n${wedding.partner1} & ${wedding.partner2}\n\nPerfect Moment Organizer\nIvan - 085103949090\nRSVP by SF Invitation`

    }

    const ceremony = `THANKSGIVING MASS\n${wedding.ceremony_time ?? ""}\n${wedding.ceremony_venue ?? ""}`
    const reception = guest.invitation_type === "full" ? `\n\nRECEPTION\n${wedding.reception_time ?? ""}\n${wedding.reception_venue ?? ""}` : ""
    return `Dear Mr. & Mrs. ${guest.greeting},\n _(we apologize if there are any errors in writing names or titles)_\n\nYou are respectfully invited to the event:\nThe Wedding of *${wedding.partner1} & ${wedding.partner2}*\n\nBlessed Parents,\n*${wedding.groom_father ?? ""} & ${wedding.groom_mother ?? ""}*\n_and_\n*${wedding.bride_father ?? ""} & ${wedding.bride_mother ?? ""}*\n\n${ceremony}${reception}\n\nPlease click the button below to start RSVP:\n${link}\n\nPlease save this *QR Code from your RSVP* and present it at Check In.\n\nBest Regards,\n${wedding.partner1} & ${wedding.partner2}\n\nPerfect Moment Organizer\nIvan - 085103949090\nRSVP by SF Invitation`

  }

  const rsvpBadge = (rsvp: string) => ({
    background: rsvp === "confirmed" ? "#eaf3de" : rsvp === "declined" ? "#fcebeb" : "#f5f0e8",
    color: rsvp === "confirmed" ? "#3b6d11" : rsvp === "declined" ? "#a32d2d" : "#888780",
    fontSize: 10, padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase" as const
  })

  const scannedBadge = (scanned: boolean) => ({
    display: "inline-block",
    background: scanned ? "#eaf3de" : "#f5f0e8",
    color: scanned ? "#3b6d11" : "#b4b2a9",
    fontSize: 10, padding: "2px 8px", letterSpacing: "0.05em"
  })

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", marginTop: 24 }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0ebe3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a" }}>
          All Guests ({guests.length})
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.refresh()} style={{ background: "transparent", color: "#888780", border: "1px solid #e4ddd0", padding: "7px 14px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refresh
          </button>
          <button onClick={handleExportCSV} style={{ background: "#2c2c2a", color: "#e8d5a3", border: "none", padding: "7px 14px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            ↓ Export CSV
          </button>
          {selected.size > 0 && (
            <button onClick={handleDelete} disabled={deleting} style={{ background: "#a32d2d", color: "#fff", border: "none", padding: "7px 16px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? "Menghapus..." : `Hapus ${selected.size} Tamu`}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 24px", borderBottom: "1px solid #f0ebe3", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text" placeholder="Cari nama / greeting..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 160, border: "1px solid #e4ddd0", padding: "7px 10px", fontSize: 12, background: "#fdf8ee", outline: "none", fontFamily: "inherit", color: "#2c2c2a" }}
        />
        <select value={filterRsvp} onChange={e => { setFilterRsvp(e.target.value); setPage(1) }}
          style={{ border: "1px solid #e4ddd0", padding: "7px 10px", fontSize: 12, background: "#fdf8ee", outline: "none", fontFamily: "inherit", color: "#2c2c2a", cursor: "pointer" }}>
          <option value="all">Semua RSVP</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
          style={{ border: "1px solid #e4ddd0", padding: "7px 10px", fontSize: 12, background: "#fdf8ee", outline: "none", fontFamily: "inherit", color: "#2c2c2a", cursor: "pointer" }}>
          <option value="all">Semua Tipe</option>
          <option value="full">Full</option>
          <option value="ceremony">Ceremony Only</option>
        </select>
        <select value={filterSide} onChange={e => { setFilterSide(e.target.value); setPage(1) }}
          style={{ border: "1px solid #e4ddd0", padding: "7px 10px", fontSize: 12, background: "#fdf8ee", outline: "none", fontFamily: "inherit", color: "#2c2c2a", cursor: "pointer" }}>
          <option value="all">Semua Sisi</option>
          <option value="groom">Mempelai Pria</option>
          <option value="bride">Mempelai Wanita</option>
        </select>
        <select value={`${sortBy}-${sortDir}`} onChange={e => { const parts = e.target.value.split("-"); setSortBy(parts[0]); setSortDir(parts[1] as "asc" | "desc"); setPage(1) }}
          style={{ border: "1px solid #e4ddd0", padding: "7px 10px", fontSize: 12, background: "#fdf8ee", outline: "none", fontFamily: "inherit", color: "#2c2c2a", cursor: "pointer" }}>
          <option value="created-desc">Terbaru</option>
          <option value="name-asc">Nama A–Z</option>
          <option value="name-desc">Nama Z–A</option>
          <option value="table-asc">Table ↑</option>
          <option value="table-desc">Table ↓</option>
          <option value="checkin_ceremony-asc">No Check-in Pemberkatan ↑</option>
          <option value="checkin_reception-asc">No Check-in Resepsi ↑</option>
        </select>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#faf8f4", borderBottom: "1px solid #e4ddd0" }}>
              <th style={{ padding: "10px 16px", width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: "pointer", width: 14, height: 14 }} />
              </th>
              {["Guest", "Dari", "Code", "WA", "Table", "Max", "C-RSVP", "R-RSVP", "Hadir P", "Hadir R", "Bahasa", "Link"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888780", fontWeight: 400 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedGuests.map(guest => (
              <tr key={guest.id} style={{
                borderBottom: "1px solid #f5f0e8",
                background: selected.has(guest.id) ? "#fef9ec"
                  : (guest.scanned_ceremony || guest.scanned_reception) ? "#f0fdf4"
                  : "transparent"
              }}>
                <td style={{ padding: "14px 16px" }}>
                  <input type="checkbox" checked={selected.has(guest.id)} onChange={() => toggleOne(guest.id)} style={{ cursor: "pointer", width: 14, height: 14 }} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <p style={{ fontWeight: 500, color: "#2c2c2a", marginBottom: 2 }}>{guest.name}</p>
                  <p style={{ fontSize: 11, color: "#888780" }}>{guest.greeting}</p>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    display: "inline-block",
                    background: guest.guest_side === "bride" ? "#fce8ed" : "#eef0e6",
                    color: guest.guest_side === "bride" ? "#c6294b" : "#535A36",
                    fontSize: 10, padding: "2px 8px", letterSpacing: "0.05em",
                    textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap"
                  }}>
                    {guest.guest_side === "bride" ? "Wanita" : "Pria"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, background: "#fdf8ee", color: "#8a6d3b", border: "1px solid #e8d5a3", padding: "2px 8px" }}>
                    {guest.code}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {guest.phone ? (
                    <a href={`https://wa.me/62${guest.phone.replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(waMessage(guest))}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#25D366", color: "#fff", padding: "4px 10px", fontSize: 11, textDecoration: "none", fontWeight: 600 }}>
                      WA ↗
                    </a>
                  ) : (
                    <span style={{ color: "#b4b2a9", fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={{ padding: "14px 16px", color: "#888780", fontSize: 12 }}>{guest.table_number ?? "—"}</td>
                <td style={{ padding: "14px 16px", color: "#888780", fontSize: 12, textAlign: "center" }}>{guest.max_attendees ?? 1}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={rsvpBadge(guest.ceremony_rsvp ?? "pending")}>{guest.ceremony_rsvp ?? "pending"}</span>
                    {guest.ceremony_rsvp === "confirmed" && (
                      <span style={{ fontSize: 10, color: "#888780" }}>{guest.ceremony_adults}D {guest.ceremony_kids}A</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {guest.invitation_type === "ceremony" ? (
                    <span style={{ color: "#b4b2a9", fontSize: 11 }}>—</span>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={rsvpBadge(guest.reception_rsvp ?? "pending")}>{guest.reception_rsvp ?? "pending"}</span>
                      {guest.reception_rsvp === "confirmed" && (
                        <span style={{ fontSize: 10, color: "#888780" }}>{guest.reception_adults}D {guest.reception_kids}A</span>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={scannedBadge(guest.scanned_ceremony)}>{guest.scanned_ceremony ? "✓ Hadir" : "—"}</span>
                  {guest.checkin_number_ceremony && (
                    <p style={{ fontSize: 12, color: "#8a6d3b", marginTop: 4, fontFamily: "monospace", fontWeight: 700 }}>
                      {guest.checkin_number_ceremony}
                    </p>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {guest.invitation_type === "ceremony" ? (
                    <span style={{ color: "#b4b2a9", fontSize: 10 }}>N/A</span>
                  ) : (
                    <>
                      <span style={scannedBadge(guest.scanned_reception)}>{guest.scanned_reception ? "✓ Hadir" : "—"}</span>
                      {guest.checkin_number_reception && (
                        <p style={{ fontSize: 12, color: "#8a6d3b", marginTop: 4, fontFamily: "monospace", fontWeight: 700 }}>
                          {guest.checkin_number_reception}
                        </p>
                      )}
                    </>
                  )}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["en", "id"].map(lang => (
                      <button key={lang} onClick={() => handleLanguageChange(guest.id, lang)}
                        disabled={updatingLang === guest.id}
                        style={{ padding: "3px 8px", fontSize: 10, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid #e4ddd0", background: guest.language === lang ? "#2c2c2a" : "#fdf8ee", color: guest.language === lang ? "#fff" : "#888780", opacity: updatingLang === guest.id ? 0.5 : 1 }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Link href={`/invitation-page/${guest.code}`} style={{ fontSize: 12, color: "#b8965a", textDecoration: "none" }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={13} style={{ padding: "40px", textAlign: "center", color: "#888780", fontSize: 13 }}>
                  No guests yet. Add your first guest above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ padding: "14px 24px", borderTop: "1px solid #f0ebe3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 11, color: "#888780" }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length} tamu {filtered.length !== guests.length ? `(${guests.length} total)` : ""}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ background: "transparent", border: "1px solid #e4ddd0", color: page === 1 ? "#b4b2a9" : "#2c2c2a", padding: "6px 12px", fontSize: 11, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ background: p === page ? "#2c2c2a" : "transparent", border: "1px solid #e4ddd0", color: p === page ? "#fff" : "#2c2c2a", padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", minWidth: 32 }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: "transparent", border: "1px solid #e4ddd0", color: page === totalPages ? "#b4b2a9" : "#2c2c2a", padding: "6px 12px", fontSize: 11, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}