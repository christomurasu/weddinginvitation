"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface MenuItem {
  id: string
  name: string
  order_index: number
  chosen: number
}

export default function MenuManager({ birthdayId, items }: { birthdayId: string; items: MenuItem[] }) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    const names = text.split("\n").map(s => s.trim()).filter(Boolean)
    if (!names.length) return
    setLoading(true)
    const start = items.length ? Math.max(...items.map(i => i.order_index)) + 1 : 0
    const { error } = await supabase.from("birthday_menu_items").insert(
      names.map((name, i) => ({ birthday_id: birthdayId, name, order_index: start + i }))
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

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginBottom: 24 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a", marginBottom: 16 }}>
        Menu Makanan ({items.length})
      </p>

      <label htmlFor="menu-add" style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#888780", display: "block", marginBottom: 6 }}>
        Tambah Menu (satu per baris)
      </label>
      <textarea id="menu-add" value={text} onChange={e => setText(e.target.value)}
        placeholder={"Nasi Tuna Dabu-Dabu\nNasi Urap Ayam Bakar Bumbu Rujak"}
        style={{
          width: "100%", minHeight: 80, border: "1px solid #e4ddd0", padding: "10px 12px",
          fontSize: 13, color: "#2c2c2a", background: "#fdf8ee", outline: "none", fontFamily: "inherit", resize: "vertical"
        }} />
      <button onClick={handleAdd} disabled={loading || !text.trim()} style={{
        marginTop: 10, background: loading || !text.trim() ? "#888780" : "#2c2c2a", color: "#fff", border: "none",
        padding: "10px 24px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: loading || !text.trim() ? "not-allowed" : "pointer", fontFamily: "inherit"
      }}>
        {loading ? "Menambah..." : "+ Tambah"}
      </button>

      {items.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e4ddd0" }}>
              <th style={{ textAlign: "left", padding: "8px 4px", fontSize: 10, letterSpacing: "0.12em", color: "#888780", fontWeight: 400 }}>MENU</th>
              <th style={{ textAlign: "right", padding: "8px 4px", fontSize: 10, letterSpacing: "0.12em", color: "#888780", fontWeight: 400 }}>DIPILIH</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0ebe3" }}>
                <td style={{ padding: "10px 4px", fontSize: 13, color: "#2c2c2a" }}>{item.name}</td>
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
      )}
    </div>
  )
}
