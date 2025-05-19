"use client";
import Link from "next/link";

export default function ShopPage() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Shop
        </h1>
        <p className="text-lg text-white/80 mb-8">Select a collection to browse:</p>
      </div>
      <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-8 justify-center items-center">
        <Link href="/shop/cups" className="flex-1 bg-matte-black/80 rounded-xl shadow-lg p-10 flex flex-col items-center hover:bg-acid-magenta/10 transition group">
          <span className="text-5xl mb-4">🥤</span>
          <span className="text-2xl font-header mb-2 text-acid-magenta group-hover:text-electric-purple transition">Cups</span>
          <span className="text-white/70">Tumblers, mugs, and more</span>
        </Link>
        <Link href="/shop/apparel" className="flex-1 bg-matte-black/80 rounded-xl shadow-lg p-10 flex flex-col items-center hover:bg-electric-purple/10 transition group">
          <span className="text-5xl mb-4">👕</span>
          <span className="text-2xl font-header mb-2 text-electric-purple group-hover:text-acid-magenta transition">Apparel</span>
          <span className="text-white/70">Hoodies, tees, and more</span>
        </Link>
      </div>
    </section>
  );
} 