import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json() as { inviteCode?: string; displayName?: string };
  if (!body.inviteCode || !body.displayName?.trim()) {
    return NextResponse.json({ error: "Kode undangan dan nama wajib diisi." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sesi masuk tidak ditemukan." }, { status: 401 });
  const { data, error } = await supabase.rpc("join_household_by_invite", { join_code: body.inviteCode, member_name: body.displayName });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}