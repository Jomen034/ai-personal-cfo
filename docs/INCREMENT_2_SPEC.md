# Tumara — Increment 2 Spec
## Live PWA + UX Foundation

This document is the binding contract for the increment after Increment 1. Do not implement AI parsing, recurring transactions, goals, billing, or any other later-increment feature here.

## 1. Product objective

Make the current manual tracker usable as a real hosted PWA for the owner and spouse. The deployed app must be the same app used for real testing, with production Supabase data isolated from development/test data.

## 2. Hosting and release

- Deploy the Next.js app to Vercel using the GitHub `main` branch.
- Configure only these environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never commit `.env.local`, service-role keys, database passwords, or API keys.
- Configure Supabase Authentication URL Configuration:
  - Site URL: the production Vercel URL
  - Redirect URLs: the production Vercel URL and its auth callback paths when used
- Add a production deployment checklist to the progress log before calling the deployment complete.
- Add a lightweight health check that confirms the app can render and reach Supabase without exposing private data.
- Use a separate Supabase project for production if the current project contains test data. Do not silently mix personal real data with test fixtures.

## 3. PWA minimum requirements

- Add a valid web app manifest with the name `Tumara`, Indonesian language metadata, theme colors, and icons.
- Add installable icons in `public/` with appropriate sizes.
- Add a service worker only for an explicit, tested caching strategy. Do not cache authenticated Supabase responses or financial data by default.
- The app must remain usable on narrow mobile screens and desktop browsers.
- Verify install/open behavior on the target phone before marking this section complete.

## 4. Real-user operating model

- Treat the owner and spouse as real beta users, using separate Auth accounts and one shared household.
- Keep test households separate from the real household. Label test data clearly or remove it before production use.
- Add a visible data/account recovery path before wider use: logout, session expiry behavior, and a clear error state.
- Do not expose email addresses, invite codes, balances, or transaction details in URLs, logs, analytics, or screenshots.
- Do not add analytics that sends financial transaction content to third parties.

## 5. UX direction: modern Indonesian finance app

Use Bibit and other polished Indonesian finance apps as behavioral references only: clear hierarchy, calm financial context, easy scanning, strong primary action, compact summary modules, bottom navigation on mobile, and a focused onboarding flow. Do not copy Bibit's source code, illustrations, icons, exact colors, typography, layout, wording, or proprietary assets.

### Information architecture

- Mobile primary navigation: `Ringkasan`, `Transaksi`, `Akun`, `Profil`.
- Desktop may use a left navigation rail or top navigation, but the same destinations and labels must remain available.
- `Ringkasan` is the default authenticated landing screen.
- Keep one dominant action per screen: `Catat transaksi` on Ringkasan, `Tambah akun` on Akun, and `Gabung household` only during onboarding.
- Use Indonesian labels consistently. Avoid mixing `account`, `wallet`, `income`, and `expense` into visible UI copy.

### Ringkasan screen

- Header: greeting from the email-derived display name, household name below it, and a privacy/balance visibility control reserved for this increment only if it can be implemented cleanly.
- First viewport: current balance/sisa, monthly pemasukan, monthly pengeluaran, and the primary `Catat transaksi` action.
- Second section: recent transactions with category, account, date, and signed amount.
- Empty state: explain the next useful action and provide one direct button; never show a blank page or fake zero without context.
- Loading, error, and success states must be explicit and localized in Bahasa Indonesia.

### Transaction experience

- Keep the manual form fast: amount first, type as a segmented control, then category, account, date, and optional note.
- Preserve input on validation or network errors.
- After save, show confirmation and navigate to the updated transaction list or summary.
- Use the shared currency/date utilities everywhere.

### Visual system

- Choose an intentional Tumara identity, not a Bibit clone: green may remain an accent, but pair it with a distinct warm neutral and one contrasting action color.
- Use expressive but readable typography with stable sizes; avoid viewport-scaled text.
- Prefer flat, lightly bordered surfaces and clear spacing over nested decorative cards.
- Use familiar icons with accessible labels/tooltips where icons are introduced.
- Keep touch targets at least 44px and verify no text overlap at mobile widths.
- Use restrained motion for page entry and successful saves; do not animate financial values in a distracting way.

## 6. Definition of Done

- [ ] Production deployment is reachable from the phone over the internet.
- [ ] Production environment variables are configured without secrets in Git.
- [ ] Supabase Auth redirects work on the production domain.
- [ ] PWA manifest and install flow work on the target phone.
- [ ] Owner and spouse can log in with separate accounts and see the same household.
- [ ] A household cannot see another household's data in production.
- [ ] One real transaction can be added, displayed in history, and reflected in the summary.
- [ ] Mobile navigation and empty/loading/error/success states are reviewed.
- [ ] `npm run lint`, `npm run build`, and a production smoke test pass.
- [ ] `PROGRESS_LOG.md` records the deployment URL, test date, users tested, and any remaining risks.
