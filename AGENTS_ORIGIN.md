# AGENTS.md — Instructions for AI Coding Agents

This file is read automatically by Kilo Code (and supported by Cursor, Windsurf) at the start of every session. It applies regardless of which model is active (Gemini, OpenAI, or any other) — this project is deliberately built to be **AI-agnostic**.

## Mandatory reading before starting any work
1. Read this file (AGENTS.md) in full.
2. Read `/docs/PROGRESS_LOG.md`, especially the most recent entry, to understand what was last done, what decisions were made, and what the planned next step is.
3. Determine the current increment from PROGRESS_LOG.md (or, if no entries exist yet, assume Increment 1). Read the matching `/docs/INCREMENT_<N>_SPEC.md` file (e.g. `INCREMENT_1_SPEC.md`) in full — **this is the binding contract for what to build right now.**
4. Read `/docs/AI_CFO_MASTER_ROADMAP.md` for background/long-term context only. **Do not implement directly from the roadmap** — always work from the current `INCREMENT_<N>_SPEC.md`. If the roadmap and the increment spec ever conflict, the increment spec wins.
4. Do not start coding until context from all three sources above is understood.

## About this project
Building **Tumara** — an AI Personal CFO app for Indonesian users (both individuals and couples/families). The name comes from *Tumbuh* (grow) + *Arah* (direction) — "Tumbuh dengan arah." Full specification (8 phases, schema, taxonomy, etc.) lives in `/docs/AI_CFO_MASTER_ROADMAP.md` — that document is the **single source of truth**. Do not assume features beyond what's written there without confirming with the project owner. **"Tumara" is the actual product name — use it in UI text, app titles, and any user-facing copy, not a generic placeholder like "AI Personal CFO" or "Finance App."**

## Non-negotiable development principles
- **AI-agnostic**: never hardcode logic to a single LLM provider. Wrap all AI calls (transaction parsing, categorization, coaching) behind a clear interface/function so the model can be swapped later.
- **Free-tools-first**: prioritize free tiers at every layer (see the Cost & Tooling table in the roadmap). Do not add paid dependencies without strong justification, and log any exception in PROGRESS_LOG.md.
- **Iterative, not big-bang**: build strictly in the order of the Increments defined in the roadmap (Increment 1 → 8). Do not jump ahead to a later increment before the current one is working.
- **Bahasa Indonesia for ALL user-facing text**: labels, category names, error messages, notifications, button text — everything a user reads or hears must be proper, natural Bahasa Indonesia. Code, schema, and variable names may remain in English.
- **Privacy**: follow the "Data security & privacy transparency" section of the roadmap, including the Gemini free-tier-vs-paid rule (free tier is for dev/testing with dummy data only — never with real user data).
- **Confirm before major decisions**: if there is significant architectural/design ambiguity (not a small implementation detail), ask the project owner before proceeding — do not silently assume and build on top of an unconfirmed assumption.

## Tech stack (summary — full detail in the roadmap)
Next.js (PWA) · Supabase (Postgres, Auth, Realtime, RLS) · Gemini (parsing, voice, receipt-scan, coaching — see free/paid tier note in roadmap) · Web Push API · Midtrans/Xendit (later, for payments)

## End-of-session obligation
**Before ending a work session**, add a new entry to `/docs/PROGRESS_LOG.md` following the template in that file. This is mandatory, not optional — it's what allows the next session (including a different AI model) to continue without losing context.

## Coding conventions (fill in / expand as the project evolves)
- (placeholder — add naming conventions, folder structure rules, style guide, etc. here as the project matures)
