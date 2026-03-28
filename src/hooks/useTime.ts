import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

/**
 * Time Clock Types
 */
export interface ClockEntry {
  id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  breakDuration?: number;
  totalHours?: number;
  date: string;
  status: 'in' | 'out';
}

export interface DailyTimeEntry {
  date: string;
  entries: ClockEntry[];
  totalHours: number;
  breakTime: number;
}

export interface ClockResponse {
  success: boolean;
  status: 'in' | 'out';
  timestamp: string;
  message: string;
}

/**
 * Clock in
 */
export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ClockResponse>(
        `${API_ENDPOINTS.TIME.CLOCK}/in`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.time.clock.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.time.timesheets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activity() });
    },
  });
};

/**
 * Clock out
 */
export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ClockResponse>(
        `${API_ENDPOINTS.TIME.CLOCK}/out`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.time.clock.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.time.timesheets.all });
    },
  });
};

/**
 * Get current clock-in status
 */
export const useClockStatus = () => {
  return useQuery({
    queryKey: queryKeys.time.clock.status(),
    queryFn: async () => {
      const response = await apiClient.get<ClockEntry | null>(
        `${API_ENDPOINTS.TIME.CLOCK}/status`
      );
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Get today's time entries
 */
export const useTodayTimeEntries = () => {
  return useQuery({
    queryKey: queryKeys.time.timesheets.list({ date: new Date().toISOString().split('T')[0] }),
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get<DailyTimeEntry>(
        `${API_ENDPOINTS.TIME.TIMESHEETS}?date=${today}`
      );
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Get timesheet entries for a date range
 */
export const useTimeEntries = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: queryKeys.time.timesheets.list({ startDate, endDate }),
    queryFn: async () => {
      let url = API_ENDPOINTS.TIME.TIMESHEETS;
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await apiClient.get<DailyTimeEntry[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get shifts available
 */
export const useShifts = () => {
  return useQuery({
    queryKey: queryKeys.time.shifts.list(),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.TIME.SHIFTS);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
