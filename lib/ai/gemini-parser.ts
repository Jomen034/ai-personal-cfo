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
  candidates?: { content: { parts: { text: string }[] } }[];
  error?: { message: string };
};

function extractJson(text: string): ParsedTransaction | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1].trim() : text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  const jsonStr = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr) as ParsedTransaction;
  } catch {
    return null;
  }
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

    const categoryOptions = (categories || [])
      .map((c) => `- ${c.id}: ${c.name} (${c.type})`)
      .join("\n");

    const accountOptions = (accounts || [])
      .map((a) => `- ${a.id}: ${a.name} (${a.account_type})`)
      .join("\n");

    const prompt = `Kamu adalah parser transaksi keuangan untuk aplikasi Tumara (AI Personal CFO). Ubah input bahasa alami pengguna menjadi JSON transaksi yang terstruktur. Hanya balas JSON, tanpa penjelasan lain.

Kategori yang tersedia:\n${categoryOptions || "(belum ada kategori)"}

Akun yang tersedia:\n${accountOptions || "(belum ada akun)"}

Aturan:
1. transaction_type: "income" atau "expense"
2. amount: angka bulat tanpa pemisah ribuan (contoh: 45500, bukan 45.500)
3. merchant: nama toko/merchant jika terdeteksi, abaikan jika tidak ada
4. category_id: pilih id kategori yang PALING COCOK dari daftar di atas
5. account_id: pilih id akun yang PALING COCOK dari daftar di atas (jika disebutkan)
6. transaction_date: format YYYY-MM-DD, gunakan hari ini jika tidak disebutkan
7. confidence: 0.0 sampai 1.0, seberapa yakin kamu terhadap hasilnya
8. raw_input: salinan input asli pengguna

Input pengguna: "${input}"

Balas hanya JSON dengan format:
{
  "transaction_type": "income" | "expense",
  "amount": 0,
  "merchant": "",
  "category_id": "",
  "account_id": "",
  "transaction_date": "",
  "confidence": 0.0,
  "raw_input": ""
}`;

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

      return parsed;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Waktu tunggu AI habis. Coba lagi.");
      }
      throw err;
    }
  }
}
