# Page-by-Page Layout Corrections
### Applies on top of DESIGN_SYSTEM.md and UI_REVIEW_NOTES_V2.md — this file defines what content belongs on each page and how it should be laid out, correcting the current implementation shown in the reviewed screenshots.

## Cross-cutting requirement: scroll-to-top on re-tap of active nav item
Standard mobile pattern (documented in iOS Human Interface Guidelines, also standard on Android): tapping a bottom-nav item that is **already the active/current page** should scroll that page's content back to the top — not merely do nothing, and not re-navigate/reload.

**Implementation guidance**: this depends on the same reliable "is this the current route" detection needed to fix the nav active-state bug (`UI_REVIEW_NOTES_V2.md` item 1) — fix both together.
- Use `usePathname()` to compare the nav item's target route against the current route.
- If the tapped item's route === current route: intercept the tap (`preventDefault` on the Link, or use a button instead of a Link for this case) and call `window.scrollTo({ top: 0, behavior: 'smooth' })` (or scroll the specific scrollable container if the page uses one, not `window`, depending on the layout's actual scroll owner).
- If the tapped item's route !== current route: normal navigation, no special handling.

---

## Beranda (Dashboard)
**Purpose**: answer "how am I doing this month?" in under 2 seconds of looking at the screen.

**Corrected content, top to bottom:**
1. **Compact greeting row** — single line, `--text-body` (15px), not a display-scale heading: e.g. "Halo, Jomen 👋" with household name as small `--text-caption` text beside/below it. Remove the current two-line giant "Halo, jomenpardede." display heading entirely — it competes with the balance card for visual priority, which contradicts the design system's own "biggest element = the number" principle.
2. **Remove the "+ Catat transaksi" button** — redundant with the always-present center FAB (per `UI_REVIEW_NOTES_V2.md` item 2).
3. **"Sisa Bulan Ini" hero card** (keep, this is correct) — but trim its body copy: drop the explanatory sentence ("Perbandingan dari pemasukan dan pengeluaran yang tercatat.") once the user is past onboarding — a first-time tooltip/empty-state is a better place for explanation than permanent card copy on every visit. Keep the number, keep "Kelola akun →" as a convenience shortcut into Akun (this is a link, not a duplicated UI block, so it's fine to keep).
4. **Pemasukan / Pengeluaran two-column cards** (keep, already good — matches the pattern in Images 2–3).
5. **"Aktivitas Terbaru"** — last 3–5 transactions with a "Lihat semua" link to Riwayat (keep).
6. Tighten vertical spacing between all of the above to the 12px rhythm defined in `DESIGN_SYSTEM.md` Section 3 — current spacing is visibly larger than that.

---

## Akun
**Purpose**: see total money across all wallets, and manage the list of wallets. Primary content is the **list**, not the add-form.

**Corrected content, top to bottom:**
1. **Compact heading**: "Akun" at `--text-heading` (20px), not display scale. One-line subtitle, small (`--text-caption`).
2. **"Total Saldo Tercatat" hero card** (keep — this is correct and matches the big-number principle).
3. **Reorder — list first, add-form second**: currently the always-expanded "Hubungkan akun secara manual" form sits above the actual account list, pushing the primary content (the list of existing accounts, which is why someone visits this page) below the fold. Correct order:
   a. Account list (Bersama - Cash, Mama - BCA Debit, etc.) immediately after the hero card
   b. A small **"+ Tambah Akun"** button (not a permanently-expanded form) that opens the add-account fields in a bottom sheet/modal — matches the "bottom sheet for forms on mobile" pattern already noted as good practice, and avoids the form permanently consuming page height for users who already have their accounts set up (which will be true for almost every visit after initial onboarding).
4. Each account row: label + type + balance, consistent card styling per `DESIGN_SYSTEM.md` Section 4.

---

## Riwayat (Transaksi)
**Purpose**: find and review past transactions.

**Corrected content, top to bottom:**
1. Compact heading + subtitle (same sizing correction as above).
2. **Remove the "+ Catat transaksi" button** — same redundancy as Dashboard.
3. **Add filter chips**: Semua / Pemasukan / Pengeluaran, plus a per-person filter (household member names) — this pattern was one of the genuinely good things identified in the CatatBareng review (filter by type and by person). With a 2-person household cap already built into Increment 1, this is a small, high-value addition: household members frequently want to see "what did I spend" vs "what did my partner spend" separately.
4. Transaction list — fix the "Detail" link position so it doesn't shift based on note text length (per `UI_REVIEW_NOTES_V2.md` item 9); every row should have a consistent internal layout (category+note on the left, amount+Detail consistently right-aligned, regardless of how long the note text is — truncate or wrap the note text itself, not the layout around it).

---

## Profil
**Purpose**: household identity, invite code, and account-level actions (not wallet management — that belongs to Akun).

**Corrected content, top to bottom:**
1. Compact heading + subtitle.
2. Kode Undangan card (keep — correct, core Increment 1 feature).
3. Household info card (keep).
4. **Remove the entire duplicated "Sumber uang" wallet list + add-account form** — this content belongs only on the Akun page (per `UI_REVIEW_NOTES_V2.md` item 3). If a shortcut is wanted, use a single "Kelola Akun →" link instead of re-embedding the whole feature.
5. **Verify these exist; add if missing** (not confirmed present in the reviewed screenshots):
   - **Logout button** — a Profil page without a way to sign out is a real gap, not just a style issue.
   - **Link to "Keamanan & Privasi"** — this was specified as a Phase 1 deliverable in `AI_CFO_MASTER_ROADMAP.md`'s privacy section; confirm whether it was ever built, and add the link here if the page exists (or flag it as still outstanding if it doesn't).

---

## Catat Transaksi (transaksi/baru)
**Purpose**: log one transaction as fast as possible.

**Corrected content:**
1. **Fix top safe-area overlap** (per `UI_REVIEW_NOTES_V2.md` item 4) — this is the page where it's most visible.
2. **Jumlah (amount) input should be the visually dominant element on this screen** — currently it's a normal-sized text input, no different in visual weight from Kategori/Akun/Tanggal. Since amount is the single most important piece of data being entered, give it a larger font size (e.g. `--text-display` scale, 32px, centered or prominent) — similar to how a calculator or payment-entry screen treats the amount field, and consistent with the "big number = visual anchor" principle applied here to input rather than just display.
3. **Fix placeholder color consistency** (per `UI_REVIEW_NOTES_V2.md` item 8) — "Pilih kategori" / "Pilih akun" should render in `--color-text-secondary`, matching the "0" placeholder style in Jumlah, not bold black.
4. Pengeluaran/Pemasukan toggle at top (keep, this pattern already works well).
5. Kategori, Akun, Tanggal, Catatan fields below the amount, standard form styling per `DESIGN_SYSTEM.md` Section 4.

---

## Summary of what's genuinely new in this pass (beyond the previous review notes)
- Scroll-to-top on active-tab re-tap (new cross-cutting behavior)
- Akun page: reorder so list comes before the add-form, and convert the form to a bottom sheet rather than permanently-expanded inline content
- Riwayat: add Semua/Pemasukan/Pengeluaran + per-person filter chips
- Beranda: trim hero card's explanatory body copy for repeat visits
- Catat Transaksi: make the Jumlah input visually dominant (larger type), not just fix its placeholder color
- Profil: verify Logout and Keamanan & Privasi links exist; add if missing
