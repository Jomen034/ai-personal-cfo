import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { household_id } = await request.json();
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, name, account_type")
      .eq("household_id", household_id);
    
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, type")
      .is("household_id", null);

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      accounts: accounts || [],
      categories: categories || [],
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
