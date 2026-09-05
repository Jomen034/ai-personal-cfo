"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, House, Plus, WalletCards, History } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/akun", label: "Akun", icon: WalletCards },
  { href: "/transaksi", label: "Riwayat", icon: History },
  { href: "/profil", label: "Profil", icon: CircleUserRound },
];

export function MainNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleNavClick = (href: string, active: boolean) => {
    if (active) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div>
          <Link href="/dashboard" className="sidebar-brand">tumara<span>.</span></Link>
          <nav className="sidebar-nav">
            {links.map((link) => (
              <button key={link.href} type="button" onClick={() => handleNavClick(link.href, isActive(link.href))} className={isActive(link.href) ? "active" : ""}>
                <link.icon size={20} />{link.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-cta">
            <Link href="/transaksi/baru" className="primary-button w-full">Catat</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <form action="/api/auth/signout" method="post">
            <button className="text-button" type="submit">Keluar</button>
          </form>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
      <nav className="mobile-nav" aria-label="Navigasi utama">
        <button type="button" onClick={() => handleNavClick("/dashboard", isActive("/dashboard"))} className={isActive("/dashboard") ? "active" : ""}><House size={19} />Beranda</button>
        <button type="button" onClick={() => handleNavClick("/akun", isActive("/akun"))} className={isActive("/akun") ? "active" : ""}><WalletCards size={19} />Akun</button>
        <Link href="/transaksi/baru" className="mobile-fab" aria-label="Catat transaksi"><Plus size={24} /></Link>
        <button type="button" onClick={() => handleNavClick("/transaksi", isActive("/transaksi"))} className={isActive("/transaksi") ? "active" : ""}><History size={19} />Riwayat</button>
        <button type="button" onClick={() => handleNavClick("/profil", isActive("/profil"))} className={isActive("/profil") ? "active" : ""}><CircleUserRound size={19} />Profil</button>
      </nav>
    </>
  );
}
