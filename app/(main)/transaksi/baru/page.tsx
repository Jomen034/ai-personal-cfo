import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("id, household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: accounts } = membership ? await supabase.from("accounts").select("id, name, account_type").eq("household_id", membership.household_id).order("name") : { data: [] };
  const { data: categories } = await supabase.from("categories").select("id, name, type").is("household_id", null).order("name");
  return <><div className="page-heading"><div><p className="eyebrow">Catatan baru</p><h1>Catat transaksi</h1><p className="muted">Simpan aktivitas keuangan dengan cepat.</p></div></div><TransactionForm memberId={membership?.id || ""} householdId={membership?.household_id || ""} accounts={accounts || []} categories={categories || []} /></>;
}