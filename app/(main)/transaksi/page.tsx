import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransactionList } from "@/components/transactions/TransactionList";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: transactions } = membership ? await supabase.from("transactions").select("id, amount, transaction_type, transaction_date, note, categories(name), accounts(name), household_members(display_name)").eq("household_id", membership.household_id).order("transaction_date", { ascending: false }) : { data: [] };
  const params = await searchParams;
  return <><div className="page-heading"><div><p className="eyebrow">Catatan keuangan</p><h1>Transaksi</h1><p className="muted">Semua pemasukan dan pengeluaran household.</p></div><Link href="/transaksi/baru" className="primary-button">+ Catat transaksi</Link></div>{params.saved === "1" && <p className="success-text">Transaksi berhasil disimpan.</p>}<TransactionList transactions={(transactions || []) as unknown as React.ComponentProps<typeof TransactionList>["transactions"]} /></>;
}