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
  logo_url: string
  frame_url: string
  music_url: string
  ceremony_time: string
  ceremony_venue: string
  ceremony_address: string
  ceremony_maps_url: string
  ceremony_image_url: string
  reception_time: string
  reception_venue: string
  reception_address: string
  reception_maps_url: string
  reception_image_url: string
  wedding_date_iso: string
}

type PhotoFieldType =
  | "cover_photo_url"
  | "couple_photo_url"
  | "logo_url"
  | "frame_url"
  | "ceremony_image_url"
  | "reception_image_url"

function PhotoField({
  label,
  field,
  value,
  uploading,
  deleting,
  onUpload,
  onDelete,
}: {
  label: string
  field: PhotoFieldType
  value: string
  uploading: string | null
  deleting: string | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: PhotoFieldType) => void
  onDelete: (field: PhotoFieldType, url: string) => void
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
          alignItems: "center", justifyContent: "center",
          position: "relative"
        }}>
          {value ? (
            <>
              <img src={value} alt={label}
                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              <button
                onClick={() => onDelete(field, value)}
                disabled={deleting === field}
                style={{
                  position: "absolute", top: 2, right: 2,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#a32d2d", color: "#fff",
                  border: "none", fontSize: 10, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1
                }}
              >
                {deleting === field ? "..." : "✕"}
              </button>
            </>
          ) : (
            <p style={{ fontSize: 10, color: "#b4b2a9", textAlign: "center", padding: 4 }}>
              Belum ada
            </p>
          )}
        </div>
        <div>
          <label htmlFor={"upload-" + field} style={{
            display: "inline-block",
            background: uploading === field ? "#888780" : "#2c2c2a",
            color: "#fff", padding: "9px 18px",
            fontSize: 10, letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: uploading === field ? "not-allowed" : "pointer"
          }}>
            {uploading === field ? "Uploading..." : "Upload"}
          </label>
          <input
            id={"upload-" + field}
            type="file"
            accept="image/*"
            onChange={e => onUpload(e, field)}
            style={{ display: "none" }}
          />
          <p style={{ fontSize: 11, color: "#b4b2a9", marginTop: 6 }}>
            {["logo_url", "frame_url", "ceremony_image_url", "reception_image_url"].includes(field)
              ? "PNG transparan. Tidak dikompresi."
              : "Auto-compressed. Max 1200px."}
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
  const [deleting, setDeleting] = useState<string | null>(null)
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
    logo_url: wedding.logo_url ?? "",
    frame_url: wedding.frame_url ?? "",
    music_url: wedding.music_url ?? "",
    ceremony_time: wedding.ceremony_time ?? "",
    ceremony_venue: wedding.ceremony_venue ?? "",
    ceremony_address: wedding.ceremony_address ?? "",
    ceremony_maps_url: wedding.ceremony_maps_url ?? "",
    ceremony_image_url: wedding.ceremony_image_url ?? "",
    reception_time: wedding.reception_time ?? "",
    reception_venue: wedding.reception_venue ?? "",
    reception_address: wedding.reception_address ?? "",
    reception_maps_url: wedding.reception_maps_url ?? "",
    reception_image_url: wedding.reception_image_url ?? "",
    wedding_date_iso: wedding.wedding_date_iso ?? "",
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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, field: PhotoFieldType) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(field)
    const timestamp = new Date().getTime()

    const pngFields: PhotoFieldType[] = ["logo_url", "frame_url", "ceremony_image_url", "reception_image_url"]
    if (pngFields.includes(field)) {
      const fileName = wedding.id + "/" + field + "-" + timestamp + ".png"
      const { data, error } = await supabase.storage
        .from("wedding-photos")
        .upload(fileName, file, { contentType: "image/png", upsert: true })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("wedding-photos").getPublicUrl(data.path)
        setForm(f => ({ ...f, [field]: urlData.publicUrl }))
        await supabase.from("weddings").update({ [field]: urlData.publicUrl }).eq("id", wedding.id)
      }
      setUploading(null)
      return
    }

    const compressed = await compressImage(file)
    const fileName = wedding.id + "/" + field + "-" + timestamp + ".jpg"
    const { data, error } = await supabase.storage
      .from("wedding-photos")
      .upload(fileName, compressed, { contentType: "image/jpeg", upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("wedding-photos").getPublicUrl(data.path)
      setForm(f => ({ ...f, [field]: urlData.publicUrl }))
      await supabase.from("weddings").update({ [field]: urlData.publicUrl }).eq("id", wedding.id)
    }
    setUploading(null)
  }

  async function handlePhotoDelete(field: PhotoFieldType, url: string) {
    setDeleting(field)
    const path = url.split("/wedding-photos/")[1]
    if (path) {
      await supabase.storage.from("wedding-photos").remove([path])
    }
    await supabase.from("weddings").update({ [field]: null }).eq("id", wedding.id)
    setForm(f => ({ ...f, [field]: "" }))
    setDeleting(null)
    router.refresh()
  }

  async function handleMusicUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading("music_url")
    const timestamp = new Date().getTime()
    const fileName = wedding.id + "/music-" + timestamp + ".mp3"
    const { data, error } = await supabase.storage
      .from("wedding-photos")
      .upload(fileName, file, { contentType: "audio/mpeg", upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("wedding-photos").getPublicUrl(data.path)
      setForm(f => ({ ...f, music_url: urlData.publicUrl }))
      await supabase.from("weddings").update({ music_url: urlData.publicUrl }).eq("id", wedding.id)
    }
    setUploading(null)
  }

  async function handleMusicDelete() {
    setDeleting("music_url")
    const url = form.music_url
    const path = url.split("/wedding-photos/")[1]
    if (path) {
      await supabase.storage.from("wedding-photos").remove([path])
    }
    await supabase.from("weddings").update({ music_url: null }).eq("id", wedding.id)
    setForm(f => ({ ...f, music_url: "" }))
    setDeleting(null)
    router.refresh()
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase.from("weddings").update({
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
      cover_photo_url: form.cover_photo_url || null,
      couple_photo_url: form.couple_photo_url || null,
      logo_url: form.logo_url || null,
      frame_url: form.frame_url || null,
      music_url: form.music_url || null,
      ceremony_time: form.ceremony_time,
      ceremony_venue: form.ceremony_venue,
      ceremony_address: form.ceremony_address,
      ceremony_maps_url: form.ceremony_maps_url,
      ceremony_image_url: form.ceremony_image_url || null,
      reception_time: form.reception_time,
      reception_venue: form.reception_venue,
      reception_address: form.reception_address,
      reception_maps_url: form.reception_maps_url,
      reception_image_url: form.reception_image_url || null,
      wedding_date_iso: form.wedding_date_iso || null,
    }).eq("id", wedding.id)
    if (error) console.error("Save error:", error)
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
  const divider = { height: 1, background: "#f0ebe3", margin: "24px 0" }

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginBottom: 24 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b8965a", marginBottom: 24 }}>
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
      <span style={sectionLabel}>Tanggal & Venue Umum</span>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Tanggal Pernikahan (teks)</label>
        <input style={inputStyle} type="text" value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          placeholder="e.g. Minggu, 9 Agustus 2026" />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Tanggal ISO (untuk countdown)</label>
        <input style={inputStyle} type="date" value={form.wedding_date_iso}
          onChange={e => setForm({ ...form, wedding_date_iso: e.target.value })} />
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
          placeholder="e.g. Harap konfirmasi sebelum 1 Juni 2026" />
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Pemberkatan Nikah</span>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Waktu</label>
        <input style={inputStyle} type="text" value={form.ceremony_time}
          onChange={e => setForm({ ...form, ceremony_time: e.target.value })}
          placeholder="e.g. 12.30 WIB" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nama Gereja / Venue</label>
          <input style={inputStyle} type="text" value={form.ceremony_venue}
            onChange={e => setForm({ ...form, ceremony_venue: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Alamat</label>
          <input style={inputStyle} type="text" value={form.ceremony_address}
            onChange={e => setForm({ ...form, ceremony_address: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Link Google Maps</label>
        <input style={inputStyle} type="text" value={form.ceremony_maps_url}
          onChange={e => setForm({ ...form, ceremony_maps_url: e.target.value })}
          placeholder="https://maps.google.com/..." />
      </div>
      <PhotoField label="Gambar Ilustrasi Gereja (PNG)" field="ceremony_image_url"
        value={form.ceremony_image_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />

      <div style={divider} />
      <span style={sectionLabel}>Resepsi</span>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Waktu</label>
        <input style={inputStyle} type="text" value={form.reception_time}
          onChange={e => setForm({ ...form, reception_time: e.target.value })}
          placeholder="e.g. 17.30 WIB" />
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Nama Venue</label>
          <input style={inputStyle} type="text" value={form.reception_venue}
            onChange={e => setForm({ ...form, reception_venue: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Alamat</label>
          <input style={inputStyle} type="text" value={form.reception_address}
            onChange={e => setForm({ ...form, reception_address: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Link Google Maps</label>
        <input style={inputStyle} type="text" value={form.reception_maps_url}
          onChange={e => setForm({ ...form, reception_maps_url: e.target.value })}
          placeholder="https://maps.google.com/..." />
      </div>
      <PhotoField label="Gambar Ilustrasi Venue Resepsi (PNG)" field="reception_image_url"
        value={form.reception_image_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />

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
        <textarea value={form.verse}
          onChange={e => setForm({ ...form, verse: e.target.value })}
          placeholder="e.g. Two are better than one."
          rows={2}
          style={{ ...inputStyle, resize: "vertical", fontStyle: "italic", lineHeight: 1.7 }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Sumber Ayat</label>
        <input style={inputStyle} type="text" value={form.verse_source}
          onChange={e => setForm({ ...form, verse_source: e.target.value })}
          placeholder="e.g. Ecclesiastes 4:9-12" />
      </div>

      <div style={divider} />
      <span style={sectionLabel}>Foto & Logo</span>
      <PhotoField label="Logo Wedding (PNG)" field="logo_url"
        value={form.logo_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />
      <PhotoField label="Background / Tekstur Cover" field="cover_photo_url"
        value={form.cover_photo_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />
      <PhotoField label="Foto Mempelai" field="couple_photo_url"
        value={form.couple_photo_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />
      <PhotoField label="Pola Frame Foto Mempelai (PNG transparan)" field="frame_url"
        value={form.frame_url} uploading={uploading} deleting={deleting}
        onUpload={handlePhotoUpload} onDelete={handlePhotoDelete} />

      <div style={divider} />
      <span style={sectionLabel}>Musik Latar</span>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          flex: 1, background: "#f5f0e8", border: "1px solid #e4ddd0",
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 18, color: "#b8965a" }}>♪</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: form.music_url ? "#2c2c2a" : "#b4b2a9", marginBottom: 2 }}>
              {form.music_url ? "Musik sudah diupload ✓" : "Belum ada musik"}
            </p>
            {form.music_url && (
              <audio controls src={form.music_url} style={{ height: 28, marginTop: 4, width: "100%" }} />
            )}
          </div>
          {form.music_url && (
            <button
              onClick={handleMusicDelete}
              disabled={deleting === "music_url"}
              style={{
                background: "#a32d2d", color: "#fff", border: "none",
                padding: "6px 12px", fontSize: 10, cursor: "pointer",
                letterSpacing: "0.1em", textTransform: "uppercase",
                flexShrink: 0
              }}
            >
              {deleting === "music_url" ? "..." : "Hapus"}
            </button>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <label htmlFor="upload-music" style={{
            display: "inline-block",
            background: uploading === "music_url" ? "#888780" : "#2c2c2a",
            color: "#fff", padding: "9px 18px", fontSize: 10,
            letterSpacing: "0.15em", textTransform: "uppercase",
            cursor: uploading === "music_url" ? "not-allowed" : "pointer"
          }}>
            {uploading === "music_url" ? "Uploading..." : "Upload MP3"}
          </label>
          <input id="upload-music" type="file" accept="audio/mpeg,audio/mp3,.mp3"
            onChange={handleMusicUpload} style={{ display: "none" }} />
          <p style={{ fontSize: 10, color: "#b4b2a9", marginTop: 6 }}>Format MP3</p>
        </div>
      </div>

      <div style={divider} />
      <button onClick={handleSave} disabled={loading} style={{
        background: saved ? "#3b6d11" : "#2c2c2a",
        color: "#fff", border: "none", padding: "12px 32px",
        fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1, fontFamily: "inherit", transition: "background 0.3s"
      }}>
        {loading ? "Menyimpan..." : saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
      </button>
    </div>
  )
}