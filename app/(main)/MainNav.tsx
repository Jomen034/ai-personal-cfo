"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, House, Plus, WalletCards, History } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/akun", label: "Akun", icon: WalletCards },
  { href: "/transaksi", label: "Riwayat", icon: History },
  { href: "/profil", label: "Profil", icon: CircleUserRound },
];

export function MainNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside className="sidebar">
        <div>
          <Link href="/dashboard" className="sidebar-brand">tumara<span>.</span></Link>
          <nav className="sidebar-nav">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : ""}>
                <link.icon size={20} />{link.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-cta">
            <Link href="/transaksi/baru" className="primary-button" style={{width:"100%",textAlign:"center",display:"block"}}>Catat</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <form action="/api/auth/signout" method="post">
            <button className="text-button" type="submit">Keluar</button>
          </form>
        </div>
      </aside>
      <main className="main-content">
      </main>
      <nav className="mobile-nav" aria-label="Navigasi utama">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : ""}>
            <link.icon size={19} />{link.label}
          </Link>
        ))}
        <Link href="/transaksi/baru" className="mobile-fab" aria-label="Catat transaksi">
          <Plus size={24} />
        </Link>
      </nav>
    </>
  );
}
