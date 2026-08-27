# UI/UX Review — Post Design-System Implementation
### Based on 9 screenshots of the live PWA (Dashboard, Akun, Riwayat, Profil, Catat Transaksi). Prioritized by severity.

**Process note first**: `PROGRESS_LOG.md` has no entry for the session that implemented `DESIGN_SYSTEM.md` — this violates the mandatory end-of-session logging rule in `AGENTS.md`. Add a retroactive entry before continuing, and enforce this going forward.

---

## 🔴 P0 — Bugs (behavior is wrong, not just visual taste)

### 1. Bottom nav "active" indicator disappears after scrolling
**Symptom observed**: navigating to a tab (e.g. "Akun") correctly highlights it green on arrival (Image 4), but after scrolling down on that same page, the highlight reverts to gray even though the user hasn't left the page (Image 5). Same inconsistency across screenshots — Riwayat and Profil show green/active in some captures, gray in others, seemingly at random relative to scroll position.

**Diagnosis (strong hypothesis, verify against actual code)**: this is a textbook symptom of using the CSS `:active` pseudo-class (which only applies while an element is being actively pressed/tapped, and releases on scroll or touch-cancel) instead of deriving the highlighted tab from the actual current route. If the nav component's active styling is conditioned on `:active` or a transient press/touch state rather than `usePathname()` (Next.js) compared against each tab's route, this exact symptom results.

**Fix**: the active tab's styling must be derived from `usePathname()` (or equivalent route-matching logic) compared against each nav item's target path, applied as a persistent class/style — not from any hover/press/touch pseudo-state. This should hold regardless of scroll position, scroll direction, or how long the user stays on the page.

### 2. Redundant "+ Catat transaksi" button on multiple pages
Both the Dashboard (Image 1) and Riwayat/Transaksi page (Image 6) have a full-width "+ Catat transaksi" button — but the center floating "+" button in the bottom nav is **always visible on every page** and does the same thing. This is the exact redundancy flagged in the original request.

**Fix**: remove the inline "+ Catat transaksi" button from both Dashboard and Riwayat. The floating center button is the single, consistent entry point for adding a transaction, everywhere in the app.

### 3. Duplicated "Akun/Sumber uang" management UI across two separate pages
The full wallet list + "Hubungkan akun secara manual" form appears **twice**: once as its own dedicated page (Images 4–5, reached via the "Akun" nav tab), and again embedded inside the Profil page (Images 7–8, under an "AKUN — Sumber uang" section). This is the same functional UI block duplicated — a maintenance burden and a confusing "which one is the real place to manage accounts?" experience.

**Fix**: keep account/wallet management in exactly one place — the dedicated "Akun" page (Images 4–5), since it already has its own nav slot per `DESIGN_SYSTEM.md`. Remove the duplicate "Sumber uang" section from Profil; Profil should only show identity/household info (Kode Undangan, Household name) — link out to "Akun" if needed, don't re-embed the whole form.

### 4. Page headings overlap the phone status bar
Most visibly on the "Catat Transaksi" page (Image 9): the "Catat transaksi" heading text renders directly behind/overlapping the phone's clock and battery icons at the top of the screen. This is a **top safe-area problem** — `DESIGN_SYSTEM.md` Section 3.5 only specified a bottom safe-area inset (for the nav bar); it's missing the equivalent top inset for page content, which matters in PWA standalone mode where there's no browser chrome pushing content down.

**Fix**: add top safe-area padding to the main content area/page header:
```css
.page-header-safe {
  padding-top: max(1rem, env(safe-area-inset-top));
}
```
Apply this wherever a page heading sits at the very top of the scrollable content — this appears to affect every page (Dashboard, Akun, Riwayat, Profil, Catat Transaksi), not just the one it's most visible on.

### 5. Test/dummy data still present in the live household
Transaction notes like "Tes", "Tes dari pwa", "tes lainnya w mama spay" (Image 6) are still showing in the actual household's transaction history. This was already flagged as an open item in `REVIEW_NOTES_INCREMENT_1.md` ("clean up old test household data") — doesn't look like it's been done yet.

**Fix**: confirm with the project owner which household/data is real vs. test, then clean up test transactions before any real dogfooding use (per the roadmap's deployment/dogfooding practice).

---

## 🟡 P1 — Visual consistency & compactness (matches the explicit request: "compact," "no redundant spacing")

### 6. Excessive vertical whitespace between heading, subtitle, and first content block
On every page (Akun, Riwayat, Profil most visibly), there's a large gap between the page title, its subtitle, and the first card below it — noticeably more than the `DESIGN_SYSTEM.md` Section 3 spacing scale (4/8/12/16/24/32, with 12px vertical rhythm between sections) would produce. This looks like arbitrary large margins/padding rather than the defined scale.

**Fix**: audit every page's top section spacing against the Section 3 scale — likely candidates for oversized values are margin/padding on the heading block and the gap before the first card.

### 7. Oversized, space-consuming page headings
"Halo, jomenpardede." wraps to two lines and dominates the top of the Dashboard (Image 1) before the user ever sees their balance. The same large-display-heading pattern repeats on Akun ("Akun"), Riwayat ("Transaksi"), and Profil ("Profil") — each consuming significant vertical space before any actual content appears.

This works against `DESIGN_SYSTEM.md`'s own stated principle: *"the single largest, boldest element on any screen should always be the most important number... never a heading or logo competing for that visual weight."* Right now the greeting text is competing with (and appearing before) the balance card for that visual priority.

**Fix**: reduce the greeting/page-title text to a single line at a smaller size (e.g. `--text-heading` 20px, not a display-scale size), so the balance card (the actual most-important element) reaches the user's eye faster and is unambiguously the visual anchor of the page.

### 8. Inconsistent placeholder styling in form dropdowns
In the "Catat Transaksi" form (Image 9), "Pilih kategori" and "Pilih akun" render in bold black text — visually indistinguishable from an actual filled-in value — while the "Jumlah" field's placeholder "0" renders in a lighter gray. A user can't tell at a glance whether the category/account fields are genuinely empty or already have a default selected.

**Fix**: all unset/placeholder states should use `--color-text-secondary` (per Section 1's muted tone), consistently, across every input type — not bold black for some fields and gray for others.

### 9. Transaction list item layout shifts when notes wrap to two lines
In Riwayat (Image 6), the "Detail" link sits on the same line as the amount for short-note transactions, but wraps to its own line below when the note text is long enough to wrap ("tes lainnya w mama spay"). This creates visually inconsistent row heights/alignment depending on note length.

**Fix**: fix the "Detail" link's position (e.g. always top-right of the row, independent of note text length) so every transaction row has a consistent internal layout regardless of note length.

### 10. Bottom nav icon choice: envelope icon for "Akun"
The "Akun" tab uses what appears to be a mail/envelope icon — not an intuitive symbol for "accounts/wallets." A wallet-shaped icon (as used in the reference apps reviewed earlier — CatatBareng, Budggt) would be clearer at a glance.

**Fix**: swap to a wallet icon for the "Akun" tab.

---

## 🟢 P2 — Minor / worth a look, not urgent

### 11. Verify Pemasukan/Pengeluaran card top-border treatment against Section 4's card spec
The colored top border on the Pemasukan (green) and Pengeluaran (red) summary cards (Images 2–3) is a reasonable semantic use of the palette, but double check the border weight/style still matches the "soft, not heavy" card treatment in `DESIGN_SYSTEM.md` Section 4 rather than a harsh accent line.

---

## Summary for Kilo Code
Fix order suggestion: **P0 items first** (nav bug, redundant buttons, duplicated Akun UI, safe-area-top, test data), since these are either bugs or directly-requested redundancy removals — then P1 (spacing/heading-size audit against the existing design tokens) — then P2 if time permits. Every fix should be checked against `DESIGN_SYSTEM.md` tokens already defined; don't introduce new ad-hoc values.
