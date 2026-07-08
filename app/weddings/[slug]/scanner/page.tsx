"use client"
import { useEffect, useRef, useState, use } from "react"
import { supabase } from "../../../lib/supabase"
import Link from "next/link"
import jsQR from "jsqr"

type ScanMode = "ceremony" | "reception"

interface Guest {
  id: string
  name: string
  greeting: string
  code: string
  rsvp: string
  ceremony_rsvp: string
  ceremony_adults: number
  ceremony_kids: number
  reception_rsvp: string
  reception_adults: number
  reception_kids: number
  table_number: string | null
  note: string | null
  scanned: boolean
  actual_attendees: number
  max_attendees: number
  invitation_type: string
  weddings?: { partner1: string; partner2: string; slug: string }
}

interface Wedding {
  id: string
  partner1: string
  partner2: string
  slug: string
}

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
  const [guest, setGuest] = useState<Guest | null>(null)
  const [wedding, setWedding] = useState<Wedding | null>(null)
  const [error, setError] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [nameSearch, setNameSearch] = useState("")
  const [nameResults, setNameResults] = useState<Guest[]>([])
  const [mode, setMode] = useState<ScanMode>("ceremony")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScanning(false)
  }

  useEffect(() => {
    supabase.from("weddings").select("*").eq("slug", slug).single()
      .then(({ data }) => setWedding(data as Wedding))
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
    } catch {
      setError("Camera permission denied.")
    }
  }

  function startScanning() {
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
        if (intervalRef.current) clearInterval(intervalRef.current)
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
    const { data, error: err } = await supabase
      .from("guests")
      .select("*, weddings(partner1, partner2, slug)")
      .eq("code", code)
      .single()
    setLoading(false)
    if (err || !data) {
      setError(`No guest found for code: ${code}`)
      return
    }
    const g = data as Guest
    if (g.weddings?.slug !== slug) {
      setError(`This QR belongs to a different wedding.`)
      return
    }
    setGuest(g)
  }

  async function confirmPresence() {
    if (!guest) return
    setConfirming(true)
    await supabase.from("guests").update({ scanned: true }).eq("code", guest.code)
    setConfirming(false)
    setConfirmed(true)
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
      .select("*")
      .eq("wedding_id", wedding.id)
      .ilike("name", `%${value}%`)
      .limit(5)
    setNameResults((data ?? []) as Guest[])
  }

  const isConfirmedForMode = guest
    ? mode === "ceremony" ? guest.ceremony_rsvp === "confirmed" : guest.reception_rsvp === "confirmed"
    : false

  const adultsForMode = guest
    ? mode === "ceremony" ? guest.ceremony_adults : guest.reception_adults
    : 0

  const kidsForMode = guest
    ? mode === "ceremony" ? guest.ceremony_kids : guest.reception_kids
    : 0

  const wrongType = guest
    ? mode === "reception" && guest.invitation_type === "ceremony"
    : false

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
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
          {wedding?.partner1} & {wedding?.partner2}
        </p>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 300 }}>
          Guest Scanner
        </h1>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", borderBottom: "1px solid #444441" }}>
        <button
          onClick={() => { setMode("ceremony"); setGuest(null); setError(""); setConfirmed(false) }}
          style={{
            flex: 1, padding: "14px",
            background: mode === "ceremony" ? "#535A36" : "transparent",
            color: mode === "ceremony" ? "#fff" : "#888780",
            border: "none", borderRight: "1px solid #444441",
            fontFamily: "inherit", fontSize: 12,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: mode === "ceremony" ? 700 : 400
          }}
        >
          Pemberkatan
        </button>
        <button
          onClick={() => { setMode("reception"); setGuest(null); setError(""); setConfirmed(false) }}
          style={{
            flex: 1, padding: "14px",
            background: mode === "reception" ? "#535A36" : "transparent",
            color: mode === "reception" ? "#fff" : "#888780",
            border: "none",
            fontFamily: "inherit", fontSize: 12,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: mode === "reception" ? 700 : 400
          }}
        >
          Resepsi
        </button>
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
              <p style={{ color: "#888780", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>Or search manually</p>
              <div style={{ flex: 1, height: 1, background: "#444441" }} />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input id="manual-code" type="text" placeholder="INV-XXXXXX"
                style={{
                  flex: 1, background: "#1a1a18", border: "1px solid #444441",
                  color: "#fff", padding: "10px 12px", fontSize: 13,
                  fontFamily: "monospace", outline: "none", textTransform: "uppercase"
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") lookupGuest(e.currentTarget.value.trim().toUpperCase())
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
                <div style={{ background: "#1a1a18", border: "1px solid #444441", borderTop: "none", maxHeight: 220, overflowY: "auto" }}>
                  {nameResults.map(g => (
                    <div key={g.id}
                      onClick={() => { setNameSearch(""); setNameResults([]); lookupGuest(g.code) }}
                      style={{
                        padding: "12px 14px", cursor: "pointer",
                        borderBottom: "1px solid #2c2c2a",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}
                    >
                      <div>
                        <p style={{ color: "#fff", fontSize: 13, marginBottom: 2 }}>{g.name}</p>
                        <p style={{ color: "#888780", fontSize: 11 }}>{g.greeting}</p>
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#b8965a", background: "#2c2c2a", padding: "2px 8px", border: "1px solid #444441" }}>
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
          <div style={{ background: "#3d1f1f", border: "1px solid #a32d2d", padding: "24px", textAlign: "center", marginBottom: 16 }}>
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
              border: `1px solid ${confirmed ? "#3b6d11" : wrongType ? "#a32d2d" : !isConfirmedForMode ? "#a32d2d" : guest.scanned ? "#854f0b" : "#b8965a"}`,
              padding: "28px 24px", marginBottom: 14
            }}>
              <div style={{ marginBottom: 18, textAlign: "center" }}>
                {confirmed ? (
                  <span style={{ background: "#1a3d1a", color: "#97c459", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>✓ Checked In</span>
                ) : wrongType ? (
                  <span style={{ background: "#3d1f1f", color: "#f09595", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Pemberkatan Saja</span>
                ) : !isConfirmedForMode ? (
                  <span style={{ background: "#3d1f1f", color: "#f09595", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Belum Konfirmasi {mode === "ceremony" ? "Pemberkatan" : "Resepsi"}</span>
                ) : guest.scanned ? (
                  <span style={{ background: "#3d2a1a", color: "#ef9f27", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>⚠ Already Scanned</span>
                ) : (
                  <span style={{ background: "#1a2a3d", color: "#85b7eb", fontSize: 10, padding: "4px 14px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Siap Check-in</span>
                )}
              </div>

              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <p style={{ color: "#e8d5a3", fontSize: 24, fontWeight: 300, marginBottom: 4 }}>{guest.name}</p>
                <p style={{ color: "#888780", fontSize: 12 }}>{guest.greeting}</p>
              </div>

              <div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Tipe Undangan</span>
                  <span style={valueStyle}>{guest.invitation_type === "ceremony" ? "Pemberkatan Saja" : "Full"}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Table</span>
                  <span style={valueStyle}>{guest.table_number ?? "—"}</span>
                </div>
                <div style={rowStyle}>
                  <span style={labelStyle}>Dewasa</span>
                  <span style={{ ...valueStyle, color: "#b8965a" }}>{adultsForMode}</span>
                </div>
                <div style={{ ...rowStyle, borderBottom: "none" }}>
                  <span style={labelStyle}>Anak</span>
                  <span style={{ ...valueStyle, color: "#b8965a" }}>{kidsForMode}</span>
                </div>
              </div>

              {guest.note && (
                <div style={{ marginTop: 14, padding: "12px 14px", background: "#2c2c2a", borderLeft: "2px solid #b8965a" }}>
                  <p style={{ color: "#888780", fontSize: 11, fontStyle: "italic" }}>{guest.note}</p>
                </div>
              )}
            </div>

            {!confirmed && !wrongType && isConfirmedForMode && !guest.scanned && (
              <button onClick={confirmPresence} disabled={confirming} style={{
                width: "100%", background: "#3b6d11", color: "#fff",
                border: "none", padding: "15px", fontSize: 12,
                letterSpacing: "0.2em", textTransform: "uppercase",
                cursor: confirming ? "not-allowed" : "pointer",
                opacity: confirming ? 0.7 : 1,
                fontFamily: "inherit", marginBottom: 10
              }}>
                {confirming ? "Confirming..." : `✓ Check-in · ${adultsForMode} Dewasa${kidsForMode > 0 ? ` · ${kidsForMode} Anak` : ""}`}
              </button>
            )}

            {confirmed && (
              <div style={{ background: "#1a3d1a", border: "1px solid #3b6d11", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#97c459", fontSize: 14, marginBottom: 4 }}>✓ Guest successfully checked in</p>
                <p style={{ color: "#3b6d11", fontSize: 12 }}>{adultsForMode} Dewasa{kidsForMode > 0 ? ` · ${kidsForMode} Anak` : ""}</p>
              </div>
            )}

            {guest.scanned && !confirmed && (
              <div style={{ background: "#3d2a1a", border: "1px solid #854f0b", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#ef9f27", fontSize: 13 }}>Tamu ini sudah di-scan sebelumnya. Verifikasi identitas.</p>
              </div>
            )}

            {wrongType && (
              <div style={{ background: "#3d1f1f", border: "1px solid #a32d2d", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#f09595", fontSize: 13 }}>Tamu ini hanya diundang ke Pemberkatan, bukan Resepsi.</p>
              </div>
            )}

            {!isConfirmedForMode && !wrongType && (
              <div style={{ background: "#3d1f1f", border: "1px solid #a32d2d", padding: "16px", textAlign: "center", marginBottom: 10 }}>
                <p style={{ color: "#f09595", fontSize: 13 }}>Tamu belum konfirmasi kehadiran untuk {mode === "ceremony" ? "Pemberkatan" : "Resepsi"}.</p>
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