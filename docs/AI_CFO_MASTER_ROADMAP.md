# Tumara — Master Product Roadmap
### (AI Personal CFO for Indonesian users — supersedes PROJECT_BRIEF.md — this is the current source of truth)

## Brand identity
**Product name: Tumara** — derived from *Tumbuh* (grow) + *Arah* (direction). The name reflects the product's growth arc: it starts as a simple transaction tracker (Increment 1) and grows into a full AI Personal CFO (Phase 8), mirroring the user's own financial journey — growing with direction, not just accumulating money. Working philosophy line: **"Tumbuh dengan arah."** This name was chosen deliberately to avoid literal finance/money/wallet words in the primary brand (common pattern among many existing Indonesian competitors, which increases collision risk and pigeonholes the brand as "just a tracker"). Internal/code references may still use "AI Personal CFO" as a category descriptor; **Tumara is the actual product/brand name** to use in UI, app metadata, and any user-facing or public-facing material.

**Product vision**: Build an AI Personal CFO for Indonesian users (starting with couples/households as the initial wedge market). The platform should help users record financial activities, track accounts/balances, understand spending behavior, forecast future finances, prioritize financial decisions, reach financial goals, and receive AI-powered coaching.

**The system answers**: Where did my money go? Is my financial condition healthy? What should I improve first? When can I buy a house? Can I afford my child's education? When can I retire? What financial decision should I make next?

**Core flow**: Accounts → Transactions → Categorization → Financial Intelligence → Goal Planning → Recommendations → AI CFO Coaching

## Deployment & dogfooding practice (applies from Increment 1 onward)
Every checkpoint that reaches "stable" status (per the current increment spec's Definition of Done) should also be **deployed to the live Vercel URL**, not just committed/pushed — this is a deliberate practice, not a one-off. The project owner and their partner use the live PWA on their own phones as real users after each meaningful checkpoint, which serves two purposes: (1) genuine dogfooding surfaces real UX friction the owner's own review can't catch, and (2) it keeps the "grow with the product" spirit of the Tumara brand literal, not just conceptual. Practical implications:
- After each checkpoint push (per the current increment spec's git workflow section), also trigger/confirm a Vercel deployment (if using Vercel's git integration, this may already happen automatically on push to `main` — confirm this is configured rather than assuming)
- Verify the live deployment's environment variables (Supabase URL/key, and later Gemini key) are set in Vercel's project settings, separately from local `.env.local` — these do not sync automatically
- Confirm PWA installability ("Add to Home Screen") actually works on the live URL on both an Android and iOS phone before considering a checkpoint truly done for dogfooding purposes


**Primary reference: Bibit** (PT. Bibit Tumbuh Bersama — note the name coincidence: "Tumbuh Bersama" echoes Tumara's own "Tumbuh + Arah" origin). Bibit is a well-established Indonesian investment app (mutual funds/SBN/stocks) known for making inherently complex financial data (fund fact sheets, expense ratios, risk profiles) feel simple and approachable to first-time users via a Robo-Advisor — a positioning very close to what Tumara aims for with its AI CFO layer (Phase 5–8): reduce complexity for a novice user, not add to it.

**Principles to carry into Tumara's UI (visual/UX inspiration only — do not copy code, assets, or exact layouts):**
- **Palette**: clean white/green as the primary base (green ties naturally to "growth," consistent with the Tumbuh/grow brand meaning) — light mode is the default and primary experience, not dark mode. Dark mode may exist as an optional user toggle, not the default.
- **Simplicity over density**: even where underlying data is complex (financial health score breakdown, recommendations, category taxonomy), the default view should show a clean summary — detail belongs behind a tap/expand, not all laid out at once. This matters most for Phase 5 (health score card) and Phase 7 (recommendation cards), which risk feeling like an accountant's report if over-designed.
- **Trustworthy, not flashy**: avoid heavy animation or aggressive visual effects — the tone should feel calm and credible (handling someone's household finances), similar to how Bibit avoids gimmicky trading-app aesthetics despite covering investment products.
- **Large, clear numbers as the visual anchor**: balance/totals should be the biggest, most legible element on any given screen — consistent with what nearly every finance app reference reviewed in this project (CatatBareng, Fundy, Budggt, Bibit) does well.

This section guides visual/UX decisions only. It does not override any functional/schema/architecture decision elsewhere in this document.

---

## ⚠️ Build strategy note (read before starting Phase 1)

This document specs 8 phases in full depth. **Do not build each phase to 100% completion before starting the next.** Recommended approach:

1. **Vertical slice v1**: build a minimal version of every phase — enough Phase 1 domain model to log a transaction, basic Phase 2 free-text input, basic Phase 3 categorization (skip Layer 4/AI categorization initially, start with Layers 1–3), skip Phase 4–7 entirely for v1, and skip Phase 8 (AI coaching) until there's real transaction history to coach on.
2. **Ship this slice**, get real households using it.
3. **Deepen each phase** in the order below, driven by actual usage data — Phase 5–8 in particular are only meaningful once there are months of real transactions to compute health scores and recommendations against.

Given the no-PC/agent-driven development constraint, treat this doc as the **reference architecture**, and treat an explicit MVP-scope conversation (which phase pieces are in v1 vs deferred) as a required step before the coding agent starts building.

---

## Origin note
Early exploration for this project started by studying **CatatBareng**, an Indonesian couples' expense-tracking PWA, as a reference point (manual form entry, single-axis categorization, dashboard/history/goals/PDF export). A second, more advanced reference was later found: **Fundy** (fundy.id), an Indonesian AI finance app with chat/voice/receipt-scan transaction entry, a cashflow health dashboard, budget & goals, multi-account support (including investment/property/physical assets), bill/debt reminders, and a one-time-payment-app + metered-AI-subscription pricing model. Neither reference defines this product's scope — the actual target is the full AI Personal CFO vision below, which goes deeper than both (notably Phase 7 Recommendation Engine and Phase 8 AI Coaching, which neither reference product appears to have — this is our real differentiation point, not the input/dashboard features which both references already do well).

## Language & terminology requirement (critical, applies to all phases)
**Target users are Indonesian — both single users and couples/families.** All user-facing text in the app (labels, category names, transaction type names, button text, notifications, AI-generated narrative in Phase 8, error messages, onboarding copy) must be in **proper, correct, commonly-used Bahasa Indonesia** — not English jargon, not awkward literal translation. Internal code/schema/database field names may remain in English (standard engineering practice), but anything a user reads or hears must read naturally to a native Indonesian speaker, matching the register Fundy and CatatBareng both use (casual-professional, e.g. "Pemasukan/Pengeluaran," "Catat," "Rekap," not "Income/Expense," "Add," "Report"). This applies retroactively to every taxonomy in Phase 1 — the Financial Taxonomy, Purpose Framework, Life Area Framework, and Essentiality Framework should all ship with Indonesian labels as the primary user-facing values (English names in this doc are working labels for the spec, not final UI copy). The coding agent should treat any user-facing string as needing an Indonesian-language pass before shipping, and should default to Indonesian terms directly rather than English-first-then-translate.

## Data security & privacy transparency requirement (critical, applies to all phases)

**Architecture reality**: this product is cloud-first (Supabase/Postgres), which is what enables the AI-parsing (Phase 2/3) and automated reporting/health-scoring (Phase 5–7) features that are core to the product. This is a deliberate tradeoff, not an oversight — full end-to-end/zero-knowledge encryption is not compatible with those features (the database needs to read amounts/text to categorize and aggregate; encrypting client-side would break `SUM()`/`GROUP BY` reporting and AI parsing entirely). The product should be honest about this tradeoff rather than making inaccurate "100% private" claims.

**What is actually protected**:
- Row-Level Security (RLS), already specified in Phase 1's schema, enforces that households can never see each other's data — this is solid, standard, and effective *between users*.
- RLS does **not** protect data from the platform operator. Anyone holding the Supabase `service_role` key (which intentionally bypasses RLS for admin/backend use) or dashboard access can technically query any household's data, including `raw_input` free-text. This is normal for cloud SaaS (same as most banks, Google, Notion, etc.), not a unique flaw — but it must be disclosed, not hidden.
- Free-text/voice/receipt-image data is also transiently processed by third-party LLM providers (Phase 2/3) — disclose this plainly.

**Operational commitments to build in from the start**:
1. Restrict `service_role` key access to as few people as possible (founder/tech lead only, not every contributor or AI agent)
2. Rely on Supabase/Postgres's default encryption at rest and in transit (protects against infrastructure breaches, not against the operator)
3. **Data minimization** — already reflected in the schema: `accounts.name` stores a user-defined label (e.g. "BCA Debit"), never real account numbers, PINs, or banking credentials. Maintain this principle consistently as new tables are added in later phases.
4. Written internal policy: commit to not accessing individual transaction detail except when needed for support/debugging with the user's context, even though technically possible
5. **Indonesian data protection law (UU PDP)** applies to any app storing personal data in Indonesia, regardless of business scale — not an early-stage blocker, but should be on the radar before wider public launch. (Separately, OJK financial-advisory regulation was considered and explicitly deprioritized for now — the AI recommendation engine, Phase 7, is not offering specific financial products, so this is not a current concern; revisit only if that scope changes.)

**Product requirement — in-app "Keamanan & Privasi" page**: build a dedicated, plain-language trust/transparency page (not a replacement for a formal legal Privacy Policy, which is a separate later deliverable). Location: accessible from Profil, and surfaced briefly during onboarding. Content, in natural Bahasa Indonesia per the language requirement above:
1. **What's protected** — other users (including people outside your household) can never see your data
2. **How AI processes your entries** — text/voice/receipt data is sent briefly to an AI service to extract transaction details; not permanently stored by that provider
3. **Our team's technical access** — honest disclosure that the team can technically access data for maintenance/support, with a stated commitment not to view individual transaction detail without cause
4. **What we never ask for** — no full account numbers, PINs, or banking credentials; account names are just user-created labels
5. Link out to the full formal Privacy Policy

Tone must be honest without being alarming — the goal is building trust through transparency, not scaring users at the exact moment we're trying to earn their confidence. This is a genuine differentiation point: CatatBareng's landing page uses AI-generated testimonials with no data transparency; a real, honest security page is a credibility advantage worth investing in from Phase 1 onward.


- **AI-agnostic**: no phase should hardcode a single LLM provider. Wrap AI-dependent steps (Phase 2/3 parsing, Phase 8 narrative generation) behind a thin interface (e.g. `extractTransaction(text)`, `generateCoachingNarrative(data)`) so the underlying model/provider is swappable per phase and over time.
- **AI-agent-built**: implementation work is done by AI coding agents, not manual hand-coding.
- **Free-tools-first, cost-minimized always**: use free tiers at every layer during early stage; even post-revenue, default to minimizing paid tooling rather than upgrading by default.
- **Iterative, not phase-complete-then-next**: see Iterative Increments section below — each increment ships a usable product state.

## Cost & tooling strategy (free-tier stack)
| Layer | Free option | Note |
|---|---|---|
| Hosting | Vercel free tier (Next.js) | Watch bandwidth limits as usage grows |
| Database/Auth/Realtime | Supabase free tier | 500MB DB; free projects pause after ~1 week inactivity, needs a wake ping |
| Push notifications | Raw Web Push API (not OneSignal/MagicBell) | No managed service needed — just VAPID keys + own service worker |
| LLM — parsing (Phase 2/3, text + voice transcript + receipt scan/OCR) | **Gemini** (Flash tier) — chosen provider, single model handles text, transcribed voice, and receipt images natively since Gemini is multimodal | Wrapped behind an AI-agnostic interface per Development Philosophy — Gemini is the initial implementation, not a hard dependency |
| Voice transcription | Browser-native Web Speech API (free, client-side) to start; Gemini's native audio input as an alternative if quality needs improving | Feeds into the same Gemini parsing call used for text |
| LLM — coaching (Phase 8) | Gemini, same reasoning as above — revisit only if narrative quality needs a different model | Only needed once Phases 5–7 have real data to narrate |

**⚠️ Gemini free-tier privacy caveat (important, ties to the Data security & privacy transparency requirement above)**: Google's **free** Gemini API / AI Studio tier uses submitted prompts to improve Google's products by default, and content may be human-reviewed. The **paid** Gemini API / Vertex AI tier does not train on submitted data. This directly conflicts with the privacy commitments in this document if real user financial data is sent through the free tier.
- **Development/testing** (dummy data only): free tier is fine, keeps early-stage cost at zero
- **Once real user data flows through** (any live users, even a small beta): must move to the **paid** Gemini API/Vertex AI tier for anything touching actual transaction data — pricing at the Flash tier is low, and this is a justified exception to the "minimize paid tools" principle given the privacy commitments already made to users
- This should be a hard gate before public launch, not an optimization to revisit later
| Version control | GitHub free | |
| Payments (later) | Midtrans/Xendit | Usage-based, not a fixed cost — only relevant once there's revenue |
| WhatsApp bot entry (Phase 2 extension) | **Deferred** — WhatsApp Business API is not free past sandbox limits | Revisit once revenue justifies the per-conversation cost; not an early-stage build target |

## Pricing model (inspired by Fundy's approach — replaces earlier Basic/Premium framing)
Fundy's model ties cost directly to the actual variable expense (AI compute), rather than a flat feature-gated tier. Adapting that shape for this product once monetization starts:
- **Core app**: one-time payment or free, covers Phase 1–2 manual/basic recording, Phase 6 goals, and dashboard — the parts with near-zero marginal cost per user
- **AI-assisted features metered separately**: natural-language/voice/receipt-scan entry (Phase 2/3), analytics narrative, and Phase 8 coaching are the AI-compute-heavy parts — gate these behind a usage quota (token budget, voice-minutes budget) with a renewable subscription, mirroring Fundy's trial-then-monthly-renewal pattern
- This keeps the free tier genuinely sustainable (no AI cost exposure on unpaid users) while making the paywall trigger tied to real cost drivers, not an arbitrary feature lock
- Exact pricing numbers are a business decision for later — this is a shape recommendation, not a final price

### Second monetization lever: household member cap
Independent of the AI-usage metering above, a household is capped at **2 members** (1 admin + 1 partner) in the free/base tier — this covers the most common cases (a single user, or a couple/family managed by up to 2 adults) at zero marginal cost. Expanding beyond 2 members is a future paid-tier feature, not built yet (Increment 1 only implements the 2-member cap itself, not the upsell/billing flow around it). **Positioning note**: frame this externally as a cap on *pengelola/admin akun* (account managers), not literally "family size" — most families only have 1-2 adults actively managing finances even in larger households, so this cap doesn't functionally exclude the "keluarga" (family) segment of the target market, it just limits how many people can actively log/manage transactions on the free tier.

## Additional reference: Budggt — adopted enhancements
A third reference product, **Budggt** (budggt.com), was reviewed via demo videos and found to be the most feature-mature reference so far — closer to our full 8-phase vision than CatatBareng or Fundy, including AI anomaly detection and spending projection (beyond our original Phase 7 scope). The following enhancements are adopted from that review, mapped to the phase they extend:

| # | Enhancement | Phase | Integration note |
|---|---|---|---|
| 1 | **Privacy Mode toggle** (hide balance figures) | Phase 1 / UX | Simple UI toggle, relevant especially for household/shared-device use |
| 2 | **Spending heatmap calendar** | Phase 1 dashboard / Phase 5 reporting | Additional visualization alongside the category donut chart |
| 3 | **50/30/20 budgeting rule with allocation slider** | Phase 1 (Essentiality Framework) + Phase 6 | Concrete implementation of the Essentiality Framework (Wajib/Penting/Opsional/Mewah) as a dynamic percentage-allocation budgeting method — more actionable for average users than the abstract framework alone |
| 4 | **Emergency fund "runway" in months** | Phase 5 | Make this the concrete, user-facing expression of the "Emergency Fund Coverage" metric — e.g. "Dana daruratmu cukup untuk 4,2 bulan" rather than an abstract score component |
| 5 | **Enveloping / Pockets** (sub-allocating part of a wallet's balance for a purpose, distinct from Goals) | Phase 1 schema + Phase 6 | New concept — see schema addition below |
| 6 | **RDN and PayLater account types** | Phase 1 Account Architecture | Add to the account type enum (RDN = Rekening Dana Nasabah, relevant for stock/securities investment; PayLater increasingly common in Indonesia) |
| 7 | **Aset Likuid vs Aset Tetap** (liquid vs fixed asset distinction) | Phase 1 `assets` table | Use the existing `asset_type` field with explicit values `liquid` / `fixed`, and surface the distinction in total-wealth reporting |
| 8 | **Item-level receipt splitting** | Phase 2 Receipt Scan | Extend the receipt-scan spec: extracted line items from a struk should be individually assignable to different categories/wallets, not just one lump transaction |
| 9 | **Bulk transaction entry** (multiple rows at once) | Phase 2 Supported Input Styles | Add as an additional input style alongside Natural Language/Voice/Receipt Scan/Quick Entry/Guided Forms |
| 10 | **AI anomaly detection + end-of-month spending projection** | Phase 7 (extends beyond original scope) | Beyond static priority-based recommendations: detect unusual spending patterns and project month-end totals from daily trend, surfacing concrete actions (e.g. "kurangi belanja online bulan ini") — this is the bar Phase 8's coaching layer needs to clear or exceed to stay differentiated |
| 11 | **Excel/CSV export with custom filters** | Phase 6 Rekap / reporting | Add alongside the PDF export already specified — don't limit to PDF only |

### Schema addition — Pockets (item 5)
```sql
create table wallet_pockets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  name text not null,          -- "Dana Darurat", "Jalan-jalan", "Kado"
  earmarked_amount numeric(16,2) not null default 0,
  created_at timestamptz default now()
);
```
Distinction from `financial_goals` (Phase 6): a Pocket earmarks a portion of an *existing* wallet balance for a purpose (money already there, just labeled), while a Goal tracks progress toward accumulating a *target* amount over time (money not yet there). Both are user-facing "kantong"-style concepts but serve different mental models — worth keeping both rather than merging them.

---


# PHASE 1 — Master Financial Data Architecture

**Goal**: Define the entire financial language of the platform. This becomes the source of truth used by all future modules.

### Financial Domain Model (entities)
User, Household, Account, Transaction, Category, Subcategory, Merchant, Asset, Debt, Bill, Recurring Transaction, Financial Goal, Investment Account, Investment Holding, Financial Health Score, Recommendation.

### Account Architecture (account types)
Cash, Bank Account, Digital Wallet, Credit Card, Investment Account, Loan Account, Property Account, Business Account, Foreign Currency Account, **RDN/Rekening Dana Nasabah** (securities account), **PayLater**.

### Transaction Types
Income, Expense, Transfer, Savings Allocation, Investment Purchase, Investment Sale, Debt Borrowing, Debt Repayment, Credit Card Spending, Credit Card Payment, Asset Purchase, Asset Sale, Cash Withdrawal, Cash Deposit, Refund, Adjustment.

### Financial Taxonomy (categories)
Working label (EN) → **user-facing label (ID)**:
Income → **Pemasukan**, Housing → **Tempat Tinggal**, Food & Dining → **Makan & Minum**, Transportation → **Transportasi**, Utilities → **Tagihan**, Education → **Pendidikan**, Healthcare → **Kesehatan**, Insurance → **Asuransi**, Debt → **Utang**, Taxes → **Pajak**, Shopping → **Belanja**, Entertainment → **Hiburan**, Travel → **Perjalanan**, Family Support → **Dukungan Keluarga**, Donation → **Donasi**, Religious Activities → **Kegiatan Keagamaan**, Savings → **Tabungan**, Investment → **Investasi**, Government Services → **Layanan Pemerintah**, Others → **Lainnya**.

### Merchant Dictionary
Target: minimum 200 merchants (Indonesian market — GoFood, GrabFood, ShopeeFood, PLN, PDAM, Indihome, e-wallets, common retailers, etc.). Powers Categorization Engine Layer 1 (Phase 3).

### Financial Purpose Framework
Working label (EN) → **user-facing label (ID)**:
Consumption → **Konsumsi**, Savings → **Tabungan**, Investment → **Investasi**, Protection → **Proteksi**, Education → **Pendidikan**, Wealth Building → **Membangun Kekayaan**, Family Support → **Dukungan Keluarga**, Social → **Sosial**, Lifestyle → **Gaya Hidup**, Religious → **Keagamaan**, Business → **Usaha**.

### Life Area Framework
Working label (EN) → **user-facing label (ID)**:
Housing → **Tempat Tinggal**, Family → **Keluarga**, Children → **Anak**, Health → **Kesehatan**, Education → **Pendidikan**, Career → **Karier**, Lifestyle → **Gaya Hidup**, Transportation → **Transportasi**, Religion → **Agama**, Business → **Usaha**, Social → **Sosial**, Wealth Building → **Membangun Kekayaan**.

### Essentiality Framework
Working label (EN) → **user-facing label (ID)**:
Essential → **Wajib**, Important → **Penting**, Optional → **Opsional**, Luxury → **Mewah**.

### Goal Impact Mapping
Working label (EN) → **user-facing label (ID)**:
Emergency Fund → **Dana Darurat**, House → **Rumah**, Education → **Pendidikan**, Retirement → **Pensiun**, Vehicle → **Kendaraan**, Travel → **Liburan/Perjalanan**, Business Capital → **Modal Usaha**.

**Note for the agent**: store the English "working label" as an internal enum/code (for schema stability and future localization), but the value the user sees/selects/hears must always be the Indonesian label. This same EN-code/ID-label pattern should extend to Transaction Types, Account Types, and every other user-facing enum in this document — the tables above are the pattern to follow, not an exhaustive list (transaction types like "Expense/Income/Transfer" should similarly ship as "Pengeluaran/Pemasukan/Transfer," etc.).

### Schema — Phase 1 core tables

**Deliverable note**: Phase 1 should also include the "Keamanan & Privasi" in-app page and onboarding surfacing, per the Data security & privacy transparency requirement above — this is foundational trust UX, not a later add-on.

```sql
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji_icon text default '🏠',
  plan_tier text default 'free',
  plan_expires_at timestamptz,
  currency text default 'IDR',
  created_at timestamptz default now()
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  auth_user_id uuid not null,
  display_name text not null,
  role text default 'partner',
  is_active boolean not null default true,   -- soft-delete: never hard-delete, preserves historical transaction attribution when membership changes
  left_at timestamptz,
  push_subscription jsonb,
  notification_prefs jsonb default '{"days_before": 3, "enabled": true}',
  created_at timestamptz default now(),
  unique (household_id, auth_user_id)
);
-- Free-tier cap: max 2 rows WHERE is_active = true per household_id (see Pricing model section — "Second monetization lever"). Enforce in application/API logic via a shared MAX_HOUSEHOLD_MEMBERS constant, not a hardcoded check scattered across the codebase — this keeps raising the cap for a future paid tier a one-line change.

create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in
    ('cash','bank_account','digital_wallet','credit_card','investment_account',
     'loan_account','property_account','business_account','foreign_currency_account')),
  currency text default 'IDR',
  current_balance numeric(16,2) default 0,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade, -- null = system default
  name text not null,
  parent_category_id uuid references categories(id),
  icon text,
  is_default boolean default false
);

create table merchants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade, -- null = global dictionary entry
  name text not null,
  default_category_id uuid references categories(id),
  aliases text[]  -- alternate spellings/slang the parser should match
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  member_id uuid references household_members(id),
  transaction_type text not null check (transaction_type in
    ('income','expense','transfer','savings_allocation','investment_purchase','investment_sale',
     'debt_borrowing','debt_repayment','credit_card_spending','credit_card_payment',
     'asset_purchase','asset_sale','cash_withdrawal','cash_deposit','refund','adjustment')),
  amount numeric(16,2) not null,
  source_account_id uuid references accounts(id),
  destination_account_id uuid references accounts(id), -- for transfers
  category_id uuid references categories(id),
  subcategory_id uuid references categories(id),
  merchant_id uuid references merchants(id),
  purpose text,        -- Financial Purpose Framework value
  life_area text,       -- Life Area Framework value
  essentiality text check (essentiality in ('essential','important','optional','luxury')),
  transaction_date date not null,
  raw_input text,                 -- verbatim free-text entry, Phase 2
  parsed_confidence numeric(4,3), -- Phase 3
  reviewed_flag boolean default false,
  source text default 'manual',   -- manual | whatsapp_bot | csv_import
  created_at timestamptz default now()
);
create index idx_transactions_household_date on transactions(household_id, transaction_date);

create table assets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  asset_type text,      -- property, vehicle, other
  current_value numeric(16,2),
  created_at timestamptz default now()
);

create table debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  name text not null,
  principal_amount numeric(16,2) not null,
  remaining_balance numeric(16,2) not null,
  interest_rate numeric(6,3),
  minimum_payment numeric(16,2),
  due_day integer,
  created_at timestamptz default now()
);

create table investment_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  account_id uuid references accounts(id),
  provider text,
  created_at timestamptz default now()
);

create table investment_holdings (
  id uuid primary key default gen_random_uuid(),
  investment_account_id uuid references investment_accounts(id) on delete cascade,
  instrument_name text not null,
  quantity numeric(16,4),
  average_cost numeric(16,2),
  current_value numeric(16,2),
  updated_at timestamptz default now()
);
```

Row-Level Security: apply the same `household_members`-scoped policy pattern to every table above — repeat for `transactions`, `accounts`, `assets`, `debts`, `investment_accounts`, `investment_holdings`, `merchants` where household-scoped. (For the exact, concrete RLS SQL used in practice, see `INCREMENT_1_SPEC.md` Section 3 — that document has the literal policies for the tables built so far; this roadmap describes the pattern conceptually since later-increment tables don't have their own spec file yet.)

---

# PHASE 2 — Financial Journal & Input Engine

**Goal**: Design the fastest possible transaction recording experience. Users should think in sentences, not forms.

### Critical Principle: User Confirmation Is Mandatory
Every extracted transaction from natural language input MUST go through a confirmation step before being permanently saved.

**Flow**: Raw Input → Parsing → Categorization → Account Mapping → Confidence Calculation → User Confirmation → Save Transaction

**Example**:
Input: `"grabfood 120k ocbc debit"`
System suggestion:
- Transaction Type: Expense
- Amount: Rp120.000
- Category: Food Delivery
- Merchant: GrabFood
- Source Account: OCBC Debit *(name the account consistently with how the user refers to it — avoid silently relabeling "debit" as "Savings")*

User actions: **Confirm / Edit / Cancel**. Only after confirmation should the transaction affect balances, reports, goals, and recommendations.

### Supported Input Styles
Natural Language (chat/text), Quick Entry, Guided Forms, **Voice** (speak a transaction, transcribed then parsed through the same pipeline), **Receipt Scan** (photo of a struk/receipt, read by a vision-capable model into the same structured extraction as text input), **Bulk Entry** (multiple transaction rows entered/pasted at once).

- **Voice**: transcribe first (browser-native Web Speech API for a free client-side option, or Gemini's native audio input for better Bahasa Indonesia accuracy), then feed the transcript into the exact same text parser as Natural Language input — no separate parsing logic needed.
- **Receipt Scan**: no classical OCR pipeline needed — send the photo directly to Gemini (vision-capable) with the same constrained-enum extraction prompt used for text (household's category/account enums), returning the same structured schema. This is additive to Phase 2/3 infrastructure, not a new module. **Item-level splitting**: extracted line items from a struk should be individually assignable to different categories/wallets rather than saved as one lump transaction — the extraction schema should return an array of line items with the total, letting the user reassign individual items before confirming.
- **Bulk Entry**: accepts multiple lines of natural-language or structured input in one submission (e.g. pasted list), parsed as a batch through the same Phase 2/3 pipeline, with one confirmation step covering the whole batch.

### Transaction Parser — must extract
Transaction Type, Amount, Merchant, Source Account, Destination Account, Category, Subcategory, Purpose, Life Area, Date (and, from our earlier design work: Essentiality).

### Transaction Schema
`transaction_id, raw_input, transaction_type, amount, source_account, destination_account, category, subcategory, merchant, purpose, life_area, essentiality, transaction_date` — matches the `transactions` table in Phase 1.

### Account Balance Engine
Must support balance updates for: Expense, Income, Transfer, Credit Card Spending, Credit Card Payment, Investment Purchase, Investment Sale, Cash Withdrawal, Cash Deposit.

### Implementation notes (from prior design work, still applicable)
- **Fast path / slow path**: check a `merchant_aliases`/learned-mapping cache per household first; only call the LLM parser on novel input. Keeps cost and latency down at scale.
- **Never let the LLM invent categories/accounts** — always constrained to the household's registered enums (Phase 1 tables).
- **Single-category-per-message for v1** — defer multi-item text splitting ("kopi sama bensin totalnya 75k") to a later phase.
- **WhatsApp bot channel** (phase 2 extension): same parsing pipeline via WhatsApp Business API webhook — biggest UX unlock, zero app-open friction, and the natural differentiator vs. CatatBareng's form-only entry.

---

# PHASE 3 — Categorization Engine

**Goal**: Convert messy user inputs into structured financial data.

### Mandatory Confirmation Strategy
Every categorization result must include a confidence score.

| Confidence | Behavior |
|---|---|
| **High** | Auto-filled, still displayed to user, one-click confirmation required before save |
| **Medium** | Suggested category shown, user should review, confirmation required |
| **Low** | User must select category manually, confirmation required |

**No transaction may be committed without user confirmation.** Corrections become training data for future categorization.

### Layered categorization pipeline
- **Layer 1 — Merchant Dictionary**: exact/fuzzy match against the 200+ merchant dictionary (Phase 1)
- **Layer 2 — Keyword Rules**: rule-based matching on keywords/slang not yet in the dictionary
- **Layer 3 — User Learning**: household-specific learned mappings from past corrections (the `merchant_aliases`-style cache)
- **Layer 4 — AI Categorization**: LLM structured extraction as the fallback for genuinely novel input (see Phase 2 implementation notes — constrained enum output only)

### Categorization axes applied per transaction (from Phase 1 taxonomy)
Category/Subcategory, Purpose, Life Area, Essentiality — four independent dimensions, not a single tree. This is what powers Phase 5–7 reporting depth beyond a simple category pie chart.

---

# PHASE 4 — Recurring Transaction Engine

**Goal**: Automatically discover committed expenses.

### Recurring categories
Rent, Mortgage, PLN, Water, Internet, School Fees, Insurance, Credit Card Bills, Netflix, Spotify, Gym, Investment Funding, Family Support.

### Detection inputs
Merchant Similarity, Date Similarity, Amount Similarity, Frequency Consistency.

### Outputs
Recurring Status, Frequency, Confidence.

### Additional features
Upcoming Bills, Expected Monthly Commitments, Recurring Cashflow Forecast.

### Ties to earlier notification design
This phase is what feeds the **push notification bill-reminder feature** designed earlier: once a transaction is flagged recurring with a `next_due_date`, the daily reminder job (Web Push API + service worker + VAPID keys, iOS requires Home Screen install per platform constraints already documented) fires against it.

```sql
create table bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  category_id uuid references categories(id),
  merchant_id uuid references merchants(id),
  name text not null,
  amount numeric(16,2),
  recurrence text default 'monthly',   -- monthly | yearly | custom
  next_due_date date not null,
  detection_confidence numeric(4,3),   -- from Phase 4 detection engine
  is_auto_detected boolean default false,
  is_paid_current_cycle boolean default false,
  created_at timestamptz default now()
);
```

---

# PHASE 5 — Financial Health Engine

**Goal**: Evaluate overall financial condition.

### Metrics
Cashflow, Savings Rate, Debt Ratio, Expense Ratio, Emergency Fund Coverage.

### Financial Health Score (weighted composite)
| Component | Weight |
|---|---|
| Emergency Fund | 30% |
| Debt Health | 25% |
| Savings Rate | 20% |
| Goal Progress | 15% |
| Retirement Readiness | 10% |

### Status bands
| Score | Status |
|---|---|
| 90–100 | Excellent |
| 75–89 | Healthy |
| 60–74 | Needs Improvement |
| 40–59 | Risky |
| 0–39 | Critical |

```sql
create table financial_health_scores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  computed_for_month date not null,
  emergency_fund_score numeric(5,2),
  debt_health_score numeric(5,2),
  savings_rate_score numeric(5,2),
  goal_progress_score numeric(5,2),
  retirement_readiness_score numeric(5,2),
  total_score numeric(5,2),
  status text, -- excellent | healthy | needs_improvement | risky | critical
  computed_at timestamptz default now()
);
```
**Note**: all scores here are deterministically computed (SQL/application logic), not LLM-generated — this feeds Phase 8's "AI explains, never calculates" principle.

---

# PHASE 6 — Goal Planning Engine

**Goal**: Help users achieve future financial goals.

### Modules
Emergency Fund Goal, House Goal, Education Goal, Retirement Goal (plus the more general savings/debt "Kantong" goals from the CatatBareng-competitor work — Vehicle, Travel, Business Capital per the Phase 1 Goal Impact Mapping).

### Outputs
Gap Analysis, Target Completion Date, Monthly Savings Required, Forecasts.

```sql
create table financial_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  goal_type text not null, -- emergency_fund | house | education | retirement | vehicle | travel | business_capital | custom
  name text not null,
  target_amount numeric(16,2) not null,
  current_amount numeric(16,2) default 0,
  target_date date,
  created_at timestamptz default now(),
  achieved_at timestamptz
);

create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references financial_goals(id) on delete cascade,
  member_id uuid references household_members(id),
  amount numeric(16,2) not null,
  occurred_on date not null,
  created_at timestamptz default now()
);
```

---

# PHASE 7 — Recommendation Engine

**Goal**: Determine financial priorities.

### Priority Framework
1. Financial Survival
2. Protection
3. Foundation
4. Goals
5. Lifestyle

### Pipeline
Transactions → Accounts → Metrics → Rule Engine → Priority Engine → Recommendation

### Recommendation structure
Each recommendation includes: **Issue, Current Condition, Target Condition, Recommended Action, Estimated Impact, Priority.**

```sql
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  issue text not null,
  current_condition text,
  target_condition text,
  recommended_action text,
  estimated_impact text,
  priority text check (priority in ('financial_survival','protection','foundation','goals','lifestyle')),
  generated_at timestamptz default now(),
  dismissed boolean default false
);
```
This engine is rule-based (deterministic priority framework + metrics from Phase 5), not LLM-generated — the LLM's job starts one layer up, in Phase 8.

---

# PHASE 8 — AI Personal CFO Engine

**Goal**: Transform financial data into coaching.

### Non-negotiable principle
**AI never performs calculations. AI explains calculations.** All numbers (health scores, gap analysis, recommendation impact estimates) come from deterministic Phase 5–7 logic; the LLM's role is exclusively narrative explanation and conversational coaching over already-computed, already-correct numbers. This avoids the single biggest risk in an AI finance product — a model hallucinating a number in a domain where being wrong is unacceptable.

### Use cases
Monthly CFO Report, Financial Coaching, Scenario Simulation, Goal Optimization.

### Full architecture
Accounts → Transactions → Balance Engine → Categorization Engine → Financial Health Engine → Goal Planning Engine → Recommendation Engine → **AI Narrative Layer**

---

# ITERATIVE INCREMENTS (replaces single-pass phase order)

Each increment ships a usable product state — an AI coding agent should be able to complete, test, and merge one increment per work session rather than working phase-to-100%-completion.

| # | Increment | What it covers |
|---|---|---|
| 1 | **Core tracker** | Minimal Phase 1 (household, accounts, categories, transactions only — skip assets/debts/investments) + Phase 2 with manual form entry only (no AI yet) + basic dashboard. Already a working expense tracker. |
| 2 | **Live PWA + UX Foundation** | *(inserted after real-world build experience — see `INCREMENT_2_SPEC.md`)* Deploy Increment 1's tracker as a real hosted PWA for genuine dogfooding by the owner and spouse before adding any AI features: production Vercel deployment, PWA install/manifest, safe-area/mobile polish, Bibit-inspired design system rollout, transaction detail view, and the Keamanan & Privasi page. No AI, recurring transactions, goals, or later-phase features. |
| 3 | **Natural language entry** | Full Phase 2 free-text parsing + Categorization Layers 1–3 (Phase 3: merchant dictionary, keyword rules, user learning — no LLM yet) |
| 4 | **AI categorization** | Categorization Layer 4 (LLM in the loop) + confidence tiers (High/Medium/Low) + confirm/edit UX |
| 5 | **Recurring & reminders** | Phase 4 recurring detection + bill push notifications (Web Push API) |
| 6 | **Health scoring** | Phase 5 Financial Health Engine |
| 7 | **Goal planning** | Phase 6, including Assets/Debts/Investment entities from Phase 1 as needed to support goal types |
| 8 | **Recommendations** | Phase 7 rule-based priority/recommendation engine |
| 9 | **AI CFO coaching** | Phase 8 narrative layer — last, since it needs real accumulated data from every prior increment to coach against |

**Note on numbering**: this table now has 9 rows for 8 product phases because Increment 2 (Live PWA + UX Foundation) is a cross-cutting infrastructure/UX increment, not a new Phase — it was inserted based on real project experience (get a genuinely usable app in front of real users before building AI features) rather than planned from the start. Every subsequent increment number shifted by one to accommodate it. If you're looking for "which increment builds Phase 3's natural language parsing," it's now **Increment 3**, not Increment 2.

*(WhatsApp-bot input and any paid-tier features are explicitly out of scope until revenue justifies them — see Cost & tooling strategy above.)*

---

## Tech stack (carried over, still applicable)
Next.js PWA frontend · Supabase (Postgres + Auth + Realtime + RLS) · small/fast LLM for Phase 2–3 parsing, larger model acceptable for Phase 8 narrative generation · Web Push API for Phase 4 bill reminders · Midtrans/Xendit for payments.

## Open decisions for the agent to flag back, not assume
- Exact MVP slice: which pieces of each phase ship in v1 vs. deferred
- LLM provider/model choice for Phase 2–3 (fast/cheap) vs Phase 8 (narrative quality) — likely two different models
- Confidence thresholds for High/Medium/Low tiers (Phase 3) — needs real Bahasa Indonesia slang benchmarking
- Whether Phase 8 coaching is push-based (proactive monthly report) or pull-based (chat interface) or both
- Pricing/plan-tier gating across phases (e.g., is Phase 5–8 a "Premium" tier, matching CatatBareng's Basic/Premium split?)