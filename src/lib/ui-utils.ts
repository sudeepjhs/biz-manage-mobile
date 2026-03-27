/**
 * UI Utilities
 *
 * Centralized spacing, color, and theme utilities for consistent UI design
 */

// Spacing scale (based on Material Design)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Responsive padding/margin helpers
export const createSpacing = (size: keyof typeof SPACING) => {
  return {
    padding: SPACING[size],
    margin: SPACING[size],
  };
};

// Border radius scale
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
} as const;

// Shadow styles (iOS and Android compatible)
export const SHADOWS = {
  sm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  md: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  lg: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
} as const;

// Touch target minimum size (Material Design: 48dp)
export const MIN_TOUCH_TARGET = 48;

// Typography scale helpers
export const TYPOGRAPHY = {
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },
} as const;

// Flex helpers
export const FLEX = {
  center: { justifyContent: 'center', alignItems: 'center' },
  between: { justifyContent: 'space-between' },
  around: { justifyContent: 'space-around' },
  evenly: { justifyContent: 'space-evenly' },
} as const;

// Common layout patterns
export const LAYOUT = {
  row: { flexDirection: 'row' as const },
  column: { flexDirection: 'column' as const },
  fill: { flex: 1 },
  fullWidth: { width: '100%' },
  fullHeight: { height: '100%' },
  full: { width: '100%', height: '100%' },
  centerContent: { justifyContent: 'center', alignItems: 'center', flex: 1 },
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 360,
  md: 480,
  lg: 768,
  xl: 1024,
} as const;

// Get responsive value based on screen width
export const getResponsiveValue = <T,>(
  screenWidth: number,
  values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }
): T | undefined => {
  if (screenWidth >= BREAKPOINTS.xl && values.xl) return values.xl;
  if (screenWidth >= BREAKPOINTS.lg && values.lg) return values.lg;
  if (screenWidth >= BREAKPOINTS.md && values.md) return values.md;
  if (screenWidth >= BREAKPOINTS.sm && values.sm) return values.sm;
  return values.xs;
};

// Common container styles
export const CONTAINERS = {
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  screen: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
} as const;

// Opacity values for subtle effects
export const OPACITY = {
  disabled: 0.5,
  hover: 0.8,
  active: 0.9,
  full: 1,
} as const;

// Animation durations (milliseconds)
export const ANIMATION_DURATION = {
  short: 150,
  medium: 250,
  long: 350,
  extraLong: 500,
} as const;

// Animation timing functions (not built-in to RN, but useful reference)
export const ANIMATION_TIMING = {
  easeInOut: 'ease-in-out',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  linear: 'linear',
} as const;
