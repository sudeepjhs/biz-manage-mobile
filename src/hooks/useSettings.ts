import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { API_ENDPOINTS } from '../config/API';
import { queryKeys } from '../lib/query-keys';

/**
 * Settings Types
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  avatar?: string;
  hireDate?: string;
  active: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  leaveNotifications: boolean;
  orderNotifications: boolean;
  inventoryNotifications: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

/**
 * Fetch current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: async () => {
      const response = await apiClient.get<UserProfile>(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await apiClient.put<UserProfile>(
        API_ENDPOINTS.AUTH.PROFILE,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.profile(), data);
    },
  });
};

/**
 * Fetch notification settings
 */
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: async () => {
      const response = await apiClient.get<NotificationSettings>(
        '/api/settings/notifications'
      );
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });
};

/**
 * Update notification settings
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const response = await apiClient.put<NotificationSettings>(
        '/api/settings/notifications',
        settings
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'notifications'], data);
    },
  });
};

/**
 * Fetch app settings (cached locally, synced with server)
 */
export const useAppSettings = () => {
  return useQuery({
    queryKey: ['settings', 'app'],
    queryFn: async () => {
      const response = await apiClient.get<AppSettings>('/api/settings/app');
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Update app settings
 */
export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AppSettings>) => {
      const response = await apiClient.put<AppSettings>(
        '/api/settings/app',
        settings
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings', 'app'], data);
    },
  });
};
