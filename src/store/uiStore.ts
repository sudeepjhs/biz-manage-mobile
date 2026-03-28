import { create } from 'zustand';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface UIState {
  toast: ToastOptions | null;
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
}

/**
 * Global UI Store
 * Manages global UI elements like toasts/snackbars
 */
export const useUIStore = create<UIState>((set) => ({
  toast: null,
  showToast: (options) => {
    if (typeof options === 'string') {
      set({ toast: { message: options, type: 'info' } });
    } else {
      set({ toast: options });
    }
  },
  hideToast: () => set({ toast: null }),
}));
