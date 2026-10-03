/**
 * Applications screen â€” tracks application status.
 *
 * Will eventually support tabs/filtering for:
 * - Saved
 * - Preparing
 * - Applied
 */

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { ApplicationStatus } from '@applyalert/contracts';

const STATUS_TABS: Array<{ key: ApplicationStatus; label: string }> = [
  { key: 'SAVED', label: 'Saved' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'APPLIED', label: 'Applied' },
];

export function ApplicationsScreen() {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('SAVED');

  return (
    <ScreenContainer testID="applications-screen">
      <View style={styles.header}>
        <Typography variant="heading1">Applications</Typography>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`tab-${tab.key.toLowerCase()}`}
              style={[
                styles.tab,
                isActive && styles.activeTab,
                isActive && { borderBottomColor: theme.colors.primary[500] },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Typography
                variant="label"
                color={isActive ? theme.colors.primary[500] : theme.colors.textSecondary}
              >
                {tab.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.emptyState,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Typography variant="body" color={theme.colors.textTertiary} align="center">
            No {activeTab.toLowerCase()} applications
          </Typography>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
