import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json() as { inviteCode?: string };
  if (!body.inviteCode) {
    return NextResponse.json({ error: "Kode undangan wajib diisi." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, { status: 401 });
  const { data, error } = await supabase.rpc("join_household_by_invite", { join_code: body.inviteCode });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}