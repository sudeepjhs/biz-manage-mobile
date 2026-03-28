import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

/**
 * COMPREHENSIVE THEME SYSTEM
 * Theme-centric design with modern color palettes, semantic tokens, and component variants
 */

// Neutral Grays (Background, Text, Borders)
const SLATE_COLORS = {
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  slate950: '#020617',
};

// Primary Accent Colors (Interactive, Brand) - Now using VIOLET to match Web
const ACCENT_COLORS = {
  violet: {
    light: '#a78bfa', // Violet 400
    main: '#7c3aed',  // Violet 600
    dark: '#5b21b6',  // Violet 800
    container: '#f5f3ff', // Violet 50
    onContainer: '#2e1065', // Violet 950
  },
  emerald: {
    light: '#34d399',
    main: '#10b981',
    dark: '#059669',
    container: '#ecfdf5',
    onContainer: '#064e3b',
  },
  rose: {
    light: '#fb7185',
    main: '#f43f5e',
    dark: '#e11d48',
    container: '#fff1f2',
    onContainer: '#4c0519',
  },
};

// Semantic Status Colors
const SEMANTIC_COLORS = {
  success: {
    light: '#4ade80',
    main: '#22c55e',
    dark: '#16a34a',
    container: '#f0fdf4',
    onContainer: '#14532d',
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#d97706',
    container: '#fffbeb',
    onContainer: '#78350f',
  },
  critical: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    container: '#fef2f2',
    onContainer: '#7f1d1d',
  },
  info: {
    light: '#38bdf8',
    main: '#0ea5e9',
    dark: '#0284c7',
    container: '#f0f9ff',
    onContainer: '#0c4a6e',
  },
};

// Extended Semantic (UI interactions)
const SEMANTIC_EXTENDED = {
  disabled: SLATE_COLORS.slate300,
  divider: SLATE_COLORS.slate200,
  disabled_text: SLATE_COLORS.slate400,
  interactive_hover: ACCENT_COLORS.violet.container,
  interactive_pressed: ACCENT_COLORS.violet.light,
  focus_ring: ACCENT_COLORS.violet.main,
  success: SEMANTIC_COLORS.success.main,
  warning: SEMANTIC_COLORS.warning.main,
  critical: SEMANTIC_COLORS.critical.main,
  info: SEMANTIC_COLORS.info.main,
};

/**
 * LIGHT THEME
 * Modern, clean, professional appearance
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary Brand (Violet)
    primary: ACCENT_COLORS.violet.main,
    primaryContainer: ACCENT_COLORS.violet.container,
    onPrimary: '#ffffff',
    onPrimaryContainer: ACCENT_COLORS.violet.onContainer,
    
    // Secondary (Emerald)
    secondary: ACCENT_COLORS.emerald.main,
    secondaryContainer: ACCENT_COLORS.emerald.container,
    onSecondary: '#ffffff',
    onSecondaryContainer: ACCENT_COLORS.emerald.onContainer,
    
    // Tertiary (Rose)
    tertiary: ACCENT_COLORS.rose.main,
    tertiaryContainer: ACCENT_COLORS.rose.container,
    onTertiary: '#ffffff',
    onTertiaryContainer: ACCENT_COLORS.rose.onContainer,
    
    // Surfaces
    surface: '#ffffff', // White for cards (matches Web's bg.surface)
    surfaceVariant: '#ffffff',
    background: SLATE_COLORS.slate50, // Slate 50 for background
    onSurface: SLATE_COLORS.slate900,
    onSurfaceVariant: SLATE_COLORS.slate600,
    
    // Status
    error: SEMANTIC_COLORS.critical.main,
    errorContainer: SEMANTIC_COLORS.critical.container,
    onError: '#ffffff',
    onErrorContainer: SEMANTIC_COLORS.critical.onContainer,
    
    // Outline
    outline: SLATE_COLORS.slate300,
    outlineVariant: SLATE_COLORS.slate200,
    
    // Additional semantic tokens
    success: SEMANTIC_COLORS.success.main,
    successContainer: SEMANTIC_COLORS.success.container,
    onSuccess: '#ffffff',
    
    warning: SEMANTIC_COLORS.warning.main,
    warningContainer: SEMANTIC_COLORS.warning.container,
    onWarning: '#ffffff',
    
    info: SEMANTIC_COLORS.info.main,
    infoContainer: SEMANTIC_COLORS.info.container,
    onInfo: '#ffffff',
    
    // Extended
    disabled: SEMANTIC_EXTENDED.disabled,
    divider: SEMANTIC_EXTENDED.divider,
  },
};

/**
 * DARK THEME
 * Modern dark appearance with vibrant accents
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary Brand (Violet Light)
    primary: ACCENT_COLORS.violet.light,
    primaryContainer: '#2e1065', // Deep violet
    onPrimary: '#ffffff',
    onPrimaryContainer: ACCENT_COLORS.violet.light,
    
    // Secondary (Emerald Light)
    secondary: ACCENT_COLORS.emerald.light,
    secondaryContainer: '#064e3b',
    onSecondary: '#ffffff',
    onSecondaryContainer: ACCENT_COLORS.emerald.light,
    
    // Tertiary (Rose Light)
    tertiary: ACCENT_COLORS.rose.light,
    tertiaryContainer: '#4c0519',
    onTertiary: '#ffffff',
    onTertiaryContainer: ACCENT_COLORS.rose.light,
    
    // Surfaces
    surface: SLATE_COLORS.slate900, // Slate 900 for cards (matches Web's bg.surface _dark)
    surfaceVariant: SLATE_COLORS.slate800,
    background: SLATE_COLORS.slate950, // Slate 950 for background (matches Web's bg.canvas _dark)
    onSurface: SLATE_COLORS.slate100, // Slate 100 for primary text (matches Web's fg.default _dark)
    onSurfaceVariant: SLATE_COLORS.slate400,
    
    // Status
    error: SEMANTIC_COLORS.critical.light,
    errorContainer: '#7f1d1d',
    onError: '#ffffff',
    onErrorContainer: SEMANTIC_COLORS.critical.light,
    
    // Outline
    outline: SLATE_COLORS.slate600,
    outlineVariant: SLATE_COLORS.slate700,
    
    // Additional semantic tokens
    success: SEMANTIC_COLORS.success.light,
    successContainer: '#052c16',
    onSuccess: '#ffffff',
    
    warning: SEMANTIC_COLORS.warning.light,
    warningContainer: '#451a03',
    onWarning: '#ffffff',
    
    info: SEMANTIC_COLORS.info.light,
    infoContainer: '#082f49',
    onInfo: '#ffffff',
    
    // Extended
    disabled: SLATE_COLORS.slate700,
    divider: SLATE_COLORS.slate800,
  },
};

/**
 * THEME EXPORTS
 * Color palettes, semantic tokens, and component customizations
 */
export const COLORS = {
  slate: SLATE_COLORS,
  accent: ACCENT_COLORS,
  semantic: SEMANTIC_COLORS,
  extended: SEMANTIC_EXTENDED,
};

// Component-specific theme variants
export const COMPONENT_VARIANTS = {
  button: {
    primary: { color: ACCENT_COLORS.violet.main },
    secondary: { color: ACCENT_COLORS.emerald.main },
    tertiary: { color: ACCENT_COLORS.rose.main },
    success: { color: SEMANTIC_COLORS.success.main },
    warning: { color: SEMANTIC_COLORS.warning.main },
    critical: { color: SEMANTIC_COLORS.critical.main },
  },
  card: {
    elevated: { shadow: true, elevation: 2 },
    filled: { filled: true, elevation: 0 },
    outlined: { outlined: true, elevation: 0 },
    interactive: { shadow: true, elevation: 2, pressable: true },
  },
  badge: {
    success: SEMANTIC_COLORS.success.main,
    warning: SEMANTIC_COLORS.warning.main,
    critical: SEMANTIC_COLORS.critical.main,
    info: SEMANTIC_COLORS.info.main,
    neutral: SLATE_COLORS.slate500,
  },
};

// Animation presets for transitions
export const ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
};

export type ThemeType = typeof lightTheme;
