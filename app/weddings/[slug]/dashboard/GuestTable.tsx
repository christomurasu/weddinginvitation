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
}

export default function GuestTable({
  guests: initialGuests,
  wedding,
}: {
  guests: Guest[]
  wedding: { partner1: string; partner2: string; date: string; venue: string }
}) {
  const router = useRouter()
  const [guests, setGuests] = useState(initialGuests)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [updatingLang, setUpdatingLang] = useState<string | null>(null)

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

  async function handleLanguageChange(id: string, lang: string) {
    setUpdatingLang(id)
    await supabase.from("guests").update({ language: lang }).eq("id", id)
    setGuests(prev => prev.map(g => g.id === id ? { ...g, language: lang } : g))
    setUpdatingLang(null)
  }

  const waMessage = (guest: Guest) =>
    `Kepada Yth.\n${guest.greeting},\n\nBersama ini kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami:\n\n${wedding.partner1} & ${wedding.partner2}\n${wedding.date}\n${wedding.venue}\n\nSebagai tanda kasih, kami telah menyiapkan undangan digital khusus untuk Bapak/Ibu/Saudara/i:\n\nhttps://sfinvitation.id/invitation-page/${guest.code}\n\nMohon konfirmasi kehadiran melalui link undangan di atas.\n\nAtas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami mengucapkan terima kasih.\n\nSalam hangat,\n${wedding.partner1} & ${wedding.partner2}`

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
          {selected.size > 0 && (
            <button onClick={handleDelete} disabled={deleting} style={{ background: "#a32d2d", color: "#fff", border: "none", padding: "7px 16px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.6 : 1 }}>
              {deleting ? "Menghapus..." : `Hapus ${selected.size} Tamu`}
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#faf8f4", borderBottom: "1px solid #e4ddd0" }}>
              <th style={{ padding: "10px 16px", width: 40 }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: "pointer", width: 14, height: 14 }} />
              </th>
              {["Guest", "Code", "WA", "Table", "Max", "C-RSVP", "R-RSVP", "Hadir P", "Hadir R", "Bahasa", "Link"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888780", fontWeight: 400 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => (
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
                  <span style={scannedBadge(guest.scanned_ceremony)}>
                    {guest.scanned_ceremony ? "✓ Hadir" : "—"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {guest.invitation_type === "ceremony" ? (
                    <span style={{ color: "#b4b2a9", fontSize: 10 }}>N/A</span>
                  ) : (
                    <span style={scannedBadge(guest.scanned_reception)}>
                      {guest.scanned_reception ? "✓ Hadir" : "—"}
                    </span>
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
                <td colSpan={12} style={{ padding: "40px", textAlign: "center", color: "#888780", fontSize: 13 }}>
                  No guests yet. Add your first guest above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}