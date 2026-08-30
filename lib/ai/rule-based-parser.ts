import { createClient } from "@/lib/supabase/server";

export interface ParsedTransaction {
  transaction_type: "income" | "expense";
  amount: number;
  merchant?: string;
  category_id?: string;
  account_id?: string;
  transaction_date: string;
  confidence: number;
  raw_input: string;
}

interface Merchant {
  id: string;
  name: string;
  aliases: string[];
  default_category_id: string | null;
}

interface Account {
  id: string;
  name: string;
  account_type: string;
}

const KEYWORD_RULES: Record<string, { category_keywords: string[]; type: "income" | "expense" }> = {
  gaji: { category_keywords: ["gaji", "salary", "upah"], type: "income" },
  makan_minum: { category_keywords: ["makan", "minum", "kopi", "sarapan", "makan siang", "makan malam", "snack", "jajanan", "warung", "restoran", "cafe", "kantin", "food", "drink"], type: "expense" },
  transportasi: { category_keywords: ["gojek", "grab", "ojol", "taxi", "bensin", "parkir", "tol", "bus", "kereta", "transport", "perjalanan", "jaket"], type: "expense" },
  tagihan: { category_keywords: ["pln", "listrik", "pdam", "air", "internet", "wifi", "pulsa", "telkomsel", "tagihan", "bill", "cicilan"], type: "expense" },
  belanja: { category_keywords: ["belanja", "shopping", "indomaret", "alfamart", "supermarket", "pasar", "market"], type: "expense" },
  kesehatan: { category_keywords: ["kesehatan", "obat", "rumah sakit", "klinik", "dokter", "bpjs", "asuransi"], type: "expense" },
  hiburan: { category_keywords: ["hiburan", "film", "bioskop", "game", "spotify", "netflix", "youtube", "nonton"], type: "expense" },
  pendidikan: { category_keywords: ["pendidikan", "sekolah", "kuliah", "kursus", "buku", "les"], type: "expense" },
};

const ACCOUNT_TYPE_KEYWORDS: Record<string, string[]> = {
  cash: ["cash", "tunai", "dompet"],
  bank_account: ["debit", "bank", "rekening", "bca", "mandiri", "bni", "bri"],
  digital_wallet: ["e-wallet", "ewallet", "gopay", "ovo", "dana", "shopeepay"],
  credit_card: ["kredit", "credit card", "kartu kredit"],
};

function extractAmount(input: string): number | null {
  const patterns = [
    /(?:Rp\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/,
    /(\d+)\s*k(?:\s|$)/i,
    /(\d+)\s*jt(?:\s|$)/i,
    /(\d+)\s*ribu(?:\s|$)/i,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/[.,]/g, ""));
      if (amount < 1000 && /\bk\b/i.test(match[0])) amount *= 1000;
      if (amount < 1000 && /\bjt\b/i.test(match[0])) amount *= 1000000;
      if (amount < 1000 && /\bribu\b/i.test(match[0])) amount *= 1000;
      if (Number.isFinite(amount) && amount > 0) return Math.round(amount);
    }
  }

  return null;
}

function extractDate(input: string): string {
  const today = new Date();
  const lower = input.toLowerCase();

  if (lower.includes("hari ini")) return today.toISOString().slice(0, 10);
  if (lower.includes("kemarin")) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  const dateMatch = input.match(/(?:tanggal|tgl)\s+(\d{1,2})/i);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const d = new Date(today.getFullYear(), today.getMonth(), day);
    return d.toISOString().slice(0, 10);
  }

    const dmyMatch = input.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10);
      let year = dmyMatch[3] ? parseInt(dmyMatch[3], 10) : today.getFullYear();
      if (year < 100) year += 2000;
      const d = new Date(year, month - 1, day);
      return d.toISOString().slice(0, 10);
    }

  return today.toISOString().slice(0, 10);
}

function inferTransactionType(input: string, amount: number | null): "income" | "expense" {
  const lower = input.toLowerCase();

  const incomeKeywords = ["gaji", "bonus", "hadiah", "transfer masuk", "pemasukan", "diterima", "cashback"];
  const expenseKeywords = ["beli", "bayar", "keluar", "pengeluaran", "transaksi", "order", "pesan"];

  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) return "income";
  }
  for (const kw of expenseKeywords) {
    if (lower.includes(kw)) return "expense";
  }

  if (amount && amount > 0) {
    const hasIncomeContext = lower.includes("dapat") || lower.includes("terima");
    const hasExpenseContext = lower.includes("habis") || lower.includes("keluar");
    if (hasIncomeContext && !hasExpenseContext) return "income";
    if (hasExpenseContext && !hasIncomeContext) return "expense";
  }

  return "expense";
}

function computeConfidence(hasMerchant: boolean, hasCategory: boolean, hasAccount: boolean): number {
  if (hasMerchant && hasCategory && hasAccount) return 0.9;
  if (hasMerchant && hasCategory) return 0.75;
  if (hasMerchant || hasCategory) return 0.6;
  return 0.4;
}

export class RuleBasedParser {
  async parse(input: string, householdId: string): Promise<ParsedTransaction> {
    const supabase = await createClient();
    const lowerInput = input.toLowerCase();

    const amount = extractAmount(input);
    const transaction_date = extractDate(input);
    const transaction_type = inferTransactionType(input, amount);

    let merchant: string | undefined;
    let category_id: string | undefined;
    let account_id: string | undefined;

    const { data: merchants } = await supabase
      .from("merchants")
      .select("id, name, aliases, default_category_id")
      .or(`household_id.is.null,household_id.eq.${householdId}`);

    const merchantList = (merchants || []) as Merchant[];
    for (const m of merchantList) {
      const allNames = [m.name, ...m.aliases].map((n) => n.toLowerCase());
      if (allNames.some((n) => lowerInput.includes(n))) {
        merchant = m.name;
        category_id = m.default_category_id || undefined;
        break;
      }
    }

    if (!category_id) {
      for (const [key, rule] of Object.entries(KEYWORD_RULES)) {
        if (rule.type === transaction_type && rule.category_keywords.some((kw) => lowerInput.includes(kw))) {
          const { data: category } = await supabase
            .from("categories")
            .select("id")
            .eq("household_id", householdId)
            .eq("name", key.replace("_", " & "))
            .limit(1);
          if (category && category.length > 0) {
            category_id = category[0].id;
            break;
          }
        }
      }
    }

    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, name, account_type")
      .eq("household_id", householdId);

    const accountList = (accounts || []) as Account[];
    for (const acc of accountList) {
      if (lowerInput.includes(acc.name.toLowerCase())) {
        account_id = acc.id;
        break;
      }
    }

    if (!account_id) {
      for (const [type, keywords] of Object.entries(ACCOUNT_TYPE_KEYWORDS)) {
        if (keywords.some((kw) => lowerInput.includes(kw))) {
          const match = accountList.find((a) => a.account_type === type);
          if (match) {
            account_id = match.id;
            break;
          }
        }
      }
    }

    const confidence = computeConfidence(!!merchant, !!category_id, !!account_id);

    return {
      transaction_type,
      amount: amount || 0,
      merchant,
      category_id,
      account_id,
      transaction_date,
      confidence,
      raw_input: input,
    };
  }
}
