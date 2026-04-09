import { supabase } from "../../lib/supabase"
import RSVPButtons from "./RSVPButtons"

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  const { data: guest, error } = await supabase
    .from("guests")
    .select("*, weddings(*)")
    .eq("code", code)
    .single()

  if (error || !guest) {
    return (
      <div style={{
        minHeight: "100vh", background: "#faf7f2",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{
            color: "#888780", fontSize: 13,
            letterSpacing: "0.2em", textTransform: "uppercase"
          }}>
            Invitation not found
          </p>
          <p style={{ color: "#b4b2a9", fontSize: 11, marginTop: 8 }}>
            {code}
          </p>
        </div>
      </div>
    )
  }

  const wedding = guest.weddings

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Header */}
      <div style={{
        textAlign: "center", padding: "64px 32px 40px",
        background: "linear-gradient(180deg, rgba(184,150,90,0.07) 0%, transparent 100%)"
      }}>
        <p style={{
          color: "#b8965a", fontSize: 10,
          letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 16
        }}>
          You are invited
        </p>
        <h1 style={{
          fontFamily: "Georgia, serif", fontSize: 42,
          fontWeight: 300, color: "#1a1a18", marginBottom: 10,
          lineHeight: 1.2
        }}>
          {wedding.partner1} & {wedding.partner2}
        </h1>
        <p style={{
          color: "#888780", fontStyle: "italic",
          fontSize: 15, marginBottom: 10
        }}>
          Together with their families
        </p>
        <p style={{
          color: "#b8965a", fontSize: 11,
          letterSpacing: "0.22em", textTransform: "uppercase"
        }}>
          — {guest.greeting || "Dear Honoured Guest"} —
        </p>
      </div>

      {/* Cards */}
      <div style={{
        maxWidth: 480, margin: "0 auto",
        padding: "0 24px 64px",
        display: "flex", flexDirection: "column", gap: 14
      }}>

        {/* Ceremony */}
        <div style={{
          background: "#fff", border: "1px solid #e4ddd0",
          padding: "24px 28px", position: "relative"
        }}>
          <div style={{
            position: "absolute", top: 5, left: 5,
            right: 5, bottom: 5,
            border: "1px solid #f0e8d5", pointerEvents: "none"
          }} />
          <p style={{
            fontSize: 9, letterSpacing: "0.28em",
            textTransform: "uppercase", color: "#b8965a", marginBottom: 10
          }}>
            The Ceremony
          </p>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 32,
            fontWeight: 300, color: "#1a1a18", lineHeight: 1
          }}>
            {wedding.date}
          </p>
          <p style={{ color: "#888780", fontSize: 12, marginTop: 6 }}>
            Commencing at Half Past Three in the Afternoon
          </p>
        </div>

        {/* Venue */}
        <div style={{
          background: "#fff", border: "1px solid #e4ddd0",
          padding: "24px 28px", position: "relative"
        }}>
          <div style={{
            position: "absolute", top: 5, left: 5,
            right: 5, bottom: 5,
            border: "1px solid #f0e8d5", pointerEvents: "none"
          }} />
          <p style={{
            fontSize: 9, letterSpacing: "0.28em",
            textTransform: "uppercase", color: "#b8965a", marginBottom: 10
          }}>
            Venue
          </p>
          <p style={{
            fontFamily: "Georgia, serif", fontSize: 22,
            fontWeight: 300, color: "#1a1a18", marginBottom: 4
          }}>
            {wedding.venue}
          </p>
          <p style={{ color: "#888780", fontSize: 13 }}>
            {wedding.venue_address}
          </p>
        </div>

        {/* Personal note */}
        {guest.note && (
          <div style={{
            background: "#fdf8ee", border: "1px solid #e8d5a3",
            padding: "24px 28px"
          }}>
            <p style={{
              fontSize: 9, letterSpacing: "0.28em",
              textTransform: "uppercase", color: "#b8965a", marginBottom: 10
            }}>
              A Personal Note
            </p>
            <p style={{
              color: "#2c2c2a", fontStyle: "italic",
              fontSize: 14, lineHeight: 1.7
            }}>
              {guest.note}
            </p>
          </div>
        )}

        {/* RSVP */}
        <RSVPButtons
          guestCode={code}
          initialStatus={guest.rsvp}
          rsvpDeadline={wedding.rsvp_deadline}
          maxAttendees={guest.max_attendees ?? 1}
          initialAttendees={guest.actual_attendees ?? 1}
        />

      </div>
    </div>
  )
}