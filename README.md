# Tumara — AI Personal CFO

**Tumbuh dengan arah.**

Tumara is an AI-powered personal finance app for Indonesian individuals, couples, and families. It helps users record financial activities, track accounts/balances, understand spending behavior, and make better financial decisions — starting with a privacy-first, manual-first tracker and growing into a full AI CFO.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend/BaaS**: Supabase (Postgres + Auth + Realtime + RLS)
- **Hosting**: Vercel
- **PWA**: Service worker with safe caching strategy

## Project Structure

```
app/                      # Next.js App Router
  (auth)/                 # Login, signup, household setup
  (main)/                 # Authenticated screens
    dashboard/            # Ringkasan bulanan
    transaksi/            # Riwayat + form transaksi baru
    akun/                 # Kelola akun/saldo
    profil/               # Profil, invite code, logout
    keamanan-privasi/     # Trust & transparency page
components/               # Shared React components
  auth/                   # Auth forms, household setup
  profile/                # Account setup
  transactions/           # Transaction list, form
lib/                      # Utilities, Supabase clients, constants
public/                   # Static assets, manifest, service worker
supabase/                 # Migrations
docs/                     # Specs, progress log, design system
```

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:

```bash
npm install
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Deployment

- Deployed automatically to Vercel on push to `main`
- Production URL: https://ai-personal-cfo-plum.vercel.app
- Environment variables configured in Vercel dashboard

## Documentation

- `docs/AI_CFO_MASTER_ROADMAP.md` — Full product vision and phase plan
- `docs/INCREMENT_2_SPEC.md` — Current increment binding contract
- `docs/DESIGN_SYSTEM.md` — Design tokens and UI conventions
- `docs/PROGRESS_LOG.md` — Session history and deployment log

## License

Private — all rights reserved.
