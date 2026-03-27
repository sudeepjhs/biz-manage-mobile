import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const SLATE_COLORS = {
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
};

const SEMANTIC = {
  green: '#16a34a',
  red: '#dc2626',
  amber: '#f59e0b',
  blue: '#3b82f6',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: SEMANTIC.blue,
    primaryContainer: '#dbeafe',
    secondary: SLATE_COLORS.slate700,
    secondaryContainer: SLATE_COLORS.slate200,
    surface: SLATE_COLORS.slate50,
    background: SLATE_COLORS.slate100,
    error: SEMANTIC.red,
    errorContainer: '#fee2e2',
    onBackground: SLATE_COLORS.slate900,
    onSurface: SLATE_COLORS.slate900,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: SEMANTIC.blue,
    primaryContainer: '#003da5',
    secondary: SLATE_COLORS.slate200,
    secondaryContainer: SLATE_COLORS.slate700,
    surface: SLATE_COLORS.slate800,
    background: SLATE_COLORS.slate900,
    error: SEMANTIC.red,
    errorContainer: '#7f1d1d',
    onBackground: SLATE_COLORS.slate50,
    onSurface: SLATE_COLORS.slate50,
  },
};

// Export semantic colors separately for use outside Paper components
export const COLORS = {
  slate: SLATE_COLORS,
  semantic: SEMANTIC,
};

export type ThemeType = typeof lightTheme;
