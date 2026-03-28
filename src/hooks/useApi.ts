import API_CLIENT from '@lib/api-client';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  status?: number;
}

/**
 * Custom hook for API requests using React Query
 * Provides default configuration and error handling
 */
export function useApi<T = any, TError = ApiError>(
  url: string,
  options?: Omit<UseQueryOptions<T, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, TError> {
  return useQuery<T, TError>({
    queryKey: [url],
    queryFn: async () => {
      try {
        const response = await API_CLIENT.get<ApiResponse<T>>(url);
        
        if (response.data.success) {
          return response.data.data as T;
        }
        
        throw new Error(response.data.error || 'Request failed');
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorData = error.response?.data as ApiError | undefined;
          throw errorData || {
            success: false,
            error: error.message,
            status: error.response?.status,
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for mobile with slower networks
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    enabled: true,
    ...options,
  });
}

/**
 * Hook for manual queries with custom key
 * Use when you need more control over the query key
 */
export function useApiWithKey<T = any, TError = ApiError>(
  queryKey: readonly (string | number)[],
  url: string,
  options?: Omit<UseQueryOptions<T, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, TError> {
  return useQuery<T, TError>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await API_CLIENT.get<ApiResponse<T>>(url);
        
        if (response.data.success) {
          return response.data.data as T;
        }
        
        throw new Error(response.data.error || 'Request failed');
      } catch (error) {
        if (error instanceof AxiosError) {
          const errorData = error.response?.data as ApiError | undefined;
          throw errorData || {
            success: false,
            error: error.message,
            status: error.response?.status,
          };
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: true,
    ...options,
  });
}
