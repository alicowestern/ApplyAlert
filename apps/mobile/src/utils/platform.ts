/**
 * Platform detection utilities.
 *
 * Provides helpers for platform-specific behavior without
 * scattering Platform.OS checks throughout the codebase.
 */

import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const platformVersion = Platform.Version;

/**
 * Select a value based on the current platform.
 * More type-safe than Platform.select when you always
 * want both platforms covered.
 */
export function platformSelect<T>(options: { android: T; ios: T }): T {
  return isAndroid ? options.android : options.ios;
}
