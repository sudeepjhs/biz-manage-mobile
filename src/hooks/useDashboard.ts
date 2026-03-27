import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { API_ENDPOINTS } from '../config/API';
import { queryKeys } from '../lib/query-keys';

/**
 * Dashboard Stats Types
 */
export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  activeEmployees: number;
  lowStockProducts: number;
  pendingLeaveRequests: number;
  averageOrderValue?: number;
  salesTrend?: Array<{ date: string; value: number }>;
}

export interface ActivityItem {
  id: string;
  type: 'sale' | 'order' | 'leave' | 'inventory' | 'timesheet';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardActivity {
  items: ActivityItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch dashboard stats
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

/**
 * Fetch activity log/feed
 */
export const useDashboardActivity = (limit = 10, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardActivity>(
        `${API_ENDPOINTS.DASHBOARD.ACTIVITY}?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
