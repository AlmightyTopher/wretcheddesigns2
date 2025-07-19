"use client";
import { useCart } from '../../components/CartContext';
import Link from 'next/link';

const productImages: Record<string, string> = {
  'aurora-glow-tumbler': '🥤',
  'midnight-marble-mug': '☕',
  'sunset-crop-hoodie': '🧥',
  'dreamstate-tee': '👕',
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Cart
        </h1>
        <div className="text-6xl mb-4 animate-bounce">🛒</div>
        <p className="text-lg text-white/80 mb-6">Your cart is empty.</p>
        <Link href="/shop" className="px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta" aria-label="Go to Shop">Go to Shop</Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center min-h-[60vh] w-full p-4">
      <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
        Cart
      </h1>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 mb-8">
        {items.map(item => (
          <div key={item.id} className="bg-matte-black rounded-xl shadow-lg p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col items-center mr-2">
              <span className="text-4xl mb-1">{productImages[item.id] || '🛍️'}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <span className="text-acid-magenta font-bold">${item.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-acid-magenta text-white rounded hover:bg-electric-purple transition focus:outline-none focus:ring-2 focus:ring-acid-magenta"
                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                aria-label={`Decrease quantity of ${item.name}`}
              >-</button>
              <span className="px-3 text-lg font-mono">{item.quantity}</span>
              <button
                className="px-2 py-1 bg-acid-magenta text-white rounded hover:bg-electric-purple transition focus:outline-none focus:ring-2 focus:ring-acid-magenta"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label={`Increase quantity of ${item.name}`}
              >+</button>
            </div>
            <span className="w-20 text-right font-mono">${(item.price * item.quantity).toFixed(2)}</span>
            <button
              className="ml-4 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-800 transition focus:outline-none focus:ring-2 focus:ring-red-600"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name} from cart`}
            >Remove</button>
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <span className="text-xl font-bold">Total: <span className="text-acid-magenta">${total.toFixed(2)}</span></span>
        <button
          className="px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta"
          onClick={clearCart}
          aria-label="Clear Cart"
        >Clear Cart</button>
        <Link href="/checkout" className="px-6 py-3 bg-electric-purple text-white rounded shadow hover:bg-acid-magenta transition font-bold focus:outline-none focus:ring-2 focus:ring-electric-purple" aria-label="Checkout">Checkout</Link>
      </div>
    </section>
  );
} 