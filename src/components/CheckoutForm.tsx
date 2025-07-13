// Instructions: Update CheckoutForm.tsx to use PaymentElement, fetch clientSecret dynamically based on cart total, and improve error handling and user feedback.

import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useCart } from '@/components/CartContext'; // Assuming CartContext provides total amount
import { useRouter } from 'next/navigation';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, getTotalAmount } = useCart(); // Get cart and total amount
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For loading payment element

  useEffect(() => {
    if (cart.length > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Math.round(getTotalAmount() * 100) }), // Amount in cents
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            setIsLoading(false);
          } else {
            setClientSecret(data.clientSecret);
            setIsLoading(false);
          }
        })
        .catch(err => {
            setError("Failed to initialize payment. Please try again.");
            setIsLoading(false);
        });
    } else {
        setError("Your cart is empty.");
        setIsLoading(false);
    }
  }, [cart, getTotalAmount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      setError('Stripe.js has not loaded correctly, or payment intent is missing. Please refresh and try again.');
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: `${window.location.origin}/confirmation`,
        },
      });

    if (stripeError) {
      setError(stripeError.message || 'An unexpected error occurred during payment.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      // Clear cart, redirect to confirmation, or show success message
      // Example: router.push('/confirmation?payment_intent_client_secret=' + paymentIntent.client_secret);
      // For now, just logging success
      console.log('Payment Succeeded:', paymentIntent);
      // Potentially clear cart here: clearCart();
    } else if (paymentIntent && paymentIntent.status === 'requires_action'){
      setError("Further action is required to complete your payment.");
      setProcessing(false);
    } else {
      setError("Payment did not succeed. Please try again.");
      setProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading payment options...</div>;
  }

  if (!clientSecret && !error) {
    return <div className="text-center p-4">Initializing payment...</div>;
  }

  if (error && !clientSecret) { // Show error if client secret fetch failed and no secret is available
    return <div className="text-red-500 text-center p-4">Error: {error}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow-md rounded-lg">
      {clientSecret && <PaymentElement id="payment-element" options={{layout: "tabs"}}/>}
      {error && (
        <div id="payment-message" className="text-red-600 text-sm font-medium bg-red-100 p-3 rounded-md">{error}</div>
      )}
      {succeeded && (
        <div className="text-green-600 text-sm font-medium bg-green-100 p-3 rounded-md">Payment successful! You will be redirected shortly.</div>
      )}
      <button
        type="submit"
        disabled={processing || succeeded || !stripe || !elements || !clientSecret}
        className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out"
      >
        {processing ? (
            <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </div>
        ) : 'Pay Now'}
      </button>
      {cart.length === 0 && !succeeded && (
          <p className="text-center text-gray-500">Your cart is empty. Add items to proceed to payment.</p>
      )}
    </form>
  );
};

export default CheckoutForm;
