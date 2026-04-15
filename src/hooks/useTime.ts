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
  type: 'PUNCH_IN' | 'PUNCH_OUT' | 'MEAL_START' | 'MEAL_END' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  latitude?: number;
  longitude?: number;
  deviceInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClockPunchPayload {
  type: 'PUNCH_IN' | 'PUNCH_OUT' | 'MEAL_START' | 'MEAL_END' | 'BREAK_START' | 'BREAK_END';
  latitude: number;
  longitude: number;
  deviceInfo?: string;
  notes?: string;
}

export interface DailyTimeEntry {
  employeeId: string;
  employeeName: string;
  department?: string;
  date: string;
  totalHours: number;
  status: 'INCOMPLETE' | 'ACTIVE' | 'COMPLETED';
  firstPunch?: string;
  lastPunch?: string;
  firstPunchLocation?: { lat: number; lng: number };
  lastPunchLocation?: { lat: number; lng: number };
  punchCount: number;
}

export interface ClockResponse {
  id: string;
  employeeId: string;
  type: string;
  timestamp: string;
}

export interface ClockState {
  currentState: 'IN' | 'OUT' | 'MEAL' | 'BREAK' | 'LEAVE' | 'COMPLETED';
  lastPunchTime?: string;
  lastPunchType?: string;
  todayPunches: number;
  activeLeave: { id: string; state: string } | null;
}

export interface ShiftItem {
  id: string;
  employeeId: string;
  startUTC: string;
  endUTC: string;
  state: string;
  notes?: string;
  employee?: {
    id?: string;
    name: string;
    department?: { name: string };
  };
  location?: {
    name: string;
  };
}

/**
 * Clock in
 */
export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClockPunchPayload) => {
      const response = await apiClient.post<ClockResponse>(
        API_ENDPOINTS.TIME.CLOCK,
        payload
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
    mutationFn: async (payload: ClockPunchPayload) => {
      const response = await apiClient.post<ClockResponse>(
        API_ENDPOINTS.TIME.CLOCK,
        payload
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
 * Get current clock status
 */
export const useClockStatus = () => {
  return useQuery({
    queryKey: queryKeys.time.clock.status(),
    queryFn: async () => {
      const response = await apiClient.get<ClockState>(
        API_ENDPOINTS.TIME.CLOCK
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
      const response = await apiClient.get<DailyTimeEntry[]>(
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
      const response = await apiClient.get<ShiftItem[]>(API_ENDPOINTS.TIME.SHIFTS);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
      state?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.TIME.SHIFTS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.time.shifts.all });
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        employeeId: string;
        date: string;
        startTime: string;
        endTime: string;
        notes?: string;
        state?: string;
      };
    }) => {
      const response = await apiClient.put(API_ENDPOINTS.TIME.SHIFT(id), payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.time.shifts.all });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(API_ENDPOINTS.TIME.SHIFT(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.time.shifts.all });
    },
  });
};
