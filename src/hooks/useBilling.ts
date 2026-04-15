import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { queryKeys } from '@lib/query-keys';

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  customerId: string;
  customer?: { id: string; name: string };
  status: string;
  totalAmount: number;
  dueDate?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  method: string;
  paidAt?: string;
  createdAt: string;
}

export interface CustomerLedger {
  customerId: string;
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  outstandingAmount: number;
  invoices: Invoice[];
  payments: Payment[];
}

export interface ReminderLog {
  id: string;
  actionType: string;
  note?: string;
  nextFollowUpAt?: string;
  createdAt: string;
}

export const useInvoices = () => {
  return useQuery({
    queryKey: queryKeys.finance.invoices(),
    queryFn: async () => {
      const response = await apiClient.get<Invoice[]>(API_ENDPOINTS.FINANCE.INVOICES);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const usePayments = () => {
  return useQuery({
    queryKey: queryKeys.finance.payments(),
    queryFn: async () => {
      const response = await apiClient.get<Payment[]>(API_ENDPOINTS.FINANCE.PAYMENTS);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useLedger = (customerId: string) => {
  return useQuery({
    queryKey: queryKeys.finance.ledger(customerId),
    queryFn: async () => {
      const response = await apiClient.get<CustomerLedger>(API_ENDPOINTS.FINANCE.LEDGER(customerId));
      return (response.data as any)?.data ?? response.data;
    },
    enabled: !!customerId,
    staleTime: 60 * 1000,
  });
};

export const useCustomerReminders = (customerId: string) => {
  return useQuery({
    queryKey: queryKeys.finance.reminders(customerId),
    queryFn: async () => {
      const response = await apiClient.get<ReminderLog[]>(API_ENDPOINTS.FINANCE.CUSTOMER_REMINDERS(customerId));
      return (response.data as any)?.data ?? response.data;
    },
    enabled: !!customerId,
    staleTime: 60 * 1000,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customerId: string;
      dueDate?: string;
      notes?: string;
      discount?: number;
      lines: Array<{ description: string; quantity: number; unitPrice: number }>;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.FINANCE.INVOICES, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customerId: string;
      amount: number;
      method: string;
      paidAt?: string;
      notes?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.FINANCE.PAYMENTS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.payments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.invoices() });
    },
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      customerId: string;
      actionType: string;
      note?: string;
      nextFollowUpAt?: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.FINANCE.REMINDERS, payload);
      return (response.data as any)?.data ?? response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.reminders(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.ledger(variables.customerId) });
    },
  });
};
