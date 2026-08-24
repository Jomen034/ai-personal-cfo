<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Tumara Project Rules

This file combines the generated Next.js rules above with the original Tumara project rules below. The generated block may be updated by Next.js; preserve both sections.

## Mandatory reading before starting work

1. Read this file in full.
2. Read `docs/PROGRESS_LOG.md`, especially the newest entry.
3. Identify the current increment and read its matching `docs/INCREMENT_<N>_SPEC.md` in full. That file is the binding contract for current scope.
4. Read `docs/AI_CFO_MASTER_ROADMAP.md` only for background. If it conflicts with the active increment spec, the increment spec wins.
5. Do not start coding until the required context is understood.

## About Tumara

Tumara is an AI Personal CFO for Indonesian individuals, couples, and families. The product name is **Tumara** and must be used in UI text, app titles, metadata, and user-facing copy.

## Non-negotiable principles

- AI-agnostic: wrap AI calls behind a swappable interface.
- Free-tools-first: prefer free tiers and document paid exceptions in `PROGRESS_LOG.md`.
- Iterative: build strictly in the current increment order; do not jump to later features.
- Bahasa Indonesia: all user-facing labels, categories, errors, notifications, and buttons must use natural Bahasa Indonesia.
- Internal engineering documentation, progress logs, and agent instructions should use clear English for consistent cross-model understanding. This does not apply to user-facing product copy.
- Privacy: use RLS for household isolation, minimize stored data, and follow the roadmap's AI privacy rules.
- Confirm major architectural or product decisions with the project owner before implementing them.

## Security and privacy

- Never commit `.env.local`, service-role keys, database passwords, or API keys.
- Never expose passwords, email addresses, invite codes, balances, or transaction data in URLs or logs.
- Never weaken RLS to make a feature work.
- Never store bank account numbers, PINs, or banking credentials.
- Supabase Auth is the source of truth for authentication identity and email.
- Do not add third-party analytics that sends financial transaction content.

## Engineering conventions

- Follow the active increment's folder structure and schema exactly.
- Prefer existing Next.js, Supabase, and local helper patterns.
- Keep changes minimal and focused; avoid unrelated refactors.
- Keep currency/date formatting in `lib/utils/` and shared limits in `lib/constants.ts`.
- Keep `lib/ai/.gitkeep` empty until the active increment explicitly introduces AI.
- Run `npm run lint` and `npm run build` after meaningful changes.
- Update `docs/PROGRESS_LOG.md` at the end of every work session with exact verification status and next steps.

## UI principles

- Optimize for clear hierarchy, fast repeated workflows, accessibility, and responsive mobile layouts.
- Provide explicit Indonesian loading, error, empty, and success states.
- Preserve form input when validation or network requests fail.
- Use familiar icons with accessible labels when icons are introduced.
