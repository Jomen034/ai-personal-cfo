import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").select("id").is("household_id", null).limit(1);
  if (error) return NextResponse.json({ status: "error" }, { status: 503 });
  return NextResponse.json({ status: "ok", service: "tumara" }, { headers: { "Cache-Control": "no-store" } });
}
