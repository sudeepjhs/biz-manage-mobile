import { useQuery } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

export interface AuditLog {
  id: string;
  actorId: string;
  actor: {
    name: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

/**
 * Fetch audit logs
 */
export const useAuditLogs = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: queryKeys.audit.logs(filters),
    queryFn: async () => {
      let url = API_ENDPOINTS.AUDIT;
      if (filters?.search) url += `?search=${filters.search}`;

      const response = await apiClient.get<{ data: AuditLog[] }>(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
