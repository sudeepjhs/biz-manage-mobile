import { API_BASE_URL } from '@config/API';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

// Declare global type for logout handler
declare global {
  var __logoutHandler: (() => void) | undefined;
}

const API_CLIENT = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials to support Next-Auth session cookies
  withCredentials: true,
});

let isRefreshing = false;
const failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue.length = 0;
};

import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';


// Request interceptor: Add JWT token
API_CLIENT.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from Zustand store directly
      const token = useAuthStore.getState().token;

      if (token) {
        // Next-Auth's getServerSession primarily looks at cookies.
        // On mobile, headers might need to be precisely formatted.
        // We set the standard cookie name.
        const cookieName = 'next-auth.session-token';
        config.headers['Cookie'] = `${cookieName}=${token}`;

        // Also send in Authorization header as many custom routes expect this
        config.headers['Authorization'] = `Bearer ${token}`;

        // Log token for debugging (only in DEV)
        if (__DEV__) {
          console.log(`[API] Attaching session token for ${config.url}`);
        }
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh token
API_CLIENT.interceptors.response.use(
  (response: any) => {
    // Update response.data to be the inner data, as requested (data = data.data)
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const responseData = error.response?.data as any;

    // Show error toast for non-401 errors
    if (error.response?.status && error.response.status >= 400 && error.response.status !== 401) {
      // Handle various error structures: 
      // 1. { error: { message: '...' } } (user's case)
      // 2. { error: '...' }
      // 3. { message: '...' }
      if (error.response?.status !== 404) {

        const errorMessage = responseData?.error?.message ||
          (typeof responseData?.error === 'string' ? responseData.error : null) ||
          responseData?.message ||
          error.message;

        useUIStore.getState().showToast({
          message: errorMessage,
          type: 'error',
        });
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return API_CLIENT(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Let the store handle its own persisted JSON removal!
        useAuthStore.getState().logout();

        // Emit event to trigger navigation to login
        if ((global as any).__logoutHandler) {
          (global as any).__logoutHandler();
        }

        processQueue(null);
      } catch (err) {
        processQueue(err as Error);
        isRefreshing = false;
        return Promise.reject(err);
      }

      isRefreshing = false;
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API_CLIENT;
