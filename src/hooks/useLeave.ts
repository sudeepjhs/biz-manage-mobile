import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { API_ENDPOINTS } from '../config/API';
import { queryKeys } from '../lib/query-keys';

/**
 * Leave Management Types
 */
export interface LeaveType {
  id: string;
  name: string;
  annualDays: number;
  description?: string;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  managerId?: string;
  managerName?: string;
  approvalDate?: string;
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveLeaveRequestPayload {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

/**
 * Fetch leave types available
 */
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: queryKeys.leave.types(),
    queryFn: async () => {
      const response = await apiClient.get<LeaveType[]>(API_ENDPOINTS.LEAVE.TYPES);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Fetch current user's leave balance
 */
export const useLeaveBalance = () => {
  return useQuery({
    queryKey: queryKeys.leave.balance(),
    queryFn: async () => {
      const response = await apiClient.get<LeaveBalance[]>(API_ENDPOINTS.LEAVE.BALANCES);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch leave requests for current user
 */
export const useLeaveRequests = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: queryKeys.leave.myRequests(limit, offset),
    queryFn: async () => {
      const params = {
        limit: limit || 20,
        offset: offset || 0,
      };
      const response = await apiClient.get<LeaveRequest[]>(
        API_ENDPOINTS.LEAVE.REQUESTS,
        { params }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
};

/**
 * Fetch pending leave approvals (for managers)
 */
export const usePendingLeaveApprovals = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: queryKeys.leave.pendingApprovals(limit, offset),
    queryFn: async () => {
      const params = {
        limit: limit || 20,
        offset: offset || 0,
        status: 'SUBMITTED',
      };
      const response = await apiClient.get<LeaveRequest[]>(
        API_ENDPOINTS.LEAVE.REQUESTS,
        { params }
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
};

/**
 * Submit a new leave request
 */
export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeaveRequestPayload) => {
      const response = await apiClient.post<LeaveRequest>(
        API_ENDPOINTS.LEAVE.REQUESTS,
        data
      );
      return response.data;
    },
    onSuccess: (newRequest) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.myRequests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
};

/**
 * Approve or reject a leave request (manager only)
 */
export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: ApproveLeaveRequestPayload;
    }) => {
      const response = await apiClient.put<LeaveRequest>(
        `${API_ENDPOINTS.LEAVE.REQUESTS}/${requestId}/approve`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.pendingApprovals() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.myRequests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
};

/**
 * Cancel a leave request (user can cancel if not yet approved)
 */
export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiClient.put<LeaveRequest>(
        `${API_ENDPOINTS.LEAVE.REQUESTS}/${requestId}/cancel`,
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.myRequests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balance() });
    },
  });
};
