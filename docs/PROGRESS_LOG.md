# Progress Log — Tumara (AI Personal CFO)

**Purpose of this file**: a structured historical record, updated at the end of EVERY work session, by whichever AI model is currently active (Gemini, OpenAI, or otherwise). Newest entry goes at the top. This file must be read at the start of every new session (see AGENTS.md) so context carries over across model switches — including multiple sessions on the same day.

**How to use**: copy the template below for each new entry. Do not delete or edit past entries — this is an append-only historical log. Use a full timestamp (not just date) so multiple sessions on the same day are distinguishable and ordered correctly.

---

## 2026-08-24 01:14 WIB — Increment 1: success criteria review

**Model used**: GitHub Copilot

### Checkpoint 1A status
- [x] Lima tabel didefinisikan dalam migration `0001`.
- [x] RLS diterapkan dan recursion diperbaiki pada `0002`.
- [ ] Uji RLS lintas household dengan dua akun belum dilakukan dan dicatat sebagai hasil langsung.
- [x] Signup/login berhasil diuji di browser.
- [x] Pembuatan household dan membership admin tersedia.
- [x] Join via invite server-side tersedia.
- [ ] Penolakan user ketiga pada cap dua anggota belum diuji end-to-end dan belum dicatat hasil langsung.
- [x] `npm run dev` berhasil ketika hanya satu instance server berjalan.

### Checkpoint 1B status
- [x] Form transaksi manual tersedia dan transaksi tes terlihat di riwayat.
- [x] Riwayat transaksi tersedia.
- [x] Dashboard menghitung total bulan berjalan dari data nyata; bug batas tanggal sudah diperbaiki.
- [x] Format Rupiah menggunakan locale `id-ID`.
- [x] UI Increment 1 menggunakan Bahasa Indonesia.
- [ ] Uji viewport mobile formal belum dicatat.
- [x] `npm run dev`, lint, dan build berhasil pada project.

### Kesimpulan
- Increment 1 belum ditandai selesai sampai tiga item tersisa di atas benar-benar diuji: RLS lintas household, cap user ketiga, dan viewport mobile.

## 2026-08-24 01:08 WIB — Increment 1: consolidated current status

**Model used**: GitHub Copilot

### What was done
- Project Next.js 16.3.2, Supabase client/SSR, App Router, Tailwind, auth, household onboarding, accounts, transactions, dashboard, profil, dan RLS sudah dibuat.
- Remote GitHub `origin` sudah terhubung dan seluruh perubahan sudah dipush ke `main`.
- RLS recursion berhasil didiagnosis melalui REST API Supabase (`42P17`) dan diperbaiki pada migration `0002`.
- Duplicate membership ditangani pada `0003`; query membership memilih membership aktif terbaru dan household kedua untuk akun yang sama dicegah.
- Error sintaks PostgreSQL pada `0004` diperbaiki.
- Display name sekarang otomatis berasal dari `auth.users.email` untuk admin dan partner melalui `0005`; field input display name sudah dihapus.
- Display name legacy seperti `jomend test` dinormalisasi melalui `0006` menjadi bagian email sebelum `@`.
- Bug dashboard Rp0 diperbaiki dengan rentang tanggal awal bulan sampai awal bulan berikutnya.
- Bug form login Network diperbaiki dengan `allowedDevOrigins` dan fallback `POST`; login Network sudah diuji dengan URL tetap bersih dan field tetap terisi saat kredensial salah.
- Bug async `event.currentTarget.reset()` pada form account diperbaiki.

### Key decisions made
- Email login tidak diduplikasi ke tabel publik. Email, waktu pendaftaran, dan `last_sign_in_at` tetap dikelola Supabase Auth pada `auth.users`.
- Migration destruktif untuk menghapus household tidak dimasukkan ke aplikasi; cleanup manual harus dijalankan sadar di SQL Editor.
- Nama household dan display name adalah dua data berbeda. Display name baru tidak dapat diatur manual dan diturunkan server-side dari email.

### Files changed/created
- `app/`, `components/`, `lib/`, `proxy.ts`, `next.config.ts`
- `supabase/migrations/0001_increment1_core_schema.sql` sampai `0006_sync_all_display_names.sql`
- `.env.local.example`, `.gitignore`, `package.json`, `docs/PROGRESS_LOG.md`

### Verification
- `npm run lint` berhasil.
- `npm run build` berhasil.
- `npm run dev` berhasil pada `localhost:3000` dan `192.168.1.11:3000`.
- Login invalid diuji melalui browser pada Network URL; URL tidak lagi memuat kredensial.
- Supabase REST API terverifikasi normal setelah `0002`; data protected tidak diklaim terverifikasi tanpa sesi user/admin.

### Open issues / unfinished work
- Migration `0004`, `0005`, dan `0006` harus dijalankan di Supabase SQL Editor bila belum dijalankan.
- Data household duplikat lama perlu dihapus manual setelah memastikan household yang benar dan histori transaksi yang dipertahankan.
- Pengujian RLS lintas household, cap tiga anggota, dan seluruh checkpoint Increment 1 belum dinyatakan selesai secara formal.

### Next step
- Jalankan migration `0004` sampai `0006` sesuai urutan, bersihkan household duplikat dengan SQL yang disengaja, lalu lakukan uji end-to-end Auth, RLS, invite, account, transaksi, dashboard, dan mobile.

## 2026-08-24 00:06 WIB — Increment 1: RLS recursion diagnosis

**Model used**: GitHub Copilot

### What was done
- Menganalisis tiga screenshot dan alur login, pembuatan household, serta penambahan akun.
- Memverifikasi langsung REST API Supabase: request ke `categories` dan `households` mengembalikan HTTP 500 dengan kode `42P17` karena infinite recursion pada policy `household_members`.
- Membuat migration `0002_fix_rls_recursion.sql` yang mengganti subquery rekursif dengan helper `SECURITY DEFINER`.
- Memperbaiki feedback UI untuk status menyimpan, sukses membuat household, sukses menambah akun, dan error yang jelas.

### Key decisions made
- Policy tetap mengikuti scope active household dari kontrak; hanya mekanisme lookup membership yang dipindahkan ke helper aman agar tidak memanggil policy tabel yang sama.

### Files changed/created
- `supabase/migrations/0002_fix_rls_recursion.sql`
- `components/auth/HouseholdSetup.tsx`
- `components/profile/AccountSetup.tsx`
- `app/(main)/dashboard/page.tsx`
- `app/globals.css`

### Open issues / unfinished work
- Migration `0002` belum dijalankan ke project Supabase karena Supabase CLI tidak tersedia lokal.
- Setelah migration dijalankan, perlu refresh aplikasi dan menguji household/account yang sudah ada.

### Next step
- Jalankan isi `0002_fix_rls_recursion.sql` di Supabase SQL Editor, lalu uji ulang Profil, pembuatan household, penambahan akun, dan RLS.

## 2026-08-24 00:20 WIB — Increment 1: duplicate membership fix

**Model used**: GitHub Copilot

### What was done
- Memverifikasi endpoint Supabase kembali normal setelah `0002` diterapkan.
- Menemukan penyebab UI tetap kosong setelah household dibuat dua kali: `.maybeSingle()` gagal saat user memiliki lebih dari satu membership aktif, sehingga data dibaca sebagai `null`.
- Semua query membership kini memilih membership aktif terbaru secara deterministik.
- Fungsi pembuatan household kini menolak household kedua untuk akun yang sama.
- Form akun tidak lagi mengirim UUID kosong dan menampilkan alasan yang jelas bila household belum tersedia.

### Key decisions made
- Membership lama tidak dihapus otomatis karena data tersebut berpotensi memiliki histori; aplikasi memilih membership aktif terbaru sampai data dibersihkan secara sadar.

### Files changed/created
- `supabase/migrations/0003_handle_duplicate_memberships.sql`
- `app/(main)/dashboard/page.tsx`
- `app/(main)/profil/page.tsx`
- `app/(main)/transaksi/page.tsx`
- `app/(main)/transaksi/baru/page.tsx`
- `components/auth/HouseholdSetup.tsx`
- `components/profile/AccountSetup.tsx`

### Open issues / unfinished work
- Migration `0003` harus dijalankan di Supabase SQL Editor.
- Duplikasi household lama belum dihapus; perlu ditinjau berdasarkan membership dan histori transaksi.

### Next step
- Jalankan `0003_handle_duplicate_memberships.sql`, refresh/login ulang, lalu pastikan Profil menampilkan household aktif dan akun berhasil ditambahkan.

## 2026-08-24 01:08 WIB — Increment 1: automatic email display names

**Model used**: GitHub Copilot

### What was done
- Menghapus field input display name dari onboarding.
- Admin dan partner sekarang mendapat display name otomatis dari bagian email sebelum karakter `@`, diproses server-side melalui `auth.users`.
- Menambahkan `0005_auto_display_names.sql` untuk mengganti signature RPC create/join household.
- Menyelaraskan tipe database RPC dengan signature baru.

### Key decisions made
- Email login tersimpan di Supabase Auth `auth.users.email`; tabel publik hanya menyimpan display name hasil turunan, bukan password.

### Open issues / unfinished work
- `0005_auto_display_names.sql` belum dijalankan di Supabase SQL Editor.

### Next step
- Jalankan migration `0005` setelah `0004`, lalu buat/join household baru atau refresh data membership lama.

## 2026-08-24 01:20 WIB — Increment 1: normalize legacy display names

**Model used**: GitHub Copilot

### What was done
- Menambahkan `0006_sync_all_display_names.sql` untuk mengubah seluruh display name membership lama menjadi bagian email sebelum `@`.
- Dengan ini nilai lama seperti `jomend test` akan menjadi `jomend.pardede` jika email akun tersebut memang `jomend.pardede@...`.

### Key decisions made
- Email tidak diduplikasi ke tabel publik baru. Supabase Auth sudah menyimpan email terdaftar dan metadata login pada `auth.users`, termasuk `last_sign_in_at`.
- Penambahan tabel statistik email berada di luar schema Increment 1 dan berisiko membuat data Auth tidak sinkron.

### Next step
- Jalankan migration `0006` di Supabase SQL Editor, lalu query `auth.users` untuk statistik internal menggunakan akses admin.

## 2026-08-24 00:28 WIB — Increment 1: login form reliability fix

**Model used**: GitHub Copilot

### What was done
- Mereproduksi login dengan Enter di browser; handler dapat menampilkan error dan mempertahankan field.
- Menambahkan state input dan `try/catch/finally` pada form Auth agar field tidak hilang dan error koneksi tidak diam.
- Mengubah error login Supabase menjadi pesan Bahasa Indonesia.
- Memperbaiki bug async `event.currentTarget` pada form akun yang dapat menyebabkan `reset()` membaca `null`.

### Open issues / unfinished work
- URL pada screenshot memuat kredensial sebagai query string; password akun tersebut harus segera diganti.

### Next step
- Uji login dengan password baru, lalu lanjutkan verifikasi alur dashboard dan transaksi.

## 2026-08-24 00:51 WIB — Increment 1: LAN login delivery fix

**Model used**: GitHub Copilot

### What was done
- Log Next.js mengonfirmasi resource dev diblokir untuk origin `192.168.1.11`, sehingga browser Network tidak memuat JavaScript dan form fallback mengirim kredensial ke query string.
- Menambahkan `allowedDevOrigins` untuk akses LAN pada `next.config.ts`.
- Memisahkan input nama tampilan admin dari nama household saat onboarding.
- Menambahkan migration perbaikan nama tampilan legacy admin.
- Menambahkan fallback `POST` pada form login agar kredensial tidak pernah jatuh ke URL GET.

### Verification
- Login invalid diuji pada `http://192.168.1.11:3000/login`: URL tetap bersih, field tetap terisi, dan pesan `Email atau kata sandi tidak sesuai.` tampil.
- `npm run lint` dan `npm run build` berhasil.

### Next step
- Restart server dev, lalu uji login Network dengan password baru dan lanjutkan pengujian transaksi/dashboard.

## 2026-08-24 01:02 WIB — Increment 1: legacy display-name migration syntax

**Model used**: GitHub Copilot

### What was done
- Memperbaiki error PostgreSQL `42P01` pada `0004_fix_legacy_display_names.sql`; target alias `members` kini hanya direferensikan di `WHERE`.
- Memastikan onboarding baru mengirim `display_name` terpisah untuk admin dan partner, sementara nama household dikirim melalui field tersendiri.

### Next step
- Jalankan ulang isi `0004_fix_legacy_display_names.sql` di Supabase SQL Editor, lalu pastikan setiap membership memiliki display name yang sesuai.

## 2026-08-24 00:33 WIB — Increment 1: dashboard month totals fix

**Model used**: GitHub Copilot

### What was done
- Menemukan filter dashboard memakai batas akhir `${prefix}-32`, sehingga transaksi bulan berjalan tidak ikut terambil dan total tampil Rp0.
- Mengganti filter dengan rentang tanggal `[awal bulan, awal bulan berikutnya)` yang valid, termasuk saat pergantian tahun.
- Dashboard dibuat dinamis agar tidak menyajikan hasil lama setelah transaksi ditambahkan.
- Error query agregasi kini menampilkan kendala, bukan angka nol palsu.

### Open issues / unfinished work
- Penghapusan semua household lama harus dijalankan manual sekali di Supabase SQL Editor menggunakan hak database owner/service role; tidak dimasukkan ke migration aplikasi karena bersifat destruktif.

### Next step
- Jalankan SQL cleanup household, buat satu household baru, tambah akun dan transaksi, lalu pastikan dashboard menghitung total bulan berjalan.

## Entry template (copy this for a new entry)

```
## [YYYY-MM-DD HH:MM timezone] — Increment X: [Increment Name]

**Model used**: [e.g. Gemini 2.5 Pro / GPT-5 / etc. — be specific, not just the provider name]
**Session duration** (optional): [e.g. ~45 min]

### What was done
- (bullet points, concise)

### Key decisions made
- (e.g. schema structure choices, trade-offs taken — including any deviation from the roadmap and why)

### Files changed/created
- (list of main files/folders)

### Open issues / unfinished work
- (what still needs doing, known bugs, etc.)

### Next step
- (concrete plan for the next session)
```

**Timestamp format note**: use `YYYY-MM-DD HH:MM` plus timezone (e.g. `2026-08-22 14:30 WIB`). Get the current timestamp from the system clock at the time of writing the entry — do not estimate or leave it blank.

---

## 2026-08-23 23:08 WIB — Increment 1: Core Tracker

**Model used**: GitHub Copilot

### What was done
- Scaffolding Next.js 16.3.2 dengan TypeScript, App Router, Tailwind CSS, dan ESLint.
- Menambahkan Supabase JS client dan SSR adapter.
- Membuat `.env.local` berisi kredensial Supabase dan `.env.local.example` dengan hanya dua variabel Increment 1.
- Membuat migration `0001_increment1_core_schema.sql` berisi lima tabel, seed kategori, RLS, dan fungsi atomik pembuatan/join household.
- Membuat UI Bahasa Indonesia untuk login, signup, onboarding household, dashboard, akun, transaksi, riwayat, dan profil.
- Menambahkan batas anggota terpusat `MAX_HOUSEHOLD_MEMBERS = 2`.

### Key decisions made
- Pembuatan household memakai fungsi database `SECURITY DEFINER` agar insert household dan membership atomik di bawah RLS.
- Join memakai API route server-side dan fungsi database yang memvalidasi kode serta jumlah anggota aktif.
- RLS dan flow Supabase belum dapat diuji end-to-end karena migration belum dijalankan ke project Supabase.

### Files changed/created
- `app/`, `components/`, `lib/`, `supabase/`, `.env.local.example`, `.gitignore`, `package.json`.

### Open issues / unfinished work
- Checkpoint 1A belum terverifikasi: migration belum diterapkan, signup/login dan RLS cross-household belum diuji dengan dua akun, cap anggota belum diuji langsung.
- Checkpoint 1B belum terverifikasi terhadap database nyata dan belum diuji pada viewport mobile.
- GitHub remote sudah dikonfigurasi sebagai `origin` dan fondasi sudah dipush ke branch `main` setelah menggabungkan commit awal remote.

### Next step
- Jalankan migration ke project Supabase, lakukan pengujian Auth/RLS/invite end-to-end, lalu push hanya setelah Checkpoint 1A terverifikasi penuh.

The first entry will be added once Increment 1 (Core Tracker — see `/docs/AI_CFO_MASTER_ROADMAP.md`) begins. Until the first entry exists, `/docs/AI_CFO_MASTER_ROADMAP.md` is the primary starting-point reference.
