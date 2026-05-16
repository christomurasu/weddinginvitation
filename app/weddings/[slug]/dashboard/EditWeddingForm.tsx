"use client"
import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface Wedding {
  id: string
  partner1: string
  partner2: string
  date: string
  venue: string
  venue_address: string
  rsvp_deadline: string
  groom_father: string
  groom_mother: string
  bride_father: string
  bride_mother: string
  groom_child_order: string
  bride_child_order: string
  verse: string
  verse_source: string
  cover_photo_url: string
  couple_photo_url: string
}

// ── Moved OUTSIDE EditWeddingForm ──
function PhotoField({
  label,
  field,
  value,
  uploading,
  onUpload,
}: {
  label: string
  field: "cover_photo_url" | "couple_photo_url"
  value: string
  uploading: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: "cover_photo_url" | "couple_photo_url") => void
}) {
  const labelStyle = {
    fontSize: 10, letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#888780", display: "block", marginBottom: 6
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 80, height: 80, flexShrink: 0,
          background: "#f5f0e8", border: "1px solid #e4ddd0",
          overflow: "hidden", display: "flex",
          alignItems: "center", justifyContent: "center"
        }}>
          {value ? (
            <img src={value} alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <p style={{
              fontSize: 10, color: "#b4b2a9",
              textAlign: "center", padding: 4
            }}>
              Belum ada foto
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`upload-${field}`} style={{
            display: "inline-block",
            background: uploading === field ? "#888780" : "#2c2c2a",
            color: "#fff", padding: "9px 18px",
            fontSize: 10, letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: uploading === field ? "not-allowed" : "pointer"
          }}>
            {uploading === field ? "Uploading..." : "Upload Foto"}
          </label>
          <input
            id={`upload-${field}`}
            type="file"
            accept="image/*"
            onChange={e => onUpload(e, field)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: 11, color: "#b4b2a9", marginTop: 6 }}>
            Auto-compressed. Max 1200px.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EditWeddingForm({ wedding }: { wedding: Wedding }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    partner1: wedding.partner1 ?? "",
    partner2: wedding.partner2 ?? "",
    date: wedding.date ?? "",
    venue: wedding.venue ?? "",
    venue_address: wedding.venue_address ?? "",
    rsvp_deadline: wedding.rsvp_deadline ?? "",
    groom_father: wedding.groom_father ?? "",
    groom_mother: wedding.groom_mother ?? "",
    bride_father: wedding.bride_father ?? "",
    bride_mother: wedding.bride_mother ?? "",
    groom_child_order: wedding.groom_child_order ?? "",
    bride_child_order: wedding.bride_child_order ?? "",
    verse: wedding.verse ?? "",
    verse_source: wedding.verse_source ?? "",
    cover_photo_url: wedding.cover_photo_url ?? "",
    couple_photo_url: wedding.couple_photo_url ?? "",
  })

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const maxW = 1200
        const ratio = Math.min(maxW / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.82)
      }
      img.src = url
    })
  }

  async function handlePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "cover_photo_url" | "couple_photo_url"
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(field)
    const compressed = await compressImage(file)
    const timestamp = new Date().getTime()
    const fileName = `${wedding.id}/${field}-${timestamp}.jpg`
    const { data, error } = await supabase.storage
      .from("wedding-photos")
      .upload(fileName, compressed, { contentType: "image/jpeg", upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("wedding-photos")
        .getPublicUrl(data.path)
      setForm(f => ({ ...f, [field]: urlData.publicUrl }))
    }
    setUploading(null)
  }

  async function handleSave() {
    setLoading(true)
    await supabase.from("weddings").update({
      partner1: form.partner1,
      partner2: form.partner2,
      date: form.date,
      venue: form.venue,
      venue_address: form.venue_address,
      rsvp_deadline: form.rsvp_deadline,
      groom_father: form.groom_father,
      groom_mother: form.groom_mother,
      bride_father: form.bride_father,
      bride_mother: form.bride_mother,
      groom_child_order: form.groom_child_order,
      bride_child_order: form.bride_child_order,
      verse: form.verse,
      verse_source: form.verse_source,
      cover_photo_url: form.cover_photo_url,
      couple_photo_url: form.couple_photo_url,
    }).eq("id", wedding.id)
    setLoading(false)
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
  const divider = {
    height: 1, background: "#f0ebe3", margin: "24px 0"
  }

  return (
    <div style={{
      background: "#fff", border: "1px solid #e4ddd0",
      padding: "24px", marginBottom: 24
    }}>
      <p style={{
        fontSize: 10, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#b8965a", marginBottom: 24
      }}>
        Edit Wedding Details
      </p>

      <span style={sectionLabel}>Nama Mempelai</span>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Mempelai Pria</label>
          <input style={inputStyle} type="text" value={form.partner1}
            onChange={e => setForm({ ...form, partner1: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Mempelai Wanita</label>
          <input style={inputStyle} type="text" value={form.partner2}
            onChange={e => setForm({ ...form, partner2: e.target.value })} />
        </div>
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Tanggal & Venue</span>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Tanggal Pernikahan</label>
        <input style={inputStyle} type="text" value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          placeholder="e.g. Sabtu, 14 Juni 2025" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nama Venue</label>
          <input style={inputStyle} type="text" value={form.venue}
            onChange={e => setForm({ ...form, venue: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Alamat Venue</label>
          <input style={inputStyle} type="text" value={form.venue_address}
            onChange={e => setForm({ ...form, venue_address: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>RSVP Deadline</label>
        <input style={inputStyle} type="text" value={form.rsvp_deadline}
          onChange={e => setForm({ ...form, rsvp_deadline: e.target.value })}
          placeholder="e.g. Harap konfirmasi sebelum 1 Juni 2025" />
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Nama Orang Tua</span>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ayah Mempelai Pria</label>
          <input style={inputStyle} type="text" value={form.groom_father}
            onChange={e => setForm({ ...form, groom_father: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ibu Mempelai Pria</label>
          <input style={inputStyle} type="text" value={form.groom_mother}
            onChange={e => setForm({ ...form, groom_mother: e.target.value })} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Putra ke- (Pria)</label>
          <input style={inputStyle} type="text" value={form.groom_child_order}
            onChange={e => setForm({ ...form, groom_child_order: e.target.value })}
            placeholder="e.g. Pertama" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Putri ke- (Wanita)</label>
          <input style={inputStyle} type="text" value={form.bride_child_order}
            onChange={e => setForm({ ...form, bride_child_order: e.target.value })}
            placeholder="e.g. Kedua" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ayah Mempelai Wanita</label>
          <input style={inputStyle} type="text" value={form.bride_father}
            onChange={e => setForm({ ...form, bride_father: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Ibu Mempelai Wanita</label>
          <input style={inputStyle} type="text" value={form.bride_mother}
            onChange={e => setForm({ ...form, bride_mother: e.target.value })} />
        </div>
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Ayat / Quote</span>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Ayat</label>
        <textarea
          value={form.verse}
          onChange={e => setForm({ ...form, verse: e.target.value })}
          placeholder="e.g. Two are better than one."
          rows={2}
          style={{
            ...inputStyle, resize: "vertical",
            fontStyle: "italic", lineHeight: 1.7
          }}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Sumber Ayat</label>
        <input style={inputStyle} type="text" value={form.verse_source}
          onChange={e => setForm({ ...form, verse_source: e.target.value })}
          placeholder="e.g. Ecclesiastes 4:9-12" />
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Foto Cover Page</span>
      <PhotoField
        label="Background / Tekstur Cover"
        field="cover_photo_url"
        value={form.cover_photo_url}
        uploading={uploading}
        onUpload={handlePhotoUpload}
      />
      <PhotoField
        label="Foto Mempelai (untuk frame)"
        field="couple_photo_url"
        value={form.couple_photo_url}
        uploading={uploading}
        onUpload={handlePhotoUpload}
      />

      <div style={divider} />
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          background: saved ? "#3b6d11" : "#2c2c2a",
          color: "#fff", border: "none", padding: "12px 32px",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, fontFamily: "inherit",
          transition: "background 0.3s"
        }}
      >
        {loading ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
      </button>
    </div>
  )
}