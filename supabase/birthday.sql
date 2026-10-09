-- Template undangan ulang tahun. Jalankan di Supabase → SQL Editor (aman dijalankan ulang).
-- Tidak menyentuh tabel wedding sama sekali.

create table if not exists birthdays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  event_title text,                         -- mis. "Sera's Danger Zone" (judul tab / preview WA)
  celebrant_name text,                      -- STARRING
  genre text,
  age text,
  premiere_title text default 'THE BIRTHDAY PREMIERE',
  premiere_date text,                       -- mis. "21 NOV"
  show_time text,                           -- mis. "18.00"
  venue text,
  venue_address text,
  casting_text text default E'COME DRESSED AS YOUR FAVORITE CHARACTER!\n\nTHE SILLIER, THE BETTER.\n\nBEST COSTUME WILL STEAL THE SPOTLIGHT & WIN A SPECIAL PRIZE!',
  menu_text text default 'PLEASE CHOOSE YOUR FOOD & DRINK MENU IN ADVANCE, SO YOUR ORDER WILL BE READY TO ENJOY WHEN YOU ARRIVE.',
  -- asset gambar (bucket birthday-photos)
  cover_url text,                           -- page 1
  bg2_url text, ticket_url text, title_image_url text,                        -- page 2
  bg3_url text, casting_title_url text, casting_icon_left_url text,
  casting_icon_right_url text, chair_url text,                                -- page 3
  bg4_url text, menu_title_url text,                                          -- page 4
  bg5_url text, see_you_url text,                                             -- page 5
  bg6_url text, photo_url text                                                -- page 6
);

create table if not exists birthday_menu_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  birthday_id uuid not null references birthdays(id) on delete cascade,
  name text not null,
  order_index int not null default 0
);

create table if not exists birthday_guests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  birthday_id uuid not null references birthdays(id) on delete cascade,
  code text not null unique,                -- dipakai di URL /birthday/[code] & QR
  name text not null,                       -- tampil sebagai "Dear {name},"
  phone text,
  menu_item_id uuid references birthday_menu_items(id) on delete set null
);

-- Bucket foto baru (public), terpisah dari wedding-photos
insert into storage.buckets (id, name, public)
values ('birthday-photos', 'birthday-photos', true)
on conflict (id) do nothing;

-- Admin upload/hapus dari browser pakai anon key (sama seperti wedding-photos)
drop policy if exists "birthday-photos read" on storage.objects;
create policy "birthday-photos read" on storage.objects for select to anon, authenticated using (bucket_id = 'birthday-photos');
drop policy if exists "birthday-photos insert" on storage.objects;
create policy "birthday-photos insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'birthday-photos');
drop policy if exists "birthday-photos update" on storage.objects;
create policy "birthday-photos update" on storage.objects for update to anon, authenticated using (bucket_id = 'birthday-photos');
drop policy if exists "birthday-photos delete" on storage.objects;
create policy "birthday-photos delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'birthday-photos');

-- Tabel baru otomatis RLS aktif → izinkan akses dari aplikasi (anon key), sama seperti tabel wedding
drop policy if exists "birthdays app access" on birthdays;
create policy "birthdays app access" on birthdays for all to anon, authenticated using (true) with check (true);
drop policy if exists "birthday_menu_items app access" on birthday_menu_items;
create policy "birthday_menu_items app access" on birthday_menu_items for all to anon, authenticated using (true) with check (true);
drop policy if exists "birthday_guests app access" on birthday_guests;
create policy "birthday_guests app access" on birthday_guests for all to anon, authenticated using (true) with check (true);
