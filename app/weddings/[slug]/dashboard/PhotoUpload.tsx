"use client"
import { useState, useRef } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function PhotoUpload({ 
  weddingId,
  photos
}: { 
  weddingId: string
  photos: any[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        // Max 1200px width
        const maxW = 1200
        const ratio = Math.min(maxW / img.width, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        canvas.toBlob(blob => resolve(blob!), "image/jpeg", 0.8)
      }
      img.src = url
    })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)

    for (const file of files) {
      const compressed = await compressImage(file)
      const fileName = `${weddingId}/${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from("wedding-photos")
        .upload(fileName, compressed, { contentType: "image/jpeg" })

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from("wedding-photos")
          .getPublicUrl(data.path)

        await supabase.from("wedding_photos").insert({
          wedding_id: weddingId,
          url: urlData.publicUrl,
          order_index: photos.length
        })
      }
    }

    setUploading(false)
    router.refresh()
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleDelete(photoId: string, url: string) {
    setDeleting(photoId)
    const path = url.split("/wedding-photos/")[1]
    await supabase.storage.from("wedding-photos").remove([path])
    await supabase.from("wedding_photos").delete().eq("id", photoId)
    setDeleting(null)
    router.refresh()
  }

  async function movePhoto(photoId: string, direction: "up" | "down") {
    const idx = photos.findIndex(p => p.id === photoId)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === photos.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const current = photos[idx]
    const swap = photos[swapIdx]

    await supabase.from("wedding_photos")
      .update({ order_index: swapIdx }).eq("id", current.id)
    await supabase.from("wedding_photos")
      .update({ order_index: idx }).eq("id", swap.id)

    router.refresh()
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "24px", marginTop: 24 }}>
      <p style={{
        fontSize: 10, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "#b8965a", marginBottom: 20
      }}>
        Wedding Photos
      </p>

      {/* Upload button */}
      <div style={{ marginBottom: 20 }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          style={{ display: "none" }}
          id="photo-upload"
        />
        <label htmlFor="photo-upload" style={{
          display: "inline-block",
          background: uploading ? "#888780" : "#2c2c2a",
          color: "#fff", padding: "10px 24px",
          fontSize: 11, letterSpacing: "0.18em",
          textTransform: "uppercase", cursor: uploading ? "not-allowed" : "pointer"
        }}>
          {uploading ? "Uploading..." : "+ Upload Photos"}
        </label>
        <p style={{ fontSize: 11, color: "#888780", marginTop: 8 }}>
          Bisa pilih beberapa foto sekaligus. Auto-compressed ke max 1200px.
        </p>
      </div>

      {/* Photo grid */}
      {photos.length === 0 && (
        <p style={{ color: "#b4b2a9", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
          Belum ada foto. Upload foto pertama kamu.
        </p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12
      }}>
        {photos.map((photo, idx) => (
          <div key={photo.id} style={{ position: "relative" }}>
            <img
              src={photo.url}
              alt={`Photo ${idx + 1}`}
              style={{
                width: "100%", aspectRatio: "1",
                objectFit: "cover", display: "block"
              }}
            />
            {/* Order badge */}
            <div style={{
              position: "absolute", top: 6, left: 6,
              background: "#2c2c2a", color: "#e8d5a3",
              width: 22, height: 22, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 500
            }}>
              {idx + 1}
            </div>
            {/* Actions */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex", justifyContent: "space-between",
              padding: "4px 6px"
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => movePhoto(photo.id, "up")}
                  disabled={idx === 0}
                  style={{
                    background: "none", border: "none", color: "#fff",
                    fontSize: 14, cursor: idx === 0 ? "not-allowed" : "pointer",
                    opacity: idx === 0 ? 0.3 : 1, padding: "0 2px"
                  }}
                >↑</button>
                <button
                  onClick={() => movePhoto(photo.id, "down")}
                  disabled={idx === photos.length - 1}
                  style={{
                    background: "none", border: "none", color: "#fff",
                    fontSize: 14, cursor: idx === photos.length - 1 ? "not-allowed" : "pointer",
                    opacity: idx === photos.length - 1 ? 0.3 : 1, padding: "0 2px"
                  }}
                >↓</button>
              </div>
              <button
                onClick={() => handleDelete(photo.id, photo.url)}
                disabled={deleting === photo.id}
                style={{
                  background: "none", border: "none", color: "#f09595",
                  fontSize: 12, cursor: "pointer", padding: "0 2px"
                }}
              >
                {deleting === photo.id ? "..." : "✕"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}