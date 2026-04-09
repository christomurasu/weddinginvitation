"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function NewWeddingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    partner1: "",
    partner2: "",
    date: "",
    venue: "",
    venue_address: "",
    rsvp_deadline: "",
    max_capacity: "200",
  })

  function makeSlug(p1: string, p2: string) {
    const clean = (s: string) =>
      s.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    return `${clean(p1)}-${clean(p2)}`
  }

  async function handleCreate() {
    if (!form.partner1.trim() || !form.partner2.trim()) return
    setLoading(true)

    const slug = makeSlug(form.partner1, form.partner2)

    const { data, error } = await supabase
      .from("weddings")
      .insert({
        partner1: form.partner1,
        partner2: form.partner2,
        date: form.date,
        venue: form.venue,
        venue_address: form.venue_address,
        rsvp_deadline: form.rsvp_deadline,
        max_capacity: parseInt(form.max_capacity) || 200,
        slug,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      alert("Error creating wedding: " + error.message)
      return
    }

    router.push(`/weddings/${slug}/dashboard`)
  }

  const inputStyle = {
    width: "100%", border: "1px solid #e4ddd0",
    padding: "11px 13px", fontSize: 13, color: "#2c2c2a",
    background: "#fdf8ee", outline: "none", fontFamily: "inherit"
  }
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#888780", display: "block", marginBottom: 6
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>

      {/* Header */}
      <div style={{
        background: "#2c2c2a", padding: "40px 32px",
        textAlign: "center"
      }}>
        <p style={{
          color: "#e8d5a3", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10
        }}>
          Wedding System
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>
          New Wedding
        </h1>
      </div>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          background: "#fff", border: "1px solid #e4ddd0", padding: "32px"
        }}>

          <p style={{
            fontSize: 10, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#b8965a", marginBottom: 24
          }}>
            Wedding Details
          </p>

          {/* Couple names */}
          <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Partner 1 Name *</label>
              <input style={inputStyle} type="text"
                value={form.partner1}
                onChange={e => setForm({ ...form, partner1: e.target.value })}
                placeholder="e.g. Ahmad" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Partner 2 Name *</label>
              <input style={inputStyle} type="text"
                value={form.partner2}
                onChange={e => setForm({ ...form, partner2: e.target.value })}
                placeholder="e.g. Bella" />
            </div>
          </div>

          {/* Slug preview */}
          {form.partner1 && form.partner2 && (
            <div style={{
              background: "#fdf8ee", border: "1px solid #e8d5a3",
              padding: "10px 14px", marginBottom: 18
            }}>
              <p style={{ fontSize: 10, color: "#888780", letterSpacing: "0.1em", marginBottom: 3 }}>
                DASHBOARD URL
              </p>
              <p style={{ fontSize: 12, color: "#b8965a", fontFamily: "monospace" }}>
                /weddings/{makeSlug(form.partner1, form.partner2)}/dashboard
              </p>
            </div>
          )}

          {/* Date */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Wedding Date</label>
            <input style={inputStyle} type="text"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              placeholder="e.g. Saturday, 14 June 2025" />
          </div>

          {/* Venue */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Venue Name</label>
            <input style={inputStyle} type="text"
              value={form.venue}
              onChange={e => setForm({ ...form, venue: e.target.value })}
              placeholder="e.g. The Grand Ballroom" />
          </div>

          {/* Venue address */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Venue Address</label>
            <input style={inputStyle} type="text"
              value={form.venue_address}
              onChange={e => setForm({ ...form, venue_address: e.target.value })}
              placeholder="e.g. Jl. Raya Gubernur Suryo, Gresik" />
          </div>

          {/* RSVP deadline */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>RSVP Deadline Text</label>
            <input style={inputStyle} type="text"
              value={form.rsvp_deadline}
              onChange={e => setForm({ ...form, rsvp_deadline: e.target.value })}
              placeholder="e.g. Please respond by 1st June 2025" />
          </div>

          {/* Max capacity */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Max Capacity</label>
            <input style={inputStyle} type="number"
              value={form.max_capacity}
              min="1"
              onChange={e => setForm({ ...form, max_capacity: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleCreate}
              disabled={loading || !form.partner1.trim() || !form.partner2.trim()}
              style={{
                flex: 1, background: "#2c2c2a", color: "#fff",
                border: "none", padding: "13px",
                fontSize: 11, letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || !form.partner1.trim() || !form.partner2.trim() ? 0.5 : 1,
                fontFamily: "inherit"
              }}
            >
              {loading ? "Creating..." : "Create Wedding"}
            </button>
            <button
              onClick={() => router.push("/weddings")}
              style={{
                background: "transparent", color: "#888780",
                border: "1px solid #e4ddd0", padding: "13px 20px",
                fontSize: 11, letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}