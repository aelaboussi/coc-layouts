import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Town Hall & Builder Hall Base Layouts`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Browse real Clash of Clans base layouts by Town Hall level, sorted by category and freshness, with one-tap links into the game. Unofficial fan resource.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-200">
        <Header />
        <main className="flex-1">{children}</main>
        <div className="mx-auto w-full max-w-6xl px-4">
          <AdSlot size="banner" />
        </div>
        <Footer />
      </body>
    </html>
  );
}
