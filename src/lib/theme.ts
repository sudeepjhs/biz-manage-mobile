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

// Primary Accent Colors (Interactive, Brand)
const ACCENT_COLORS = {
  blue: {
    light: '#0ea5e9',
    main: '#0284c7',
    dark: '#0369a1',
    container: '#e0f2fe',
    onContainer: '#001d33',
  },
  teal: {
    light: '#14b8a6',
    main: '#0d9488',
    dark: '#0f766e',
    container: '#ccfbf1',
    onContainer: '#001513',
  },
  indigo: {
    light: '#8366e7',
    main: '#6366f1',
    dark: '#4f46e5',
    container: '#e0e7ff',
    onContainer: '#1e1b4b',
  },
};

// Semantic Status Colors
const SEMANTIC_COLORS = {
  success: {
    light: '#22c55e',
    main: '#16a34a',
    dark: '#15803d',
    container: '#dcfce7',
    onContainer: '#051005',
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#d97706',
    container: '#fef3c7',
    onContainer: '#331501',
  },
  critical: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c',
    container: '#fee2e2',
    onContainer: '#4b0707',
  },
  info: {
    light: '#06b6d4',
    main: '#0891b2',
    dark: '#0e7490',
    container: '#cffafe',
    onContainer: '#001819',
  },
};

// Extended Semantic (UI interactions)
const SEMANTIC_EXTENDED = {
  disabled: SLATE_COLORS.slate300,
  divider: SLATE_COLORS.slate200,
  disabled_text: SLATE_COLORS.slate400,
  interactive_hover: ACCENT_COLORS.blue.container,
  interactive_pressed: ACCENT_COLORS.blue.light,
  focus_ring: ACCENT_COLORS.blue.main,
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
    // Primary Brand
    primary: ACCENT_COLORS.blue.main,
    primaryContainer: ACCENT_COLORS.blue.container,
    onPrimary: '#ffffff',
    onPrimaryContainer: ACCENT_COLORS.blue.onContainer,
    
    // Secondary
    secondary: ACCENT_COLORS.teal.main,
    secondaryContainer: ACCENT_COLORS.teal.container,
    onSecondary: '#ffffff',
    onSecondaryContainer: ACCENT_COLORS.teal.onContainer,
    
    // Tertiary (Accent)
    tertiary: ACCENT_COLORS.indigo.main,
    tertiaryContainer: ACCENT_COLORS.indigo.container,
    onTertiary: '#ffffff',
    onTertiaryContainer: ACCENT_COLORS.indigo.onContainer,
    
    // Surfaces
    surface: SLATE_COLORS.slate50,
    surfaceVariant: SLATE_COLORS.slate100,
    background: SLATE_COLORS.slate50,
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
    // Primary Brand
    primary: ACCENT_COLORS.blue.light,
    primaryContainer: '#003d5c',
    onPrimary: '#001b2f',
    onPrimaryContainer: ACCENT_COLORS.blue.container,
    
    // Secondary
    secondary: ACCENT_COLORS.teal.light,
    secondaryContainer: '#003d35',
    onSecondary: '#001513',
    onSecondaryContainer: ACCENT_COLORS.teal.container,
    
    // Tertiary (Accent)
    tertiary: ACCENT_COLORS.indigo.light,
    tertiaryContainer: '#3730a3',
    onTertiary: '#0d0d2b',
    onTertiaryContainer: ACCENT_COLORS.indigo.container,
    
    // Surfaces
    surface: SLATE_COLORS.slate900,
    surfaceVariant: SLATE_COLORS.slate800,
    background: SLATE_COLORS.slate950,
    onSurface: SLATE_COLORS.slate50,
    onSurfaceVariant: SLATE_COLORS.slate400,
    
    // Status
    error: SEMANTIC_COLORS.critical.light,
    errorContainer: '#5c0a0a',
    onError: '#5c0a0a',
    onErrorContainer: SEMANTIC_COLORS.critical.container,
    
    // Outline
    outline: SLATE_COLORS.slate600,
    outlineVariant: SLATE_COLORS.slate700,
    
    // Additional semantic tokens
    success: SEMANTIC_COLORS.success.light,
    successContainer: '#1b4d1b',
    onSuccess: '#001b00',
    
    warning: SEMANTIC_COLORS.warning.light,
    warningContainer: '#663800',
    onWarning: '#2b1700',
    
    info: SEMANTIC_COLORS.info.light,
    infoContainer: '#003d4a',
    onInfo: '#001819',
    
    // Extended
    disabled: SEMANTIC_COLORS.critical.light,
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
    primary: { color: ACCENT_COLORS.blue.main },
    secondary: { color: ACCENT_COLORS.teal.main },
    tertiary: { color: ACCENT_COLORS.indigo.main },
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
