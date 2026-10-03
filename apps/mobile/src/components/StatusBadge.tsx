import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import type { ApplicationStatus } from '@applyalert/contracts';
import { Bookmark, Clock, CheckCircle2, XCircle, Archive } from 'lucide-react-native';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme();
  
  let color: string = theme.colors.textSecondary;
  let bg: string = theme.colors.neutral[100];
  let label: string = status;
  let Icon = Bookmark;

  switch (status) {
    case 'SAVED':
      label = 'Saved';
      Icon = Bookmark;
      break;
    case 'PREPARING':
      label = 'Preparing';
      color = theme.colors.primary[600];
      bg = theme.colors.primary[50];
      Icon = Clock;
      break;
    case 'APPLIED':
      label = 'Applied';
      color = theme.colors.success;
      bg = '#E8F5E9'; // light green
      Icon = CheckCircle2;
      break;
    case 'SKIPPED':
      label = 'Skipped';
      Icon = XCircle;
      break;
    case 'ARCHIVED':
      label = 'Archived';
      Icon = Archive;
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
      <Icon color={color} size={14} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
