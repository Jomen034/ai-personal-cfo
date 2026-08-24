import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { AccountSetup } from "@/components/profile/AccountSetup";

export default async function ProfilePage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = await supabase.from("household_members").select("id, household_id, display_name, households(name, invite_code)").eq("auth_user_id", user!.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: accounts } = membership ? await supabase.from("accounts").select("id, name, account_type, current_balance").eq("household_id", membership.household_id).order("name") : { data: [] };
  const household = membership?.households as unknown as { name: string; invite_code: string } | null;
  return <><div className="page-heading"><div><p className="eyebrow">Ruangmu</p><h1>Profil</h1><p className="muted">{user!.email}</p></div></div><section className="profile-grid"><article className="info-panel"><span className="eyebrow">Kode undangan</span><strong className="invite-code">{household?.invite_code || "Belum tersedia"}</strong><p className="muted">Bagikan kode ini kepada satu pengelola keuangan lainnya.</p></article><article className="info-panel"><span className="eyebrow">Household</span><h2>{household?.name || "Belum diatur"}</h2><p className="muted">{membership?.display_name}</p></article></section><section className="content-section" id="akun"><div className="section-heading"><div><p className="eyebrow">Akun</p><h2>Sumber uang</h2></div></div><AccountSetup householdId={membership?.household_id || ""} accountTypes={ACCOUNT_TYPES} accounts={accounts || []} /></section></>;
}