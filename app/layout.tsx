import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tumara",
  description: "Tumbuh dengan arah.",
};

export const viewport: Viewport = {
  themeColor: "#166b53",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className="h-full antialiased"><body className={`min-h-full ${geist.className}`}>{children}<script dangerouslySetInnerHTML={{__html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); }); }`}} /></body></html>;
}
