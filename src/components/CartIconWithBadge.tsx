"use client";
import Link from "next/link";
import { useCart } from "./CartContext";

export default function CartIconWithBadge() {
  const { count } = useCart();
  return (
    <Link href="/cart" title="View Cart" className="ml-2 p-2 rounded-full transition hover:bg-neon-magenta/10 relative">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF00CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="neon">
        <circle cx="9" cy="21" r="1.5"/>
        <circle cx="19" cy="21" r="1.5"/>
        <path d="M1 1h2l2.1 13.4A2 2 0 0 0 7 17h11.5a2 2 0 0 0 1.98-1.76L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-acid-magenta text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-neon animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
} 