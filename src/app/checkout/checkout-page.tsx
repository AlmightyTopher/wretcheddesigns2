// Instructions: Update checkout-page.tsx to properly use the Elements provider from Stripe, fetch client secret, and pass it to CheckoutForm. Also, improve loading and error states.

import { useState, useEffect } from "react";
import { useCart } from "../../components/CartContext";
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from "../../components/CheckoutForm"; // Import the updated CheckoutForm
import { useRouter } from "next/navigation";
import Link from "next/link";

// ... existing code ... <imports>
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items, total, clearCart, getTotalAmount } = useCart();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true); // To manage loading state of client secret
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (items.length > 0) {
      setLoading(true);
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(getTotalAmount() * 100) }), // Ensure amount is in cents
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error.message || "Failed to initialize payment.");
            setLoading(false);
          } else if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setLoading(false);
          } else {
            setError("Received an unexpected response from payment server.");
            setLoading(false);
          }
        })
        .catch(() => {
          setError("Could not connect to payment server. Please try again.");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [items, getTotalAmount]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      labels: 'floating',
      variables: {
        colorPrimary: '#f0f', // Example: Acid Magenta
        colorBackground: '#18181b', // Example: Matte Black
        colorText: '#ffffff',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '2px',
        borderRadius: '4px',
        // See all variables: https://stripe.com/docs/elements/appearance-api
      }
    },
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta border-b-4 border-electric-purple"></div>
        <p className="mt-4 text-white">Loading checkout...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Checkout Error
        </h1>
        <p className="text-red-500 text-center">{error}</p>
        <Link href="/cart" className="mt-4 px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta text-center">
          Back to Cart
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
     return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Empty Cart
        </h1>
        <p className="text-white/80 text-center">Your cart is empty. Please add some items to proceed to checkout.</p>
        <Link href="/shop" className="mt-4 px-6 py-3 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta text-center">
          Go to Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center min-h-[60vh] w-full p-4 relative">
      <h1 className="glitch-header glitch font-header text-4xl md:text-6xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
        Checkout
      </h1>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <div className="w-full max-w-xl bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col gap-5 relative">
            {/* Order Summary can be a separate component or remain here */}
            <div className="bg-[#18181b] rounded p-4 mb-4 border-2 border-acid-magenta/40 shadow-lg">
              <h2 className="text-lg font-bold mb-2 text-acid-magenta flex items-center gap-2">
                <span>Order Summary</span>
                <span className="text-xl">🧾</span>
              </h2>
              <ul className="mb-2">
                {items.map(item => (
                  <li key={item.id} className="flex justify-between text-white/90">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold text-white border-t border-acid-magenta pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <CheckoutForm /> { /* Using the updated CheckoutForm component */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/cart" className="px-6 py-3 bg-matte-black text-acid-magenta border border-acid-magenta rounded shadow hover:bg-acid-magenta hover:text-white transition font-bold focus:outline-none focus:ring-2 focus:ring-acid-magenta text-center w-full sm:w-auto" aria-label="Back to Cart">Back to Cart</Link>
            </div>
          </div>
        </Elements>
      )}
    </section>
  );
}
