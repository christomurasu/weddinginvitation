"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import QRCode from "qrcode"
import { supabase } from "../../../../lib/supabase"
import { COLORS, LABELS, POLL_MS, leaderboard, type Quiz } from "../../../../quiz/shared"

type Player = { id: string; name: string }
type Answer = { player_id: string; question_index: number; choice: number; points: number }

const bigBtn = {
  background: "#b8965a", color: "#fff", border: "none", padding: "16px 40px", fontSize: 16,
  letterSpacing: "0.15em", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "inherit"
}

export default function HostPage() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [qr, setQr] = useState("")
  const [joinHost, setJoinHost] = useState("")
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single().then(({ data }) => {
      if (!data) return
      setQuiz(data)
      setJoinHost(location.host)
      QRCode.toDataURL(`${location.origin}/quiz?pin=${data.pin}`, { width: 400, margin: 1 }).then(setQr)
    })
  }, [id])

  // Ambil daftar pemain & jawaban terus-menerus
  useEffect(() => {
    const poll = async () => {
      const [p, a] = await Promise.all([
        supabase.from("quiz_players").select("id, name").eq("quiz_id", id).order("created_at"),
        supabase.from("quiz_answers").select("player_id, question_index, choice, points").eq("quiz_id", id),
      ])
      setPlayers(p.data ?? [])
      setAnswers(a.data ?? [])
    }
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => clearInterval(t)
  }, [id])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])

  async function go(status: Quiz["status"], current_index: number) {
    if (!quiz) return
    if (status === "question") setDeadline(Date.now() + quiz.questions[current_index].time * 1000)
    setQuiz({ ...quiz, status, current_index })
    await supabase.from("quizzes").update({ status, current_index }).eq("id", id)
  }

  async function reset() {
    if (!confirm("Main lagi dari awal? Semua pemain & skor dihapus.")) return
    await supabase.from("quiz_players").delete().eq("quiz_id", id)
    setPlayers([])
    setAnswers([])
    go("lobby", -1)
  }

  const idx = quiz?.current_index ?? -1
  const question = quiz?.questions[idx]
  const current = answers.filter(a => a.question_index === idx)
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000))

  // Waktu habis atau semua sudah jawab → tampilkan jawaban
  const allAnswered = players.length > 0 && current.length >= players.length
  useEffect(() => {
    if (quiz?.status !== "question" || (remaining > 0 && !allAnswered)) return
    const t = setTimeout(() => go("reveal", idx), 0)
    return () => clearTimeout(t)
  }, [quiz?.status, remaining, allAnswered, idx]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!quiz) return <div style={{ minHeight: "100vh", background: "#2c2c2a" }} />

  const board = leaderboard(players, answers)
  const isLast = idx >= quiz.questions.length - 1

  return (
    <div style={{ minHeight: "100vh", background: "#2c2c2a", color: "#fff", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <p style={{ color: "#e8d5a3", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>
        <Link href={`/events/quiz/${id}`} style={{ color: "inherit" }}>{quiz.title}</Link>
        {question && ` · Soal ${idx + 1}/${quiz.questions.length}`}
      </p>

      {quiz.status === "lobby" && (
        <>
          <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {qr && <img src={qr} alt="QR untuk join" style={{ width: 220, height: 220, background: "#fff", padding: 8 }} />}
            <div>
              <p style={{ fontSize: 18, color: "#b4b2a9" }}>Buka <b style={{ color: "#fff" }}>{joinHost}/quiz</b></p>
              <p style={{ fontSize: 14, color: "#b4b2a9", marginTop: 16 }}>Game PIN</p>
              <p style={{ fontSize: 88, fontWeight: 700, letterSpacing: "0.1em", lineHeight: 1 }}>{quiz.pin}</p>
            </div>
          </div>
          <button onClick={() => go("question", 0)} disabled={!players.length || !quiz.questions.length}
            style={{ ...bigBtn, opacity: players.length && quiz.questions.length ? 1 : 0.4 }}>
            Mulai ({players.length} pemain)
          </button>
          {!quiz.questions.length && <p style={{ color: "#c6294b" }}>Belum ada soal — tambah dulu di halaman Edit.</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 900 }}>
            {players.map(p => (
              <span key={p.id} style={{ background: "#3d3d3a", padding: "8px 16px", fontSize: 18 }}>{p.name}</span>
            ))}
          </div>
        </>
      )}

      {(quiz.status === "question" || quiz.status === "reveal") && question && (
        <>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, maxWidth: 1000 }}>{question.q}</h1>
          {quiz.status === "question" ? (
            <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
              <span style={{ fontSize: 64, fontWeight: 700, color: remaining <= 5 ? "#c6294b" : "#e8d5a3" }}>{remaining}</span>
              <span style={{ fontSize: 20, color: "#b4b2a9" }}>{current.length}/{players.length} menjawab</span>
              <button onClick={() => go("reveal", idx)} style={{ ...bigBtn, background: "#3d3d3a", padding: "10px 20px", fontSize: 12 }}>Lewati</button>
            </div>
          ) : (
            <button onClick={() => (isLast ? go("ended", idx) : go("question", idx + 1))} style={bigBtn}>
              {isLast ? "Lihat Juara 🏆" : "Soal Berikutnya →"}
            </button>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 1000 }}>
            {question.options.map((opt, k) => opt.trim() && (
              <div key={k} style={{
                background: COLORS[k], padding: "24px 20px", fontSize: 24, textAlign: "left", display: "flex", gap: 16, alignItems: "center",
                opacity: quiz.status === "reveal" && k !== question.correct ? 0.3 : 1
              }}>
                <b>{LABELS[k]}</b>
                <span style={{ flex: 1 }}>{opt}</span>
                {quiz.status === "reveal" && <b>{k === question.correct ? "✓ " : ""}{current.filter(a => a.choice === k).length}</b>}
              </div>
            ))}
          </div>
          {quiz.status === "reveal" && <Ranking board={board.slice(0, 5)} />}
        </>
      )}

      {quiz.status === "ended" && (
        <>
          <h1 style={{ fontSize: 48, fontWeight: 300 }}>🏆 Juara</h1>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            {[1, 0, 2].map(r => board[r] && (
              <div key={r} style={{ width: 180 }}>
                <p style={{ fontSize: 22, marginBottom: 8 }}>{board[r].name}</p>
                <p style={{ color: "#e8d5a3", marginBottom: 8 }}>{board[r].score}</p>
                <div style={{ background: ["#b8965a", "#9a9a94", "#8a5a3a"][r], height: [220, 160, 110][r], fontSize: 48, paddingTop: 12 }}>{r + 1}</div>
              </div>
            ))}
          </div>
          <Ranking board={board.slice(3)} offset={3} />
          <button onClick={reset} style={{ ...bigBtn, background: "#3d3d3a" }}>Main Lagi</button>
        </>
      )}
    </div>
  )
}

function Ranking({ board, offset = 0 }: { board: { id: string; name: string; score: number }[]; offset?: number }) {
  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      {board.map((p, i) => (
        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "#3d3d3a", marginBottom: 6, fontSize: 20 }}>
          <span>{i + 1 + offset}. {p.name}</span>
          <b style={{ color: "#e8d5a3" }}>{p.score}</b>
        </div>
      ))}
    </div>
  )
}
