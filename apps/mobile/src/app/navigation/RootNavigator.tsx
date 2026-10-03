/**
 * Root navigator — bottom tab navigation.
 *
 * Four primary areas: Home, Add Opportunity, Applications, Settings.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { AddOpportunityScreen } from '../../features/import/screens/AddOpportunityScreen';
import { ApplicationsScreen } from '../../features/opportunity/screens/ApplicationsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

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
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="AddOpportunity"
        component={AddOpportunityScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: AddIcon,
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: 'Applications',
          tabBarIcon: ApplicationsIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});
