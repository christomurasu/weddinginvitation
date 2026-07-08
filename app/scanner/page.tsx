"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "../lib/supabase"
import Link from "next/link"

type ScanMode = "ceremony" | "reception"

interface ScanResult {
  status: "success" | "already_scanned" | "not_confirmed" | "not_found" | "wrong_type"
  guest?: {
    name: string
    invitation_type: string
    ceremony_rsvp: string
    ceremony_adults: number
    ceremony_kids: number
    reception_rsvp: string
    reception_adults: number
    reception_kids: number
    scanned: boolean
  }
}

export default function ScannerPage({ params }: { params: { slug: string } }) {
  const [mode, setMode] = useState<ScanMode>("ceremony")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scanning && inputRef.current) inputRef.current.focus()
  }, [scanning])

  async function processCode(code: string) {
    if (!code.trim() || processing) return
    setProcessing(true)
    setResult(null)

    const { data: guest } = await supabase
      .from("guests")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single()

    if (!guest) {
      setResult({ status: "not_found" })
      setProcessing(false)
      setManualCode("")
      return
    }

    if (mode === "ceremony") {
      if (guest.invitation_type === "reception_only") {
        setResult({ status: "wrong_type", guest })
      } else if (guest.ceremony_rsvp !== "confirmed") {
        setResult({ status: "not_confirmed", guest })
      } else if (guest.scanned) {
        setResult({ status: "already_scanned", guest })
      } else {
        await supabase.from("guests").update({ scanned: true }).eq("code", code.trim().toUpperCase())
        setResult({ status: "success", guest: { ...guest, scanned: true } })
      }
    } else {
      if (guest.invitation_type === "ceremony") {
        setResult({ status: "wrong_type", guest })
      } else if (guest.reception_rsvp !== "confirmed") {
        setResult({ status: "not_confirmed", guest })
      } else {
        await supabase.from("guests").update({ scanned: true }).eq("code", code.trim().toUpperCase())
        setResult({ status: "success", guest: { ...guest, scanned: true } })
      }
    }

    setProcessing(false)
    setManualCode("")
  }

  function handleManualSubmit() {
    processCode(manualCode)
  }

  function handleReset() {
    setResult(null)
    setManualCode("")
    if (inputRef.current) inputRef.current.focus()
  }

  const resultColor = {
    success: "#3b6d11",
    already_scanned: "#b8965a",
    not_confirmed: "#a32d2d",
    not_found: "#a32d2d",
    wrong_type: "#a32d2d",
  }

  const resultMessage = {
    success: "✓ Check-in Berhasil",
    already_scanned: "⚠ Sudah Di-scan Sebelumnya",
    not_confirmed: "✗ Belum Konfirmasi Kehadiran",
    not_found: "✗ Kode Tidak Ditemukan",
    wrong_type: "✗ Tipe Undangan Tidak Sesuai",
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#faf7f2", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#2c2c2a", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={`/weddings/${params.slug}/dashboard`} style={{ color: "#888780", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
          ← Dashboard
        </Link>
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Scanner
        </p>
        <div style={{ width: 80 }} />
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", margin: "24px 24px 0" }}>
        <button
          onClick={() => { setMode("ceremony"); setResult(null) }}
          style={{
            flex: 1, padding: "14px",
            background: mode === "ceremony" ? "#535A36" : "#fff",
            color: mode === "ceremony" ? "#fff" : "#888780",
            border: "1px solid #e4ddd0", borderRight: "none",
            fontFamily: "inherit", fontSize: 12,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: mode === "ceremony" ? 700 : 400
          }}
        >
          Pemberkatan
        </button>
        <button
          onClick={() => { setMode("reception"); setResult(null) }}
          style={{
            flex: 1, padding: "14px",
            background: mode === "reception" ? "#535A36" : "#fff",
            color: mode === "reception" ? "#fff" : "#888780",
            border: "1px solid #e4ddd0",
            fontFamily: "inherit", fontSize: 12,
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: mode === "reception" ? 700 : 400
          }}
        >
          Resepsi
        </button>
      </div>

      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Manual Input */}
        <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "20px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888780", marginBottom: 12 }}>
            Masukkan Kode Tamu
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
              placeholder="INV-XXXXXX"
              style={{
                flex: 1, border: "1px solid #e4ddd0",
                padding: "10px 12px", fontSize: 14,
                fontFamily: "monospace", color: "#2c2c2a",
                background: "#fdf8ee", outline: "none",
                letterSpacing: "0.1em", textTransform: "uppercase"
              }}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim() || processing}
              style={{
                background: !manualCode.trim() || processing ? "#888780" : "#2c2c2a",
                color: "#fff", border: "none",
                padding: "10px 20px", fontSize: 11,
                letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: !manualCode.trim() || processing ? "not-allowed" : "pointer",
                fontFamily: "inherit"
              }}
            >
              {processing ? "..." : "Scan"}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            background: "#fff", border: `2px solid ${resultColor[result.status]}`,
            padding: "24px"
          }}>
            <p style={{
              fontSize: 18, fontWeight: 700,
              color: resultColor[result.status],
              marginBottom: 16, textAlign: "center"
            }}>
              {resultMessage[result.status]}
            </p>

            {result.guest && (
              <div style={{ borderTop: "1px solid #f0ebe3", paddingTop: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#2c2c2a", marginBottom: 8 }}>
                  {result.guest.name}
                </p>

                {result.status === "success" && mode === "ceremony" && (
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <div style={{ background: "#eaf3de", padding: "8px 16px", textAlign: "center", flex: 1 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#3b6d11" }}>{result.guest.ceremony_adults}</p>
                      <p style={{ fontSize: 10, color: "#888780", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dewasa</p>
                    </div>
                    <div style={{ background: "#eaf3de", padding: "8px 16px", textAlign: "center", flex: 1 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#3b6d11" }}>{result.guest.ceremony_kids}</p>
                      <p style={{ fontSize: 10, color: "#888780", textTransform: "uppercase", letterSpacing: "0.1em" }}>Anak</p>
                    </div>
                  </div>
                )}

                {result.status === "success" && mode === "reception" && (
                  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                    <div style={{ background: "#eaf3de", padding: "8px 16px", textAlign: "center", flex: 1 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#3b6d11" }}>{result.guest.reception_adults}</p>
                      <p style={{ fontSize: 10, color: "#888780", textTransform: "uppercase", letterSpacing: "0.1em" }}>Dewasa</p>
                    </div>
                    <div style={{ background: "#eaf3de", padding: "8px 16px", textAlign: "center", flex: 1 }}>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#3b6d11" }}>{result.guest.reception_kids}</p>
                      <p style={{ fontSize: 10, color: "#888780", textTransform: "uppercase", letterSpacing: "0.1em" }}>Anak</p>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: "#888780", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {result.guest.invitation_type === "ceremony" ? "Pemberkatan Saja" : "Pemberkatan + Resepsi"}
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                width: "100%", marginTop: 16,
                background: "#2c2c2a", color: "#fff",
                border: "none", padding: "12px",
                fontFamily: "inherit", fontSize: 11,
                letterSpacing: "0.15em", textTransform: "uppercase",
                cursor: "pointer"
              }}
            >
              Scan Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  )
}