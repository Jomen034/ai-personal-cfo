# Tumara — Increment 3 Spec
## Natural Language Entry + Categorization Layers 1–3

This document is the binding contract for Increment 3. Do not implement AI categorization (Layer 4), recurring transactions, goals, billing, or any later-increment feature here.

## 1. Product objective

Add natural-language transaction entry to Increment 2's manual tracker, backed by deterministic categorization layers (merchant dictionary, keyword rules, user learning) so users can record transactions by typing or speaking a sentence instead of filling every form field manually. The LLM-based parser fallback (Layer 4) is explicitly deferred to Increment 4.

## 2. What is in scope

- Natural-language input field on the transaction entry screen
- Categorization Layer 1 — Merchant Dictionary: exact/fuzzy match against registered merchants
- Categorization Layer 2 — Keyword Rules: rule-based matching on Indonesian keywords/slang
- Categorization Layer 3 — User Learning: household-specific learned mappings from past corrections
- User confirmation flow before save (High/Medium/Low confidence display)
- Account mapping heuristics (match account name/type from input)
- Amount extraction from natural text (e.g. "120k", "120.000", "120000")
- Date extraction from natural text (e.g. "hari ini", "kemarin", "tanggal 5")
- Transaction type inference from keywords

## 3. What is explicitly out of scope

- Layer 4 — AI/LLM categorization (Increment 4)
- Voice input (Web Speech API) — infrastructure can be prepared but UI is deferred
- Receipt scan / OCR — deferred to Increment 4
- Bulk entry — deferred to Increment 4
- WhatsApp bot input — deferred (cost-gated)
- Recurring transactions, goals, health scoring, recommendations, AI coaching
- Any paid-tier gating

## 4. Data model changes

### merchants table (new)

```sql
create table merchants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade, -- null = global dictionary entry
  name text not null,
  default_category_id uuid references categories(id),
  aliases text[]  -- alternate spellings/slang the parser should match
);
```

### transactions table extensions (already present in schema, ensure they exist)

- `raw_input text` — verbatim free-text entry
- `parsed_confidence numeric(4,3)` — confidence score from categorization
- `reviewed_flag boolean default false` — whether user confirmed/corrected

If these columns are missing from the live database, add them via migration.

## 5. UI/UX requirements

- Input: a prominent text field on the transaction entry screen (in addition to the existing manual form, not replacing it)
- Confirmation: after parsing, show a summary card with extracted values and confidence indicator
- User actions: **Konfirmasi** / **Edit** / **Batal**
- Confidence display:
  - High: green indicator, "Sangat mirip"
  - Medium: yellow indicator, "Kemungkinan cocok"
  - Low: red indicator, "Perlu dicek"
- Preserve existing manual form as fallback when parsing fails or user prefers it
- All labels and copy in Bahasa Indonesia

## 6. Parser interface (AI-agnostic)

All parsing logic must be wrapped behind a swappable interface so the underlying implementation can change without touching UI code.

```typescript
// lib/ai/parser.interface.ts
export interface ParsedTransaction {
  transaction_type: 'income' | 'expense';
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  transaction_date: string;
  confidence: number; // 0-1
  raw_input: string;
}

export interface TransactionParser {
  parse(input: string, householdId: string): Promise<ParsedTransaction>;
}
```

Default implementation for Increment 3: deterministic rule-based parser (no LLM). Increment 4 can add an LLM-backed implementation behind the same interface.

## 7. Categorization pipeline

1. **Layer 1 — Merchant Dictionary**: exact/fuzzy match against `merchants.name` and `merchants.aliases` for the household (fall back to global `household_id IS NULL` entries)
2. **Layer 2 — Keyword Rules**: match Indonesian keywords/slang to category IDs (e.g. "kopi" → Makan & Minum, "gojek" → Transportasi)
3. **Layer 3 — User Learning**: check household-specific learned mappings from past corrections
4. **Fallback**: if no layer matches, return Low confidence and ask user to pick category manually

## 8. Account mapping heuristics

- Match input tokens against `accounts.name` (case-insensitive, partial match)
- Match account type keywords: "debit" → bank_account, "cash" → cash, "e-wallet" → digital_wallet, "kredit" → credit_card
- If multiple accounts match, ask user to disambiguate

## 9. Amount extraction rules

- Support: "120k", "120.000", "120000", "120.000,50" (IDR formatting)
- Support prefixes: "Rp", "IDR"
- Support context: "belanja 120k di indomaret"
- Reject negative amounts for expense, negative amounts for income

## 10. Date extraction rules

- "hari ini" → today
- "kemarin" → yesterday
- "tanggal 5" / "tgl 5" → 5th of current month
- "5/8" or "05-08" → parse as DD/MM or DD-MM
- ISO date strings → pass through
- Unparseable → default to today, flag as Medium confidence

## 11. Definition of Done

- [ ] Natural-language input field exists on transaction entry screen alongside manual form
- [ ] Parser extracts: transaction type, amount, category, account, date from Indonesian free text
- [ ] Categorization Layer 1 (merchant dictionary) works with seeded global + household entries
- [ ] Categorization Layer 2 (keyword rules) covers at least 20 common Indonesian merchant/category keywords
- [ ] Categorization Layer 3 (user learning) persists corrections and reuses them for same household
- [ ] Confirmation flow shows extracted values with High/Medium/Low confidence indicator
- [ ] User can confirm, edit, or cancel parsed transaction
- [ ] Confirmed transactions are saved with `raw_input`, `parsed_confidence`, and `reviewed_flag`
- [ ] `npm run lint`, `npm run build`, and manual smoke test pass
- [ ] `PROGRESS_LOG.md` records the implementation date and any parser accuracy notes

## 12. Constraints

- Do not add any Phase 4+ feature
- Do not add any LLM/AI call in Increment 3 — all parsing is deterministic rule-based
- Keep Indonesian language requirement: all parser error messages, confidence labels, and UI copy must be natural Bahasa Indonesia
- Preserve existing manual form as the fallback path
- Maintain RLS and household isolation for any new tables/queries
