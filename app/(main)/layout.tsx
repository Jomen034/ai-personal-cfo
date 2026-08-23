import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="app-shell"><header className="topbar"><Link href="/dashboard" className="brand-mark">tumara<span>·</span></Link><nav><Link href="/dashboard">Ringkasan</Link><Link href="/transaksi">Transaksi</Link><Link href="/profil">Profil</Link></nav><form action="/api/auth/signout" method="post"><button className="text-button">Keluar</button></form></header><main className="main-content">{children}</main></div>;
}