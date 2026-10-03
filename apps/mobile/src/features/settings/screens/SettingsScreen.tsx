/**
 * Settings screen placeholder.
 *
 * Will eventually contain:
 * - Notification preferences
 * - Default reminder strategy
 * - Theme selection (light/dark)
 * - Data & privacy
 * - About / version
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface SettingsRowProps {
  label: string;
  value: string;
}

function SettingsRow({ label, value }: SettingsRowProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <Typography variant="body">{label}</Typography>
      <Typography variant="body" color={theme.colors.textSecondary}>
        {value}
      </Typography>
    </View>
  );
}

export function SettingsScreen() {
  return (
    <ScreenContainer testID="settings-screen">
      <View style={styles.header}>
        <Typography variant="heading1">Settings</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="label" style={styles.sectionTitle}>
          ABOUT
        </Typography>
        <SettingsRow label="Version" value="0.0.1" />
        <SettingsRow label="Build" value="Development" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
