/**
 * Hook to access the app theme.
 *
 * All components should use this hook to access design tokens
 * rather than importing tokens directly. This enables future
 * dark mode support and theme switching.
 */

import { lightTheme } from '../theme/theme';
import type { AppTheme } from '../theme/types';

export function useAppTheme(): AppTheme {
  // For now, always returns light theme.
  // When dark mode is added, this will use context or
  // system preference to select the appropriate theme.
  return lightTheme;
}
