import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumara",
  description: "Tumbuh dengan arah.",
};

export const viewport: Viewport = {
  themeColor: "#166b53",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className="h-full antialiased"><body className="min-h-full">{children}</body></html>;
}
