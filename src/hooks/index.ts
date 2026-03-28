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
} from '@hooks/useInventory';
export {
  useClockIn,
  useClockOut,
  useClockStatus,
  useTodayTimeEntries,
  useTimeEntries,
  useShifts,
} from '@hooks/useTime';
export {
  useUserProfile,
  useUpdateProfile,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useAppSettings,
  useUpdateAppSettings,
} from '@hooks/useSettings';
