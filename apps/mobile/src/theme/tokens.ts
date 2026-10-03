/**
 * Design tokens for ApplyAlert.
 *
 * All visual constants are defined here. No raw color/spacing values
 * should appear in component files.
 *
 * Design direction: calm, trustworthy, modern, minimal, action-oriented.
 */

export const colors = {
  // Primary â€” Teal/Blue-green for trust and calm
  primary: {
    50: '#E6F7F5',
    100: '#B3E8E2',
    200: '#80D9CF',
    300: '#4DCABC',
    400: '#26BEA9',
    500: '#0FA68E', // Main primary
    600: '#0D9580',
    700: '#0A7A6A',
    800: '#085F53',
    900: '#05443C',
  },

  // Accent â€” Warm amber for urgency and deadlines
  accent: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main accent
    600: '#FFB300',
    700: '#FF8F00',
    800: '#FF6F00',
    900: '#E65100',
  },

  // Urgency â€” Red-orange for critical deadlines
  urgency: {
    low: '#0FA68E', // Primary â€” no rush
    medium: '#FFB300', // Amber â€” approaching
    high: '#FF6F00', // Deep amber â€” soon
    critical: '#E53935', // Red â€” very soon / overdue
  },

  // Deadline semantic background and text colors
  deadline: {
    overdue: { bg: '#FDECEA', text: '#C62828' }, // Error light
    today: { bg: '#FEF0D9', text: '#FF6F00' }, // High urgency
    urgent: { bg: '#FEF0D9', text: '#FF8F00' },
    soon: { bg: '#FFF8E1', text: '#F9A825' }, // Warning light
    upcoming: { bg: '#E6F7F5', text: '#0A7A6A' }, // Primary light
    rolling: { bg: '#F1F4F6', text: '#4A5568' }, // Neutral
    ambiguous: { bg: '#E3F2FD', text: '#1565C0' }, // Info light
    closed: { bg: '#E4E8EC', text: '#6B7685' },
  },

  // Neutral â€” Cool grays
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFB',
    100: '#F1F4F6',
    200: '#E4E8EC',
    300: '#CDD3DA',
    400: '#9BA5B1',
    500: '#6B7685',
    600: '#4A5568',
    700: '#364152',
    800: '#232D3B',
    900: '#141B24',
  },

  // Semantic
  success: '#2E7D32',
  warning: '#F9A825',
  error: '#C62828',
  info: '#1565C0',

  // Surface
  background: '#FFFFFF',
  surface: '#F8FAFB',
  surfaceElevated: '#FFFFFF',
  border: '#E4E8EC',
  borderFocused: '#0FA68E',

  // Text
  textPrimary: '#232D3B',
  textSecondary: '#6B7685',
  textTertiary: '#9BA5B1',
  textInverse: '#FFFFFF',
  textLink: '#0FA68E',
} as const;

export const spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 32px */
  xxxl: 32,
  /** 40px */
  xxxxl: 40,
  /** 48px */
  xxxxxl: 48,
  /** 64px */
  jumbo: 64,
} as const;

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  // Font families â€” uses system defaults (Roboto on Android, SF on iOS)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },

  // Line heights
  lineHeight: {
    xs: 16,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 38,
    display: 44,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;
