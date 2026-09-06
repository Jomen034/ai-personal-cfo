import { NextResponse } from "next/server";
import { GeminiParser } from "@/lib/ai/gemini-parser";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: Request) {
  try {
    const { input, household_id } = await request.json();

    if (!input || !household_id) {
      return NextResponse.json({ error: "Input dan household_id diperlukan" }, { status: 400 });
    }

    const parser = new GeminiParser();
    const result = await parser.parse(input, household_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Parser error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memproses input" }, { status: 500 });
  }
}
