/**
 * Theme object for ApplyAlert.
 *
 * Composes all design tokens into a single theme.
 * Structured so dark mode can be added by creating
 * a second theme with different token values.
 */

import { colors, spacing, radius, typography, shadows } from './tokens';
import type { AppTheme } from './types';

export const lightTheme: AppTheme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  isDark: false,
};

// Dark theme will be added later by overriding color tokens.
// export const darkTheme: AppTheme = { ... };
