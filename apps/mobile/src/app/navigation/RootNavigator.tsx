/**
 * Root navigator — bottom tab navigation.
 *
 * Four primary areas: Home, Add Opportunity, Applications, Settings.
 * Each tab (except Settings) hosts a Stack Navigator to allow pushing detail screens.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Home, PlusCircle, Inbox, Settings } from 'lucide-react-native';

// Screens
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { AddOpportunityScreen } from '../../features/import/screens/AddOpportunityScreen';
import { ManualAddScreen } from '../../features/import/screens/ManualAddScreen';
import { ReviewOpportunityScreen } from '../../features/import/screens/ReviewOpportunityScreen';
import { ImportProcessingScreen } from '../../features/import/screens/ImportProcessingScreen';
import { SharePreviewScreen } from '../../features/import/screens/SharePreviewScreen';
import { PasteInputScreen } from '../../features/import/screens/PasteInputScreen';
import { ApplicationsScreen } from '../../features/opportunity/screens/ApplicationsScreen';
import { OpportunityDetailScreen } from '../../features/opportunity/screens/OpportunityDetailScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import { ArchivedOpportunitiesScreen } from '../../features/settings/screens/ArchivedOpportunitiesScreen';
import { EditOpportunityScreen } from '../../features/opportunity/screens/EditOpportunityScreen';
import { ShareImportCoordinator } from '../../services/sharing/ShareImportCoordinator';

import type { RootTabParamList, HomeStackParamList, AddStackParamList, ApplicationsStackParamList, SettingsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AddStack = createNativeStackNavigator<AddStackParamList>();
const ApplicationsStack = createNativeStackNavigator<ApplicationsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function HomeIcon({ color, size }: { color: string; size: number }) {
  return <Home color={color} size={size} />;
}
function AddIcon({ color, size }: { color: string; size: number }) {
  return <PlusCircle color={color} size={size} />;
}
function ApplicationsIcon({ color, size }: { color: string; size: number }) {
  return <Inbox color={color} size={size} />;
}
function SettingsIcon({ color, size }: { color: string; size: number }) {
  return <Settings color={color} size={size} />;
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
      <HomeStack.Screen name="EditOpportunity" component={EditOpportunityScreen} />
    </HomeStack.Navigator>
  );
}

function AddStackNavigator() {
  return (
    <AddStack.Navigator screenOptions={{ headerShown: false }}>
      <AddStack.Screen name="AddMain" component={AddOpportunityScreen} />
      <AddStack.Screen name="PasteInput" component={PasteInputScreen} />
      <AddStack.Screen name="ImportProcessing" component={ImportProcessingScreen} />
      <AddStack.Screen name="ManualAdd" component={ManualAddScreen} />
      <AddStack.Screen name="ReviewOpportunity" component={ReviewOpportunityScreen} />
      <AddStack.Screen name="SharePreview" component={SharePreviewScreen} />
    </AddStack.Navigator>
  );
}

function ApplicationsStackNavigator() {
  return (
    <ApplicationsStack.Navigator screenOptions={{ headerShown: false }}>
      <ApplicationsStack.Screen name="ApplicationsMain" component={ApplicationsScreen} />
      <ApplicationsStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
      <ApplicationsStack.Screen name="EditOpportunity" component={EditOpportunityScreen} />
    </ApplicationsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="ArchivedOpportunities" component={ArchivedOpportunitiesScreen} />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const theme = useAppTheme();

  return (
    <>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surfaceElevated,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home', tabBarIcon: HomeIcon }}
      />
      <Tab.Screen
        name="AddOpportunity"
        component={AddStackNavigator}
        options={{ tabBarLabel: 'Add', tabBarIcon: AddIcon }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsStackNavigator}
        options={{ tabBarLabel: 'Applications', tabBarIcon: ApplicationsIcon }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings', tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
    {/* Coordinator mounted here has access to global navigation state */}
    <ShareImportCoordinator />
    </>
  );
}

