import { createClient } from "@/lib/supabase/server";
import { ParsedTransaction, TransactionParser } from "@/lib/ai/parser.interface";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GeminiResponse = {
  candidates?: { content: { parts: Array<{ text: string; thoughtSignature?: string }> } }[];
};

interface GeminiParsed {
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  account_name: string | null;
  destination_account_name: string | null;
  description: string;
}

function extractJson(text: string): GeminiParsed | null {
  const trimmed = text.trim();

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim()) as GeminiParsed;
    } catch {
      // fall through
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const jsonStr = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(jsonStr) as GeminiParsed;
    } catch {
      // fall through
    }
  }

  return null;
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
      supabase.from("categories").select("id, name, type").is("household_id", null),
      supabase.from("accounts").select("id, name, account_type").eq("household_id", householdId),
    ]);

    const categoryList = (categories || []).map((c) => c.name);
    const accountList = (accounts || []).map((a) => a.name);

    const prompt = `Parse this Indonesian financial text into JSON.

Accounts: ${JSON.stringify(accountList)}
Categories: ${JSON.stringify(categoryList)}

Text: "${input}"

Instructions:
- If text mentions transfer/tf/kirim/pindah/tarik between accounts: type=transfer, account_name=source, destination_account_name=target
- Else if text mentions gaji/bonus/terima/dapat: type=income
- Else: type=expense
- amount: numeric value (25rb=25000, 5jt=5000000)
- category: best match from list above
- description: brief context

Return ONLY JSON:
{"type":"expense","amount":0,"category":"","account_name":null,"destination_account_name":null,"description":""}`;

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
            maxOutputTokens: 1024,
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
        console.error("Gemini full data:", JSON.stringify(data).slice(0, 500));
        throw new Error("Format respons AI tidak valid");
      }

      const categoryMatch = parsed.category
        ? bestMatch(parsed.category, (categories || []).map((c) => ({ id: c.id, name: c.name })))
        : null;
      const accountMatch = parsed.account_name
        ? bestMatch(parsed.account_name, (accounts || []).map((a) => ({ id: a.id, name: a.name })))
        : null;
      const destinationAccountMatch = parsed.destination_account_name
        ? bestMatch(parsed.destination_account_name, (accounts || []).map((a) => ({ id: a.id, name: a.name })))
        : null;

      console.log("[GeminiParser] accounts:", JSON.stringify(accounts));
      console.log("[GeminiParser] parsed.account_name:", parsed.account_name, "=> accountMatch:", accountMatch);
      console.log("[GeminiParser] parsed.destination_account_name:", parsed.destination_account_name, "=> destinationAccountMatch:", destinationAccountMatch);

      return {
        transaction_type: parsed.type,
        amount: Math.round(parsed.amount),
        merchant: parsed.description || undefined,
        category_id: parsed.type === "transfer" ? undefined : categoryMatch?.id,
        account_id: accountMatch?.id,
        destination_account_id: destinationAccountMatch?.id,
        transfer_type: parsed.type === "transfer" ? "internal" : null,
        transaction_date: todayISO(),
        confidence: parsed.type === "transfer" && accountMatch && destinationAccountMatch ? 0.9 : categoryMatch && accountMatch ? 0.9 : categoryMatch ? 0.75 : 0.5,
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
