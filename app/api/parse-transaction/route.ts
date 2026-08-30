import { NextResponse } from "next/server";
import { RuleBasedParser } from "@/lib/ai/rule-based-parser";

export async function POST(request: Request) {
  try {
    const { input, household_id } = await request.json();

    if (!input || !household_id) {
      return NextResponse.json({ error: "Input dan household_id diperlukan" }, { status: 400 });
    }

    const parser = new RuleBasedParser();
    const result = await parser.parse(input, household_id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Parser error:", error);
    return NextResponse.json({ error: "Gagal memproses input" }, { status: 500 });
  }
}
