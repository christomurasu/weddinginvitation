export type Question = { q: string; options: string[]; correct: number; time: number }

export type Quiz = {
  id: string
  title: string
  pin: string
  questions: Question[]
  status: "lobby" | "question" | "reveal" | "ended"
  current_index: number
}

export const COLORS = ["#c6294b", "#2f6fb0", "#c99a2e", "#3c8d5a"]
export const LABELS = ["A", "B", "C", "D"]

// Benar = 500–1000 poin, makin cepat makin besar. Salah = 0.
export function points(correct: boolean, ms: number, timeSec: number) {
  if (!correct) return 0
  return Math.round(1000 * (1 - Math.min(ms / (timeSec * 1000), 1) / 2))
}

// Total skor per pemain, urut terbesar
export function leaderboard(
  players: { id: string; name: string }[],
  answers: { player_id: string; points: number }[]
) {
  return players
    .map(p => ({ ...p, score: answers.filter(a => a.player_id === p.id).reduce((s, a) => s + a.points, 0) }))
    .sort((a, b) => b.score - a.score)
}

export const POLL_MS = 1000 // ponytail: polling 1 detik, ganti ke Supabase Realtime kalau pemain ratusan
