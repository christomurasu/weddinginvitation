"use client"

export default function QRCodeDisplay({ code }: { code: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
    code
  )}&bgcolor=F4F1EA&color=2c2c2a&margin=10`

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 20,
        width: "100%",
      }}
    >
      <p
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#5F5F5F",
          marginBottom: 12,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Kode Check-in
      </p>

      <div
        style={{
          display: "inline-block",
          width: "100%",
          maxWidth: 220,
          background: "#F4F1EA",
          padding: 16,
          border: "1px solid rgba(0,0,0,0.08)",
          boxSizing: "border-box",
        }}
      >
        <img
          src={qrUrl}
          alt="QR Code"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>

      <p
        style={{
          fontFamily: "monospace",
          fontSize: 14,
          color: "#5F5F5F",
          marginTop: 10,
          letterSpacing: "0.15em",
          wordBreak: "break-all",
          overflowWrap: "break-word",
          padding: "0 12px",
        }}
      >
        {code}
      </p>
    </div>
  )
}