import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { env } from "@/lib/env";
import { getCurrentProfile } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Mana - Devices, audio and home essentials",
    template: "%s | Mana",
  },
  description:
    "Mana is a modern shop for phones, audio, storage and smart home gear. Free standard shipping over ₦200,000.",
  openGraph: {
    title: "Mana",
    description: "Devices, audio and home essentials, chosen to last.",
    type: "website",
    url: env.siteUrl,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Skip to content
          </a>
          <Header profile={profile} />
          <main id="main" className="pt-4">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
