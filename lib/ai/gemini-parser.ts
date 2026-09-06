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

export interface TransactionParser {
  parse(input: string, householdId: string): Promise<ParsedTransaction>;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: { content: { parts: Array<{ text: string; thoughtSignature?: string }> } }[];
};

interface GeminiParsed {
  type: "income" | "expense";
  amount: number;
  category: string;
  account_name: string | null;
  description: string;
}

function extractJson(text: string): GeminiParsed | null {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1].trim() : trimmed;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  const jsonStr = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr) as GeminiParsed;
  } catch {
    return null;
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function bestMatch(name: string, candidates: Array<{ id: string; name: string }>): { id: string; score: number } | null {
  const lower = name.toLowerCase();
  let best: { id: string; score: number } | null = null;

  for (const c of candidates) {
    const cl = c.name.toLowerCase();
    let score = 0;
    if (cl === lower) score = 1.0;
    else if (cl.includes(lower) || lower.includes(cl)) score = 0.85;
    else if (cl.split(/\s+/).some((w) => lower.includes(w))) score = 0.6;
    if (!best || score > best.score) best = { id: c.id, score };
  }

  return best && best.score >= 0.6 ? best : null;
}

export class GeminiParser implements TransactionParser {
  async parse(input: string, householdId: string): Promise<ParsedTransaction> {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY tidak dikonfigurasi di server.");
    }

    const supabase = await createClient();

    const [{ data: categories }, { data: accounts }] = await Promise.all([
      supabase.from("categories").select("id, name, type").eq("household_id", householdId),
      supabase.from("accounts").select("id, name, account_type").eq("household_id", householdId),
    ]);

    const categoryList = (categories || []).map((c) => c.name);
    const accountList = (accounts || []).map((a) => a.name);

    const prompt = `You are the Natural Language Financial Parser for 'Tumara AI Personal CFO'.
Extract financial transaction details from the user's natural language input into a strict JSON format.

Available User Accounts: ${JSON.stringify(accountList)}
Available Categories: ${JSON.stringify(categoryList)}

Rules:
1. Identify if it's 'expense' or 'income'. Default to 'expense' unless explicitly 'terima', 'dapat', or 'pemasukan'.
2. Extract the exact numerical amount (convert '50k' -> 50000, '1.2jt' -> 1200000).
3. Match 'account_name' to the closest available account provided above. If no match, return null.
4. Match 'category' to the most relevant available category.
5. Clean the remaining context as 'description'.

Return ONLY valid JSON:
{
  "type": "expense" | "income",
  "amount": number,
  "category": string,
  "account_name": string | null,
  "description": string
}

Input: "${input}"`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 256,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`Gagal memproses input (HTTP ${response.status})`);
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error("Gemini empty response:", JSON.stringify(data));
        throw new Error("Respons AI kosong");
      }

      const parsed = extractJson(text);
      if (!parsed) {
        console.error("Gemini non-JSON response:", text);
        throw new Error("Format respons AI tidak valid");
      }

      const categoryMatch = bestMatch(parsed.category, (categories || []).map((c) => ({ id: c.id, name: c.name })));
      const accountMatch = parsed.account_name
        ? bestMatch(parsed.account_name, (accounts || []).map((a) => ({ id: a.id, name: a.name })))
        : null;

      return {
        transaction_type: parsed.type,
        amount: Math.round(parsed.amount),
        merchant: parsed.description || undefined,
        category_id: categoryMatch?.id,
        account_id: accountMatch?.id,
        transaction_date: todayISO(),
        confidence: categoryMatch && accountMatch ? 0.9 : categoryMatch ? 0.75 : 0.5,
        raw_input: input,
      };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Waktu tunggu AI habis. Coba lagi.");
      }
      throw err;
    }
  }
}
