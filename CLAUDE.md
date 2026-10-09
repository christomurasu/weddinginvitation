@AGENTS.md

# CLAUDE.md

Panduan untuk Claude Code saat mengembangkan proyek ini. Baca file ini lebih dulu sebelum mengerjakan tugas apa pun.

---

## 1. Project Overview

**sfinvitation.id** — SaaS undangan pernikahan digital (multi-wedding). Setiap tamu dapat link unik, melihat undangan personal, melakukan RSVP, mendapat QR code, dan di-check-in pada hari H lewat scanner.

- **Domain produksi:** https://sfinvitation.id
- **Repo:** `christomurasu/weddinginvitation` (GitHub)
- **Hosting:** Vercel (auto-deploy setiap `git push` ke branch utama)
- **Owner:** iOS developer yang sedang belajar web dev — jelaskan hal web dengan ringkas bila perlu.

**Wedding utama (client pertama):** Christopher Sonny Pratama & Felyn Karina Bingtoyo — 9 Agustus 2026.
**Wedding ke-2:** duplikasi config married owner sendiri (slug `sonny-felyn-misa-syukur`), tanpa daftar undangan.

---

## 2. Tech Stack

- **Next.js 16** (App Router) + **TypeScript** — API bisa beda dari pengetahuan lama; cek `node_modules/next/dist/docs/` sebelum menulis kode (lihat `AGENTS.md`).
- **React 19** — Server Components default; Client Components pakai `"use client"`. Pola `forwardRef` + `useImperativeHandle` dipakai (mis. `RSVPSection` expose method `save()`).
- **Supabase** — PostgreSQL + Storage (bucket `wedding-photos`, public).
- **Vercel** — deploy otomatis dari GitHub.
- **Auth admin** — cookie `admin_session` harus sama dengan `process.env.ADMIN_SECRET`; `middleware.ts` melindungi route `/events/*` (URL lama `/weddings/*` di-redirect via `next.config.ts`).

**Catatan konfigurasi:**
- `next.config.ts` memakai `typescript: { ignoreBuildErrors: true }` — build tetap jalan walau ada TS error. **Jangan andalkan ini**; tetap perbaiki error nyata.
- Halaman yang menampilkan data dinamis **wajib** `export const dynamic = "force-dynamic"` agar tidak kena static cache Vercel (lihat §9). Saat ini dipasang di `app/events/page.tsx`, `app/birthday/[code]`, `app/events/birthday/[slug]`.

---

## 3. Environment Variables

Jangan pernah commit secret. Variabel yang dipakai:

| Variable | Kegunaan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase (client-side) |
| `ADMIN_SECRET` | Nilai yang dicocokkan dengan cookie `admin_session` untuk login admin |

> ⚠️ **Keamanan:** password database Supabase pernah ter-expose di chat sebelumnya dan **harus sudah di-reset** (Supabase → Settings → Database → Reset database password). Jangan menuliskan password DB, connection string, atau key apa pun di file yang di-commit.

---

## 4. Database Schema (Supabase / PostgreSQL)

### Table: `weddings`
Konfigurasi per pernikahan.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | dipakai di URL `/events/weddings/[slug]/...` |
| `partner1` / `partner2` | text | nama mempelai |
| `date` | date/text | tanggal acara |
| `couple_photo_url` | text | foto mempelai (juga dipakai sbg OG image) |
| `cover_photo_url` | text | foto cover (background scanner & cover page) |
| `logo_url` | text | logo di cover |
| `frame_url` | text | frame foto polaroid intro album |
| `verse` / `verse_source` | text | ayat & sumber di cover |
| `show_qr` | bool | default true. Jika false → QR code tidak dimunculkan (tidak ada scan) |
| venue pemberkatan: `ceremony_*` | text | venue/alamat/jam/maps pemberkatan |
| venue resepsi: `reception_*` | text | venue/alamat/jam/maps resepsi |
| foto intro/album, teks overlay, dll. | text | field-field foto & teks |

### Table: `guests`
Satu baris per tamu/undangan.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | PK |
| `wedding_id` | uuid | FK ke `weddings` |
| `code` | text | kode unik undangan (dipakai di URL & QR) |
| `name` | text | nama tamu |
| `greeting` | text | sapaan yang tampil di undangan ("Bapak/Ibu ...") |
| `phone` | text | nomor HP (untuk link WA) |
| `table_number` | text | nomor meja |
| `max_attendees` | int | jumlah pax maksimal yang diundang (cap saat RSVP & check-in) |
| `guest_side` | text | `"groom"` (Pria/S) atau `"bride"` (Wanita/F) |
| `invitation_type` | text | `"full"` (pemberkatan + resepsi) atau `"ceremony"` (pemberkatan saja) |
| `non_kristen` | bool | jika true → tampil seperti "ceremony only" tapi data venue pakai data **resepsi** (lihat §7) |
| `language` | text | `"id"` / `"en"` — pilih format undangan & WA |
| **RSVP** | | |
| `rsvp_ceremony` | text | status RSVP pemberkatan (`"confirmed"` / `"pending"` / dll.) |
| `rsvp_reception` | text | status RSVP resepsi |
| `adults_ceremony` / `kids_ceremony` | int | jumlah pax pemberkatan |
| `adults_reception` / `kids_reception` | int | jumlah pax resepsi |
| **Check-in** | | |
| `scanned_ceremony` | bool | sudah check-in pemberkatan |
| `scanned_reception` | bool | sudah check-in resepsi |
| `checkin_number_ceremony` | text | nomor antrian check-in pemberkatan (prefix S/F — lihat §6) |
| `checkin_number_reception` | text | nomor antrian check-in resepsi |
| `angpao_received` | bool | status angpao (ditampilkan di scanner mode resepsi) |

### Table: `wishes`
Ucapan dari tamu.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | uuid | PK |
| `wedding_id` | uuid | FK |
| `guest_name` | text | **diisi dari `greeting`** tamu (bukan `name`) |
| `message` | text | isi ucapan |
| `created_at` | timestamp | |

### Table: `wedding_photos`
Foto-foto galeri/album per wedding (bucket `wedding-photos`).

---

## 5. Struktur File / Folder

```
app/
  layout.tsx                      # metadata root: metadataBase, icons (Supabase logo), OG/twitter (SF_for_link.png)
  invitation-page/[code]/
    page.tsx                      # router undangan utama + generateMetadata (title/icons/OG dari couple_photo_url)
    Wishform.tsx                  # (f kecil) RSVPSection + textarea ucapan; submit = save RSVP + insert wish
    RSVPSection.tsx               # forwardRef, expose save(); default Yes +1 dewasa saat pending
    RSVPPopupWrapper.tsx / RSVPPopUp.tsx  # popup QR (Show QR Code / Back to Invitation) — perhatikan "U" besar di nama file
    Translations.ts               # t.en / t.id
    CoverPage.tsx, Gallery.tsx, QRCodeDisplay.tsx, dll.
  events/
    page.tsx                      # daftar semua event: wedding + birthday (WAJIB force-dynamic)
    birthday/new, birthday/[slug] # admin birthday (lihat §13)
    weddings/new/page.tsx         # buat wedding baru
    weddings/[slug]/
      dashboard/
        page.tsx                  # stats (tabel) + link Scanner/Preview/Cek Meja
        GuestTable.tsx            # tabel tamu: pagination(20), search, filter, sort, export CSV
        WeddingAddGuestForm.tsx   # tab Manual | CSV
        CSVImport.tsx             # import CSV (incl. guest_side, non_kristen)
      scanner/page.tsx            # scanner check-in (mode pemberkatan/resepsi)
  pagar-ayu/[slug]/
    page.tsx + PagarAyuSearch.tsx # lookup read-only no-login (cari nama → nomor meja)
  login/ + api/login, api/logout  # login admin (set/hapus cookie admin_session)
  lib/supabase.ts                 # client Supabase
  dashboard/page.tsx              # legacy: hanya redirect ke /events
  scanner/page.tsx                # legacy: scanner versi lama (pakai yang di events/weddings/[slug]/scanner)
middleware.ts                     # proteksi /events/* via cookie admin_session
public/                           # SF_for_link.png, no-angpao.png, no-gift.png, fonts/, dll.
```

---

## 6. Logika Nomor Check-in (S/F)

Saat tamu di-check-in lewat scanner, sistem meng-generate nomor antrian:

- **Prefix berdasarkan sisi tamu:** `guest.guest_side === "bride"` → `"F"`, selain itu → `"S"`.
- **Counter gabungan per sisi, lintas event:** ambil angka maksimum yang sudah terpakai di **kedua** kolom (`checkin_number_ceremony` dan `checkin_number_reception`) untuk sisi tersebut, lalu +1.
- Nomor disimpan di kolom sesuai mode: `checkin_number_ceremony` (pemberkatan) atau `checkin_number_reception` (resepsi).

Contoh (sesuai yang di-approve owner): Raymond→C1, Rendy→F1, Chin→C2, Linda→F2, lalu Raymond datang resepsi→C3 (counter lanjut, bukan reset). *(Catatan: contoh owner memakai "C" untuk groom; implementasi final memakai prefix **S** untuk groom, **F** untuk bride — ikuti kode yang ada.)*

---

## 7. Flag & Behavior Khusus

### `non_kristen` (per tamu)
Di `invitation-page/[code]/page.tsx`:
```
isNonKristen     = guest.non_kristen === true
isCeremonyOnly   = guest.invitation_type === "ceremony" || isNonKristen
```
Saat non-Kristen: variabel `cerImage/cerVenue/cerAddress/cerTime/cerMaps` **di-swap ke data `reception_*`**, dan section resepsi disembunyikan `{!isCeremonyOnly && (...)}`. Jadi tamu non-Kristen melihat satu section venue (berisi data resepsi) seolah "pemberkatan saja".

### `show_qr` (per wedding)
- `showQr = wedding.show_qr ?? true`, diteruskan ke `Wishform`.
- Jika true → setelah RSVP muncul popup QR.
- Jika false → tidak ada QR; setelah submit tampil tombol "✓ Tersimpan!" selama 3 detik.

### `invitation_type`
- `"full"` → pemberkatan + resepsi. Di scanner mode pemberkatan untuk tamu full tampil info "ℹ Tamu ini terundang juga untuk Resepsi".
- `"ceremony"` → pemberkatan saja.

### RSVP default
Saat status masih pending, default **Yes + 1 dewasa**. Status jadi `"confirmed"` **hanya** bila QR memang dimunculkan (show_qr). Pax bisa diedit, di-cap `max_attendees`.

### Catatan tanda kasih (hardcoded)
Di bawah `Wishform` ada div (mengisi sisa ruang, bukan snap-section sendiri) berisi dua ikon `/no-angpao.png` + `/no-gift.png` dan teks:
> "Ungkapan tanda kasih yang diberikan mohon berupa doa untuk kebahagiaan anak kami.
> Terima kasih"
("Terima kasih" di baris baru.) Ini sengaja hardcode.

---

## 8. Format Pesan WhatsApp

`waMessage()` di `GuestTable.tsx` adalah **function declaration** (hoisted, supaya bisa dipakai di `handleExportCSV`). Format tergantung `language`. Pakai markdown WA: `*bold*`, `_italic_`, dan `encodeURIComponent` untuk link `wa.me/62...?text=...`.

- Diawali sapaan "Dear Mr. & Mrs. {greeting}" (EN) / "Kepada Yth. Bapak/Ibu {greeting}" (ID).
- Memuat detail acara (PEMBERKATAN PERNIKAHAN / resepsi), link undangan, dan baris pengingat:
  "Harap simpan QR Code ... tunjukkan pada saat Check In." (ID & EN).
- EO ditandatangani: **Ivan — 085103949090** / "Perfect Moment Organizer" / "RSVP by SF Invitation".

> Format WA ini sudah final/di-approve owner — jangan diubah tanpa diminta.

---

## 9. Konvensi Kerja (PENTING — preferensi owner)

1. **"Jadikan basis, jangan ubah yang tidak perlu."** Bila owner paste sebuah file, perlakukan sebagai basis: ubah **hanya** bagian yang diminta, pertahankan sisanya persis.
2. **Jangan overwrite judul custom.** Owner sering menyesuaikan sendiri teks judul (mis. `{tr.holyMatrimony}`, "You are invited..."). Jangan diubah kecuali diminta.
3. **"Jangan ask, kasih saja."** Kadang owner ingin aksi langsung tanpa pertanyaan. Baca nada permintaan.
4. **`force-dynamic` untuk masalah caching.** Kalau data baru tidak muncul di produksi padahal ada di localhost → kemungkinan besar static cache; tambahkan `export const dynamic = "force-dynamic"`.
5. **Flag per-tamu / per-wedding** lebih disukai daripada hardcode bila hanya berlaku sebagian (pengecualian yang diterima: catatan tanda kasih §7 boleh hardcode).
6. **Kirim file lengkap** saat diminta benahin, bukan potongan — owner belajar web dev, lebih mudah copy file utuh.
7. **macOS case-insensitive** — hati-hati penamaan import vs nama file (`RSVPPopup` vs `RSVPPopUp`) karena produksi (Linux) case-sensitive.

---

## 10. Fitur yang Sudah Jalan

- Undangan personal per tamu (ID/EN), cover, galeri/album scrollable, intro album (1 foto PNG ukuran asli di tengah frame).
- RSVP terpisah pemberkatan & resepsi, default Yes, cap `max_attendees`.
- QR code (opsional via `show_qr`), popup "Show QR Code / Back to Invitation", auto-tampil bila sudah confirmed saat undangan dibuka.
- Ucapan (`wishes`) — list scrollable di div tengah; `guest_name` diisi dari `greeting`.
- Dashboard: stats sebagai **tabel** (Invitations, Confirmed, Pending, Declined, Pax RSVP pemberkatan/resepsi, Pax Hadir pemberkatan/resepsi).
- GuestTable: pagination 20, search (nama + greeting), filter (RSVP/tipe/sisi), sort (incl. nomor check-in numeric per-prefix), export CSV (+ baris TOTAL) dengan kolom link WA yang bisa diklik.
- Add guest: tab Manual (guest_side, invitation_type, non_kristen) & CSV import.
- Scanner: mode pemberkatan/resepsi terpisah, status "sudah scan" per mode (`scanned_ceremony`/`scanned_reception`), edit pax saat check-in, check-in tanpa RSVP via nama, nomor check-in S/F, status angpao di mode resepsi, background dari `cover_photo_url`.
- Halaman Pagar Ayu: lookup read-only tanpa login, cari nama → nomor meja + detail.
- Metadata OG/favicon untuk preview WhatsApp (perlu Facebook Debugger "Scrape Again" karena WA cache di server).

---

## 11. Deployment Flow

1. Edit kode lokal.
2. `git add` → `git commit` → `git push` ke branch utama.
3. Vercel auto-build & deploy ke https://sfinvitation.id.
4. Jika data dinamis tidak update di produksi → cek `force-dynamic` (§9.4).
5. Preview OG WhatsApp tidak update → jalankan Facebook Sharing Debugger "Scrape Again".

**Backup database:** `pg_dump` lewat **Session pooler** (host `aws-1-ap-northeast-2.pooler.supabase.com:5432`), bukan direct-connect (IPv6 sering unreachable). Pastikan versi `pg_dump` cocok dengan server (Postgres 17 → `brew install postgresql@17`, pakai `/opt/homebrew/opt/postgresql@17/bin/pg_dump`).

---

## 12. Known Issues / TODO

- Halaman wedding (dashboard / pagar-ayu / undangan) belum `force-dynamic`. Bila menampilkan data basi di produksi, tambahkan di sana.
- `CountdownBanner` punya hydration mismatch yang diabaikan owner (masih berfungsi).

---

## 13. Template Ulang Tahun (Birthday)

Template terpisah — **tidak menyentuh tabel/route wedding**. Skema di `supabase/birthday.sql` (tabel `birthdays`, `birthday_menu_items`, `birthday_guests`; bucket `birthday-photos`).

- **Undangan tamu:** `app/birthday/[code]/` — 6 page snap-scroll: cover full → tiket (Dear nama, detail, QR dari `code` via lib `qrcode` di server) → casting call → menu (search + radio, `MenuPicker` simpan `menu_item_id` langsung) → see you there → foto.
- **Admin:** pakai login yang sama, di `app/events/birthday/new` dan `app/events/birthday/[slug]` (terlindungi `middleware.ts`). Daftar `/events` berisi wedding + birthday.
- Semua asset gambar & teks per-event diatur di `EditBirthdayForm` (`TEXT_FIELDS` / `IMAGE_GROUPS`). Tambah field baru = tambah kolom di SQL + satu baris di array itu.
- Kode tamu prefix `BD-`. Format WA birthday masih sementara (`GuestManager.waMessage`).
