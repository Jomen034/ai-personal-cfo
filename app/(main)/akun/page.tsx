import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { AccountSetup } from "@/components/profile/AccountSetup";
import { Suspense } from "react";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("household_id").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return <><div className="page-heading"><div><p className="eyebrow">Sumber dana</p><h1>Akun</h1><p className="muted">Kelola rekening dan saldo yang dipakai household.</p></div></div><Suspense fallback={<><section className="skeleton-block" /><section><div className="section-heading"><p className="eyebrow">Tambah sumber dana</p><h2>Hubungkan akun secara manual</h2></div><div className="skeleton skeleton-block" style={{height: 120}} /></section></>}><AccountContent householdId={membership?.household_id || ""} /></Suspense></>;
}

async function AccountContent({ householdId }: { householdId: string }) {
  const supabase = await createClient();
  const { data: accounts } = await supabase.from("accounts").select("id, name, account_type, current_balance").eq("household_id", householdId).order("name");
  return <><section className="account-hero"><div><span className="eyebrow">Total saldo tercatat</span><strong>{(accounts || []).reduce((total, account) => total + Number(account.current_balance), 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</strong></div><WalletHint /></section><section className="content-section"><div className="section-heading"><p className="eyebrow">Tambah sumber dana</p><h2>Hubungkan akun secara manual</h2></div><AccountSetup householdId={householdId} accountTypes={ACCOUNT_TYPES} accounts={accounts || []} /></section></>;
}

function WalletHint() { return <p className="muted account-hint">Gunakan nama label saja, tanpa nomor rekening atau data perbankan sensitif.</p>; }
