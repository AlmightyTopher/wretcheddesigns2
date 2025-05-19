"use client";
import { useState } from "react";
import { useCart } from "../../components/CartContext";
import { formatOrderPayload } from "../../lib/cartService";
import { pay } from "../../lib/paymentService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleEmailBlur = () => setEmailTouched(true);
  const isEmailValid = form.email.match(/^\S+@\S+\.\S+$/);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const orderPayload = formatOrderPayload(items, form);
      const result = await pay(orderPayload);
      clearCart();
      router.push(`/confirmation?orderId=${result.orderId}`);
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center min-h-[60vh] w-full p-4 relative">
      {loading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta border-b-4 border-electric-purple"></div>
        </div>
      )}
      <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
        Checkout
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col gap-5 relative">
        <input name="name" type="text" required placeholder="Name" className="px-4 py-2 rounded bg-[#222] text-white mb-2 focus:outline-none focus:ring-2 focus:ring-acid-magenta" value={form.name} onChange={handleChange} aria-label="Name" />
        <input name="email" type="email" required placeholder="Email" className="px-4 py-2 rounded bg-[#222] text-white mb-2 focus:outline-none focus:ring-2 focus:ring-acid-magenta" value={form.email} onChange={handleChange} onBlur={handleEmailBlur} aria-label="Email" />
        {emailTouched && !isEmailValid && (
          <div className="text-red-500 text-sm mb-2">Please enter a valid email address.</div>
        )}
        <input name="address" type="text" required placeholder="Shipping Address" className="px-4 py-2 rounded bg-[#222] text-white mb-2 focus:outline-none focus:ring-2 focus:ring-acid-magenta" value={form.address} onChange={handleChange} aria-label="Shipping Address" />
        <input name="phone" type="tel" placeholder="Phone (optional)" className="px-4 py-2 rounded bg-[#222] text-white mb-2 focus:outline-none focus:ring-2 focus:ring-acid-magenta" value={form.phone} onChange={handleChange} aria-label="Phone" />
        <div className="bg-[#18181b] rounded p-4 mb-2 border-2 border-acid-magenta/40 shadow-lg">
          <h2 className="text-lg font-bold mb-2 text-acid-magenta flex items-center gap-2">
            <span>Order Summary</span>
            <span className="text-xl">🧾</span>
          </h2>
          {items.length === 0 ? (
            <p className="text-white/70">No items in cart.</p>
          ) : (
            <ul className="mb-2">
              {items.map(item => (
                <li key={item.id} className="flex justify-between text-white/90">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between font-bold text-white border-t border-acid-magenta pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        {error && <div className="text-red-500 font-bold mb-2">{error}</div>}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link href="/cart" className="px-6 py-3 bg-matte-black text-acid-magenta border border-acid-magenta rounded shadow hover:bg-acid-magenta hover:text-white transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta text-center" aria-label="Back to Cart">Back to Cart</Link>
          <button type="submit" className="px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta" disabled={loading || items.length === 0 || !isEmailValid} aria-label="Confirm and Pay">
            {loading ? "Processing..." : "Confirm & Pay"}
          </button>
        </div>
      </form>
    </section>
  );
} 