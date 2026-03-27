import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@config/API';

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

// Request interceptor: Add JWT token
API_CLIENT.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
        // Clear auth data and signal to navigate to login
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
        
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
