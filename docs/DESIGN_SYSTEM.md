# Tumara — Design System (Bibit-inspired)
### Binding reference for all UI work from this point forward. Supersedes the general "Design direction" notes in AI_CFO_MASTER_ROADMAP.md with concrete, implementable values.

## 0. Why this exists
The current UI (login/signup pages) already has the right instinct — green theme color, clean copy — but there's no systemized design language yet. This document gives Kilo Code exact tokens so results are consistent across every screen, not re-decided page by page. This is explicitly authorized to require **significant rework** of already-built screens (login, signup, dashboard, transaction list, transaction form) — visual consistency now is worth more than preserving whatever styling exists today.

## 1. Color tokens
```
--color-primary: #0F9D6E        /* main brand green — slightly brighter than current #166b53 theme-color, use for primary buttons, active states, key highlights */
--color-primary-dark: #166B53   /* current theme-color — use for headers/emphasis text on light backgrounds, and as-is for browser theme-color meta */
--color-primary-light: #E6F5EF  /* pale green tint — card backgrounds, selected states, subtle highlights */
--color-background: #FFFFFF     /* primary background — light mode is default, per AI_CFO_MASTER_ROADMAP.md Design direction */
--color-surface: #F7F9F8        /* slightly off-white for card/section backgrounds against pure white page bg */
--color-text-primary: #10231C   /* near-black with a slight green cast, for main text */
--color-text-secondary: #5B6B65 /* muted gray-green for secondary/helper text */
--color-border: #E3E8E6         /* subtle borders/dividers */
--color-error: #D64545           /* form errors, negative amounts */
--color-success: #0F9D6E         /* same as primary — positive states reuse brand green rather than a separate success color */
```
Dark mode: not built in this pass. If added later, it's a toggle (per Design direction doc), not a default — do not build dark mode as part of this task.

## 2. Typography
- Font: keep the existing Geist font already in use (per Next.js default) — do not introduce a new font family, Bibit's reference here is about layout/hierarchy, not typeface
- Scale:
```
--text-display: 32px / 700 weight   /* the one big number per screen — e.g. dashboard balance */
--text-heading: 20px / 600 weight   /* section headers, page titles */
--text-body: 15px / 400 weight      /* default body text */
--text-caption: 13px / 400 weight   /* helper text, timestamps, labels */
```
- The single largest, boldest element on any screen should always be the most important number (balance, total) — never a heading or logo competing for that visual weight.

## 3. Spacing & layout
- Base unit: 4px. Use multiples of it (4, 8, 12, 16, 24, 32) for all padding/margin/gaps — no arbitrary values.
- Page horizontal padding: 16px on mobile viewports
- Card padding: 16px internal
- Card corner radius: 16px (soft, friendly — not sharp corners, not overly rounded either)
- Vertical rhythm between cards/sections: 12px

## 3.5. Mobile PWA technical requirements (new — was missing from earlier version)
These are functional/technical requirements, not visual taste — apply regardless of the visual redesign scope below.

- **iOS safe-area support**: the bottom navigation bar must respect the iPhone home-indicator inset, or it will visually collide with it on notched/Face-ID iPhones:
  ```css
  .bottom-nav-safe {
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  }
  ```
- **Viewport meta tag** must include `viewport-fit=cover` for the safe-area CSS above to work at all:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  ```
  Verify this is set in `app/layout.tsx` — check before assuming it's already there.
- **Minimum touch target size: 44×44px** for every interactive element (buttons, tab bar icons, checkboxes) — this is a standard accessibility baseline (Apple HIG / WCAG), not optional polish.
- **Loading states for AI/OCR latency** (relevant starting Increment 2, but worth establishing the pattern now so it's consistent when built): use skeleton/shimmer placeholders during any AI parsing or receipt-scan call, not spinners or blank space — this prevents layout shift when the real content arrives. Style: a muted pulsing block matching the shape of the content it's replacing (e.g. a card-shaped skeleton for a transaction card), using `--color-surface` as the base tone, not a stark gray that clashes with the palette in Section 1.

## 4. Component patterns

### Cards
- White or `--color-surface` background, `--color-border` 1px border OR soft shadow (`0 1px 3px rgba(0,0,0,0.06)`) — not both heavy border AND heavy shadow
- Used for: transaction list items, summary stats, category breakdowns, any grouped info block
- Never present raw tabular data without card grouping — this is the core "simple despite complex data" principle from the Design direction doc

### Buttons
- Primary action: solid `--color-primary` background, white text, corner radius 12px, full-width on mobile for primary CTAs (e.g. "Catat", "Masuk", "Daftar")
- Secondary action: `--color-primary-light` background, `--color-primary-dark` text — not a plain gray/ghost button, keep it on-brand even for secondary actions
- Destructive action (if/when needed): `--color-error`, used sparingly

### The "big number" pattern (dashboard, summary cards)
- Follows the pattern already live on the login page's clean, uncluttered feel: one dominant number, supporting context in smaller `--text-caption` text below it, minimal visual noise around it (no heavy borders/icons competing with it)

### Forms (transaction entry, auth)
- Label above input, not placeholder-only labels (placeholders disappear on focus — a real accessibility/usability issue, especially for less tech-savvy users which fits our "not just tech-savvy singles" target)
- Input fields: `--color-surface` background, `--color-border` border, 12px corner radius, 12px vertical padding
- Inline validation errors in `--color-error`, directly below the relevant field — never a single generic error banner for the whole form

### Navigation

**Mobile (primary target — bottom navigation bar, 5 slots, explicitly mirroring Budggt's structure):**
```
[ Beranda ]   [ Akun ]   [  (+)  ]   [ Riwayat ]   [ Profil ]
   grid        wallet    FAB, raised    swap        person
                          --color-primary
                          circular button
```
- Slot 1 — **Beranda**: `app/(main)/dashboard/page.tsx`
- Slot 2 — **Akun**: list of the household's accounts/wallets (BCA, Cash, GoPay, etc.) — if this doesn't yet exist as its own persistent page (per PROGRESS_LOG, `AccountSetup.tsx` may currently only be part of onboarding), this pass should give it a proper home screen reachable from this nav slot, since it's a core Increment 1 concept (the `accounts` table) that deserves persistent access, not just a one-time setup step
- Slot 3 — **central floating "+" button**: raised above the bar (not flush with the other 4 icons), `--color-primary` background, white icon, opens the manual transaction entry form (`transaksi/baru`) — keep the existing Pemasukan/Pengeluaran toggle already built, do not add a Transfer option yet (out of scope until a later increment introduces transfers)
- Slot 4 — **Riwayat**: `app/(main)/transaksi/page.tsx`
- Slot 5 — **Profil**: `app/(main)/profil/page.tsx`
- Icons + Indonesian labels together underneath, not icon-only (per the accessible-labels principle already in AGENTS.md's UI principles)
- Respect the safe-area requirement from Section 3.5 above

**Desktop (`viewport >= 768px`) — left sidebar, not a top bar:**
- Logo/wordmark ("Tumara") at the top, `--color-primary-dark` accent
- Nav links, same 4 destinations as the mobile bar's non-FAB slots: Beranda, Akun, Riwayat, Profil — plus a distinct "Catat" primary button (not just relying on a floating action button, which is a mobile-specific pattern) placed near the top of the sidebar for adding a transaction
- **Do not add sidebar links for Budget, Goals, Aset, Utang, Investasi, AI Advisor, or Laporan yet** — those are Phase 4-8 features that don't exist in this codebase. Adding nav links to non-existent pages creates dead links and false product promises. When those phases are actually built, their own increment's design spec will extend this navigation — this file only covers what exists today.
- Collapsible is a nice-to-have, not required for this pass — don't spend effort on a collapse/expand mechanism unless it's trivial

## 5. Screens explicitly in scope for this redesign pass
Apply these tokens/patterns to every screen that exists so far (confirmed actual paths, per the latest PROGRESS_LOG.md entry — verify these still match the current repo state before starting):
- [ ] `/login` and `/signup` pages (including invite-code entry step) — login already has the right instinct (green theme, clean copy), align exact colors/spacing to the tokens above
- [ ] `app/(main)/dashboard/page.tsx` — Pemasukan/Pengeluaran/Sisa, this is the primary "big number" screen
- [ ] **Akun/wallets list page** — per the Navigation section above, verify whether a persistent `/akun` (or similar) page already exists. If `AccountSetup.tsx` is currently only reachable during onboarding, this pass should also create a proper persistent page for it, reachable from the bottom nav's "Akun" slot — this is a small scope addition justified by the navigation restructure, not unrelated new-feature creep
- [ ] `app/(main)/transaksi/page.tsx` (Riwayat/history) and `app/(main)/transaksi/baru/page.tsx` (manual entry form)
- [ ] `app/(main)/profil/page.tsx` — household info, invite code display
- [ ] `components/auth/HouseholdSetup.tsx` and `components/profile/AccountSetup.tsx` — these exist per PROGRESS_LOG and should follow the same tokens

Do not add new features while doing this pass — this is a visual/UX consistency pass over Increment 1's existing functionality, not new scope.

## 6. What "Bibit-inspired" does NOT mean here
- Do not copy Bibit's actual logo, illustrations, or copyrighted visual assets
- Do not copy Bibit's specific investment-product UI (fund cards, risk profile quizzes) — irrelevant to Tumara's current scope
- This is about *tone* (clean, green, simple, trustworthy, large numbers) — not a pixel-for-pixel clone

## 7. Note on conflicting external guidance (if you encounter it)
A separate document ("UI/UX Overhaul V3") was reviewed and explicitly **rejected** on several points — if Kilo Code has seen that document or anything derived from it, this section overrides it:
- **Dark mode is NOT the default.** That document claimed dark mode should be default; this is incorrect per the actual decision made (see Section 1) and contradicts the already-live production theme.
- **The exact green hex value matters — use `#166B53`/`#0F9D6E` from Section 1, not `#00B853`.** The `#00B853` value from that other document was an unverified guess at Bibit's color and, more importantly, ignores the fact that `#166b53` is **already live in production** (`theme-color` meta tag on the deployed login page). Do not shift the brand's actual green without a deliberate decision to do so — this file's Section 1 tokens are the real ones.
- **Do not build Phase 4–8 features** (Wallets/Assets/Goals/AI Advisor/Reports navigation, Bento Grid dashboard with health score + heatmap + anomaly detection, AI chat interface) as part of this design pass. That other document's scope jumps far ahead of Increment 1. This design system applies **only** to the screens listed in Section 5, which are what's actually built today. Later increments will get their own visual spec extensions when those features are actually being built — do not pre-build navigation links or empty pages for features that don't exist yet.
- **TypeScript types**: do not introduce a parallel `Transaction`/`Wallet` type shape from that document. The real schema (with `household_id`, RLS, and the category/subcategory/purpose/life_area/essentiality taxonomy) is what's already implemented and tested — keep using it. If the existing `database.types.ts` needs adjusting for this UI pass, adjust it, don't replace it with a simplified parallel model.
