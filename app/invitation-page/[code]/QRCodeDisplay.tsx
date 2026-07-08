"use client"

export default function QRCodeDisplay({ code }: { code: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(code)}&bgcolor=F4F1EA&color=2c2c2a&margin=10`

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <p style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700, fontSize: 13,
        color: "#5F5F5F", marginBottom: 12,
        letterSpacing: "0.05em", textTransform: "uppercase"
      }}>
        Kode Check-in
      </p>
      <div style={{
        display: "inline-block",
        background: "#F4F1EA",
        padding: 16,
        border: "1px solid rgba(0,0,0,0.08)"
      }}>
        <img src={qrUrl} alt="QR Code" width={180} height={180} style={{ display: "block" }} />
      </div>
      <p style={{
        fontFamily: "monospace",
        fontSize: 14, color: "#5F5F5F",
        marginTop: 10, letterSpacing: "0.15em"
      }}>
        {code}
      </p>
    </div>
  )
}