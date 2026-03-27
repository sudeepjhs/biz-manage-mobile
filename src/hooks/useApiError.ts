import { useCallback, useState } from 'react';
import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  retry: () => void;
  clear: () => void;
}

/**
 * Consistent error handling for API calls
 * Provides user-friendly messages and retry capability
 */
export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const getMessage = useCallback((err: unknown): string => {
    if (err instanceof AxiosError) {
      // Server returned error response
      const status = err.response?.status;
      if (status === 401) {
        return 'You are not authenticated. Please log in again.';
      }
      if (status === 403) {
        return 'You do not have permission to perform this action.';
      }
      if (status === 404) {
        return 'The requested resource was not found.';
      }
      if (status === 409) {
        return 'This action conflicts with existing data. Please refresh and try again.';
      }
      if (status === 422) {
        return 'Please check your input and try again.';
      }
      if (status === 429) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      if (status && status >= 500) {
        return 'Server error. Please try again later.';
      }
      
      // Check for server message
      const serverMessage = (err.response?.data as any)?.message;
      if (typeof serverMessage === 'string') {
        return serverMessage;
      }
    }

    // Network error
    if (err instanceof AxiosError && !err.response) {
      return 'Network error. Please check your connection and try again.';
    }

    // Generic error
    if (err instanceof Error) {
      return err.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }, []);

  const handleError = useCallback(
    (err: unknown, retryFn?: () => Promise<void>) => {
      const message = getMessage(err);
      const status = err instanceof AxiosError ? err.response?.status : undefined;

      setError({
        message,
        status,
        code: err instanceof AxiosError ? err.code : 'UNKNOWN_ERROR',
        retry: () => {
          if (retryFn) {
            setIsRetrying(true);
            retryFn().finally(() => setIsRetrying(false));
          }
        },
        clear: () => setError(null),
      });
    },
    [getMessage]
  );

  const clear = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    clear,
  };
}
