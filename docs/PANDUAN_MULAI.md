# Panduan Mulai — Tumara (AI Personal CFO)

Dokumen ini adalah rangkuman lengkap semua langkah yang perlu dilakukan untuk mulai development, dari instalasi sampai prompt yang harus di-paste ke Kilo Code. Ikuti urutan dari atas ke bawah.

---

## Bagian 1 — Checklist Prasyarat (sebelum mulai)

- [ ] Node.js terinstall
- [ ] VS Code terinstall
- [ ] Extension **Kilo Code** terinstall di VS Code
- [ ] API key **Gemini** sudah ditambahkan di pengaturan Kilo Code
- [ ] API key **OpenAI** sudah ditambahkan di pengaturan Kilo Code
- [ ] Akun **Supabase** sudah dibuat (project baru sudah/akan dibuat di Bagian 3)
- [ ] Akun **GitHub** aktif, siap buat repo baru

---

## Bagian 2 — Instalasi (kalau belum ada)

### 2.1 Install Node.js (MacBook Pro M1)
Cara paling simpel:
1. Buka [nodejs.org](https://nodejs.org)
2. Download versi **LTS**
3. Buka file `.pkg`, ikuti wizard install
4. Verifikasi di Terminal:
   ```bash
   node -v
   npm -v
   ```
   Harus muncul nomor versi, bukan error "command not found"

### 2.2 Install VS Code
Download dari [code.visualstudio.com](https://code.visualstudio.com) kalau belum ada.

### 2.3 Install Kilo Code
1. Buka VS Code → tab Extensions (ikon kotak di sidebar kiri)
2. Cari "Kilo Code" → Install
3. Buka pengaturan Kilo Code → masukkan API key Gemini dan API key OpenAI

---

## Bagian 3 — Siapkan Akun & Kredensial

### 3.1 Buat project Supabase
1. Buka [supabase.com](https://supabase.com) → sign up/login
2. Buat project baru (pilih region Singapore kalau tersedia, paling dekat ke Indonesia)
3. Setelah project jadi, buka **Project Settings → API**
4. Catat dua nilai ini (akan dibutuhkan nanti):
   - **Project URL**
   - **anon public key**

### 3.2 Buat repo GitHub kosong
1. Buka [github.com/new](https://github.com/new)
2. Buat repository baru (kosong, tanpa README/gitignore otomatis biar bersih)
3. Catat URL repo-nya (format: `https://github.com/username/nama-repo.git`)

**Catatan**: Gemini & OpenAI API key untuk kebutuhan development (Kilo Code) sudah kamu siapkan di Bagian 2.3 — itu terpisah dari `GEMINI_API_KEY` yang nanti dipakai fitur AI di dalam aplikasinya sendiri (baru dibutuhkan mulai Increment 2, bukan sekarang).

---

## Bagian 4 — Siapkan Folder Project

1. Buat folder project kosong di komputer, misal `ai-personal-cfo/`
2. Buka folder itu di VS Code (`File → Open Folder...`)
3. Download 4 file berikut (sudah dibuat di sesi sebelumnya) dan taruh sesuai struktur ini:

```
ai-personal-cfo/
├── AGENTS.md                          ← taruh di root
└── docs/
    ├── AI_CFO_MASTER_ROADMAP.md       ← taruh di dalam folder docs/
    ├── INCREMENT_1_SPEC.md            ← taruh di dalam folder docs/
    └── PROGRESS_LOG.md                ← taruh di dalam folder docs/
```

Empat file ini adalah "kontrak" yang akan dibaca Kilo Code di setiap sesi — pastikan sudah di tempat yang benar sebelum lanjut ke Bagian 5.

---

## Bagian 5 — Sesi Pertama: Prompt Kickoff

1. Buka Kilo Code di VS Code (biasanya lewat ikon di sidebar atau Command Palette)
2. Mulai sesi chat baru
3. **Copy-paste prompt di bawah ini persis apa adanya**:

```
You are starting a fresh build session for "Tumara" (an AI Personal CFO project).

STEP 0 — MANDATORY CONTEXT LOADING
1. Read /AGENTS.md in full.
2. Read /docs/PROGRESS_LOG.md in full (currently empty — that's expected for a first session).
3. Read /docs/INCREMENT_1_SPEC.md in full. This is a BINDING CONTRACT for what to build right now — follow it exactly, do not deviate, do not add scope from later increments even if you see it referenced in the roadmap.
4. Read /docs/AI_CFO_MASTER_ROADMAP.md only for background context — do NOT implement anything from it directly. If INCREMENT_1_SPEC.md and the roadmap ever conflict, INCREMENT_1_SPEC.md wins.
5. If any of these files are missing, STOP and tell me before proceeding.

STEP 1 — ENVIRONMENT SETUP
Per INCREMENT_1_SPEC.md Section 1: only Supabase credentials are needed for this increment. Do NOT ask me for Gemini or OpenAI API keys — they are not used anywhere in Increment 1.
1. Initialize git if not already done.
2. Scaffold Next.js (TypeScript, App Router, Tailwind CSS).
3. Install the Supabase JS client.
4. Create `.env.local.example` with placeholders for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY only.
5. If `.env.local` doesn't exist with real values, STOP and ask me only for: my Supabase Project URL and anon public key. Wait for my response.
6. Verify `.gitignore` excludes `.env.local` before any commit is made. Confirm this check passed.

STEP 2 — GIT REMOTE
Ask me for the GitHub repo URL, connect it as `origin`. Do not push yet — see Section 8 of INCREMENT_1_SPEC.md for exactly when to push.

STEP 3 — BUILD CHECKPOINT 1A
Follow INCREMENT_1_SPEC.md Sections 2, 3, 4 exactly (schema, RLS, invite mechanism). Do not proceed to Checkpoint 1B until every box in Section 6's Checkpoint 1A checklist is genuinely verified — including actually testing that RLS blocks cross-household access, not just trusting the SQL looks right. Push to remote once 1A is fully done, per Section 8.

STEP 4 — BUILD CHECKPOINT 1B
Follow INCREMENT_1_SPEC.md Sections 5 and 6 (Checkpoint 1B). Push to remote once fully done, per Section 8.

STEP 5 — END OF SESSION
Update /docs/PROGRESS_LOG.md per its template (full timestamp, specific model name, what's done, what's not, next step). If you stopped mid-checkpoint, say exactly which checklist items are/aren't done so the next session knows precisely where to resume. Commit this update; push only if it coincides with a checkpoint push per Section 8.

Begin with Step 0 now.
```

4. Kilo Code akan mulai baca file-file itu, lalu **berhenti sejenak** untuk minta:
   - Project URL Supabase + anon key (dari Bagian 3.1)
   - URL repo GitHub (dari Bagian 3.2)
5. Kasih nilai-nilai itu saat diminta, lalu biarkan Kilo lanjut bekerja

---

## Bagian 6 — Selama Sesi Berjalan (yang perlu diperhatikan)

- Kilo akan bekerja melalui Checkpoint 1A dulu (schema, auth, RLS, invite code), baru Checkpoint 1B (form transaksi + dashboard)
- Kalau Kilo minta konfirmasi sebelum push pertama kali — **cek dulu** perubahan yang mau di-push (boleh minta Kilo tunjukkan `git diff`/`git status` sebelum approve)
- Kalau sesi harus dihentikan di tengah jalan (belum selesai satu checkpoint), itu tidak masalah — instruksinya sudah mengatur supaya progress tetap ter-commit lokal dan tercatat di PROGRESS_LOG.md

---

## Bagian 7 — Akhir Sesi (checklist manual, jangan lewati)

Sebelum benar-benar menutup VS Code:
- [ ] Tanya eksplisit ke Kilo: *"Apakah PROGRESS_LOG.md sudah diupdate?"*
- [ ] Cek sendiri isi `docs/PROGRESS_LOG.md` — pastikan entri baru benar-benar ada, bukan cuma diklaim
- [ ] Jalankan `git log` dan `git status` sendiri di Terminal — pastikan commit benar-benar ada dan (kalau sudah checkpoint stabil) sudah ter-push ke GitHub
- [ ] Kalau baru selesai Checkpoint 1A/1B, cek juga langsung ke repo GitHub di browser — pastikan kode benar-benar muncul di sana

---

## Bagian 8 — Mulai Sesi Berikutnya (setelah sesi pertama)

Untuk sesi lanjutan (boleh ganti model Gemini ↔ OpenAI kapan saja), prompt cukup singkat:

```
Read /AGENTS.md and /docs/PROGRESS_LOG.md before starting. Continue from the "Next step" noted in the latest PROGRESS_LOG.md entry. If that entry references an INCREMENT_<N>_SPEC.md, read that file too before doing anything — treat it as the binding contract for current scope.
```

---

## Bagian 9 — Hal-hal yang Perlu Diwaspadai (pengingat, bukan blocker)

- **Cek batas/limit penggunaan** di dashboard OpenAI (platform.openai.com → Billing) dan Google AI Studio — supaya tidak kaget kalau sesi berjalan lama
- **Jangan pernah commit `.env.local`** — kalau ragu, cek isinya tidak muncul saat `git status` sebelum commit apa pun
- Kalau di tengah jalan Kilo Code terlihat mau mengambil keputusan besar yang tidak ada di `INCREMENT_1_SPEC.md` (misal menambah tabel baru, mengubah struktur folder) — **stop dan tanya balik**, jangan biarkan lanjut begitu saja
- Increment 1 selesai = **kedua** checkpoint (1A dan 1B) tercentang semua di checklist `INCREMENT_1_SPEC.md` Bagian 6 — bukan "kelihatannya sudah jalan"
