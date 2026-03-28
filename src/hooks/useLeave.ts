import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

/**
 * Leave Management Types
 */
export interface LeaveType {
  id: string;
  code: string;
  name: string;
  isPaid: boolean;
  countsAgainstBalance: boolean;
  requiresApproval: boolean;
  allowsPartialDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  typeId: string;
  periodStart: string;
  periodEnd: string;
  accruedMins: number;
  usedMins: number;
  carryoverMins: number;
  availableMins: number;
  lastAccrualRunAt?: string;
  createdAt: string;
  updatedAt: string;
  type: {
    name: string;
    isPaid: boolean;
    requiresApproval: boolean;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  typeId: string;
  startDateLocal: string;
  endDateLocal: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  totalRequestedMins: number;
  state: 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'TAKEN' | 'CLOSED' | 'CANCELLED';
  approverId?: string;
  reason?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    name: string;
    department?: {
      name: string;
    };
  };
  type: {
    name: string;
  };
  approver?: {
    name: string;
  };
}

export interface CreateLeaveRequestPayload {
  typeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ApproveLeaveRequestPayload {
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
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
      const response = await apiClient.post<LeaveRequest>(
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
