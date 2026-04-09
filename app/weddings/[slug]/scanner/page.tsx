"use client"
import { useEffect, useRef, useState, use } from "react"
import { supabase } from "../../../lib/supabase"
import Link from "next/link"

export default function WeddingScannerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const [wedding, setWedding] = useState<any>(null)
  const [error, setError] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [nameSearch, setNameSearch] = useState("")
  const [nameResults, setNameResults] = useState<any[]>([])
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    supabase.from("weddings").select("*").eq("slug", slug).single()
      .then(({ data }) => setWedding(data))
    return () => stopCamera()
  }, [slug])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        startScanning()
      }
    } catch (e) {
      setError("Camera permission denied.")
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScanning(false)
  }

  function startScanning() {
    const jsQR = require("jsqr")
    intervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code?.data) {
        clearInterval(intervalRef.current)
        stopCamera()
        lookupGuest(code.data)
      }
    }, 300)
  }

  async function lookupGuest(code: string) {
    setLoading(true)
    setError("")
    setGuest(null)
    setConfirmed(false)
    const { data, error } = await supabase
      .from("guests")
      .select("*, weddings(partner1, partner2, slug)")
      .eq("code", code)
      .single()
    setLoading(false)
    if (error || !data) {
      setError(`No guest found for code: ${code}`)
      return
    }
    if (data.weddings?.slug !== slug) {
      setError(`This QR belongs to a different wedding.`)
      return
    }
    setGuest(data)
  }

  async function confirmPresence() {
    if (!guest) return
    setConfirming(true)
    await supabase
      .from("guests")
      .update({ scanned: true })
      .eq("code", guest.code)
    setConfirming(false)
    setConfirmed(true)
  }

  async function updateAttendees(value: number) {
    if (!guest) return
    const newVal = Math.min(Math.max(1, value), guest.max_attendees ?? 1)
    await supabase
      .from("guests")
      .update({ actual_attendees: newVal })
      .eq("code", guest.code)
    setGuest({ ...guest, actual_attendees: newVal })
  }

  function resetScanner() {
    setGuest(null)
    setError("")
    setConfirmed(false)
    setScanning(false)
    setNameSearch("")
    setNameResults([])
    setTimeout(() => startCamera(), 500)
  }

  async function handleNameSearch(value: string) {
    setNameSearch(value)
    if (value.trim().length < 2) { setNameResults([]); return }
    if (!wedding) return
    const { data } = await supabase
      .from("guests")
      .select("id, name, greeting, code, rsvp, table_number, note, scanned, actual_attendees, max_attendees")
      .eq("wedding_id", wedding.id)
      .ilike("name", `%${value}%`)
      .limit(5)
    setNameResults(data ?? [])
  }

  const rowStyle = {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "10px 0",
    borderBottom: "1px solid #2c2c2a"
  }
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em",
    textTransform: "uppercase" as const, color: "#444441"
  }
  const valueStyle = { fontSize: 14, color: "#fff", fontWeight: 300 as const }

  return (
    <div style={{ minHeight: "100vh", background: "#2c2c2a" }}>

      <div style={{
        padding: "28px 24px", textAlign: "center",
        borderBottom: "1px solid #444441", position: "relative"
      }}>
        <Link href={`/weddings/${slug}/dashboard`} style={{
          position: "absolute", left: 20, top: "50%",
          transform: "translateY(-50%)",
          color: "#888780", fontSize: 11,
          letterSpacing: "0.1em", textTransform: "uppercase",
          textDecoration: "none"
        }}>
          ← Dashboard
        </Link>
        <p style={{
          color: "#e8d5a3", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6
        }}>
          {wedding?.partner1} & {wedding?.partner2}
        </p>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 300 }}>
          Guest Scanner
        </h1>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 24px" }}>

        {!guest && !loading && (
          <div>
            <div style={{
              background: "#1a1a18", border: "1px solid #444441",
              aspectRatio: "1", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: 14, position: "relative", overflow: "hidden"
            }}>
              <video ref={videoRef}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: scanning ? "block" : "none" }}
                playsInline muted />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {scanning && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 200, height: 200, border: "2px solid #b8965a", pointerEvents: "none"
                }}>
                  {[
                    { top: -2, left: -2, borderWidth: "3px 0 0 3px" },
                    { top: -2, right: -2, borderWidth: "3px 3px 0 0" },
                    { bottom: -2, left: -2, borderWidth: "0 0 3px 3px" },
                    { bottom: -2, right: -2, borderWidth: "0 3px 3px 0" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      position: "absolute", width: 20, height: 20,
                      borderColor: "#b8965a", borderStyle: "solid", ...c
                    }} />
                  ))}
                </div>
              )}
              {!scanning && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#444441", fontSize: 48, lineHeight: 1, marginBottom: 8 }}>◻</p>
                  <p style={{ color: "#888780", fontSize: 12 }}>Camera inactive</p>
                </div>
              )}
            </div>

            {!scanning ? (
              <button onClick={startCamera} style={{
                width: "100%", background: "#b8965a", color: "#fff",
                border: "none", padding: "13px", fontSize: 11,
                letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "inherit", marginBottom: 18
              }}>
                Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} style={{
                width: "100%", background: "transparent", color: "#888780",
                border: "1px solid #444441", padding: "13px", fontSize: 11,
                letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "inherit", marginBottom: 18
              }}>
                Stop Camera
              </button>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "#444441" }} />
              <p style={{ color: "#888780", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Or search manually
              </p>
              <div style={{ flex: 1, height: 1, background: "#444441" }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input id="manual-code" type="text" placeholder="Enter code e.g. INV-AB1234"
                style={{
                  flex: 1, background: "#1a1a18", border: "1px solid #444441",
                  color: "#fff", padding: "10px 12px", fontSize: 13,
                  fontFamily: "monospace", outline: "none"
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const input = e.currentTarget
                    if (input.value) lookupGuest(input.value.trim().toUpperCase())
                  }
                }}
              />
              <button onClick={() => {
                const input = document.getElementById("manual-code") as HTMLInputElement
                if (input?.value) lookupGuest(input.value.trim().toUpperCase())
              }} style={{
                background: "#2c2c2a", color: "#e8d5a3",
                border: "1px solid #444441", padding: "10px 18px",
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                letterSpacing: "0.1em", textTransform: "uppercase"
              }}>
                Check
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <input type="text" placeholder="Or search by guest name..."
                value={nameSearch}
                onChange={e => handleNameSearch(e.target.value)}
                style={{
                  width: "100%", background: "#1a1a18", border: "1px solid #444441",
                  color: "#fff", padding: "10px 12px", fontSize: 13,
                  outline: "none", fontFamily: "inherit"
                }}
              />
              {nameResults.length > 0 && (
                <div style={{
                  background: "#1a1a18", border: "1px solid #444441",
                  borderTop: "none", maxHeight: 220, overflowY: "auto"
                }}>
                  {nameResults.map(g => (
                    <div key={g.id}
                      onClick={() => { setNameSearch(""); setNameResults([]); lookupGuest(g.code) }}
                      style={{
                        padding: "12px 14px", cursor: "pointer",
                        borderBottom: "1px solid #2c2c2a",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#2c2c2a")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <p style={{ color: "#fff", fontSize: 13, marginBottom: 2 }}>{g.name}</p>
                        <p style={{ color: "#888780", fontSize: 11 }}>{g.greeting}</p>
                      </div>
                      <span style={{
                        fontFamily: "monospace", fontSize: 10, color: "#b8965a",
                        background: "#2c2c2a", padding: "2px 8px", border: "1px solid #444441"
                      }}>
                        {g.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#888780", fontSize: 12 }}>Looking up guest...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: "#3d1f1f", border: "1px solid #a32d2d",
            padding: "24px", textAlign: "center", marginBottom: 16
          }}>
            <p style={{ color: "#f09595", fontSize: 14, marginBottom: 16 }}>{error}</p>
            <button onClick={resetScanner} style={{
              background: "transparent", color: "#888780",
              border: "1px solid #444441", padding: "10px 24px",
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              letterSpacing: "0.1em", textTransform: "uppercase"
            }}>
              Try Again
            </button>
          </div>
        )}

        {guest && !loading && (
          <div>
            <div style={{
              background: "#1a1a18",
              border: `1px solid ${confirmed ? "#3b6d11" : guest.scanned ? "#854f0b" : guest.rsvp === "confirmed" ? "#b8965a" : "#a32d2d"}`,
              padding: "28px 24px", marginBottom: 14
            }}>
              <div style={{ marginBottom: 18, textAlign: "center" }}>
                {confirmed ? (
                  <span style={{ background: "#1a3d1a", color: "#97c459", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>✓ Checked In</span>
                ) : guest.scanned ? (
                  <span style={{ background: "#3d2a1a", color: "#ef9f27", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>⚠ Already Scanned</span>
                ) : guest.rsvp === "confirmed" ? (
                  <span style={{ background: "#1a2a3d", color: "#85b7eb", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>RSVP Confirmed</span>
                ) : (
                  <span style={{ background: "#3d1f1f", color: "#f09595", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Not Confirmed</span>
                )}
              </div>

              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <p style={{ color: "#e8d5a3", fontSize: 24, fontWeight: 300, marginBottom: 4 }}>{guest.name}</p>
                <p style={{ color: "#888780", fontSize: 12 }}>{guest.greeting}</p>
              </div>

              <div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Table</span>
                  <span style={valueStyle}>{guest.table_number ?? "—"}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Max allowed</span>
                  <span style={valueStyle}>{guest.max_attendees ?? 1}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={labelStyle}>Attending</span>
                  {!confirmed && !guest.scanned && guest.rsvp === "confirmed" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => updateAttendees((guest.actual_attendees ?? 1) - 1)}
                        style={{
                          width: 28, height: 28, background: "transparent",
                          border: "1px solid #444441", color: "#888780", fontSize: 18,
                          cursor: (guest.actual_attendees ?? 1) <= 1 ? "not-allowed" : "pointer",
                          opacity: (guest.actual_attendees ?? 1) <= 1 ? 0.3 : 1,
                          fontFamily: "inherit", display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}>−</button>
                      <span style={{ color: "#b8965a", fontSize: 22, fontWeight: 300, minWidth: 24, textAlign: "center" }}>
                        {guest.actual_attendees ?? 1}
                      </span>
                      <button onClick={() => updateAttendees((guest.actual_attendees ?? 1) + 1)}
                        style={{
                          width: 28, height: 28, background: "transparent",
                          border: "1px solid #444441", color: "#888780", fontSize: 18,
                          cursor: (guest.actual_attendees ?? 1) >= (guest.max_attendees ?? 1) ? "not-allowed" : "pointer",
                          opacity: (guest.actual_attendees ?? 1) >= (guest.max_attendees ?? 1) ? 0.3 : 1,
                          fontFamily: "inherit", display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}>+</button>
                    </div>
                  ) : (
                    <span style={{ ...valueStyle, color: "#b8965a" }}>
                      {guest.actual_attendees ?? 1} {(guest.actual_attendees ?? 1) === 1 ? "person" : "people"}
                    </span>
                  )}
                </div>
              </div>

              {guest.note && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#2c2c2a", borderLeft: "2px solid #b8965a" }}>
                  <p style={{ color: "#888780", fontSize: 11, fontStyle: "italic" }}>{guest.note}</p>
                </div>
              )}
            </div>

            {!confirmed && !guest.scanned && guest.rsvp === "confirmed" && (
              <button onClick={confirmPresence} disabled={confirming} style={{
                width: "100%", background: "#3b6d11", color: "#fff",
                border: "none", padding: "15px", fontSize: 12,
                letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: confirming ? "not-allowed" : "pointer",
                opacity: confirming ? 0.7 : 1,
                fontFamily: "inherit", marginBottom: 10
              }}>
                {confirming ? "Confirming..." : `✓ Confirm · ${guest.actual_attendees ?? 1} ${(guest.actual_attendees ?? 1) === 1 ? "person" : "people"}`}
              </button>
            )}

            {confirmed && (
              <div style={{ background: "#1a3d1a", border: "1px solid #3b6d11", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#97c459", fontSize: 14, marginBottom: 4 }}>✓ Guest successfully checked in</p>
                <p style={{ color: "#3b6d11", fontSize: 12 }}>{guest.actual_attendees ?? 1} {(guest.actual_attendees ?? 1) === 1 ? "person" : "people"} admitted</p>
              </div>
            )}

            {guest.scanned && !confirmed && (
              <div style={{ background: "#3d2a1a", border: "1px solid #854f0b", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#ef9f27", fontSize: 13 }}>This guest was already scanned. Please verify their identity.</p>
              </div>
            )}

            {guest.rsvp !== "confirmed" && (
              <div style={{ background: "#3d1f1f", border: "1px solid #a32d2d", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#f09595", fontSize: 13 }}>Guest has not confirmed RSVP. Check with coordinator.</p>
              </div>
            )}

            <button onClick={resetScanner} style={{
              width: "100%", background: "transparent", color: "#888780",
              border: "1px solid #444441", padding: "13px", fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit"
            }}>
              Scan Next Guest
            </button>
          </div>
        )}

      </div>
    </div>
  )
}