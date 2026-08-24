import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CircleUserRound, House, ReceiptText, WalletCards } from "lucide-react";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="app-shell"><header className="topbar"><Link href="/dashboard" className="brand-mark">tumara<span>·</span></Link><nav className="desktop-nav"><Link href="/dashboard"><House size={16} />Ringkasan</Link><Link href="/transaksi"><ReceiptText size={16} />Transaksi</Link><Link href="/akun"><WalletCards size={16} />Akun</Link><Link href="/profil"><CircleUserRound size={16} />Profil</Link></nav><form action="/api/auth/signout" method="post"><button className="text-button">Keluar</button></form></header><main className="main-content">{children}</main><nav className="mobile-nav" aria-label="Navigasi utama"><Link href="/dashboard"><House size={19} />Ringkasan</Link><Link href="/transaksi"><ReceiptText size={19} />Transaksi</Link><Link href="/akun"><WalletCards size={19} />Akun</Link><Link href="/profil"><CircleUserRound size={19} />Profil</Link></nav></div>;
}