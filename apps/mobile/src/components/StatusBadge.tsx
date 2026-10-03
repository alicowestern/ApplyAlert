import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import type { ApplicationStatus } from '@applyalert/contracts';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme();
  
  let color: string = theme.colors.textSecondary;
  let bg: string = theme.colors.neutral[100];
  let label: string = status;

  switch (status) {
    case 'SAVED':
      label = 'Saved';
      break;
    case 'PREPARING':
      label = 'Preparing';
      color = theme.colors.primary[600];
      bg = theme.colors.primary[50];
      break;
    case 'APPLIED':
      label = 'Applied';
      color = theme.colors.success;
      bg = '#E8F5E9'; // light green
      break;
    case 'SKIPPED':
      label = 'Skipped';
      break;
    case 'ARCHIVED':
      label = 'Archived';
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <Typography variant="caption" color={color} style={{ fontWeight: theme.typography.fontWeight.medium }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
