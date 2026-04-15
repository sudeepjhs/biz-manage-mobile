
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
  MoreTab: undefined;
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
  ProposeMovement: {
    productId: string;
    productName: string;
  };
};

// Time Stack (Nested within TimeTab)
export type TimeStackParamList = {
  TimeClockScreen: undefined;
  TimesheetHistory: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  };
};


// Leave Stack (Nested within LeaveTab)
export type LeaveStackParamList = {
  LeaveRequests: undefined;
  LeaveApprovals: undefined;
  LeaveBalance: undefined;
  LeaveHistory: {
    startDate?: string;
    endDate?: string;
    status?: string;
    employeeId?: string;
  };
};


// Settings Stack (Nested within SettingsTab)
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  ProfileEdit?: undefined;
  NotificationSettings?: undefined;
  AppSettings?: undefined;
};

// More Stack (Nested within MoreTab)
export type MoreStackParamList = {
  MoreScreen: undefined;
  Partners: undefined;
  EmployeeDirectory: undefined;
  AuditLogs: undefined;
  AIChat: undefined;
  StockTypes: undefined;
  Locations: undefined;
  Procurement: undefined;
  MovementQueue: undefined;
  Billing: undefined;
  ShiftManagement: undefined;
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
  | MoreStackParamList
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
