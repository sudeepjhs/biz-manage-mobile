import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import { API_ENDPOINTS } from '../config/API';
import { queryKeys } from '../lib/query-keys';

/**
 * POS Product Types
 */
export interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost?: number;
  stock: number;
  category?: string;
  categoryId?: string;
  image?: string;
  description?: string;
  active: boolean;
}

export interface POSCategory {
  id: string;
  name: string;
  description?: string;
}

export interface CheckoutPayload {
  paymentMethod: 'cash' | 'card' | 'check';
  amountPaid: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export interface SaleResponse {
  id: string;
  saleNumber: string;
  total: number;
  tax: number;
  subtotal: number;
  paymentMethod: string;
  change: number;
  createdAt: string;
}

/**
 * Fetch all POS products
 */
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.pos.all(),
    queryFn: async () => {
      const response = await apiClient.get<POSProduct[]>(API_ENDPOINTS.POS.PRODUCTS);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch products by category
 */
export const useProductsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: queryKeys.pos.byCategory(categoryId),
    queryFn: async () => {
      const response = await apiClient.get<POSProduct[]>(
        `${API_ENDPOINTS.POS.PRODUCTS}?categoryId=${categoryId}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Search products by name or SKU
 */
export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: queryKeys.pos.search(query),
    queryFn: async () => {
      const response = await apiClient.get<POSProduct[]>(
        `${API_ENDPOINTS.POS.PRODUCTS}?search=${query}`
      );
      return response.data;
    },
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch product categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.pos.categories(),
    queryFn: async () => {
      const response = await apiClient.get<POSCategory[]>(
        API_ENDPOINTS.INVENTORY.CATEGORIES
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
  });
};

/**
 * Checkout mutation - create a sale
 */
export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      const response = await apiClient.post<SaleResponse>(
        API_ENDPOINTS.POS.CHECKOUT,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate products cache to refresh stock levels
      queryClient.invalidateQueries({ queryKey: queryKeys.pos.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
    },
    onError: (error: any) => {
      console.error('Checkout failed:', error);
    },
  });
};

/**
 * Fetch POS orders/sales history
 */
export const useOrders = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: queryKeys.pos.orders.list(limit, offset),
    queryFn: async () => {
      const response = await apiClient.get(
        `${API_ENDPOINTS.POS.ORDERS}?limit=${limit}&offset=${offset}`
      );
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};
