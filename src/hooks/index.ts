// Export all hooks for easier imports
export { useAuth } from './useAuth';
export { useApi } from './useApi';
export { usePOSCart } from './usePOSCart';
export { useApiError } from './useApiError';
export {
  useProducts,
  useProductsByCategory,
  useSearchProducts,
  useCategories,
  useCheckout,
  useOrders,
} from './usePOS';
export {
  useDashboardStats,
  useDashboardActivity,
} from './useDashboard';
export {
  useInventoryProducts,
  useInventoryProduct,
  useUpdateStock,
  useLowStockAlerts,
  useInventoryCategories,
} from './useInventory';
export {
  useClockIn,
  useClockOut,
  useClockStatus,
  useTodayTimeEntries,
  useTimeEntries,
  useShifts,
} from './useTime';
export {
  useUserProfile,
  useUpdateProfile,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useAppSettings,
  useUpdateAppSettings,
} from './useSettings';
