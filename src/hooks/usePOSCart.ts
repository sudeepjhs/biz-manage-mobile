import { useCallback } from 'react';
import { usePOSStore } from '@store/posStore';
import type { CartItem } from '@store/posStore';

/**
 * Custom hook for POS cart operations
 * Provides convenient methods for cart management
 */
export function usePOSCart() {
  const store = usePOSStore();

  const addItem = useCallback(
    (product: { id: string; name: string; unitPrice: number }, quantity: number = 1) => {
      const cartItem: CartItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.unitPrice,
        subtotal: quantity * product.unitPrice,
      };
      store.addItem(cartItem);
    },
    [store]
  );

  const removeItem = useCallback(
    (productId: string) => {
      store.removeItem(productId);
    },
    [store]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      store.updateItem(productId, quantity);
    },
    [store]
  );

  const checkout = useCallback(async () => {
    // Return checkout data without clearing (let checkout screen do that)
    return {
      items: store.items,
      subtotal: store.getSubtotal(),
      discount: store.discount,
      total: store.getTotal(),
      customerId: store.customerId,
      notes: store.notes,
    };
  }, [store]);

  const completeCheckout = useCallback(() => {
    store.clearCart();
  }, [store]);

  return {
    // Cart state
    items: store.items,
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    discount: store.discount,
    total: store.getTotal(),
    customerId: store.customerId,
    notes: store.notes,
    isEmpty: store.items.length === 0,

    // Cart actions
    addItem,
    removeItem,
    updateQuantity,
    setDiscount: store.setDiscount,
    setNotes: store.setNotes,
    setCustomerId: store.setCustomerId,
    clearCart: store.clearCart,

    // Checkout flow
    checkout,
    completeCheckout,
  };
}
