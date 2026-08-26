import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CircleUserRound, House, Plus, WalletCards, History } from "lucide-react";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");
  return <><aside className="sidebar"><div><Link href="/dashboard" className="sidebar-brand">tumara<span>.</span></Link><nav className="sidebar-nav"><Link href="/dashboard"><House size={20} />Beranda</Link><Link href="/akun"><WalletCards size={20} />Akun</Link><Link href="/transaksi"><History size={20} />Riwayat</Link><Link href="/profil"><CircleUserRound size={20} />Profil</Link></nav><div className="sidebar-cta"><Link href="/transaksi/baru" className="primary-button" style={{width:"100%",textAlign:"center",display:"block"}}>Catat</Link></div></div><div className="sidebar-footer"><form action="/api/auth/signout" method="post"><button className="text-button" type="submit">Keluar</button></form></div></aside><main className="main-content">{children}</main><nav className="mobile-nav" aria-label="Navigasi utama"><Link href="/dashboard"><House size={19} />Beranda</Link><Link href="/akun"><WalletCards size={19} />Akun</Link><Link href="/transaksi/baru" className="mobile-fab" aria-label="Catat transaksi"><Plus size={24} /></Link><Link href="/transaksi"><History size={19} />Riwayat</Link><Link href="/profil"><CircleUserRound size={19} />Profil</Link></nav></>;
}
