"use client"
import { useEffect, useRef } from "react"
import QRCode from "qrcode"

export default function QRCodeDisplay({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code, {
        width: 200,
        margin: 2,
        color: {
          dark: "#2c2c2a",
          light: "#ffffff",
        },
      })
    }
  }, [code])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12
    }}>
      <div style={{
        background: "#fff",
        padding: 16,
        border: "1px solid #e8d5a3"
      }}>
        <canvas ref={canvasRef} />
      </div>
      <p style={{
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "#888780"
      }}>
        Screenshot this as your entry pass
      </p>
    </div>
  )
}