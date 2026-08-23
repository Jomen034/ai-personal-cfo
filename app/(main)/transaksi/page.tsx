import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user!.id).eq("is_active", true).maybeSingle();
  const { data: transactions } = membership ? await supabase.from("transactions").select("id, amount, transaction_type, transaction_date, note, categories(name), accounts(name)").eq("household_id", membership.household_id).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }) : { data: [] };
  return <><div className="page-heading"><div><p className="eyebrow">Catatan keuangan</p><h1>Transaksi</h1><p className="muted">Semua pemasukan dan pengeluaran household.</p></div><Link href="/transaksi/baru" className="primary-button">+ Catat transaksi</Link></div><div className="transaction-list">{transactions?.length ? transactions.map((transaction) => { const category = transaction.categories as unknown as { name: string } | null; const account = transaction.accounts as unknown as { name: string } | null; return <article className="transaction-row" key={transaction.id}><div><strong>{category?.name || "Tanpa kategori"}</strong><p>{transaction.note || account?.name || "Tanpa catatan"}</p></div><div className="transaction-meta"><time>{formatDate(transaction.transaction_date)}</time><strong className={transaction.transaction_type === "income" ? "income-text" : "expense-text"}>{transaction.transaction_type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}</strong></div></article>; }) : <div className="empty-state compact"><h2>Belum ada transaksi.</h2><p className="muted">Catat transaksi pertamamu untuk melihat ritme keuangan household.</p></div>}</div></>;
}