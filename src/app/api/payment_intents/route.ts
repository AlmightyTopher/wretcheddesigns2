import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    const { orderDetails, customerEmail } = await req.json();

    if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
      return NextResponse.json({ error: 'Invalid order details provided' }, { status: 400 });
    }

    // Calculate the total amount (assuming orderDetails is an array of items with price and quantity)
    const totalAmount = orderDetails.reduce((sum, item) => {
      // Ensure item.price and item.quantity are numbers before multiplying
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity, 10);

      if (isNaN(price) || isNaN(quantity)) {
        console.error('Invalid price or quantity in order details:', item);
        return sum; // Skip this item if price or quantity is invalid
      }

      return sum + price * quantity;
    }, 0);

    // Stripe requires amount in cents
    const totalAmountInCents = Math.round(totalAmount * 100);

    if (totalAmountInCents <= 0) {
         return NextResponse.json({ error: 'Order total must be greater than zero' }, { status: 400 });
    }


    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd', // Or your desired currency
      // Add any additional parameters as needed, e.g., metadata, description
    });

    // Call the email sending endpoint
    if (customerEmail) {
      await fetch(`${req.nextUrl.origin}/api/send_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderDetails, customerEmail }),
      });
    }


    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}