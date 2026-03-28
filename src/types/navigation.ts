import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

/**
 * Root Navigator Types
 * Defines the main navigation structure: Authentication vs App
 */
export type RootParamList = {
  Auth: undefined;
  App: NavigatorScreenParams<AppParamList>;
};

/**
 * App Navigator Types
 * Defines all logged-in app screens with bottom tab navigation
 */
export type AppParamList = {
  DashboardStack: NavigatorScreenParams<DashboardStackParamList>;
  POSStack: NavigatorScreenParams<POSStackParamList>;
  InventoryStack: NavigatorScreenParams<InventoryStackParamList>;
  TimeStack: NavigatorScreenParams<TimeStackParamList>;
  Settings: undefined;
};

/**
 * Dashboard Stack Types
 */
export type DashboardStackParamList = {
  Dashboard: undefined;
  ActivityDetail: { id: string };
};

/**
 * POS Stack Types
 */
export type POSStackParamList = {
  POSHome: undefined;
  ProductSelector: undefined;
  CheckoutConfirm: undefined;
  OrderDetail: { orderId: string };
};

/**
 * Inventory Stack Types
 */
export type InventoryStackParamList = {
  InventoryHome: undefined;
  ProductList: undefined;
  ProductDetail: { id: string };
  MovementList: undefined;
  LocationList: undefined;
  LocationDetail: { id: string };
  ProposeMovement: {
    productId: string;
    productName: string;
  };
};

/**
 * Time Stack Types
 */
export type TimeStackParamList = {
  Clock: undefined;
  TimeSheet: undefined;
  DayDetail: { date: string };
};

/**
 * Auth Stack Types
 */
export type AuthParamList = {
  Login: undefined;
  ForgotPassword?: { email?: string };
};

/**
 * Navigation Props Helper
 * Use with useNavigation hook: useNavigation<NavigationProp<AppParamList>>()
 */
export type NavigationScreenProp<ParamList extends Record<string, any | undefined>, RouteName extends keyof ParamList> = {
  navigation: NativeStackNavigationProp<ParamList, RouteName>;
  route: RouteProp<ParamList, RouteName>;
};
