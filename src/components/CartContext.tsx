"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useToastContext } from "../context/ToastContext";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  cart: CartItem[]; // Alias for items (used in some components)
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { showSuccess, showInfo, showWarning } = useToastContext();

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const updated = prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
        showSuccess(
          "Item Updated",
          `Added ${item.quantity} more ${item.name} to cart`,
          { duration: 3000 }
        );
        return updated;
      } else {
        showSuccess(
          "Added to Cart",
          `${item.name} has been added to your cart`,
          {
            duration: 3000,
            action: {
              label: "View Cart",
              onClick: () => window.location.href = "/cart"
            }
          }
        );
        return [...prev, item];
      }
    });
  }, [showSuccess]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        showInfo(
          "Item Removed",
          `${item.name} has been removed from your cart`,
          { duration: 3000 }
        );
      }
      return prev.filter(item => item.id !== id);
    });
  }, [showInfo]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const item = prev.find(i => i.id === id);
      if (item) {
        showInfo(
          "Quantity Updated",
          `${item.name} quantity changed to ${quantity}`,
          { duration: 2000 }
        );
      }
      return updated;
    });
  }, [removeItem, showInfo]);

  const clearCart = useCallback(() => {
    const itemCount = items.length;
    setItems([]);
    if (itemCount > 0) {
      showWarning(
        "Cart Cleared",
        `All ${itemCount} items have been removed from your cart`,
        { duration: 4000 }
      );
    }
  }, [items.length, showWarning]);

  const getTotalAmount = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = getTotalAmount();

  const value: CartContextType = {
    items,
    cart: items, // Alias for compatibility
    count,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
