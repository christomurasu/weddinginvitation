"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/weddings"

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!password.trim()) return
    setLoading(true)
    setError("")

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push(from)
      router.refresh()
    } else {
      setError("Password salah. Coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#faf7f2",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        background: "#fff", border: "1px solid #e4ddd0",
        padding: "48px 40px", width: "100%", maxWidth: 400
      }}>
        <p style={{
          fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#b8965a",
          marginBottom: 8
        }}>
          SF Invitation
        </p>
        <h1 style={{
          fontSize: 24, fontWeight: 300, color: "#2c2c2a",
          marginBottom: 32
        }}>
          Admin Login
        </h1>

        <div style={{ marginBottom: 20 }}>
          <label style={{
            fontSize: 10, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#888780",
            display: "block", marginBottom: 6
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            autoFocus
            style={{
              width: "100%", border: "1px solid #e4ddd0",
              padding: "10px 12px", fontSize: 13, color: "#2c2c2a",
              background: "#fdf8ee", outline: "none", fontFamily: "inherit"
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 12, color: "#a32d2d", marginBottom: 16 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !password.trim()}
          style={{
            width: "100%",
            background: loading || !password.trim() ? "#888780" : "#2c2c2a",
            color: "#fff", border: "none",
            padding: "12px", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
            cursor: loading || !password.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit"
          }}
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </div>
    </div>
  )
}