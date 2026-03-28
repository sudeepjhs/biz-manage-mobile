import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(['ADMIN', 'MANAGER', 'WORKER']),
  }),
});

export type AuthUser = z.infer<typeof AuthResponseSchema>['user'];
export type UserRole = 'ADMIN' | 'MANAGER' | 'WORKER';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setAuth: (token: string, user: AuthUser) => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      setAuth: (token, user) => {
        set({ token, user, error: null });
      },

      logout: () => {
        set({ token: null, user: null, error: null });
      },

      isAuthenticated: () => {
        const { token } = get();
        return !!token;
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
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
