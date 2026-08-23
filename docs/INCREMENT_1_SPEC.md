# Tumara — Increment 1 Spec — Core Tracker
### (this is a binding contract, not a suggestion — the agent must not deviate from or expand this scope)

This document defines **exactly** what to build for Increment 1. It exists because the master roadmap (`AI_CFO_MASTER_ROADMAP.md`) describes the full 8-phase system, and an agent skimming it could easily implement schema/features that belong to later increments. **If it's not written in this file, it is out of scope for Increment 1 — even if it exists in the roadmap.**

---

## 0. Relationship to other docs
- `AGENTS.md` — general working rules (read first, every session)
- `AI_CFO_MASTER_ROADMAP.md` — long-term architecture reference (context only — do NOT implement from this file directly)
- `INCREMENT_1_SPEC.md` (this file) — the actual build contract for right now
- `PROGRESS_LOG.md` — historical record, update at end of session

## 1. Environment variables required for THIS increment — nothing else
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
Do not request, reference, or scaffold `GEMINI_API_KEY` or `OPENAI_API_KEY` in this increment. Those belong to Increment 2+. If `.env.local` is missing, ask the user ONLY for the two Supabase values above.

## 2. Exact schema for Increment 1 — create only these tables, with only these columns

```sql
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji_icon text default '🏠',
  invite_code text not null unique,   -- 6-char alphanumeric, generated at creation, see Section 4
  created_at timestamptz default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  auth_user_id uuid not null,
  display_name text not null,
  role text not null default 'partner' check (role in ('admin','partner')),
  is_active boolean not null default true,   -- soft-delete flag: never hard-delete a member row, see note below
  left_at timestamptz,                        -- set when is_active is flipped to false, null while active
  created_at timestamptz default now(),
  unique (household_id, auth_user_id)
);
```
**Why soft-delete, not hard-delete**: `transactions.member_id` references this table. If a member leaves the household (breakup, account change, etc.), hard-deleting their row would orphan or cascade-delete their historical transactions, destroying the household's own financial history. Instead: flip `is_active` to `false` and set `left_at`, keep the row intact. Their past transactions remain attributed and visible to the household; they simply lose ongoing access and no longer count toward the member cap (Section 4).

**Out of scope for Increment 1**: building the actual "remove/deactivate member" UI/action, and any admin-role-transfer flow (e.g. if the admin is the one leaving). The schema field exists now so this doesn't require a breaking migration later, but the feature itself is a future increment's concern — do not build the deactivation UI now.

```sql

create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,                  -- user-defined label, e.g. "BCA Debit"
  account_type text not null check (account_type in ('cash','bank_account','digital_wallet','credit_card')),
  current_balance numeric(16,2) not null default 0,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade, -- null = system default, shared across all households
  name text not null,
  type text not null check (type in ('income','expense')),  -- determines which categories show up for Pemasukan vs Pengeluaran forms
  parent_category_id uuid references categories(id),  -- null = top-level category
  icon text,
  is_default boolean not null default false
);
```

**Seed data required**: the migration must also insert a default set of system categories (`household_id = null`, `is_default = true`) so the app isn't empty on first use. Use Indonesian labels directly, minimum set for Increment 1:
- **Pemasukan** (type='income'): Gaji, Bonus, Hadiah, Lainnya
- **Pengeluaran** (type='expense'): Makan & Minum, Transportasi, Tagihan, Belanja, Kesehatan, Hiburan, Pendidikan, Lainnya

This is a starter set only — the full taxonomy from the roadmap (with subcategories, Purpose Framework, Life Area Framework, Essentiality) is out of scope until later increments. Do not build subcategories or the other frameworks now — `parent_category_id` exists in the schema for future use but stays unused (all null) in Increment 1.

```sql

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  member_id uuid references household_members(id),
  account_id uuid references accounts(id),
  category_id uuid references categories(id),
  transaction_type text not null check (transaction_type in ('income','expense')),
  amount numeric(16,2) not null check (amount > 0),
  transaction_date date not null,
  note text,
  created_at timestamptz default now()
);
create index idx_transactions_household_date on transactions(household_id, transaction_date);
```

**Explicitly excluded from Increment 1** (do not create these tables/columns even though they appear in the master roadmap): `assets`, `debts`, `investment_accounts`, `investment_holdings`, `bills`, `financial_health_scores`, `financial_goals`, `goal_contributions`, `recommendations`, `wallet_pockets`, `merchants`. Also excluded from the tables above: `transactions.raw_input`, `parsed_confidence`, `reviewed_flag`, `source`, `merchant_id`, `subcategory_id`, `purpose`, `life_area`, `essentiality`, `destination_account_id` — all of these are Phase 2/3+ concerns. Also excluded: `households.plan_tier`, `plan_expires_at`; `household_members.push_subscription`, `notification_prefs` — billing and notifications are later increments.

## 3. Row-Level Security — exact policies to apply

**Important**: every policy below scopes access via `is_active = true` in the `household_members` subquery. A member whose `is_active` is `false` (see Section 2's soft-delete note) loses read/write access to their former household immediately, while their historical transactions remain intact and visible to the still-active members.

```sql
alter table households enable row level security;
alter table household_members enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;

-- households: a user can see a household only if they're an ACTIVE member of it
create policy "select own household" on households for select
  using (id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

-- households: any authenticated user can create a household (they become its first member via app logic)
create policy "insert household" on households for insert
  with check (auth.uid() is not null);

-- household_members: a user can see members (active or inactive, for historical attribution) of their own ACTIVE household(s)
create policy "select own household members" on household_members for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

-- household_members: insert only allowed for yourself (either creating your own household, or joining via valid invite code — validated in application logic before this insert runs, including the member-cap check from Section 4)
create policy "insert self as member" on household_members for insert
  with check (auth_user_id = auth.uid());

-- accounts / categories (household-scoped rows) / transactions: standard ACTIVE-household-scoped pattern, repeat for each
create policy "select own household accounts" on accounts for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));
create policy "modify own household accounts" on accounts for all
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "select categories" on categories for select
  using (household_id is null or household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));

create policy "select own household transactions" on transactions for select
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));
create policy "modify own household transactions" on transactions for all
  using (household_id in (select household_id from household_members where auth_user_id = auth.uid() and is_active = true));
```

## 4. Household invite mechanism — exact flow, do not redesign
1. User signs up (Supabase Auth) → app creates a `households` row with an auto-generated `invite_code` (6 uppercase alphanumeric characters, e.g. `A3F9K2`) → app creates a `household_members` row for this user with `role = 'admin'`.
2. The `invite_code` is displayed to the user somewhere in the app (e.g. Profil) so they can share it with their partner.
3. A second user signs up separately (their own Supabase Auth account) → during onboarding, instead of creating a new household, they enter the invite code → **server-side** (API route/Server Action, not client-side), validate the code exists in `households` **AND that the household's current member count is below the cap (see below)**, then insert a `household_members` row linking them to that `household_id` with `role = 'partner'`.
4. **Household member cap: maximum 2 members per household in Increment 1** (1 admin + 1 partner), **counting only rows where `is_active = true`** — a deactivated/soft-deleted member (Section 2) does not count toward the cap, freeing up a slot for someone new to join via the same invite code. This is a deliberate product decision, not a technical limitation — it's the free-tier cap; a future paid tier may allow more members, which is why the cap must be implemented as a single named constant (e.g. `MAX_HOUSEHOLD_MEMBERS = 2` in one shared config/constants file), never hardcoded inline in multiple places. This keeps raising the cap later a one-line change, not a refactor.
5. If a user attempts to join a household that already has `MAX_HOUSEHOLD_MEMBERS` **active** members, reject the join server-side with a clear Indonesian-language error (e.g. "Household ini sudah penuh (maksimal 2 pengelola)") — do not silently allow it or invent a different limit.
6. For Increment 1: invite codes do not expire and remain valid indefinitely up to the member cap above (no need to build expiry/single-use logic beyond the cap itself — simplicity over completeness for MVP). This can be revisited later if abuse becomes a concern.
7. Do not build email-based invites. Do not build any other invite mechanism.

## 5. Feature scope — manual entry only, Indonesian UI
- App name displayed in the UI (header, browser tab title, PWA manifest name) is **"Tumara"** — not a placeholder or "AI Personal CFO"
- Signup/login (Supabase Auth, email+password is sufficient for Increment 1 — no social login needed yet)
- Create household (first user) / join household via invite code (second user)
- Manual transaction form: amount, type (Pemasukan/Pengeluaran), category, account, date, optional note
- Dashboard: current month's total Pemasukan, total Pengeluaran, Sisa (remaining), using `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` for all amount formatting
- All dates stored in UTC in the database; displayed in the user's local Indonesian timezone (WIB assumed unless otherwise specified) in the UI
- All user-facing text in natural Bahasa Indonesia, per AGENTS.md

## 6. Checkpoints and Definition of Done

### Checkpoint 1A — Foundation (schema, auth, RLS, invite flow)
**Done when ALL of the following are true:**
- [ ] All 5 tables created via a Supabase migration file (not manually via dashboard)
- [ ] All RLS policies from Section 3 applied
- [ ] **RLS is actually tested, not just written**: create two separate test households (via two separate signups), confirm household A's user CANNOT retrieve household B's data via a direct Supabase client query — this must be verified and the verification method reported in PROGRESS_LOG.md, not just assumed from reading the SQL
- [ ] Signup/login works end to end
- [ ] First user signup → household + admin membership created automatically
- [ ] Second user can join the same household using the invite code, and both can see the same household's data
- [ ] A third user attempting to join that same household (now at the 2-member cap) is rejected with the specified Indonesian error message, not silently allowed in
- [ ] `npm run dev` runs without errors

→ **This is a stable checkpoint. Commit locally throughout, push to remote once all boxes above are checked.**

### Checkpoint 1B — Transaction recording + dashboard
**Done when ALL of the following are true:**
- [ ] Manual transaction form works: can add an income or expense transaction, it's saved correctly with the right household_id and member_id
- [ ] Transaction list/history view shows recorded transactions
- [ ] Dashboard shows correct totals (Pemasukan, Pengeluaran, Sisa) for the current month, computed from real data (not hardcoded)
- [ ] Amount formatting uses Indonesian number format (Rp1.400.000, not Rp1,400,000)
- [ ] All UI text reviewed and confirmed to be natural Bahasa Indonesia (not literal/awkward translation)
- [ ] Tested on a mobile viewport width, not just desktop
- [ ] `npm run dev` runs without errors

→ **This is a stable checkpoint. Commit locally throughout, push to remote once all boxes above are checked.**

**Increment 1 is fully done only when both checkpoints are complete.** Do not mark Increment 1 done in PROGRESS_LOG.md unless every box above is checked.

## 7. Folder structure — follow this exactly, do not invent a different structure

```
project-root/
├── AGENTS.md
├── .env.local              ← real credentials (gitignored)
├── .env.local.example
├── .gitignore
├── package.json
│
├── docs/
│   ├── AI_CFO_MASTER_ROADMAP.md
│   ├── INCREMENT_1_SPEC.md
│   └── PROGRESS_LOG.md
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 0001_increment1_core_schema.sql   ← schema from Section 2/3 of this doc
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← redirect to /login or /dashboard
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx       ← includes create-household / join-via-invite-code flow
│   ├── (main)/
│   │   ├── layout.tsx            ← post-login layout (nav bar etc.)
│   │   ├── dashboard/page.tsx
│   │   ├── transaksi/
│   │   │   ├── page.tsx          ← transaction list/history
│   │   │   └── baru/page.tsx     ← manual entry form
│   │   └── profil/page.tsx       ← household info, invite code display
│   └── api/
│       └── household/
│           └── join/route.ts     ← server-side invite code validation
│
├── components/
│   ├── ui/                       ← base reusable buttons, inputs, cards
│   ├── transactions/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionList.tsx
│   └── dashboard/
│       └── SummaryCard.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← browser-side Supabase client
│   │   └── server.ts             ← server-side Supabase client
│   ├── ai/                       ← INTENTIONALLY EMPTY in Increment 1 — reserved for Increment 2's AI-agnostic wrapper (see AGENTS.md). Do not build anything here yet, just leave the folder with a .gitkeep.
│   │   └── .gitkeep
│   ├── utils/
│   │   ├── currency.ts           ← Rupiah formatting (Intl.NumberFormat 'id-ID')
│   │   └── date.ts               ← WIB timezone handling
│   ├── types/
│   │   └── database.types.ts     ← generated/hand-written types matching the Supabase schema
│   └── constants.ts              ← shared constants, e.g. MAX_HOUSEHOLD_MEMBERS = 2 (Section 4) — single source, never hardcode this value elsewhere
│
└── public/
```

Notes:
- Route groups `(auth)` and `(main)` are Next.js App Router conventions to separate pre-login and post-login pages without affecting the URL structure.
- `lib/supabase/client.ts` and `server.ts` are separate because Next.js App Router requires different Supabase client instances for client components vs. server components/API routes — this is standard Supabase+Next.js practice, not optional.
- `lib/utils/currency.ts` and `date.ts` must be built once and reused everywhere amounts/dates are displayed (dashboard, form, transaction list) — do not reimplement formatting logic separately in each component.
- Do not create a `lib/ai/` implementation in this increment — the empty folder is intentional scaffolding for Increment 2, not a task for now.


## 8. Git workflow for this increment
- Commit locally after each meaningful, working change (small, frequent commits with clear messages) — do not batch everything into one commit
- **Push to the remote only at the end of Checkpoint 1A and end of Checkpoint 1B** (i.e., two pushes total for this increment, not one push per commit) — this keeps the remote history clean at points that are actually known-working, rather than every intermediate commit (some of which may be broken mid-change)
- Before each of these two pushes, re-confirm `.gitignore` excludes `.env.local` and any credentials file (see AGENTS.md security requirement)
- If a session ends mid-checkpoint (neither 1A nor 1B fully done), do NOT push — leave it committed locally only, and record the exact in-progress state in PROGRESS_LOG.md so the next session (possibly a different model) can resume precisely
