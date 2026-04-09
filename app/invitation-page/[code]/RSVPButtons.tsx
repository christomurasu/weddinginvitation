"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import QRCodeDisplay from "./QRCode"

export default function RSVPButtons({
  guestCode,
  initialStatus,
  rsvpDeadline,
  maxAttendees,
  initialAttendees,
}: {
  guestCode: string
  initialStatus: string
  rsvpDeadline: string
  maxAttendees: number
  initialAttendees: number
}) {
  const [status, setStatus] = useState(initialStatus)
  const [step, setStep] = useState<"rsvp" | "attendees" | "done">(
    initialStatus === "confirmed" ? "done" : "rsvp"
  )
  const [loading, setLoading] = useState(false)
  const [attendees, setAttendees] = useState(initialAttendees || 1)

  async function handleDecline() {
    setLoading(true)
    await supabase
      .from("guests")
      .update({ rsvp: "declined", actual_attendees: 0 })
      .eq("code", guestCode)
    setStatus("declined")
    setLoading(false)
  }

  async function handleConfirm() {
    setLoading(true)
    await supabase
      .from("guests")
      .update({ rsvp: "confirmed", actual_attendees: attendees })
      .eq("code", guestCode)
    setStatus("confirmed")
    setStep("done")
    setLoading(false)
  }

  return (
    <div style={{
      background: "#2c2c2a",
      padding: "40px 32px",
      textAlign: "center"
    }}>
      <p style={{
        color: "#e8d5a3", fontSize: 20,
        fontWeight: 300, marginBottom: 8
      }}>
        Kindly Reply
      </p>
      <p style={{
        color: "#888780", fontSize: 10,
        letterSpacing: "0.18em", textTransform: "uppercase",
        marginBottom: 28
      }}>
        {rsvpDeadline}
      </p>

      {/* Step 1 — accept or decline */}
      {step === "rsvp" && (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => setStep("attendees")}
            style={{
              background: "#b8965a", color: "#fff",
              border: "none", padding: "13px 32px",
              fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase", cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Joyfully Accepts
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            style={{
              background: "transparent", color: "#888780",
              border: "1px solid #444441", padding: "13px 32px",
              fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase", cursor: "pointer",
              opacity: loading ? 0.5 : 1, fontFamily: "inherit"
            }}
          >
            {loading ? "Saving..." : "Regretfully Declines"}
          </button>
        </div>
      )}

      {/* Step 2 — pick number of attendees */}
      {step === "attendees" && (
        <div>
          <p style={{
            color: "#e8d5a3", fontSize: 15, marginBottom: 6
          }}>
            Wonderful! How many will attend?
          </p>
          <p style={{
            color: "#888780", fontSize: 11, marginBottom: 28
          }}>
            You have up to {maxAttendees} {maxAttendees === 1 ? "spot" : "spots"}
          </p>

          {/* Counter */}
          <div style={{
            background: "#1a1a18", border: "1px solid #444441",
            padding: "28px 24px", marginBottom: 24
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 28
            }}>
              <button
                onClick={() => setAttendees(a => Math.max(1, a - 1))}
                style={{
                  width: 44, height: 44,
                  background: "transparent",
                  border: "1px solid #444441",
                  color: "#888780", fontSize: 24,
                  cursor: attendees <= 1 ? "not-allowed" : "pointer",
                  opacity: attendees <= 1 ? 0.3 : 1,
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center",
                  justifyContent: "center"
                }}
              >
                −
              </button>

              <div style={{ textAlign: "center", minWidth: 80 }}>
                <p style={{
                  color: "#e8d5a3", fontSize: 56,
                  fontWeight: 300, lineHeight: 1
                }}>
                  {attendees}
                </p>
                <p style={{ color: "#444441", fontSize: 11, marginTop: 6 }}>
                  {attendees === 1 ? "person" : "people"}
                </p>
              </div>

              <button
                onClick={() => setAttendees(a => Math.min(maxAttendees, a + 1))}
                style={{
                  width: 44, height: 44,
                  background: "transparent",
                  border: "1px solid #444441",
                  color: "#888780", fontSize: 24,
                  cursor: attendees >= maxAttendees ? "not-allowed" : "pointer",
                  opacity: attendees >= maxAttendees ? 0.3 : 1,
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center",
                  justifyContent: "center"
                }}
              >
                +
              </button>
            </div>

            {/* Dots */}
            {maxAttendees > 1 && (
              <div style={{
                display: "flex", justifyContent: "center",
                gap: 8, marginTop: 20
              }}>
                {Array.from({ length: maxAttendees }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setAttendees(i + 1)}
                    style={{
                      width: 10, height: 10,
                      borderRadius: "50%",
                      background: i < attendees ? "#b8965a" : "#444441",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              width: "100%", background: "#b8965a", color: "#fff",
              border: "none", padding: "14px",
              fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              fontFamily: "inherit", marginBottom: 10
            }}
          >
            {loading ? "Saving..." : `Confirm · ${attendees} ${attendees === 1 ? "person" : "people"}`}
          </button>

          {/* Back button */}
          <button
            onClick={() => setStep("rsvp")}
            style={{
              width: "100%", background: "transparent",
              color: "#888780", border: "none",
              padding: "10px", fontSize: 11,
              letterSpacing: "0.1em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit"
            }}
          >
            ← Go back
          </button>
        </div>
      )}

      {/* Step 3 — confirmed, show QR */}
      {step === "done" && status === "confirmed" && (
        <div>
          <p style={{ color: "#e8d5a3", fontSize: 18, marginBottom: 6 }}>
            We look forward to seeing you!
          </p>
          <p style={{ color: "#888780", fontSize: 13, marginBottom: 8 }}>
            Present this QR code at the entrance.
          </p>
          <p style={{ color: "#b8965a", fontSize: 13, marginBottom: 28 }}>
            Attending: {attendees} {attendees === 1 ? "person" : "people"}
          </p>
          <QRCodeDisplay code={guestCode} />
          <p style={{
            color: "#444441", fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase",
            marginTop: 16
          }}>
            Code: {guestCode}
          </p>
        </div>
      )}

      {/* Declined */}
      {status === "declined" && (
        <p style={{ color: "#888780", fontSize: 14 }}>
          Thank you for letting us know. We will miss you.
        </p>
      )}
    </div>
  )
}