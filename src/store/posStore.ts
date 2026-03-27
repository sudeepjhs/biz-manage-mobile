import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface POSState {
  items: CartItem[];
  discount: number;
  notes: string;
  customerId?: string;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  setCustomerId: (customerId?: string) => void;

  // Computed
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      notes: '',
      customerId: undefined,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    subtotal: (i.quantity + item.quantity) * i.price,
                  }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateItem: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity, subtotal: quantity * i.price }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], discount: 0, notes: '', customerId: undefined });
      },

      setDiscount: (discount) => set({ discount }),
      setNotes: (notes) => set({ notes }),
      setCustomerId: (customerId) => set({ customerId }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        return Math.max(0, subtotal - discount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'pos-cart-storage',
      storage: {
        getItem: async (name) => {
          try {
            const item = await AsyncStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch (error) {
            console.error(`Error reading ${name} from AsyncStorage:`, error);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error(`Error writing ${name} to AsyncStorage:`, error);
          }
        },
        removeItem: async (name) => {
          try {
            await AsyncStorage.removeItem(name);
          } catch (error) {
            console.error(`Error removing ${name} from AsyncStorage:`, error);
          }
        },
      },
    }
  )
);
