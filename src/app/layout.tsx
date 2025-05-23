
"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ClientFooter } from "../components/ClientFooter";
import "./globals.css";
import CartIconWithBadge from "../components/CartIconWithBadge";
import Providers from "../components/Providers"; // Assuming this is where CartContext and other providers are

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: 'swap',
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: 'swap',
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-matte-black text-white relative antialiased">
        <Providers>
          <header className="sticky top-0 z-50 w-full border-b border-neon-magenta/30 bg-[#111111bb] backdrop-blur-md shadow-neon">
            <nav className="container flex items-center justify-between py-4">
              <Link href="/" className="flex items-center gap-3 select-none">
                <span className="glitch text-2xl font-header tracking-wide drop-shadow-md select-none" style={{ color: '#3A7CA5' }}>Wretched</span>
                <span className="font-header font-bold text-acid-magenta glow text-lg tracking-widest select-none">Designs</span>
              </Link>
              <div className="flex gap-6">
                <Link href="/shop" className="transition neon hover:text-electric-purple hover:drop-shadow-[0_0_10px_#FF00CC]">Shop</Link>
                <Link href="/gallery" className="transition neon hover:text-acid-magenta">Gallery</Link>
                <Link href="/about" className="transition neon hover:text-electric-purple">About</Link>
                <Link href="/contact" className="transition neon hover:text-acid-magenta">Contact</Link>
                <Link href="/blogs" className="transition neon hover:text-acid-magenta">Blog</Link>
                <CartIconWithBadge />
              </div>
            </nav>
          </header>
          <main className="container pt-10 pb-20 min-h-[80vh] flex flex-col">
            {children}
          </main>
          <ClientFooter />
        </Providers>
      </body>
    </html>
  );
}
