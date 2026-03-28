/**
 * React Query key factory for consistent cache management
 * Ensures all queries follow the same naming convention
 */

const all = ['app'] as const;

const auth = {
  all: ['auth'] as const,
  profile: () => [...auth.all, 'profile'] as const,
  user: (id: string) => [...auth.all, 'user', id] as const,
} as const;

const dashboard = {
  all: ['dashboard'] as const,
  stats: () => [...dashboard.all, 'stats'] as const,
  activity: () => [...dashboard.all, 'activity'] as const,
} as const;

const inventoryAll = ['inventory'] as const;
const inventory = {
  all: inventoryAll,
  products: {
    all: [...inventoryAll, 'products'] as const,
    list: (filters?: Record<string, any>) =>
      [...inventoryAll, 'products', 'list', filters] as const,
    detail: (id: string) => [...inventoryAll, 'products', id] as const,
  },
  locations: {
    all: [...inventoryAll, 'locations'] as const,
    list: () => [...inventoryAll, 'locations', 'list'] as const,
    detail: (id: string) => [...inventoryAll, 'locations', id] as const,
  },
  movements: {
    all: [...inventoryAll, 'movements'] as const,
    list: () => [...inventoryAll, 'movements', 'list'] as const,
    detail: (id: string) => [...inventoryAll, 'movements', id] as const,
  },
} as const;

const posAll = ['pos'] as const;
const pos = {
  all: () => posAll,
  products: {
    all: [...posAll, 'products'] as const,
    list: () => [...posAll, 'products', 'list'] as const,
  },
  byCategory: (categoryId: string) => [...posAll, 'products', 'category', categoryId] as const,
  search: (query: string) => [...posAll, 'products', 'search', query] as const,
  categories: () => [...posAll, 'categories'] as const,
  orders:  {
    all: [...posAll, 'orders'] as const,
    list: (limit?: number, offset?: number) => [...posAll, 'orders', 'list', { limit, offset }] as const,
    detail: (id: string) => [...posAll, 'orders', id] as const,
  },
} as const;

const timeAll = ['time'] as const;
const time = {
  all: timeAll,
  shifts: {
    all: [...timeAll, 'shifts'] as const,
    list: () => [...timeAll, 'shifts', 'list'] as const,
    detail: (id: string) => [...timeAll, 'shifts', id] as const,
  },
  timesheets: {
    all: [...timeAll, 'timesheets'] as const,
    list: (filters?: Record<string, any>) =>
      [...timeAll, 'timesheets', 'list', filters] as const,
    detail: (id: string) => [...timeAll, 'timesheets', id] as const,
  },
  clock: {
    all: [...timeAll, 'clock'] as const,
    status: () => [...timeAll, 'clock', 'status'] as const,
  },
} as const;

const leaveAll = ['leave'] as const;
const leave = {
  all: leaveAll,
  types: () => [...leaveAll, 'types'] as const,
  balance: () => [...leaveAll, 'balance'] as const,
  myRequests: (limit?: number, offset?: number) =>
    [...leaveAll, 'requests', 'my', { limit, offset }] as const,
  pendingApprovals: (limit?: number, offset?: number) =>
    [...leaveAll, 'requests', 'approvals', { limit, offset }] as const,
  detail: (id: string) => [...leaveAll, 'requests', id] as const,
  balances: () => [...leaveAll, 'balances'] as const,
  policies: () => [...leaveAll, 'policies'] as const,
} as const;

const employeesAll = ['employees'] as const;
const employees = {
  all: employeesAll,
  list: () => [...employeesAll, 'list'] as const,
  detail: (id: string) => [...employeesAll, id] as const,
  departments: () => [...employeesAll, 'departments'] as const,
} as const;

export const queryKeys = {
  all,
  auth,
  dashboard,
  inventory,
  pos,
  time,
  leave,
  employees,
  partners: {
    all: ['partners'] as const,
    suppliers: {
      all: ['partners', 'suppliers'] as const,
      list: (filters?: Record<string, any>) => [...['partners', 'suppliers'], 'list', filters] as const,
      detail: (id: string) => [...['partners', 'suppliers'], id] as const,
    },
    customers: {
      all: ['partners', 'customers'] as const,
      list: (filters?: Record<string, any>) => [...['partners', 'customers'], 'list', filters] as const,
      detail: (id: string) => [...['partners', 'customers'], id] as const,
    },
  },
  audit: {
    all: ['audit'] as const,
    logs: (filters?: Record<string, any>) => [...['audit'], 'logs', filters] as const,
  },
} as const;
