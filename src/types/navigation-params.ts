
/**
 * Navigation Parameters for all screens
 * Ensures type-safe navigation between screens
 * Prevents import typos and null reference errors
 */

// Bottom Tab Stack
export type BottomTabsParamList = {
  POSTab: undefined;
  DashboardTab: undefined;
  InventoryTab: undefined;
  TimeTab: undefined;
  LeaveTab: undefined;
  SettingsTab: undefined;
};

// POS Stack (Nested within POSTab)
export type POSStackParamList = {
  POSScreen: undefined;
  POSCheckout: {
    onSuccess?: () => void;
    onCancel?: () => void;
  };
  POSReceipt: {
    receipt: {
      orderId: string;
      timestamp: Date | string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
      }>;
      subtotal: number;
      discount: number;
      total: number;
      paymentMethod: string;
      amountPaid: number;
      change: number;
      customerEmail?: string;
      notes?: string;
    };
    onDone?: () => void;
    onPrint?: () => void;
  };
};

// Dashboard Stack (Nested within DashboardTab)
export type DashboardStackParamList = {
  DashboardScreen: undefined;
  QuickActionDetail?: {
    action: 'pos' | 'inventory' | 'timeclocks';
  };
};

// Inventory Stack (Nested within InventoryTab)
export type InventoryStackParamList = {
  InventoryScreen: undefined;
  ProductDetail?: {
    productId: string;
  };
  StockMovement?: {
    productId: string;
    productName: string;
  };
};

// Time Stack (Nested within TimeTab)
export type TimeStackParamList = {
  TimeClockScreen: undefined;
  TimeEntries?: {
    startDate?: string;
    endDate?: string;
  };
};

// Leave Stack (Nested within LeaveTab)
export type LeaveStackParamList = {
  LeaveRequests: undefined;
  LeaveApprovals: undefined;
  LeaveBalance: undefined;
};

// Settings Stack (Nested within SettingsTab)
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  ProfileEdit?: undefined;
  NotificationSettings?: undefined;
  AppSettings?: undefined;
};

// Root Navigation Stack (Auth + App)
export type RootStackParamList = {
  Login: undefined;
  App: undefined;
  Logout: undefined;
};

// Combined Navigation Type for useNavigation hook
export type AllNavigation =
  | BottomTabsParamList
  | POSStackParamList
  | DashboardStackParamList
  | InventoryStackParamList
  | TimeStackParamList
  | SettingsStackParamList
  | RootStackParamList;

// Helper types for screen name validation
export type AllScreens = keyof AllNavigation;

// Type-safe route builder helper
export const createRoute = <T extends AllScreens>(
  screen: T,
  params?: AllNavigation[T]
) => ({
  screen,
  params,
});
