import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Suspense } from "react";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("id, household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <><div className="page-heading"><div><p className="eyebrow">Catatan baru</p><h1>Catat transaksi</h1><p className="muted">Simpan aktivitas keuangan dengan cepat.</p></div></div>{membership ? <Suspense fallback={<form className="form-panel"><div className="skeleton skeleton-text title" /><div className="skeleton skeleton-text" style={{width: "50%"}} /><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><div className="skeleton skeleton-text" /><div className="skeleton skeleton-block" style={{height: 44}} /></div><div><div className="skeleton skeleton-text" /><div className="skeleton skeleton-block" style={{height: 44}} /></div></div><div className="skeleton skeleton-text" /><div className="skeleton skeleton-block" style={{height: 100}} /></form>}><TransactionFormData memberId={membership.id} householdId={membership.household_id} /></Suspense> : <p className="error-text">Household belum tersedia. Muat ulang halaman atau buat household terlebih dahulu.</p>}</>;
}

async function TransactionFormData({ memberId, householdId }: { memberId: string; householdId: string }) {
  const supabase = await createClient();
  const { data: accounts } = await supabase.from("accounts").select("id, name, account_type").eq("household_id", householdId).order("name");
  const { data: categories } = await supabase.from("categories").select("id, name, type").is("household_id", null).order("name");
  return <TransactionForm memberId={memberId} householdId={householdId} accounts={accounts || []} categories={categories || []} />;
}
