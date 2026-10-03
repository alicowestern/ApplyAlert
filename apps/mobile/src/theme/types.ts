/**
 * Theme type definitions for ApplyAlert.
 */

import type { colors, spacing, radius, typography, shadows } from './tokens';

export interface AppTheme {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  isDark: boolean;
}
