/**
 * Mobile app configuration
 * Development: http://localhost:3000
 * Production: Update URL via environment variable
 */

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
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
    CATEGORIES: '/api/inventory/products/categories',
    LOCATIONS: '/api/inventory/locations',
    LOCATION: (id: string) => `/api/inventory/locations/${id}`,
    MOVEMENTS: '/api/inventory/movements',
    MOVEMENT: (id: string) => `/api/inventory/movements/${id}`,
    APPROVE_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/approve`,
    REJECT_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/reject`,
    POST_MOVEMENT: (id: string) => `/api/inventory/movements/${id}/post`,
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
} as const;

// API configuration
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
