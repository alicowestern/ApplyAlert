/**
 * Root navigator — bottom tab navigation.
 *
 * Four primary areas: Home, Add Opportunity, Applications, Settings.
 * Each tab (except Settings) hosts a Stack Navigator to allow pushing detail screens.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

// Screens
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { AddOpportunityScreen } from '../../features/import/screens/AddOpportunityScreen';
import { ManualAddScreen } from '../../features/import/screens/ManualAddScreen';
import { ApplicationsScreen } from '../../features/opportunity/screens/ApplicationsScreen';
import { OpportunityDetailScreen } from '../../features/opportunity/screens/OpportunityDetailScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';

import type { RootTabParamList, HomeStackParamList, AddStackParamList, ApplicationsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AddStack = createNativeStackNavigator<AddStackParamList>();
const ApplicationsStack = createNativeStackNavigator<ApplicationsStackParamList>();

function HomeIcon() {
  return <Text style={styles.tabIcon}>🏠</Text>;
}
function AddIcon() {
  return <Text style={styles.tabIcon}>➕</Text>;
}
function ApplicationsIcon() {
  return <Text style={styles.tabIcon}>📋</Text>;
}
function SettingsIcon() {
  return <Text style={styles.tabIcon}>⚙️</Text>;
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
    </HomeStack.Navigator>
  );
}

function AddStackNavigator() {
  return (
    <AddStack.Navigator screenOptions={{ headerShown: false }}>
      <AddStack.Screen name="AddMain" component={AddOpportunityScreen} />
      <AddStack.Screen name="ManualAdd" component={ManualAddScreen} />
    </AddStack.Navigator>
  );
}

function ApplicationsStackNavigator() {
  return (
    <ApplicationsStack.Navigator screenOptions={{ headerShown: false }}>
      <ApplicationsStack.Screen name="ApplicationsMain" component={ApplicationsScreen} />
      <ApplicationsStack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
    </ApplicationsStack.Navigator>
  );
}

export function RootNavigator() {
  const theme = useAppTheme();

  return (
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
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings', tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});
