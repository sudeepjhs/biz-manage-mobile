import {
  signInWithCredentials,
  signOutFromNextAuth
} from '@lib/nextauth-client';
import { queryKeys } from '@lib/query-keys';
import { useAuthStore } from '@store/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AuthUser, LoginRequest, LoginResponse } from '../types/api';

// Declare global type for logout handler
declare global {
  var __logoutHandler: (() => void) | undefined;
}

// Re-export useAuthStore for convenient imports
export { useAuthStore };

/**
 * Custom hook for authentication operations
 * Manages login, logout, and profile fetching with Next-Auth
 * 
 * Supports both:
 * 1. Legacy credentials (if backend still uses custom auth)
 * 2. Next-Auth credentials provider (recommended)
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Login mutation - uses Next-Auth
  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      // Try Next-Auth custom mobile login
      const nextAuthResult = await signInWithCredentials(credentials);

      if (!nextAuthResult.ok || !nextAuthResult.token || !nextAuthResult.user) {
        throw new Error(nextAuthResult.error || 'Authentication failed');
      }

      // Map response to our LoginResponse format
      const loginResponse: LoginResponse = {
        token: nextAuthResult.token,
        user: {
          id: nextAuthResult.user.id || nextAuthResult.user.email,
          email: nextAuthResult.user.email,
          name: nextAuthResult.user.name || 'User',
          role: nextAuthResult.user.role || 'WORKER',
        },
      };
      return loginResponse;
    },
    onSuccess: (data) => {
      authStore.setAuth(data.token, data.user);
    },
  });

  // Logout mutation - clears Next-Auth session
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOutFromNextAuth();
    },
    onSuccess: () => {
      authStore.logout();
    },
    onError: () => {
      // Logout locally even if API call fails
      authStore.logout();
    },
  });

  // Fetch profile query - returns current user since mobile token is managed locally
  const profileQuery = useQuery<AuthUser, Error>({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      if (authStore.user) {
        return authStore.user;
      }
      throw new Error('No user profile available natively');
    },
    enabled: authStore.isAuthenticated(),
    staleTime: Infinity, // Avoid re-fetching since local
  });

  return {
    // State
    token: authStore.token,
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated(),
    isLoading: authStore.isLoading,
    error: authStore.error,

    // Queries
    profileQuery,

    // Mutations
    loginMutation,
    logoutMutation,

    // Actions
    login: (credentials: LoginRequest) => loginMutation.mutateAsync(credentials),
    logout: () => logoutMutation.mutateAsync(),
    hasRole: (role: string) => authStore.user?.role === role,
  };
}

/**
 * Hook to set login error handler globally
 * This is used by the API client to trigger logout on 401
 */
export function useAuthInterceptor() {
  const authStore = useAuthStore();

  // Set up global logout handler
  if (typeof global !== 'undefined') {
    (global as any).__logoutHandler = () => {
      authStore.logout();
    };
  }
}
