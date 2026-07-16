import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import WeddingAddGuestForm from "./WeddingAddGuestForm"
import EditWeddingForm from "./EditWeddingForm"
import PhotoUpload from "./PhotoUpload"
import CSVImport from "./CSVImport"
import LogoutButton from "./LogoutButton"
import GuestTable from "./GuestTable"

export default async function WeddingDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!wedding) {
    return (
      <div style={{
        minHeight: "100vh", background: "#faf7f2",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <p style={{ color: "#888780" }}>Wedding not found.</p>
      </div>
    )
  }

  const { data: guests } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })

  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("order_index", { ascending: true })

  const total = guests?.length ?? 0

  const confirmed = guests?.filter(g =>
    g.ceremony_rsvp === "confirmed" || g.reception_rsvp === "confirmed"
  ).length ?? 0

  const pending = guests?.filter(g =>
    g.ceremony_rsvp === "pending" &&
    (g.invitation_type === "ceremony" || g.reception_rsvp === "pending")
  ).length ?? 0

  const declined = guests?.filter(g =>
    g.ceremony_rsvp === "declined" &&
    (g.invitation_type === "ceremony" || g.reception_rsvp === "declined")
  ).length ?? 0

  const totalAttendees = guests?.reduce((sum, g) => {
    const c = g.ceremony_rsvp === "confirmed" ? (g.ceremony_adults ?? 0) + (g.ceremony_kids ?? 0) : 0
    const r = g.reception_rsvp === "confirmed" ? (g.reception_adults ?? 0) + (g.reception_kids ?? 0) : 0
    return sum + Math.max(c, r)
  }, 0) ?? 0

  const hadirPemberkatan = guests?.filter(g => g.ceremony_adults+g.ceremony_kids).length ?? 0
  const hadirResepsi = guests?.filter(g => g.reception_adults+g.reception_kids).length ?? 0

  const stats = [
    { label: "Invitations", value: total,          color: "#b8965a" },
    { label: "Confirmed",   value: confirmed,      color: "#3b6d11" },
    { label: "Pending",     value: pending,        color: "#888780" },
    { label: "Declined",    value: declined,       color: "#a32d2d" },
    { label: "Hadir Pemberkatan", value: hadirPemberkatan, color: "#535A36" },
    { label: "Hadir Resepsi",     value: hadirResepsi,     color: "#c6294b" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Header */}
      <div style={{
        background: "#2c2c2a", padding: "40px 32px",
        textAlign: "center", position: "relative"
      }}>
        <Link href="/weddings" style={{
          position: "absolute", left: 24, top: "50%",
          transform: "translateY(-50%)",
          color: "#888780", fontSize: 11,
          letterSpacing: "0.12em", textTransform: "uppercase",
          textDecoration: "none"
        }}>
          ← All Weddings
        </Link>

        <LogoutButton />

        <p style={{
          color: "#e8d5a3", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10
        }}>
          Wedding Dashboard
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300, marginBottom: 8 }}>
          {wedding.partner1} & {wedding.partner2}
        </h1>
        <p style={{ color: "#888780", fontSize: 13 }}>
          {wedding.date} · {wedding.venue}
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 20, justifyContent: "center" }}>
          <Link href={`/weddings/${slug}/scanner`} style={{
            color: "#b8965a", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none"
          }}>
            Open Scanner →
          </Link>
          <Link href={`/invitation-page/${guests?.[0]?.code ?? ""}`} style={{
            color: "#888780", fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none"
          }}>
            Preview Invitation →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              flex: 1, background: "#fff",
              border: "1px solid #e4ddd0",
              padding: "20px 12px", textAlign: "center"
            }}>
              <p style={{ color: stat.color, fontSize: 38, fontWeight: 300, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{
                color: "#888780", fontSize: 10,
                letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8
              }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Edit wedding form */}
        <EditWeddingForm wedding={wedding} />

        {/* Photo upload */}
        <PhotoUpload weddingId={wedding.id} photos={photos ?? []} />

        <CSVImport weddingId={wedding.id} />

        {/* Add guest */}
        <div style={{ marginTop: 24 }}>
          <WeddingAddGuestForm weddingId={wedding.id} slug={slug} />
        </div>

        {/* Guest table */}
        <GuestTable
          guests={guests ?? []}
          wedding={{
            partner1: wedding.partner1,
            partner2: wedding.partner2,
            date: wedding.date,
            venue: wedding.venue,
            groom_father: wedding.groom_father,
            groom_mother: wedding.groom_mother,
            bride_father: wedding.bride_father,
            bride_mother: wedding.bride_mother,
            ceremony_venue: wedding.ceremony_venue,
            ceremony_time: wedding.ceremony_time,
            ceremony_maps_url: wedding.ceremony_maps_url,
            reception_venue: wedding.reception_venue,
            reception_time: wedding.reception_time,
            reception_maps_url: wedding.reception_maps_url,
          }}
        />

      </div>
    </div>
  )
}