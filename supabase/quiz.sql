-- Game kuis ala live quiz (host di layar besar, tamu jawab di HP).
-- Jalankan di Supabase → SQL Editor (aman dijalankan ulang). Tidak menyentuh tabel wedding.

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  pin text not null unique,                       -- 6 digit, diketik pemain untuk join
  questions jsonb not null default '[]',          -- [{ q, options: [4 teks], correct: 0-3, time: detik }]
  status text not null default 'lobby',           -- lobby / question / reveal / ended
  current_index int not null default -1
);

create table if not exists quiz_players (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  name text not null,
  unique (quiz_id, name)
);

create table if not exists quiz_answers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  player_id uuid not null references quiz_players(id) on delete cascade,
  question_index int not null,
  choice int not null,
  points int not null default 0,
  unique (player_id, question_index)              -- 1 jawaban per soal
);

-- RLS aktif → izinkan akses dari aplikasi (anon key), sama seperti tabel lain
alter table quizzes enable row level security;
alter table quiz_players enable row level security;
alter table quiz_answers enable row level security;
drop policy if exists "quizzes app access" on quizzes;
create policy "quizzes app access" on quizzes for all to anon, authenticated using (true) with check (true);
drop policy if exists "quiz_players app access" on quiz_players;
create policy "quiz_players app access" on quiz_players for all to anon, authenticated using (true) with check (true);
drop policy if exists "quiz_answers app access" on quiz_answers;
create policy "quiz_answers app access" on quiz_answers for all to anon, authenticated using (true) with check (true);
