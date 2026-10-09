import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import LogoutButton from "../../weddings/[slug]/dashboard/LogoutButton"
import EditBirthdayForm from "./EditBirthdayForm"
import MenuManager from "./MenuManager"
import GuestManager from "./GuestManager"

export const dynamic = "force-dynamic"

export default async function BirthdayDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: birthday } = await supabase.from("birthdays").select("*").eq("slug", slug).single()

  if (!birthday) {
    return (
      <div style={{ minHeight: "100vh", background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888780" }}>Birthday not found.</p>
      </div>
    )
  }

  const [{ data: menu }, { data: guests }] = await Promise.all([
    supabase.from("birthday_menu_items").select("*").eq("birthday_id", birthday.id).order("order_index", { ascending: true }),
    supabase.from("birthday_guests").select("*").eq("birthday_id", birthday.id).order("created_at", { ascending: false }),
  ])

  const menuName = new Map((menu ?? []).map(m => [m.id, m.name as string]))
  // Hitung pilihan menu hanya dari tamu yang hadir
  const attending = (guests ?? []).filter(g => g.rsvp === "attending")
  const menuItems = (menu ?? []).map(m => ({
    ...m,
    chosen: attending.filter(g => g.menu_item_id === m.id || g.drink_item_id === m.id).length,
  }))
  const guestRows = (guests ?? []).map(g => ({
    id: g.id, code: g.code, name: g.name, phone: g.phone, rsvp: g.rsvp as string | null,
    food_name: menuName.get(g.menu_item_id) ?? null,
    drink_name: menuName.get(g.drink_item_id) ?? null,
    menu_note: g.menu_note as string | null,
  }))

  const total = guestRows.length
  const hadir = guestRows.filter(g => g.rsvp === "attending")
  const stats = [
    { label: "Invitations", value: total, color: "#b8965a" },
    { label: "Hadir", value: hadir.length, color: "#3b6d11" },
    { label: "Tidak Hadir", value: guestRows.filter(g => g.rsvp === "declined").length, color: "#a32d2d" },
    { label: "Belum Konfirmasi", value: guestRows.filter(g => !g.rsvp).length, color: "#888780" },
    { label: "Hadir — Belum Lengkap Pilih Menu", value: hadir.filter(g => !g.food_name || !g.drink_name).length, color: "#888780" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <div style={{ background: "#2c2c2a", padding: "40px 32px", textAlign: "center", position: "relative" }}>
        <Link href="/events" style={{
          position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
          color: "#888780", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none"
        }}>
          ← All Events
        </Link>
        <LogoutButton />
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
          Birthday Dashboard
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300, marginBottom: 8 }}>
          {birthday.event_title || birthday.celebrant_name || slug}
        </h1>
        <p style={{ color: "#888780", fontSize: 13 }}>
          {[birthday.premiere_date, birthday.show_time, birthday.venue].filter(Boolean).join(" · ")}
        </p>
        {guestRows[0] && (
          <div style={{ marginTop: 16 }}>
            <Link href={`/birthday/${guestRows[0].code}`} target="_blank" style={{
              color: "#b8965a", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none"
            }}>
              Preview Invitation →
            </Link>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ background: "#fff", border: "1px solid #e4ddd0", marginBottom: 28 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {stats.map((s, i) => (
                <tr key={s.label} style={{ borderBottom: i < stats.length - 1 ? "1px solid #f0ebe3" : "none" }}>
                  <td style={{ padding: "14px 24px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888780" }}>{s.label}</td>
                  <td style={{ padding: "14px 24px", textAlign: "right", fontSize: 24, fontWeight: 300, color: s.color }}>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EditBirthdayForm birthday={birthday} />
        <MenuManager birthdayId={birthday.id} items={menuItems} />
        <GuestManager birthdayId={birthday.id} eventTitle={birthday.event_title || "the Birthday Premiere"} guests={guestRows} />
      </div>
    </div>
  )
}
