import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@store/authStore';
import API_CLIENT from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import type { LoginRequest, LoginResponse, AuthUser } from '../types/api';
import { queryKeys } from '@lib/query-keys';

// Declare global type for logout handler
declare global {
  var __logoutHandler: (() => void) | undefined;
}

// Re-export useAuthStore for convenient imports
export { useAuthStore };

/**
 * Custom hook for authentication operations
 * Manages login, logout, and profile fetching
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Login mutation
  const loginMutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials) => {
      const response = await API_CLIENT.post<{ success: boolean; data: LoginResponse }>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      authStore.setAuth(data.token, data.user);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await API_CLIENT.post(API_ENDPOINTS.AUTH.LOGOUT);
    },
    onSuccess: () => {
      authStore.logout();
    },
    onError: () => {
      // Logout locally even if API call fails
      authStore.logout();
    },
  });

  // Fetch profile query
  const profileQuery = useQuery<AuthUser, Error>({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const response = await API_CLIENT.get<{ success: boolean; data: AuthUser }>(
        API_ENDPOINTS.AUTH.PROFILE
      );
      if (response.data.success) {
        authStore.setUser(response.data.data);
        return response.data.data;
      }
      throw new Error('Failed to fetch profile');
    },
    enabled: authStore.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
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
