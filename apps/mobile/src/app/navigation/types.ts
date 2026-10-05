/**
 * Navigation type definitions.
 *
 * Centralizes all navigation param lists so screens
 * have type-safe navigation props.
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
  OpportunityDetail: { id: string };
  EditOpportunity: { id: string };
};

export type AddStackParamList = {
  AddMain: undefined;
  ManualAdd: undefined;
  PasteInput: { mode?: 'URL' | 'TEXT' } | undefined;
  ImportProcessing: { importId: string };
  ReviewOpportunity: { initialData: any };
  SharePreview: { sharedContent: import('../../services/sharing/types').SharedContent };
};

export type ApplicationsStackParamList = {
  ApplicationsMain: undefined;
  OpportunityDetail: { id: string };
  EditOpportunity: { id: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ArchivedOpportunities: undefined;
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  AddOpportunity: NavigatorScreenParams<AddStackParamList>;
  Applications: NavigatorScreenParams<ApplicationsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  RootTabScreenProps<'Home'>
>;

export type AddStackScreenProps<T extends keyof AddStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AddStackParamList, T>,
  RootTabScreenProps<'AddOpportunity'>
>;

export type ApplicationsStackScreenProps<T extends keyof ApplicationsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ApplicationsStackParamList, T>,
  RootTabScreenProps<'Applications'>
>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, T>,
  RootTabScreenProps<'Settings'>
>;
