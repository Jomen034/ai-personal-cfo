import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/currency";
import { getCurrentMonthRange } from "@/lib/utils/date";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ household?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("household_members").select("household_id, display_name, households(name)").eq("auth_user_id", user!.id).eq("is_active", true).maybeSingle();
  if (!membership) return <EmptyState />;
  const { prefix } = getCurrentMonthRange();
  const { data: transactions } = await supabase.from("transactions").select("amount, transaction_type").eq("household_id", membership.household_id).gte("transaction_date", `${prefix}-01`).lt("transaction_date", `${prefix}-32`);
  const income = (transactions || []).filter((item) => item.transaction_type === "income").reduce((total, item) => total + Number(item.amount), 0);
  const expense = (transactions || []).filter((item) => item.transaction_type === "expense").reduce((total, item) => total + Number(item.amount), 0);
  const household = membership.households as unknown as { name: string } | null;
  const params = await searchParams;
  return <><div className="page-heading"><div><p className="eyebrow">Ringkasan bulan ini</p><h1>{params.household ? `Household ${params.household} berhasil dibuat.` : `Halo, ${membership.display_name}.`}</h1><p className="muted">{household?.name || "Ruang keuanganmu"}</p></div><Link href="/transaksi/baru" className="primary-button">+ Catat transaksi</Link></div><section className="summary-grid"><SummaryCard label="Pemasukan" value={income} tone="income" /><SummaryCard label="Pengeluaran" value={expense} tone="expense" /><SummaryCard label="Sisa" value={income - expense} tone="balance" /></section><section className="content-band"><div><p className="eyebrow">Aktivitas terbaru</p><h2>Keuangan yang terlihat, lebih mudah diarahkan.</h2></div><Link href="/transaksi" className="outline-button">Lihat semua transaksi</Link></section></>;
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) { return <article className={`summary-card ${tone}`}><span>{label}</span><strong>{formatRupiah(value)}</strong><small>bulan berjalan</small></article>; }
function EmptyState() { return <div className="empty-state"><p className="eyebrow">Satu langkah lagi</p><h1>Lengkapi ruang keuanganmu.</h1><p className="muted">Buat household atau gabung menggunakan kode undangan untuk mulai mencatat.</p><Link href="/signup?step=household" className="primary-button">Atur sekarang</Link></div>; }