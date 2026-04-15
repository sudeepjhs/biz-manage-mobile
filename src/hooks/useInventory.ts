import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

/**
 * Stock Type Interface
 */
export interface StockTypeM {
  id: string;
  name: string;
  code: string;
  visibleInPOS?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Inventory Types
 */
export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  stockTypeId?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'DISCONTINUED' | 'ARCHIVED';
  reorderPoint?: number;
  unitPrice?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  stockType?: StockTypeM | null;
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

export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseRequestLine {
  id: string;
  productId: string;
  requestedQty: number;
  reason?: string;
}

export interface PurchaseRequest {
  id: string;
  status: string;
  notes?: string;
  lines: PurchaseRequestLine[];
  _count?: {
    purchaseOrders: number;
  };
}

export interface PurchaseOrder {
  id: string;
  number: string;
  status: string;
  supplierId?: string;
  supplier?: { id: string; name: string };
  lines: Array<{
    id: string;
    orderedQty: number;
    receivedQty: number;
  }>;
}

export interface ShortageAlert {
  productId: string;
  productName: string;
  sku: string;
  currentQty: number;
  reorderPoint: number;
  shortageQty: number;
  suggestedQty: number;
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
/**
 * Propose a stock movement (for workers/managers)
 */
export const useProposeMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockMovement & { isProposal?: boolean }) => {
      const response = await apiClient.post(
        API_ENDPOINTS.INVENTORY.MOVEMENTS,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements.all });
    },
  });
};

/**
 * Fetch all stock types
 */
export const useStockTypes = () => {
  return useQuery({
    queryKey: queryKeys.inventory.stockTypes.list(),
    queryFn: async () => {
      const response = await apiClient.get<StockTypeM[]>(
        API_ENDPOINTS.INVENTORY.STOCK_TYPES
      );
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (stock types rarely change)
  });
};

export const useCreateStockType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<StockTypeM>) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.STOCK_TYPES, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stockTypes.all });
    },
  });
};

export const useUpdateStockType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<StockTypeM> }) => {
      const response = await apiClient.put(API_ENDPOINTS.INVENTORY.STOCK_TYPE(id), payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stockTypes.all });
    },
  });
};

export const useDeleteStockType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(API_ENDPOINTS.INVENTORY.STOCK_TYPE(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stockTypes.all });
    },
  });
};

export const useLocations = () => {
  return useQuery({
    queryKey: queryKeys.inventory.locations.list(),
    queryFn: async () => {
      const response = await apiClient.get<InventoryLocation[]>(API_ENDPOINTS.INVENTORY.LOCATIONS);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<InventoryLocation>) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.LOCATIONS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<InventoryLocation> }) => {
      const response = await apiClient.patch(API_ENDPOINTS.INVENTORY.LOCATION(id), payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(API_ENDPOINTS.INVENTORY.LOCATION(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all });
    },
  });
};

export const useInventoryMovements = (filters?: { state?: string; productId?: string }) => {
  return useQuery({
    queryKey: queryKeys.inventory.movements.list(),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.state) params.append('state', filters.state);
      if (filters?.productId) params.append('productId', filters.productId);
      const url = params.toString()
        ? `${API_ENDPOINTS.INVENTORY.MOVEMENTS}?${params.toString()}`
        : API_ENDPOINTS.INVENTORY.MOVEMENTS;
      const response = await apiClient.get(url);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useApproveMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.APPROVE_MOVEMENT(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements.all });
    },
  });
};

export const useRejectMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.REJECT_MOVEMENT(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements.all });
    },
  });
};

export const usePostMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.POST_MOVEMENT(id));
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.movements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products.all });
    },
  });
};

export const useMaterialShortages = () => {
  return useQuery({
    queryKey: queryKeys.inventory.procurement.shortages(),
    queryFn: async () => {
      const response = await apiClient.get<ShortageAlert[]>(API_ENDPOINTS.INVENTORY.SHORTAGES);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const usePurchaseRequests = () => {
  return useQuery({
    queryKey: queryKeys.inventory.procurement.purchaseRequests(),
    queryFn: async () => {
      const response = await apiClient.get<PurchaseRequest[]>(API_ENDPOINTS.INVENTORY.PURCHASE_REQUESTS);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: queryKeys.inventory.procurement.purchaseOrders(),
    queryFn: async () => {
      const response = await apiClient.get<PurchaseOrder[]>(API_ENDPOINTS.INVENTORY.PURCHASE_ORDERS);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useCreatePurchaseRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      notes?: string;
      lines: Array<{ productId: string; requestedQty: number; reason?: string }>;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.PURCHASE_REQUESTS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.procurement.purchaseRequests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.procurement.shortages() });
    },
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      purchaseRequestId: string;
      supplierId?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.PURCHASE_ORDERS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.procurement.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.procurement.purchaseRequests() });
    },
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        locationId: string;
        notes?: string;
        lines: Array<{ purchaseOrderLineId: string; receivedQty: number }>;
      };
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.INVENTORY.RECEIVE_PURCHASE_ORDER(id), payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.procurement.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.locations.all });
    },
  });
};
