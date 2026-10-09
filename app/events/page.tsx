import { supabase } from "../lib/supabase"
import Link from "next/link"
import LogoutButton from "./weddings/[slug]/dashboard/LogoutButton"

export const dynamic = "force-dynamic"

export default async function WeddingsPage() {
  const { data: weddings } = await supabase
    .from("weddings")
    .select("*, guests(count)")
    .order("created_at", { ascending: false })

  const { data: birthdays } = await supabase
    .from("birthdays")
    .select("*, birthday_guests(count)")
    .order("created_at", { ascending: false })

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Header */}
      <div style={{
        background: "#2c2c2a", padding: "40px 32px",
        textAlign: "center", position: "relative"
      }}>
        <LogoutButton />
        <p style={{
          color: "#e8d5a3", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10
        }}>
          Event System
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>
          All Events
        </h1>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>

        {/* New event buttons */}
        <div style={{ marginBottom: 24, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Link href="/events/birthday/new" style={{
            background: "#c6294b", color: "#fff",
            padding: "12px 28px", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
            textDecoration: "none", display: "inline-block"
          }}>
            + New Birthday
          </Link>
          <Link href="/events/weddings/new" style={{
            background: "#2c2c2a", color: "#fff",
            padding: "12px 28px", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
            textDecoration: "none", display: "inline-block"
          }}>
            + New Wedding
          </Link>
        </div>

        {/* Wedding list */}
        {weddings?.length === 0 && !birthdays?.length && (
          <div style={{
            background: "#fff", border: "1px solid #e4ddd0",
            padding: "48px", textAlign: "center"
          }}>
            <p style={{ color: "#888780", fontSize: 13 }}>
              No events yet. Create your first one.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {weddings?.map(w => {
            const guestCount = (w.guests as { count: number }[])?.[0]?.count ?? 0
            return (
              <div key={w.id} style={{
                background: "#fff", border: "1px solid #e4ddd0",
                padding: "24px 28px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 16
              }}>
                <div>
                  <h2 style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 22, fontWeight: 300,
                    color: "#2c2c2a", marginBottom: 4
                  }}>
                    {w.partner1} & {w.partner2}
                  </h2>
                  <p style={{ color: "#888780", fontSize: 12, marginBottom: 2 }}>
                    {w.date}
                  </p>
                  <p style={{ color: "#b4b2a9", fontSize: 12 }}>
                    {w.venue}
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{
                    color: "#b8965a", fontSize: 28,
                    fontWeight: 300, lineHeight: 1
                  }}>
                    {guestCount}
                  </p>
                  <p style={{
                    color: "#888780", fontSize: 9,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    marginBottom: 12
                  }}>
                    Guests
                  </p>
                  <Link
                    href={`/events/weddings/${w.slug}/dashboard`}
                    style={{
                      background: "#2c2c2a", color: "#fff",
                      padding: "8px 16px", fontSize: 10,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      textDecoration: "none", display: "block",
                      marginBottom: 6, textAlign: "center"
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/events/weddings/${w.slug}/scanner`}
                    style={{
                      background: "transparent", color: "#888780",
                      border: "1px solid #e4ddd0",
                      padding: "8px 16px", fontSize: 10,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      textDecoration: "none", display: "block",
                      textAlign: "center"
                    }}
                  >
                    Scanner
                  </Link>
                </div>
              </div>
            )
          })}

          {birthdays?.map(b => {
            const guestCount = (b.birthday_guests as { count: number }[])?.[0]?.count ?? 0
            return (
              <div key={b.id} style={{
                background: "#fff", border: "1px solid #e4ddd0",
                padding: "24px 28px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 16
              }}>
                <div>
                  <p style={{ color: "#c6294b", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                    Birthday
                  </p>
                  <h2 style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 22, fontWeight: 300,
                    color: "#2c2c2a", marginBottom: 4
                  }}>
                    {b.event_title || b.slug}
                  </h2>
                  <p style={{ color: "#888780", fontSize: 12, marginBottom: 2 }}>
                    {[b.premiere_date, b.show_time].filter(Boolean).join(" · ")}
                  </p>
                  <p style={{ color: "#b4b2a9", fontSize: 12 }}>
                    {b.venue}
                  </p>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{
                    color: "#b8965a", fontSize: 28,
                    fontWeight: 300, lineHeight: 1
                  }}>
                    {guestCount}
                  </p>
                  <p style={{
                    color: "#888780", fontSize: 9,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    marginBottom: 12
                  }}>
                    Guests
                  </p>
                  <Link
                    href={`/events/birthday/${b.slug}`}
                    style={{
                      background: "#2c2c2a", color: "#fff",
                      padding: "8px 16px", fontSize: 10,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      textDecoration: "none", display: "block",
                      textAlign: "center"
                    }}
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}