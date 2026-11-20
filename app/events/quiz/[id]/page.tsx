"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "../../../lib/supabase"
import { COLORS, LABELS, type Question } from "../../../quiz/shared"

const blank = (): Question => ({ q: "", options: ["", "", "", ""], correct: 0, time: 20 })
const input = { border: "1px solid #e4ddd0", padding: "10px 12px", fontSize: 13, background: "#fdf8ee", color: "#2c2c2a", fontFamily: "inherit", width: "100%" }

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>()
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [saved, setSaved] = useState(false)
  const [grab, setGrab] = useState<number | null>(null) // handle ⠿ sedang ditekan → kartu boleh di-drag
  const [drag, setDrag] = useState<number | null>(null) // kartu yang sedang di-drag

  useEffect(() => {
    supabase.from("quizzes").select("title, questions").eq("id", id).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title)
      setQuestions(data.questions.length ? data.questions : [blank()])
    })
  }, [id])

  const update = (i: number, patch: Partial<Question>) =>
    setQuestions(qs => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)))

  const move = (from: number, to: number) =>
    setQuestions(qs => { const a = [...qs]; a.splice(to, 0, a.splice(from, 1)[0]); return a })

  async function save() {
    // Opsi kosong boleh (mis. soal Benar/Salah cukup 2 opsi), tapi jawaban benar wajib terisi
    const bad = questions.findIndex(q => !q.q.trim() || !q.options[q.correct]?.trim())
    if (bad >= 0) return alert(`Soal #${bad + 1}: isi pertanyaan dan teks jawaban yang benar.`)
    const { error } = await supabase.from("quizzes").update({ title, questions }).eq("id", id)
    if (error) return alert("Gagal menyimpan: " + error.message)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2" }}>
      <div style={{ background: "#2c2c2a", padding: "32px", textAlign: "center" }}>
        <p style={{ color: "#e8d5a3", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
          <Link href="/events/quiz" style={{ color: "inherit" }}>← Quiz Games</Link>
        </p>
        <input value={title} onChange={e => setTitle(e.target.value)} aria-label="Judul kuis"
          style={{ background: "transparent", border: "none", color: "#fff", fontSize: 30, fontWeight: 300, textAlign: "center", width: "100%", fontFamily: "inherit" }} />
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 120px" }}>
        {questions.map((q, i) => (
          <div key={i} draggable={grab === i}
            onDragStart={e => { e.dataTransfer.setData("text/plain", ""); setDrag(i) }}
            onDragOver={e => { e.preventDefault(); if (drag !== null && drag !== i) { move(drag, i); setDrag(i) } }}
            onDragEnd={() => { setDrag(null); setGrab(null) }}
            style={{ background: "#fff", border: "1px solid #e4ddd0", padding: 20, marginBottom: 16, opacity: drag === i ? 0.4 : 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <button onMouseDown={() => setGrab(i)} onMouseUp={() => setGrab(null)}
                onKeyDown={e => {
                  if (e.key === "ArrowUp" && i > 0) move(i, i - 1)
                  if (e.key === "ArrowDown" && i < questions.length - 1) move(i, i + 1)
                }}
                aria-label="Geser urutan soal (drag, atau tombol panah atas/bawah)" title="Drag untuk ubah urutan"
                style={{ border: "none", background: "none", color: "#b4b2a9", cursor: "grab", fontSize: 20, padding: "0 2px" }}>⠿</button>
              <b style={{ color: "#b8965a" }}>#{i + 1}</b>
              <input value={q.q} onChange={e => update(i, { q: e.target.value })} placeholder="Pertanyaan" style={input} />
              <select value={q.time} onChange={e => update(i, { time: Number(e.target.value) })} aria-label="Waktu" style={{ ...input, width: 130 }}>
                {[10, 20, 30, 60].map(s => <option key={s} value={s}>{s} dtk</option>)}
                <option value={0}>Tanpa timer</option>
              </select>
              <button onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} aria-label="Hapus soal"
                style={{ border: "none", background: "none", color: "#c6294b", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {q.options.map((opt, k) => (
                <label key={k} style={{ display: "flex", gap: 8, alignItems: "center", borderLeft: `6px solid ${COLORS[k]}`, paddingLeft: 8 }}>
                  <input type="radio" name={`correct-${i}`} checked={q.correct === k} onChange={() => update(i, { correct: k })} aria-label={`Jawaban ${LABELS[k]} benar`} />
                  <input value={opt} placeholder={`Opsi ${LABELS[k]}${k > 1 ? " (opsional)" : ""}`}
                    onChange={e => update(i, { options: q.options.map((o, m) => (m === k ? e.target.value : o)) })} style={input} />
                </label>
              ))}
            </div>
          </div>
        ))}

        <button onClick={() => setQuestions(qs => [...qs, blank()])}
          style={{ width: "100%", padding: 14, border: "1px dashed #b8965a", background: "transparent", color: "#b8965a", cursor: "pointer", fontFamily: "inherit" }}>
          + Tambah Soal
        </button>
        <p style={{ color: "#888780", fontSize: 12, marginTop: 8 }}>Pilih bulatan di sebelah jawaban yang benar.</p>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e4ddd0", padding: 12, display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={save} style={{ background: "#2c2c2a", color: "#fff", border: "none", padding: "12px 32px", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 11 }}>
          {saved ? "✓ Tersimpan" : "Simpan"}
        </button>
        <Link href={`/events/quiz/${id}/host`} style={{ background: "#b8965a", color: "#fff", padding: "12px 32px", textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 11 }}>
          Host ▶
        </Link>
      </div>
    </div>
  )
}
