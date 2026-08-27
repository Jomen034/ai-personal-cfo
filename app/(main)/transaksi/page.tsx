import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Suspense } from "react";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const params = await searchParams;
  return <><div className="page-heading page-header-safe"><div><p className="eyebrow">Catatan keuangan</p><h1>Transaksi</h1><p className="muted">Semua pemasukan dan pengeluaran household.</p></div></div>{params.saved === "1" && <p className="success-text">Transaksi berhasil disimpan.</p>}<Suspense fallback={<><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 140}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 120}} /></div><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 100}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 130}} /></div><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 160}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 90}} /></div></>}><TransactionRows householdId={membership?.household_id || ""} /></Suspense></>;
}

async function TransactionRows({ householdId }: { householdId: string }) {
  const supabase = await createClient();
  const { data: transactions } = await supabase.from("transactions").select("id, amount, transaction_type, transaction_date, note, categories(name), accounts(name), household_members(display_name)").eq("household_id", householdId).order("transaction_date", { ascending: false });
  return <TransactionList transactions={(transactions || []) as unknown as React.ComponentProps<typeof TransactionList>["transactions"]} />;
}
