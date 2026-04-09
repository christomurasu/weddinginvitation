import { supabase } from "../lib/supabase"
import Link from "next/link"

export default async function WeddingsPage() {
  const { data: weddings } = await supabase
    .from("weddings")
    .select("*, guests(count)")
    .order("created_at", { ascending: false })

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Header */}
      <div style={{
        background: "#2c2c2a", padding: "40px 32px",
        textAlign: "center"
      }}>
        <p style={{
          color: "#e8d5a3", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10
        }}>
          Wedding System
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>
          All Weddings
        </h1>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>

        {/* New wedding button */}
        <div style={{ marginBottom: 24, textAlign: "right" }}>
          <Link href="/weddings/new" style={{
            background: "#2c2c2a", color: "#fff",
            padding: "12px 28px", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
            textDecoration: "none", display: "inline-block"
          }}>
            + New Wedding
          </Link>
        </div>

        {/* Wedding list */}
        {weddings?.length === 0 && (
          <div style={{
            background: "#fff", border: "1px solid #e4ddd0",
            padding: "48px", textAlign: "center"
          }}>
            <p style={{ color: "#888780", fontSize: 13 }}>
              No weddings yet. Create your first one.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {weddings?.map(w => {
            const guestCount = (w.guests as any)?.[0]?.count ?? 0
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
                    href={`/weddings/${w.slug}/dashboard`}
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
                    href={`/weddings/${w.slug}/scanner`}
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
        </div>
      </div>
    </div>
  )
}