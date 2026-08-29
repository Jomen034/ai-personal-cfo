import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) redirect("/login");
  const { data: membership } = await supabase.from("household_members").select("id, household_id, display_name, households(name, invite_code)").eq("auth_user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const household = membership?.households as unknown as { name: string; invite_code: string } | null;
  return <><div className="page-heading page-header-safe"><div><p className="eyebrow">Ruangmu</p><h1>Profil</h1><p className="muted">{membership?.display_name || user?.email}</p></div></div><section className="profile-grid"><article className="info-panel"><span className="eyebrow">Kode undangan</span><strong className="invite-code">{household?.invite_code || "Belum tersedia"}</strong><p className="muted">Bagikan kode ini kepada satu pengelola keuangan lainnya.</p></article><article className="info-panel"><span className="eyebrow">Household</span><h2>{household?.name || "Belum diatur"}</h2><p className="muted">{membership?.display_name}</p></article></section><section className="content-section"><div className="section-heading"><div><p className="eyebrow">Akun</p><h2>Sumber uang</h2></div><Link href="/akun" className="outline-button">Kelola akun →</Link></div><p className="muted">Kelola rekening dan saldo di halaman Akun.</p></section><section className="content-section"><div className="section-heading"><p className="eyebrow">Lainnya</p><h2>Keamanan &amp; Privasi</h2></div><p className="muted">Pelajari bagaimana data dan privasi kamu dilindungi.</p><Link href="/keamanan-privasi" className="outline-button" style={{marginTop: 12}}>Buka halaman Keamanan &amp; Privasi →</Link><form action="/api/auth/signout" method="post" style={{marginTop: 12}}><button className="outline-button" type="submit" style={{borderColor: "var(--color-error)", color: "var(--color-error)"}}>Keluar</button></form></section></>;
}
