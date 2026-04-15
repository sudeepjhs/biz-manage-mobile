// Export all hooks for easier imports
export { useAuth } from '@hooks/useAuth';
export { useApi } from '@hooks/useApi';
export { usePOSCart } from '@hooks/usePOSCart';
export { useApiError } from '@hooks/useApiError';
export {
  useProducts,
  useProductsByCategory,
  useSearchProducts,
  useCategories,
  useCheckout,
  useOrders,
} from '@hooks/usePOS';
export {
  useDashboardStats,
  useDashboardActivity,
} from '@hooks/useDashboard';
export {
  useInventoryProducts,
  useInventoryProduct,
  useUpdateStock,
  useLowStockAlerts,
  useInventoryCategories,
  useStockTypes,
  useCreateStockType,
  useUpdateStockType,
  useDeleteStockType,
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  useInventoryMovements,
  useApproveMovement,
  useRejectMovement,
  usePostMovement,
  useMaterialShortages,
  usePurchaseRequests,
  usePurchaseOrders,
  useCreatePurchaseRequest,
  useCreatePurchaseOrder,
  useReceivePurchaseOrder,
} from '@hooks/useInventory';
export {
  useClockIn,
  useClockOut,
  useClockStatus,
  useTodayTimeEntries,
  useTimeEntries,
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from '@hooks/useTime';
export {
  useUserProfile,
  useUpdateProfile,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useAppSettings,
  useUpdateAppSettings,
} from '@hooks/useSettings';
export {
  useLeaveTypes,
  useLeaveBalance,
  useLeaveRequests,
  usePendingLeaveApprovals,
  useSubmitLeaveRequest,
  useApproveLeaveRequest,
  useCancelLeaveRequest,
} from '@hooks/useLeave';
export {
  useSuppliers,
  useCustomers,
  useUpsertPartner,
  useDeletePartner,
} from '@hooks/usePartners';
export {
  useAuditLogs,
} from '@hooks/useAuditLogs';
export {
  useInvoices,
  usePayments,
  useLedger,
  useCustomerReminders,
  useCreateInvoice,
  useCreatePayment,
  useCreateReminder,
} from '@hooks/useBilling';
