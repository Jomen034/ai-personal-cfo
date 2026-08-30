import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils/currency";
import { getCurrentMonthRange } from "@/lib/utils/date";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("household_id, display_name, households(name)").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!membership) return <EmptyState />;
  const household = membership.households as unknown as { name: string } | null;
  const householdName = household?.name || "";
  return <><div className="page-heading page-header-safe"><div><p className="eyebrow">Ringkasan bulan ini</p><p className="muted font-body">Halo, {membership.display_name}{householdName ? ` · ${householdName}` : ""}</p></div></div><Suspense fallback={<><section className="skeleton-block" /><section className="skeleton-block" /></>}><DashboardBalance householdId={membership.household_id} /></Suspense><Suspense fallback={<><div className="section-heading"><div><p className="eyebrow">Aktivitas terbaru</p><h2>Catatan bulan ini</h2></div><Link href="/transaksi" className="outline-button">Lihat semua</Link></div><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 120}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 100}} /></div><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 140}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 90}} /></div><div className="skeleton-row"><div><div className="skeleton skeleton-text" style={{width: 100}} /><div className="skeleton skeleton-text short" /></div><div className="skeleton skeleton-text" style={{width: 110}} /></div></>}><DashboardRecent householdId={membership.household_id} /></Suspense></>;
}

async function DashboardBalance({ householdId }: { householdId: string }) {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthRange();
  const { data: transactions } = await supabase.from("transactions").select("amount, transaction_type").eq("household_id", householdId).gte("transaction_date", start).lt("transaction_date", end);
  const income = (transactions || []).filter((item) => item.transaction_type === "income").reduce((total, item) => total + Number(item.amount), 0);
  const expense = (transactions || []).filter((item) => item.transaction_type === "expense").reduce((total, item) => total + Number(item.amount), 0);
  return <><section className="balance-hero"><div><span className="eyebrow">Sisa bulan ini</span><strong>{formatRupiah(income - expense)}</strong></div><Link href="/akun" className="hero-link">Kelola akun →</Link></section><section className="summary-grid"><SummaryCard label="Pemasukan" value={income} tone="income" /><SummaryCard label="Pengeluaran" value={expense} tone="expense" /></section></>;
}

async function DashboardRecent({ householdId }: { householdId: string }) {
  const supabase = await createClient();
  const { start, end } = getCurrentMonthRange();
  const { data: recentTransactions } = await supabase.from("transactions").select("amount, transaction_type, id, categories(name), accounts(name)").eq("household_id", householdId).gte("transaction_date", start).lt("transaction_date", end).order("transaction_date", { ascending: false }).limit(4);
  return <section className="recent-section"><div className="section-heading"><div><p className="eyebrow">Aktivitas terbaru</p><h2>Catatan bulan ini</h2></div><Link href="/transaksi" className="outline-button">Lihat semua</Link></div>{recentTransactions?.length ? <div className="recent-list">{recentTransactions.map((transaction) => <div className="recent-row" key={transaction.id}><div><strong>{(transaction.categories as unknown as { name: string } | null)?.name || "Tanpa kategori"}</strong><span>{(transaction.accounts as unknown as { name: string } | null)?.name || "Tanpa akun"}</span></div><strong className={transaction.transaction_type === "income" ? "income-text" : "expense-text"}>{transaction.transaction_type === "income" ? "+" : "-"}{formatRupiah(transaction.amount)}</strong></div>)}</div> : <p className="muted">Belum ada catatan bulan ini. Mulai dari satu transaksi kecil.</p>}</section>;
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: string }) { return <article className={`summary-card ${tone}`}><span>{label}</span><strong>{formatRupiah(value)}</strong><small>bulan berjalan</small></article>; }
function EmptyState() { return <div className="empty-state"><p className="eyebrow">Satu langkah lagi</p><h1>Lengkapi ruang keuanganmu.</h1><p className="muted">Buat household atau gabung menggunakan kode undangan untuk mulai mencatat.</p><Link href="/signup?step=household" className="primary-button">Atur sekarang</Link></div>; }
