"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function getEstimatedDelivery() {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const delivery = getEstimatedDelivery();
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
      {/* Confetti SVG */}
      <div className="w-full flex justify-center mb-2">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <circle cx="20" cy="20" r="4" fill="#FF00CC"/>
          <circle cx="60" cy="10" r="3" fill="#3A7CA5"/>
          <circle cx="100" cy="25" r="5" fill="#A259F7"/>
          <circle cx="40" cy="40" r="2.5" fill="#F7B32B"/>
          <circle cx="80" cy="50" r="3.5" fill="#00FFD0"/>
        </svg>
      </div>
      <div className="bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center max-w-lg w-full">
        <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-5 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Thank You!
</h1>
        <p className="text-lg text-white/90 mb-4 text-center">Your order has been placed successfully.</p>
        {orderId && (
          <div className="mb-4 text-center">
            <span className="text-acid-magenta font-bold">Order ID:</span>
            <span className="ml-2 font-mono text-white">{orderId}</span>
          </div>
        )}
        <div className="mb-4 text-center">
          <span className="text-white/80">Estimated delivery:</span>
          <span className="ml-2 text-electric-purple font-bold">{delivery}</span>
        </div>
        <Link href="/shop" className="px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold mt-4">Continue Shopping</Link>
      </div>
    </section>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function getEstimatedDelivery() {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const delivery = getEstimatedDelivery();
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
      {/* Confetti SVG */}
      <div className="w-full flex justify-center mb-2">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
          <circle cx="20" cy="20" r="4" fill="#FF00CC"/>
          <circle cx="60" cy="10" r="3" fill="#3A7CA5"/>
          <circle cx="100" cy="25" r="5" fill="#A259F7"/>
          <circle cx="40" cy="40" r="2.5" fill="#F7B32B"/>
          <circle cx="80" cy="50" r="3.5" fill="#00FFD0"/>
        </svg>
      </div>
      <div className="bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center max-w-lg w-full">
        <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-5 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Thank You!
        </h1>
        <p className="text-lg text-white/90 mb-4 text-center">Your order has been placed successfully.</p>
        {orderId && (
          <div className="mb-4 text-center">
            <span className="text-acid-magenta font-bold">Order ID:</span>
            <span className="ml-2 font-mono text-white">{orderId}</span>
          </div>
        )}
        <div className="mb-4 text-center">
          <span className="text-white/80">Estimated delivery:</span>
          <span className="ml-2 text-electric-purple font-bold">{delivery}</span>
        </div>
        <Link href="/shop" className="px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold mt-4">Continue Shopping</Link>
      </div>
    </section>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
} 