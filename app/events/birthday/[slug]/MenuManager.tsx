"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface MenuItem {
  id: string
  name: string
  kind: string
  category: string | null
  order_index: number
  chosen: number
}

export default function MenuManager({ birthdayId, items }: { birthdayId: string; items: MenuItem[] }) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [kind, setKind] = useState<"food" | "drink">("food")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const categories = [...new Set(items.filter(i => i.kind === "food" && i.category).map(i => i.category!))]

  async function handleAdd() {
    const names = text.split("\n").map(s => s.trim()).filter(Boolean)
    if (!names.length) return
    setLoading(true)
    const start = items.length ? Math.max(...items.map(i => i.order_index)) + 1 : 0
    const { error } = await supabase.from("birthday_menu_items").insert(
      names.map((name, i) => ({
        birthday_id: birthdayId, name, kind,
        category: kind === "drink" ? null : category.trim() || null,
        order_index: start + i,
      }))
    )
    setLoading(false)
    if (error) {
      alert("Gagal menambah menu: " + error.message)
      return
    }
    setText("")
    router.refresh()
  }

  async function handleDelete(item: MenuItem) {
    if (item.chosen > 0 && !confirm(`${item.chosen} tamu sudah memilih "${item.name}". Pilihan mereka akan terhapus. Lanjut?`)) return
    await supabase.from("birthday_menu_items").delete().eq("id", item.id)
    router.refresh()
  }

  const labelStyle = { fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#888780", display: "block", marginBottom: 6 }
  const inputStyle = {
    width: "100%", border: "1px solid #e4ddd0", padding: "10px 12px",
    fontSize: 13, color: "#2c2c2a", background: "#fdf8ee", outline: "none", fontFamily: "inherit"
  }
  const toggle = (active: boolean) => ({
    flex: 1, padding: "10px", border: "1px solid #e4ddd0", cursor: "pointer", fontFamily: "inherit",
    fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const,
    background: active ? "#2c2c2a" : "#fdf8ee", color: active ? "#fff" : "#888780",
  })
  const th = { textAlign: "left" as const, padding: "8px 4px", fontSize: 10, letterSpacing: "0.12em", color: "#888780", fontWeight: 400 }

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginBottom: 24 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a", marginBottom: 16 }}>
        Menu ({items.length})
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setKind("food")} aria-pressed={kind === "food"} style={toggle(kind === "food")}>Makanan</button>
        <button onClick={() => setKind("drink")} aria-pressed={kind === "drink"} style={toggle(kind === "drink")}>Minuman</button>
      </div>

      {kind === "food" && (
        <div style={{ marginBottom: 14 }}>
          <label htmlFor="menu-cat" style={labelStyle}>Kategori</label>
          <input id="menu-cat" list="menu-cats" style={inputStyle} value={category}
            onChange={e => setCategory(e.target.value)} placeholder="e.g. Indonesian Food" />
          <datalist id="menu-cats">
            {categories.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>
      )}

      <label htmlFor="menu-add" style={labelStyle}>
        Tambah {kind === "food" ? "Makanan" : "Minuman"} (satu per baris)
      </label>
      <textarea id="menu-add" value={text} onChange={e => setText(e.target.value)}
        placeholder={kind === "food" ? "Nasi Tuna Dabu-Dabu\nNasi Goreng Pete" : "Air Mineral\nTeh Tawar / Manis"}
        style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
      <button onClick={handleAdd} disabled={loading || !text.trim()} style={{
        marginTop: 10, background: loading || !text.trim() ? "#888780" : "#2c2c2a", color: "#fff", border: "none",
        padding: "10px 24px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: loading || !text.trim() ? "not-allowed" : "pointer", fontFamily: "inherit"
      }}>
        {loading ? "Menambah..." : "+ Tambah"}
      </button>

      {items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e4ddd0" }}>
                <th style={th}>MENU</th>
                <th style={th}>KATEGORI</th>
                <th style={{ ...th, textAlign: "right" }}>DIPILIH</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f0ebe3" }}>
                  <td style={{ padding: "10px 4px", fontSize: 13, color: "#2c2c2a" }}>{item.name}</td>
                  <td style={{ padding: "10px 4px", fontSize: 12, color: "#888780" }}>
                    {item.kind === "drink" ? "Minuman" : item.category ?? "—"}
                  </td>
                  <td style={{ padding: "10px 4px", fontSize: 13, color: "#b8965a", textAlign: "right" }}>{item.chosen}</td>
                  <td style={{ padding: "10px 4px", textAlign: "right", width: 32 }}>
                    <button onClick={() => handleDelete(item)} aria-label={"Hapus " + item.name} style={{
                      background: "none", border: "none", color: "#a32d2d", cursor: "pointer", fontSize: 13
                    }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
