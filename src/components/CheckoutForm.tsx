"use client";

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
        setProcessing(false);
        return;
    }

    // Create a PaymentIntent on your server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 1000 }), // Hardcoded amount in cents (e.g., 1000 = $10.00)
    });

    const { clientSecret, error: backendError } = await response.json();

    if (backendError) {
      setError(backendError.message);
      setProcessing(false);
      return;
    }

    // Confirm the payment on the client side
    const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'An error occurred during payment.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setSucceeded(true);
      setProcessing(false);
      // You can redirect the user to a success page or show a success message here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-3">
        <CardElement />
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {succeeded && (
        <div className="text-green-500 text-sm">Payment succeeded!</div>
      )}
      <button
        type="submit"
        disabled={processing || succeeded || !stripe || !elements}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
};

export default CheckoutForm;