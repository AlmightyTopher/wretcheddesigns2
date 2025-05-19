import type { CartItem } from "../components/CartContext";

export type OrderData = {
  user: { name: string; email: string; address: string; phone?: string };
  items: { id: string; name: string; price: number; quantity: number }[];
  total: number;
};

// Dummy payment service. Replace with Stripe/PayPal/Square integration later.
export async function pay(orderData: OrderData): Promise<{ success: boolean; orderId: string }> {
  // Simulate network/payment delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // Print order payload for debugging
  if (typeof window !== "undefined") {
    console.log("[Dummy Payment] Order Payload:", orderData);
  }
  return {
    success: true,
    orderId: `ORDER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  };
} 