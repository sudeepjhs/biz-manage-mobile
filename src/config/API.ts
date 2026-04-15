/**
 * Mobile app configuration
 * Development: http://localhost:3000
 * Production: Update URL via environment variable
 */


const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:3000';
  }
  return 'https://erp.pitamberasteel.in';
};

export const API_BASE_URL = getBaseUrl();
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    // Next-Auth Endpoints
    NEXTAUTH_SIGNIN: '/api/auth/callback/credentials',
    NEXTAUTH_SESSION: '/api/auth/session',
    NEXTAUTH_SIGNOUT: '/api/auth/signout',
    NEXTAUTH_CSRF: '/api/auth/csrf',
    MOBILE_LOGIN: '/api/auth/mobile-login',
    MOBILE_DEBUG: '/api/mobile-debug',
  },
  LEAVE: {
    BALANCES: '/api/leave/balances',
    REQUESTS: '/api/leave/requests',
    TYPES: '/api/leave/types',
    POLICIES: '/api/leave/policies',
    ACCRUAL_RUN: '/api/leave/accruals/run',
    APPROVE: (id: string) => `/api/leave/requests/${id}/approve`,
    REJECT: (id: string) => `/api/leave/requests/${id}/reject`,
  },
  INVENTORY: {
    PRODUCTS: '/api/inventory/products',
    PRODUCT: (id: string) => `/api/inventory/products/${id}`,
    STOCK_TYPES: '/api/inventory/stock-types',
    STOCK_TYPE: (id: string) => `/api/inventory/stock-types/${id}`,
    CATEGORIES: '/api/inventory/products/categories',
    LOCATIONS: '/api/inventory/locations',
    LOCATION: (id: string) => `/api/inventory/locations/${id}`,
    MOVEMENTS: '/api/inventory/movements',
    MOVEMENT: (id: string) => `/api/inventory/movements/${id}`,
    APPROVE_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/approve`,
    REJECT_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/reject`,
    POST_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/post`,
    SHORTAGES: '/api/inventory/shortages',
    PURCHASE_REQUESTS: '/api/inventory/purchase-requests',
    PURCHASE_ORDERS: '/api/inventory/purchase-orders',
    RECEIVE_PURCHASE_ORDER: (id: string) => `/api/inventory/purchase-orders/${id}/receive`,
  },
  EMPLOYEES: {
    LIST: '/api/employees',
    DETAIL: (id: string) => `/api/employees/${id}`,
    STATUS: (id: string) => `/api/employees/${id}/status`,
    DEPARTMENTS: '/api/departments',
  },
  TIME: {
    SHIFTS: '/api/time/shifts',
    SHIFT: (id: string) => `/api/time/shifts/${id}`,
    TIMESHEETS: '/api/time/timesheets',
    TIMESHEET: (id: string) => `/api/time/timesheets/${id}`,
    CLOCK: '/api/time/clock',
  },
  POS: {
    PRODUCTS: '/api/pos/products',
    CHECKOUT: '/api/pos/checkout',
    ORDERS: '/api/pos/orders',
  },
  DASHBOARD: {
    ACTIVITY: '/api/dashboard/activity',
    STATS: '/api/dashboard/stats',
  },
  AUDIT: '/api/audit',
  SETTINGS: {
    TIME_POLICIES: '/api/settings/time-policies',
    HOLIDAYS: '/api/settings/holidays',
    LEAVE_POLICIES: '/api/settings/leave-policies',
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    ROLE: (id: string) => `/api/users/${id}/role`,
  },
  SUPPLIERS: {
    LIST: '/api/suppliers',
    DETAIL: (id: string) => `/api/suppliers/${id}`,
  },
  CUSTOMERS: {
    LIST: '/api/customers',
    DETAIL: (id: string) => `/api/customers/${id}`,
  },
  FINANCE: {
    INVOICES: '/api/billing/invoices',
    PAYMENTS: '/api/billing/payments',
    LEDGER: (customerId: string) => `/api/billing/ledger/${customerId}`,
    REMINDERS: '/api/billing/reminders',
    CUSTOMER_REMINDERS: (customerId: string) => `/api/billing/reminders/${customerId}`,
  },
  NOTIFICATIONS: {
    SEND: '/api/notifications/send',
    HISTORY: '/api/notifications/history',
    CONFIG: '/api/notifications/config',
    REGISTER_DEVICE: '/api/notifications/register-device',
    UNREGISTER_DEVICE: '/api/notifications/unregister-device',
  },
} as const;

// API configuration
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
