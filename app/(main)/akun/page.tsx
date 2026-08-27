import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountList } from "@/app/(main)/akun/AccountList";
import { Suspense } from "react";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <><div className="page-heading page-header-safe"><div><p className="eyebrow">Sumber dana</p><h1>Akun</h1><p className="muted">Kelola rekening dan saldo yang dipakai household.</p></div></div><Suspense fallback={<><section className="skeleton-block" /><section><div className="section-heading"><p className="eyebrow">Daftar akun</p><h2>Menyiapkan daftar...</h2></div><div className="skeleton skeleton-block" style={{height: 120}} /></section></>}><AccountsContent householdId={membership?.household_id || ""} /></Suspense></>;
}

async function AccountsContent({ householdId }: { householdId: string }) {
  const supabase = await createClient();
  const { data: accounts } = await supabase.from("accounts").select("id, name, account_type, current_balance").eq("household_id", householdId).order("name");
  const { data: transactions } = await supabase.from("transactions").select("account_id, transaction_type, amount").eq("household_id", householdId);
  const txByAccount = new Map<string, { income: number; expense: number }>();
  for (const tx of transactions || []) {
    const aid = tx.account_id as string;
    if (!txByAccount.has(aid)) txByAccount.set(aid, { income: 0, expense: 0 });
    const sums = txByAccount.get(aid)!;
    if (tx.transaction_type === "income") sums.income += Number(tx.amount);
    else sums.expense += Number(tx.amount);
  }
  const accountsWithBalance = (accounts || []).map(account => {
    const sums = txByAccount.get(account.id) || { income: 0, expense: 0 };
    const dynamicBalance = Number(account.current_balance) + sums.income - sums.expense;
    return { ...account, dynamic_balance: Math.max(0, dynamicBalance) };
  });
  const totalBalance = accountsWithBalance.reduce((sum, acc) => sum + acc.dynamic_balance, 0);
  return <><section className="account-hero"><div><span className="eyebrow">Total saldo tercatat</span><strong>{totalBalance.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</strong></div><WalletHint /></section><section className="content-section"><div className="section-heading"><div><p className="eyebrow">Daftar akun</p><h2>Rekening dan saldo terkini</h2></div></div><AccountList accounts={accountsWithBalance} householdId={householdId} /></section></>;
}

function WalletHint() { return <p className="muted account-hint">Gunakan nama label saja, tanpa nomor rekening atau data perbankan sensitif.</p>; }
