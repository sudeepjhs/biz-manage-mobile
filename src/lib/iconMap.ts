const ICON_MAP: Record<string, string> = {
  dashboard: 'view-dashboard-outline',
  inventory: 'package-variant',
  employees: 'account-group-outline',
  time: 'clock-outline',
  leave: 'calendar-check',
  audit: 'shield-account-outline',
  settings: 'cog-outline',
  product: 'package-variant',
  movement: 'swap-horizontal',
  location: 'map-marker',
  list: 'format-list-bulleted',
  timesheet: 'clock-outline',
  shift: 'clock-outline',
  clock: 'clock-outline',
  policy: 'gavel',
  holiday: 'calendar-star',
  request: 'calendar-question',
  balance: 'scale-balance',
  report: 'file-chart-outline',
  approve: 'check-circle-outline',
  pos: 'cash-register',
  default: 'help-circle-outline',
};

export function getIconName(key?: string | null) {
  if (!key) return ICON_MAP.default;
  const normalized = String(key).toLowerCase();
  return ICON_MAP[normalized] || ICON_MAP.default;
}

export default ICON_MAP;
