/**
 * App Configuration
 * Centralized configuration for the mobile app
 */

// ─── App Info ────────────────────────────────────────
export const APP_INFO = {
  name: 'BizManage Mobile',
  version: '1.0.0',
  bundleId: 'com.bizmanage.mobile',
  deepLinkingScheme: 'bizmanage://',
};

// ─── API Configuration ────────────────────────────────
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // ms
  cacheTime: 10 * 60 * 1000, // 10 minutes
  staleTime: 5 * 60 * 1000, // 5 minutes
};

// ─── Cache Keys ────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  AUTH_USER: 'authUser',
  APP_THEME: 'appTheme', // 'light' | 'dark' | 'system'
  POS_CART: 'pos-cart-storage',
  AUTH_STORAGE: 'auth-storage',
};

// ─── Debug Configuration ────────────────────────────
export const DEBUG = {
  LOG_NAVIGATION: process.env.NODE_ENV === 'development',
  LOG_API: process.env.NODE_ENV === 'development',
  LOG_AUTH: process.env.NODE_ENV === 'development',
  LOG_STORE: process.env.NODE_ENV === 'development',
};

// ─── UI Constants ────────────────────────────────────
export const UI_CONSTANTS = {
  TOUCH_TARGET_MIN: 48, // Material Design 3 minimum
  SPACING_UNIT: 8, // Spacing base unit (px)
  BORDER_RADIUS: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  ANIMATION_DURATION: {
    fast: 100,
    normal: 300,
    slow: 500,
  },
};

// ─── Data Constants ────────────────────────────────────
export const DATA_CONSTANTS = {
  PAGE_SIZE: 20,
  MAX_RETRIES: 3,
  CLOCK_POLLING_INTERVAL: 60000, // 1 minute
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
};

// ─── POS Constants ────────────────────────────────────
export const POS_CONSTANTS = {
  DEFAULT_DISCOUNT_PERCENT: 0,
  MAX_DISCOUNT_PERCENT: 100,
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
};

// ─── Feature Flags ────────────────────────────────────
export const FEATURES = {
  OFFLINE_MODE: true, // AsyncStorage caching
  BIOMETRIC_AUTH: false, // Phase 2
  CAMERA: false, // Phase 2 - barcode scanning
  GEOLOCATION: false, // Phase 2
  ANALYTICS: false, // Phase 3
  PUSH_NOTIFICATIONS: false, // Phase 3
};

// ─── Role-Based Access ────────────────────────────────
export const ROLE_PERMISSIONS = {
  ADMIN: {
    INVENTORY: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'PROPOSE_MOVE', 'APPROVE_MOVE'],
    POS: ['VIEW', 'CREATE', 'CHECKOUT', 'VIEW_ALL_SALES'],
    TIME: ['VIEW', 'CLOCK', 'APPROVE', 'VIEW_TEAM', 'MANAGE_SHIFTS', 'MANAGE_TIMESHEETS'],
    LEAVE: ['VIEW', 'REQUEST', 'APPROVE', 'VIEW_TEAM', 'MANAGE_TYPES'],
    DASHBOARD: ['VIEW', 'ALL_DATA'],
    CUSTOMERS: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
    SUPPLIERS: ['VIEW', 'CREATE', 'EDIT', 'DELETE'],
    AUDIT: ['VIEW', 'EXPORT'],
    EMPLOYEES: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'MANAGE_ROLES'],
    SETTINGS: ['VIEW', 'EDIT', 'MANAGE_USERS'],
    AI_ASSISTANT: ['CHAT'],
  },
  MANAGER: {
    INVENTORY: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'PROPOSE_MOVE', 'APPROVE_MOVE'],
    POS: ['VIEW', 'CREATE', 'CHECKOUT'],
    TIME: ['VIEW', 'CLOCK', 'APPROVE', 'VIEW_TEAM', 'MANAGE_SHIFTS', 'MANAGE_TIMESHEETS'],
    LEAVE: ['VIEW', 'REQUEST', 'APPROVE', 'VIEW_TEAM'],
    DASHBOARD: ['VIEW', 'DEPARTMENT_DATA'],
    CUSTOMERS: ['VIEW'],
    SUPPLIERS: [],
    AUDIT: ['VIEW'],
    EMPLOYEES: ['VIEW', 'CREATE', 'EDIT', 'VIEW_TEAM'],
    SETTINGS: ['VIEW', 'EDIT'],
    AI_ASSISTANT: ['CHAT'],
  },
  WORKER: {
    INVENTORY: ['VIEW', 'PROPOSE_MOVE'],
    POS: [],
    TIME: ['VIEW', 'CLOCK'],
    LEAVE: ['VIEW', 'REQUEST'],
    DASHBOARD: ['VIEW', 'OWN_DATA'],
    CUSTOMERS: ['VIEW'],
    SUPPLIERS: [],
    AUDIT: [],
    EMPLOYEES: ['VIEW_OWN'],
    SETTINGS: ['VIEW', 'EDIT'],
    AI_ASSISTANT: [],
  },
};

// ─── Debug Configuration ────────────────────────────────
// (Already defined above, no need to repeat)
