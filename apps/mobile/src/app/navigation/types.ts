/**
 * Navigation type definitions.
 *
 * Centralizes all navigation param lists so screens
 * have type-safe navigation props.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Root tab navigator param list.
 * Each key is a tab name, value is the params (undefined = no params).
 */
export type RootTabParamList = {
  Home: undefined;
  AddOpportunity: undefined;
  Applications: undefined;
  Settings: undefined;
};

/**
 * Helper type for screen props in the tab navigator.
 */
export type RootTabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;

// Future: when we add stack navigators inside tabs
// export type HomeStackParamList = { ... };
