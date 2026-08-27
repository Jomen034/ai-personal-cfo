import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WalletCards } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("id, household_id, display_name, households(name, invite_code)").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const household = membership?.households as unknown as { name: string; invite_code: string } | null;
  return <><div className="page-heading page-header-safe"><div><p className="eyebrow">Ruangmu</p><h1>Profil</h1><p className="muted">{membership?.display_name || user?.email}</p></div></div><section className="profile-grid"><article className="info-panel"><span className="eyebrow">Kode undangan</span><strong className="invite-code">{household?.invite_code || "Belum tersedia"}</strong><p className="muted">Bagikan kode ini kepada satu pengelola keuangan lainnya.</p></article><article className="info-panel"><span className="eyebrow">Household</span><h2>{household?.name || "Belum diatur"}</h2><p className="muted">{membership?.display_name}</p></article></section><section className="content-section"><div className="section-heading"><div><p className="eyebrow">Akun</p><h2>Sumber uang</h2></div><Link href="/akun" className="outline-button"><WalletCards size={16} />Kelola di halaman Akun</Link></div><p className="muted">Kelola rekening dan saldo di halaman Akun agar lebih rapi dan terpusat.</p></section></>;
}
