# Progress Log — Tumara (AI Personal CFO)

**Purpose of this file**: a structured historical record, updated at the end of EVERY work session, by whichever AI model is currently active (Gemini, OpenAI, or otherwise). Newest entry goes at the top. This file must be read at the start of every new session (see AGENTS.md) so context carries over across model switches — including multiple sessions on the same day.

**How to use**: copy the template below for each new entry. Do not delete or edit past entries — this is an append-only historical log. Use a full timestamp (not just date) so multiple sessions on the same day are distinguishable and ordered correctly.

---

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
