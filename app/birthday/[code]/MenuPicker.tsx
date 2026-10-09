"use client"
import { useRef, useState } from "react"
import { supabase } from "../../lib/supabase"

interface MenuItem {
  id: string
  name: string
  kind: string            // "food" | "drink"
  category: string | null
}

const ALL = "All"
const groupOf = (i: MenuItem) => i.kind === "drink" ? "Drinks" : (i.category || "Others")

export default function MenuPicker({
  guestCode,
  items,
  initialFood,
  initialDrink,
  initialNote,
}: {
  guestCode: string
  items: MenuItem[]
  initialFood: string | null
  initialDrink: string | null
  initialNote: string
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState(ALL)
  const [food, setFood] = useState(initialFood)
  const [drink, setDrink] = useState(initialDrink)
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("")
  const [note, setNote] = useState(initialNote)
  const noteTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Urutan grup ikut urutan menu di admin; minuman selalu terakhir
  const groups = [...new Set(items.filter(i => i.kind !== "drink").map(groupOf))]
  if (items.some(i => i.kind === "drink")) groups.push("Drinks")

  const q = query.trim().toLowerCase()
  const visible = groups
    .filter(g => filter === ALL || g === filter)
    .map(g => ({ group: g, items: items.filter(i => groupOf(i) === g && i.name.toLowerCase().includes(q)) }))
    .filter(g => g.items.length > 0)

  async function choose(item: MenuItem) {
    const isDrink = item.kind === "drink"
    const prev = isDrink ? drink : food
    const set = isDrink ? setDrink : setFood
    set(item.id)
    setStatus("saving")
    const { error } = await supabase.from("birthday_guests")
      .update({ [isDrink ? "drink_item_id" : "menu_item_id"]: item.id })
      .eq("code", guestCode)
    if (error) {
      set(prev)
      setStatus("error")
      return
    }
    setStatus("saved")
  }

  // Simpan catatan otomatis 800ms setelah tamu berhenti mengetik
  function changeNote(value: string) {
    setNote(value)
    clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(async () => {
      setStatus("saving")
      const { error } = await supabase.from("birthday_guests")
        .update({ menu_note: value.trim() || null })
        .eq("code", guestCode)
      setStatus(error ? "error" : "saved")
    }, 800)
  }

  const nameOf = (id: string | null) => items.find(i => i.id === id)?.name

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
        .menu-radio:focus-visible, .menu-chip:focus-visible { outline: 2px solid #e8c46a; outline-offset: 2px; }
        .menu-search::placeholder { color: rgba(255,255,255,0.5); }
        .menu-chips { scrollbar-width: none; }
        .menu-chips::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>FOOD LIST :</p>
        <p style={{ fontSize: 10, color: status === "error" ? "#ffb4b4" : "#e8c46a" }} aria-live="polite">
          {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : status === "error" ? "Failed, try again" : ""}
        </p>
      </div>

      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginBottom: 8, lineHeight: 1.5 }}>
        Food: <span style={{ color: food ? "#e8c46a" : "inherit", fontWeight: 600 }}>{nameOf(food) ?? "—"}</span>
        {"  ·  "}
        Drink: <span style={{ color: drink ? "#e8c46a" : "inherit", fontWeight: 600 }}>{nameOf(drink) ?? "—"}</span>
      </p>

      <div className="menu-chips" role="group" aria-label="Menu category" style={{
        display: "flex", gap: 6, overflowX: "auto", marginBottom: 8, flexShrink: 0
      }}>
        {[ALL, ...groups].map(g => (
          <button
            key={g}
            className="menu-chip"
            aria-pressed={filter === g}
            onClick={() => setFilter(g)}
            style={{
              flexShrink: 0, whiteSpace: "nowrap", cursor: "pointer",
              padding: "6px 12px", fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
              textTransform: "uppercase", fontFamily: "inherit", borderRadius: 999,
              border: "1px solid " + (filter === g ? "#e8c46a" : "rgba(255,255,255,0.45)"),
              background: filter === g ? "#e8c46a" : "transparent",
              color: filter === g ? "#1a0000" : "#fff",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <input
        className="menu-search"
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search menu..."
        aria-label="Search menu"
        style={{
          width: "100%", padding: "9px 12px", marginBottom: 8, flexShrink: 0,
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff", fontSize: 12, fontFamily: "inherit", outline: "none", borderRadius: 0
        }}
      />

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "rgba(0,0,0,0.35)", padding: "0 12px" }}>
        {visible.map(({ group, items: groupItems }) => (
          <div key={group} role="radiogroup" aria-label={group}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#e8c46a", letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0 2px" }}>
              {group}
            </p>
            {groupItems.map(item => {
              const isDrink = item.kind === "drink"
              return (
                <label key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.25)", cursor: "pointer"
                }}>
                  <input
                    className="menu-radio"
                    type="radio"
                    name={isDrink ? "drink" : "food"}
                    checked={(isDrink ? drink : food) === item.id}
                    onChange={() => choose(item)}
                  />
                  <span style={{ fontSize: 11, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{item.name}</span>
                </label>
              )
            })}
          </div>
        ))}
        {visible.length === 0 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "16px 0" }}>
            {items.length === 0 ? "Menu coming soon." : "No menu found."}
          </p>
        )}
      </div>

      <label htmlFor="menu-note" style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", margin: "12px 0 6px", flexShrink: 0 }}>
        SPECIAL NOTES :
      </label>
      <textarea
        id="menu-note"
        className="menu-search"
        value={note}
        onChange={e => changeNote(e.target.value)}
        maxLength={200}
        rows={2}
        placeholder="Allergies or ingredients to avoid, e.g. no peanuts, allergic to shrimp"
        style={{
          width: "100%", padding: "9px 12px", flexShrink: 0, resize: "none",
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff", fontSize: 12, lineHeight: 1.4, fontFamily: "inherit", outline: "none", borderRadius: 0
        }}
      />
    </div>
  )
}
