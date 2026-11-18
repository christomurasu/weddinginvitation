"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

type Row = { id: string; title: string; pin: string; questions: unknown[] }

const btn = {
  background: "#2c2c2a", color: "#fff", border: "none", padding: "12px 24px", fontSize: 11,
  letterSpacing: "0.18em", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "inherit",
  textDecoration: "none", display: "inline-block"
}

export default function QuizListPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Row[]>([])
  const [title, setTitle] = useState("")

  useEffect(() => {
    supabase.from("quizzes").select("id, title, pin, questions").order("created_at", { ascending: false })
      .then(({ data }) => setQuizzes(data ?? []))
  }, [])

  async function create() {
    if (!title.trim()) return
    // ponytail: PIN acak 6 digit; kalau bentrok (sangat jarang) unique constraint menolak, tinggal klik lagi
    const pin = String(Math.floor(100000 + Math.random() * 900000))
    const { data, error } = await supabase.from("quizzes").insert({ title: title.trim(), pin }).select("id").single()
    if (error) return alert("Gagal membuat kuis: " + error.message)
    router.push(`/events/quiz/${data.id}`)
  }

  async function remove(q: Row) {
    if (!confirm(`Hapus kuis "${q.title}"? Semua pemain & jawaban ikut terhapus.`)) return
    await supabase.from("quizzes").delete().eq("id", q.id)
    setQuizzes(qs => qs.filter(x => x.id !== q.id))
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <div style={{ background: "#2c2c2a", padding: "40px 32px", textAlign: "center" }}>
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
          <Link href="/events" style={{ color: "inherit" }}>Event System</Link>
        </p>
        <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 300 }}>Quiz Games</h1>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === "Enter" && create()}
            placeholder="Judul kuis baru, mis. Seberapa kenal Sonny & Felyn?"
            style={{ flex: 1, border: "1px solid #e4ddd0", padding: "11px 13px", fontSize: 13, background: "#fff", color: "#2c2c2a", fontFamily: "inherit" }} />
          <button onClick={create} style={btn}>+ Buat</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {quizzes.map(q => (
            <div key={q.id} style={{ background: "#fff", border: "1px solid #e4ddd0", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#2c2c2a", marginBottom: 4 }}>{q.title}</h2>
                <p style={{ color: "#888780", fontSize: 12 }}>PIN {q.pin} · {q.questions.length} soal</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Link href={`/events/quiz/${q.id}`} style={{ ...btn, background: "transparent", color: "#2c2c2a", border: "1px solid #e4ddd0", padding: "8px 14px", fontSize: 10 }}>Edit</Link>
                <Link href={`/events/quiz/${q.id}/host`} style={{ ...btn, padding: "8px 14px", fontSize: 10 }}>Host ▶</Link>
                <button onClick={() => remove(q)} style={{ ...btn, background: "transparent", color: "#c6294b", border: "1px solid #e4ddd0", padding: "8px 12px", fontSize: 10 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
