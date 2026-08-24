import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user!.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!membership) notFound();
  const { id } = await params;
  const { data: transaction, error } = await supabase.from("transactions").select("id, amount, transaction_type, transaction_date, note, categories(name), accounts(name), household_members(display_name)").eq("id", id).eq("household_id", membership.household_id).maybeSingle();
  if (error || !transaction) notFound();
  const category = transaction.categories as unknown as { name: string } | null;
  const account = transaction.accounts as unknown as { name: string } | null;
  const member = transaction.household_members as unknown as { display_name: string } | null;
  return <><div className="page-heading"><div><p className="eyebrow">Rincian transaksi</p><h1>{category?.name || "Transaksi"}</h1><p className="muted">Informasi lengkap catatan keuangan.</p></div><Link href="/transaksi" className="outline-button">Kembali</Link></div><article className="detail-panel"><div className={`detail-amount ${transaction.transaction_type === "income" ? "income-text" : "expense-text"}`}>{transaction.transaction_type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}</div><dl className="detail-list"><DetailRow label="Jenis" value={transaction.transaction_type === "income" ? "Pemasukan" : "Pengeluaran"} /><DetailRow label="Kategori" value={category?.name || "Tanpa kategori"} /><DetailRow label="Akun" value={account?.name || "Tanpa akun"} /><DetailRow label="Tanggal" value={formatDate(transaction.transaction_date)} /><DetailRow label="Dicatat oleh" value={member?.display_name || "Tidak diketahui"} /><DetailRow label="Catatan" value={transaction.note || "Tidak ada catatan"} /></dl></article></>;
}

function DetailRow({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }