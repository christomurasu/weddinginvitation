import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import WeddingAddGuestForm from "./WeddingAddGuestForm"
import EditWeddingForm from "./EditWeddingForm"
import PhotoUpload from "./PhotoUpload"

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

  const total          = guests?.length ?? 0
  const confirmed      = guests?.filter(g => g.rsvp === "confirmed").length ?? 0
  const pending        = guests?.filter(g => g.rsvp === "pending").length ?? 0
  const declined       = guests?.filter(g => g.rsvp === "declined").length ?? 0
  const totalAttendees = guests?.filter(g => g.rsvp === "confirmed")
                                .reduce((a, g) => a + (g.actual_attendees ?? 1), 0) ?? 0

  const stats = [
    { label: "Invitations", value: total,          color: "#b8965a" },
    { label: "Confirmed",   value: confirmed,      color: "#3b6d11" },
    { label: "Pending",     value: pending,        color: "#888780" },
    { label: "Declined",    value: declined,       color: "#a32d2d" },
    { label: "Attending",   value: totalAttendees, color: "#b8965a" },
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
        <PhotoUpload
          weddingId={wedding.id}
          photos={photos ?? []}
        />

        {/* Add guest */}
        <div style={{ marginTop: 24 }}>
          <WeddingAddGuestForm weddingId={wedding.id} slug={slug} />
        </div>

        {/* Guest table */}
        <div style={{
          background: "#fff", border: "1px solid #e4ddd0", marginTop: 24
        }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0ebe3" }}>
            <p style={{
              fontSize: 10, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#b8965a"
            }}>
              All Guests
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#faf8f4", borderBottom: "1px solid #e4ddd0" }}>
                  {["Guest", "Code", "Table", "Max", "Attending", "RSVP", "Link"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 16px",
                      fontSize: 10, letterSpacing: "0.15em",
                      textTransform: "uppercase", color: "#888780", fontWeight: 400
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests?.map(guest => (
                  <tr key={guest.id} style={{ borderBottom: "1px solid #f5f0e8" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontWeight: 500, color: "#2c2c2a", marginBottom: 2 }}>
                        {guest.name}
                      </p>
                      <p style={{ fontSize: 11, color: "#888780" }}>
                        {guest.greeting}
                      </p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontFamily: "monospace", fontSize: 11,
                        background: "#fdf8ee", color: "#8a6d3b",
                        border: "1px solid #e8d5a3", padding: "2px 8px"
                      }}>
                        {guest.code}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#888780", fontSize: 12 }}>
                      {guest.table_number ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#888780", fontSize: 12, textAlign: "center" }}>
                      {guest.max_attendees ?? 1}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      {guest.rsvp === "confirmed" ? (
                        <span style={{ color: "#3b6d11", fontSize: 13, fontWeight: 500 }}>
                          {guest.actual_attendees ?? 1}
                        </span>
                      ) : (
                        <span style={{ color: "#b4b2a9", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 11, padding: "3px 10px",
                        background: guest.rsvp === "confirmed" ? "#eaf3de"
                          : guest.rsvp === "declined" ? "#fcebeb" : "#f5f0e8",
                        color: guest.rsvp === "confirmed" ? "#3b6d11"
                          : guest.rsvp === "declined" ? "#a32d2d" : "#888780"
                      }}>
                        {guest.rsvp}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link
                        href={`/invitation-page/${guest.code}`}
                        style={{ fontSize: 12, color: "#b8965a", textDecoration: "none" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!guests || guests.length === 0) && (
                  <tr>
                    <td colSpan={7} style={{
                      padding: "40px", textAlign: "center",
                      color: "#888780", fontSize: 13
                    }}>
                      No guests yet. Add your first guest above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}