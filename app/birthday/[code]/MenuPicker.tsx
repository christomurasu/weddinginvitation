"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface MenuItem {
  id: string
  name: string
}

export default function MenuPicker({
  guestCode,
  items,
  initialSelected,
}: {
  guestCode: string
  items: MenuItem[]
  initialSelected: string | null
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(initialSelected)
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("")

  const filtered = items.filter(i => i.name.toLowerCase().includes(query.trim().toLowerCase()))

  async function choose(id: string) {
    const prev = selected
    setSelected(id)
    setStatus("saving")
    const { error } = await supabase.from("birthday_guests").update({ menu_item_id: id }).eq("code", guestCode)
    if (error) {
      setSelected(prev)
      setStatus("error")
      return
    }
    setStatus("saved")
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <style>{`
        .menu-radio {
          appearance: none; -webkit-appearance: none;
          width: 16px; height: 16px; margin: 0; flex-shrink: 0;
          border: 1.5px solid #fff; border-radius: 50%;
          display: grid; place-content: center; cursor: pointer;
        }
        .menu-radio:checked { border-color: #e8c46a; }
        .menu-radio:checked::before { content: "✓"; color: #e8c46a; font-size: 11px; font-weight: 700; line-height: 1; }
        .menu-radio:focus-visible { outline: 2px solid #e8c46a; outline-offset: 2px; }
        .menu-search::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>FOOD LIST :</p>
        <p style={{ fontSize: 10, color: status === "error" ? "#ffb4b4" : "#e8c46a" }} aria-live="polite">
          {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : status === "error" ? "Failed, try again" : ""}
        </p>
      </div>

      <input
        className="menu-search"
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search menu..."
        aria-label="Search menu"
        style={{
          width: "100%", padding: "9px 12px", marginBottom: 8,
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff", fontSize: 12, fontFamily: "inherit", outline: "none", borderRadius: 0
        }}
      />

      <div role="radiogroup" aria-label="Food list" style={{
        flex: 1, minHeight: 0, overflowY: "auto",
        background: "rgba(0,0,0,0.35)", padding: "0 12px"
      }}>
        {filtered.map(item => (
          <label key={item.id} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,0.25)", cursor: "pointer"
          }}>
            <input
              className="menu-radio"
              type="radio"
              name="menu"
              checked={selected === item.id}
              onChange={() => choose(item.id)}
            />
            <span style={{ fontSize: 11, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{item.name}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "16px 0" }}>
            {items.length === 0 ? "Menu coming soon." : "No menu found."}
          </p>
        )}
      </div>
    </div>
  )
}
