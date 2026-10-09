"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

const BUCKET = "birthday-photos"

const TEXT_FIELDS: { key: string; label: string; placeholder?: string; multiline?: boolean }[] = [
  { key: "event_title", label: "Judul Event (tab browser & preview WA)", placeholder: "e.g. Sera's Danger Zone" },
  { key: "share_description", label: "Deskripsi Preview Link (WA)", placeholder: "e.g. You are invited to Sera's Birthday Premiere!" },
  { key: "premiere_title", label: "Judul Tiket", placeholder: "THE BIRTHDAY PREMIERE" },
  { key: "celebrant_name", label: "Starring", placeholder: "e.g. Seraphine Amadea" },
  { key: "genre", label: "Genre", placeholder: "e.g. Comedy, Action" },
  { key: "age", label: "Age", placeholder: "e.g. 27+" },
  { key: "premiere_date", label: "Birthday Premiere (tanggal)", placeholder: "e.g. 21 NOV" },
  { key: "show_time", label: "Show Time", placeholder: "e.g. 18.00" },
  { key: "venue", label: "Venue", placeholder: "e.g. Kamarasa Eatery & Coffee (VIP Room)" },
  { key: "venue_address", label: "Alamat Venue", placeholder: "e.g. Jl. Sukomanunggal Jaya No.28, Surabaya" },
  { key: "casting_text", label: "Teks Casting Call (Page 3)", multiline: true },
  { key: "menu_text", label: "Teks Menu (Page 4)", multiline: true },
  { key: "thanks_text", label: "Teks Terima Kasih — tamu tidak hadir (Page 6)", placeholder: "THANK YOU FOR YOUR CONFIRMATION", multiline: true },
]

const IMAGE_GROUPS: { title: string; fields: { key: string; label: string }[] }[] = [
  { title: "Preview Link (WhatsApp) & Icon", fields: [
    { key: "share_image_url", label: "Gambar Preview (JPG ±1200×630, kosong = pakai cover)" },
    { key: "icon_url", label: "Icon / Favicon (PNG persegi)" },
  ] },
  { title: "Page 1 — Cover", fields: [{ key: "cover_url", label: "Gambar Cover (full)" }] },
  { title: "Page 2 — Tiket", fields: [
    { key: "bg2_url", label: "Background" },
    { key: "ticket_url", label: "Tiket (PNG)" },
    { key: "title_image_url", label: "Judul Tiket (PNG)" },
  ] },
  { title: "Page 3 — Casting Call", fields: [
    { key: "bg3_url", label: "Background" },
    { key: "casting_title_url", label: "Judul Casting Call (PNG)" },
    { key: "casting_icon_left_url", label: "Icon Kiri (PNG)" },
    { key: "casting_icon_right_url", label: "Icon Kanan (PNG)" },
    { key: "chair_url", label: "Kursi (PNG)" },
  ] },
  { title: "Page 4 — Menu", fields: [
    { key: "bg4_url", label: "Background" },
    { key: "menu_title_url", label: "Judul Menu (PNG)" },
  ] },
  { title: "Page 5 — See You There", fields: [
    { key: "bg5_url", label: "Background" },
    { key: "see_you_url", label: "See You There (PNG)" },
  ] },
  { title: "Page 6 — Tidak Hadir (Terima Kasih)", fields: [
    { key: "bg6_url", label: "Background" },
    { key: "photo_url", label: "Foto (PNG)" },
  ] },
]

// JPG/foto > 1MB dikompres ke max 1200px; PNG (transparan) diupload apa adanya
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(1200 / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.82)
    }
    img.src = url
  })
}

export default function EditBirthdayForm({ birthday }: { birthday: Record<string, string | null> }) {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(birthday).map(([k, v]) => [k, v ?? ""]))
  )
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: string) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setBusy(field)
    const asIs = file.type === "image/png" || file.size < 1024 * 1024
    const blob = asIs ? file : await compressImage(file)
    const contentType = asIs ? file.type : "image/jpeg"
    const ext = contentType === "image/png" ? "png" : contentType.split("/")[1] ?? "jpg"
    const fileName = `${birthday.id}/${field}-${new Date().getTime()}.${ext}`
    const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, blob, { contentType })
    if (error || !data) {
      alert("Upload gagal: " + (error?.message ?? ""))
      setBusy(null)
      return
    }
    const old = form[field]
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
    await supabase.from("birthdays").update({ [field]: urlData.publicUrl }).eq("id", birthday.id)
    const oldPath = old.split(`/${BUCKET}/`)[1]
    if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath])
    setForm(f => ({ ...f, [field]: urlData.publicUrl }))
    setBusy(null)
  }

  async function handleDelete(field: string) {
    setBusy(field)
    const path = form[field].split(`/${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
    await supabase.from("birthdays").update({ [field]: null }).eq("id", birthday.id)
    setForm(f => ({ ...f, [field]: "" }))
    setBusy(null)
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase.from("birthdays")
      .update(Object.fromEntries(TEXT_FIELDS.map(f => [f.key, form[f.key] || null])))
      .eq("id", birthday.id)
    setLoading(false)
    if (error) {
      alert("Gagal menyimpan: " + error.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const inputStyle = {
    width: "100%", border: "1px solid #e4ddd0",
    padding: "10px 12px", fontSize: 13, color: "#2c2c2a",
    background: "#fdf8ee", outline: "none", fontFamily: "inherit"
  }
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#888780", display: "block", marginBottom: 6
  }
  const sectionLabel = {
    fontSize: 10, letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    color: "#b8965a", marginBottom: 16, display: "block"
  }
  const divider = { height: 1, background: "#f0ebe3", margin: "24px 0" }

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginBottom: 24 }}>
      <span style={sectionLabel}>Detail Undangan</span>

      {TEXT_FIELDS.map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label htmlFor={"bf-" + f.key} style={labelStyle}>{f.label}</label>
          {f.multiline ? (
            <textarea id={"bf-" + f.key} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={form[f.key] ?? ""} placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
          ) : (
            <input id={"bf-" + f.key} style={inputStyle} type="text"
              value={form[f.key] ?? ""} placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
          )}
        </div>
      ))}

      <button onClick={handleSave} disabled={loading} style={{
        background: saved ? "#3b6d11" : "#2c2c2a", color: "#fff", border: "none",
        padding: "12px 32px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit"
      }}>
        {loading ? "Saving..." : saved ? "✓ Tersimpan!" : "Save Details"}
      </button>

      {IMAGE_GROUPS.map(group => (
        <div key={group.title}>
          <div style={divider} />
          <span style={sectionLabel}>{group.title}</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {group.fields.map(f => {
              const url = form[f.key]
              return (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 80, height: 80, flexShrink: 0, position: "relative",
                      background: "#2c2c2a", border: "1px solid #e4ddd0",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {url ? (
                        <>
                          <img src={url} alt={f.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          <button onClick={() => handleDelete(f.key)} disabled={busy === f.key} aria-label={"Hapus " + f.label} style={{
                            position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%",
                            background: "#a32d2d", color: "#fff", border: "none", fontSize: 10, cursor: "pointer", lineHeight: 1
                          }}>✕</button>
                        </>
                      ) : (
                        <p style={{ fontSize: 10, color: "#b4b2a9", textAlign: "center", padding: 4 }}>Belum ada</p>
                      )}
                    </div>
                    <label htmlFor={"bup-" + f.key} style={{
                      display: "inline-block", background: busy === f.key ? "#888780" : "#2c2c2a",
                      color: "#fff", padding: "9px 18px", fontSize: 10, letterSpacing: "0.15em",
                      textTransform: "uppercase", cursor: busy === f.key ? "not-allowed" : "pointer"
                    }}>
                      {busy === f.key ? "..." : "Upload"}
                    </label>
                    <input id={"bup-" + f.key} type="file" accept="image/*" disabled={busy === f.key}
                      onChange={e => handleUpload(e, f.key)} style={{ display: "none" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
