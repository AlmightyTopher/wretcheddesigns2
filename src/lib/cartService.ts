// Utility functions for cart logic. Expand as needed for API integration.
import type { CartItem } from "../components/CartContext";

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

// Example: format cart for order payload
export function formatOrderPayload(
  items: CartItem[],
  user: { name: string; email: string; address: string; phone?: string }
) {
  return {
    user,
    items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    total: getCartTotal(items),
  };
} 