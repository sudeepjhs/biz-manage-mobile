/**
 * API Response Types
 * Mirrors data models from web app Prisma schema
 */

// ─── Auth Types ────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'WORKER';
  avatar?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Dashboard Types ────────────────────────────────
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  lowStockItems: number;
  activeShifts: number;
  pendingApprovals: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  userName: string;
  details?: Record<string, any>;
}

// ─── Inventory Types ────────────────────────────────
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  unitPrice: number;
  lastUpdated: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'OTHER';
  capacity?: number;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  fromLocationId?: string;
  toLocationId: string;
  quantity: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  postedAt?: string;
}

// ─── POS Types ────────────────────────────────────
export interface SaleLineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  items: SaleLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'DRAFT' | 'COMPLETED' | 'VOIDED';
  createdAt: string;
  completedAt?: string;
}

export interface POSProduct extends Omit<Product, 'lastUpdated'> {
  inStock: boolean;
}

// ─── Time & Clock Types ────────────────────────────
export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration: number; // minutes
}

export interface ClockStatus {
  isClocked: boolean;
  lastPunchIn?: string; // ISO timestamp
  lastPunchOut?: string; // ISO timestamp
  todayHours: number;
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
}

export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  breakDuration: number; // minutes
  workingHours: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Timesheet {
  id: string;
  employeeId: string;
  week: string; // YYYY-WXX format
  entries: TimesheetEntry[];
  totalHours: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

// ─── Leave Types ────────────────────────────────
export interface LeaveBalance {
  leaveTypeId: string;
  leaveType: string;
  totalEntitlement: number;
  used: number;
  available: number;
  carryForward?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverComments?: string;
  createdAt: string;
}

// ─── Employee Types ────────────────────────────────
export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
}

export interface Employee {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  departmentId: string;
  departmentName: string;
  managerId?: string;
  position?: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  avatar?: string;
}

// ─── API Response Wrapper ────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, any>;
  timestamp?: string;
}

// ─── Pagination Types ────────────────────────────────
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
}
