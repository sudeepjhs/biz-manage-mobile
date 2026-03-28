import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'SUPPLIER' | 'CUSTOMER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch suppliers
 */
export const useSuppliers = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: queryKeys.partners.suppliers.list(filters),
    queryFn: async () => {
      let url = API_ENDPOINTS.SUPPLIERS.LIST;
      if (filters?.search) url += `?search=${filters.search}`;
      const response = await apiClient.get<{ data: Partner[] }>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch customers
 */
export const useCustomers = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: queryKeys.partners.customers.list(filters),
    queryFn: async () => {
      let url = API_ENDPOINTS.CUSTOMERS.LIST;
      if (filters?.search) url += `?search=${filters.search}`;
      const response = await apiClient.get<{ data: Partner[] }>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create/Update Partner
 */
export const useUpsertPartner = (type: 'SUPPLIER' | 'CUSTOMER') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<Partner> }) => {
      const url = type === 'SUPPLIER'
        ? (id ? API_ENDPOINTS.SUPPLIERS.DETAIL(id) : API_ENDPOINTS.SUPPLIERS.LIST)
        : (id ? API_ENDPOINTS.CUSTOMERS.DETAIL(id) : API_ENDPOINTS.CUSTOMERS.LIST);

      const method = id ? 'put' : 'post';
      const response = await apiClient[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      if (type === 'SUPPLIER') {
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.suppliers.all });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.customers.all });
      }
    },
  });
};

/**
 * Delete Partner
 */
export const useDeletePartner = (type: 'SUPPLIER' | 'CUSTOMER') => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = type === 'SUPPLIER'
        ? API_ENDPOINTS.SUPPLIERS.DETAIL(id)
        : API_ENDPOINTS.CUSTOMERS.DETAIL(id);

      const response = await apiClient.delete(url);
      return response.data;
    },
    onSuccess: () => {
      if (type === 'SUPPLIER') {
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.suppliers.all });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.partners.customers.all });
      }
    },
  });
};
