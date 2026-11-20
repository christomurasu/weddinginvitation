"use client"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { COLORS, LABELS, POLL_MS, leaderboard, points, type Quiz } from "./shared"

type Answer = { player_id: string; question_index: number; choice: number; points: number }

const key = (pin: string) => `quiz-player-${pin}`
const field = { width: "100%", padding: "14px", fontSize: 20, textAlign: "center" as const, border: "none", background: "#fff", color: "#2c2c2a", fontFamily: "inherit", marginBottom: 12 }

export default function PlayQuizPage() {
  const [pin, setPin] = useState("")
  const [name, setName] = useState("")
  const [playerId, setPlayerId] = useState("")
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [mine, setMine] = useState<Record<number, Answer>>({}) // jawaban sendiri, langsung tampil tanpa nunggu polling
  const [shownAt, setShownAt] = useState(0)
  const [now, setNow] = useState(0)
  const [busy, setBusy] = useState(false)

  // PIN dari QR (?pin=123456) + lanjutkan sesi kalau HP di-refresh
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("pin") ?? ""
    setPin(p) // eslint-disable-line react-hooks/set-state-in-effect -- baca URL/localStorage sekali saat mount (tidak ada di server)
    try { setPlayerId(localStorage.getItem(key(p)) ?? "") } catch {}
  }, [])

  async function join() {
    setBusy(true)
    const { data: q, error: e } = await supabase.from("quizzes").select("id").eq("pin", pin.trim()).maybeSingle()
    if (!q) { setBusy(false); return alert(e ? "Error: " + e.message : "PIN tidak ditemukan.") }
    const { data, error } = await supabase.from("quiz_players").insert({ quiz_id: q.id, name: name.trim() }).select("id").single()
    setBusy(false)
    if (error) return alert(error.code === "23505" ? "Nama sudah dipakai, coba nama lain." : "Gagal join: " + error.message)
    try { localStorage.setItem(key(pin.trim()), data.id) } catch {}
    setMine({})
    setPlayerId(data.id)
  }

  function leave() {
    try { localStorage.removeItem(key(pin)) } catch {}
    setPlayerId("")
    setQuiz(null)
  }

  useEffect(() => {
    if (!playerId) return
    const poll = async () => {
      const { data: q } = await supabase.from("quizzes").select("*").eq("pin", pin.trim()).maybeSingle()
      if (!q) return leave()
      setQuiz(q)
      if (q.status === "question") return // saat soal berjalan cukup cek status, hemat request
      const [p, a] = await Promise.all([
        supabase.from("quiz_players").select("id, name").eq("quiz_id", q.id),
        supabase.from("quiz_answers").select("player_id, question_index, choice, points").eq("quiz_id", q.id),
      ])
      if (p.data && !p.data.some(x => x.id === playerId)) return leave() // host klik "Main Lagi"
      setPlayers(p.data ?? [])
      setAnswers(a.data ?? [])
    }
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => clearInterval(t)
  }, [playerId, pin]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer dimulai saat soal pertama kali terlihat di HP ini
  const idx = quiz?.current_index ?? -1
  const inQuestion = quiz?.status === "question"
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mulai timer saat soal baru muncul
  useEffect(() => { if (inQuestion) { setShownAt(Date.now()); setNow(Date.now()) } }, [inQuestion, idx])
  useEffect(() => {
    if (!inQuestion) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [inQuestion])

  async function answer(choice: number, clickedAt: number) {
    if (!quiz) return
    const q = quiz.questions[idx]
    const pts = points(choice === q.correct, clickedAt - shownAt, q.time)
    const a = { player_id: playerId, question_index: idx, choice, points: pts }
    setMine(m => ({ ...m, [idx]: a }))
    await supabase.from("quiz_answers").insert({ ...a, quiz_id: quiz.id }) // dobel → ditolak unique, aman
  }

  const wrap = (children: React.ReactNode, bg = "#2c2c2a") => (
    <div style={{ minHeight: "100dvh", background: bg, color: "#fff", padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 12 }}>
      {children}
    </div>
  )

  if (!playerId) return wrap(
    <div style={{ width: "100%", maxWidth: 360 }}>
      <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 24 }}>SF Quiz</h1>
      <input value={pin} onChange={e => setPin(e.target.value)} placeholder="Game PIN" inputMode="numeric" aria-label="Game PIN" style={field} />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" maxLength={20} aria-label="Nama" style={field}
        onKeyDown={e => e.key === "Enter" && pin && name.trim() && join()} />
      <button onClick={join} disabled={busy || !pin || !name.trim()}
        style={{ ...field, background: "#b8965a", color: "#fff", cursor: "pointer", opacity: busy || !pin || !name.trim() ? 0.5 : 1 }}>
        {busy ? "..." : "Masuk"}
      </button>
    </div>
  )

  if (!quiz) return wrap(<p>Memuat...</p>)

  const me = players.find(p => p.id === playerId)
  const board = leaderboard(players, answers)
  const rank = board.findIndex(p => p.id === playerId) + 1
  const score = board[rank - 1]?.score ?? 0
  const question = quiz.questions[idx]
  const my = mine[idx] ?? answers.find(a => a.player_id === playerId && a.question_index === idx)

  if (quiz.status === "lobby") return wrap(<>
    <p style={{ fontSize: 14, color: "#b4b2a9" }}>{quiz.title}</p>
    <h1 style={{ fontSize: 32 }}>Kamu masuk, {me?.name}! 🎉</h1>
    <p style={{ color: "#b4b2a9" }}>Lihat namamu di layar. Tunggu host memulai...</p>
  </>)

  if (quiz.status === "question" && question) {
    const left = question.time ? Math.max(0, Math.ceil((shownAt + question.time * 1000 - now) / 1000)) : Infinity
    if (my) return wrap(<><h1 style={{ fontSize: 28 }}>Jawaban terkirim ✓</h1><p style={{ color: "#b4b2a9" }}>Tunggu yang lain...</p></>)
    if (left === 0) return wrap(<h1 style={{ fontSize: 28 }}>Waktu habis ⏰</h1>)
    return (
      <div style={{ height: "100dvh", background: "#2c2c2a", color: "#fff", padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <p style={{ fontSize: 18, flex: 1 }}>{question.q}</p>
          {question.time > 0 && <b style={{ fontSize: 32, color: left <= 5 ? "#c6294b" : "#e8d5a3" }}>{left}</b>}
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {question.options.map((opt, k) => opt.trim() && (
            <button key={k} onClick={e => answer(k, performance.timeOrigin + e.timeStamp)}
              style={{ background: COLORS[k], color: "#fff", border: "none", fontSize: 20, fontFamily: "inherit", padding: 12, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <b style={{ fontSize: 40 }}>{LABELS[k]}</b>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (quiz.status === "reveal" && question) {
    const right = my?.choice === question.correct
    return wrap(<>
      <h1 style={{ fontSize: 40 }}>{!my ? "Tidak menjawab" : right ? "Benar! ✓" : "Salah ✕"}</h1>
      {right && <p style={{ fontSize: 24 }}>+{my.points}</p>}
      {!right && <p>Jawaban: <b>{LABELS[question.correct]}. {question.options[question.correct]}</b></p>}
      <p style={{ marginTop: 24, color: "#e8d5a3" }}>Skor {score} · Peringkat #{rank || "-"}</p>
    </>, !my ? "#3d3d3a" : right ? "#3c8d5a" : "#c6294b")
  }

  return wrap(<>
    <p style={{ color: "#b4b2a9" }}>{quiz.title} selesai!</p>
    <h1 style={{ fontSize: 56 }}>{rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}</h1>
    <p style={{ fontSize: 24 }}>{me?.name} · {score} poin</p>
  </>)
}
