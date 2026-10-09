"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const makeSlug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

export default function NewBirthdayPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const slug = makeSlug(title)

  async function handleCreate() {
    if (!slug) return
    setLoading(true)
    const { error } = await supabase.from("birthdays").insert({ slug, event_title: title.trim() })
    setLoading(false)
    if (error) {
      alert("Error creating birthday: " + error.message)
      return
    }
    router.push(`/events/birthday/${slug}`)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <div style={{ background: "#2c2c2a", padding: "40px 32px", textAlign: "center" }}>
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
          Event System
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>New Birthday</h1>
      </div>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "32px" }}>
          <label htmlFor="bd-title" style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888780", display: "block", marginBottom: 6 }}>
            Judul Event *
          </label>
          <input id="bd-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Sera's Danger Zone"
            style={{
              width: "100%", border: "1px solid #e4ddd0", padding: "11px 13px", fontSize: 13,
              color: "#2c2c2a", background: "#fdf8ee", outline: "none", fontFamily: "inherit"
            }} />

          {slug && (
            <p style={{ fontSize: 12, color: "#b8965a", fontFamily: "monospace", margin: "12px 0 0" }}>
              /events/birthday/{slug}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={handleCreate} disabled={loading || !slug} style={{
              flex: 1, background: "#2c2c2a", color: "#fff", border: "none", padding: "13px",
              fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
              cursor: loading || !slug ? "not-allowed" : "pointer", opacity: loading || !slug ? 0.5 : 1, fontFamily: "inherit"
            }}>
              {loading ? "Creating..." : "Create Birthday"}
            </button>
            <button onClick={() => router.push("/events")} style={{
              background: "transparent", color: "#888780", border: "1px solid #e4ddd0", padding: "13px 20px",
              fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit"
            }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
