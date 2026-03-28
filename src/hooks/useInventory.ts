import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

/**
 * Inventory Types
 */
export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  status: 'DRAFT' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED';
  reorderPoint?: number;
  unitPrice?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  stockItems: Array<{
    id: string;
    locationId: string;
    quantityOnHand: number;
    location: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}

export interface StockMovement {
  productId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason?: string;
  notes?: string;
}

/**
 * Fetch inventory products
 */
export const useInventoryProducts = (filters?: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: queryKeys.inventory.products.list(filters),
    queryFn: async () => {
      let url = API_ENDPOINTS.INVENTORY.PRODUCTS;
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await apiClient.get<InventoryProduct[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch single product detail
 */
export const useInventoryProduct = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.inventory.products.detail(productId),
    queryFn: async () => {
      const response = await apiClient.get<InventoryProduct>(
        API_ENDPOINTS.INVENTORY.PRODUCT(productId)
      );
      return response.data;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Update stock levels
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockMovement) => {
      const response = await apiClient.post(
        API_ENDPOINTS.INVENTORY.MOVEMENTS,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
  });
};

/**
 * Fetch low stock alerts
 */
export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['inventory', 'lowStock'],
    queryFn: async () => {
      const response = await apiClient.get<InventoryProduct[]>(
        `${API_ENDPOINTS.INVENTORY.PRODUCTS}?lowStock=true`
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

/**
 * Fetch inventory categories
 */
export const useInventoryCategories = () => {
  return useQuery({
    queryKey: queryKeys.inventory.products.list({ category: 'all' }),
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY.CATEGORIES);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
